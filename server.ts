import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Client, GatewayIntentBits, ChannelType, PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { 
  joinVoiceChannel, 
  createAudioPlayer, 
  createAudioResource, 
  AudioPlayerStatus, 
  VoiceConnectionStatus,
  StreamType,
  NoSubscriberBehavior,
  getVoiceConnection
} from '@discordjs/voice';
import { WebSocketServer, WebSocket } from 'ws';
import { PassThrough } from 'stream';
import prism from 'prism-media';
import play from 'play-dl';
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, addDoc, query, where, onSnapshot, serverTimestamp, updateDoc, getDocs, limit } from "firebase/firestore";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase Config
const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), "firebase-applet-config.json"), "utf8"));
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// --- Error Handling ---

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: null, // Server-side bot doesn't have a user auth object
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Multi-bot management
  const discordClients = new Map<string, Client>();

  async function initializeBot(tokenId: string, token: string) {
    if (discordClients.has(tokenId)) return discordClients.get(tokenId);

    const client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    client.on("ready", () => {
      console.log(`Bot logged in as ${client.user?.tag} (Token ID: ${tokenId})`);
    });

    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.customId === "close_ticket") {
        const guildId = interaction.guildId;
        if (!guildId) return;
        const configDoc = await getDoc(doc(db, "settings", "ticket_config"));
        const config = configDoc.data();
        const staffRoleId = config?.staffRoleId;
        const member = interaction.member as any;
        const isStaff = member?.roles?.cache?.has(staffRoleId);
        if (!isStaff) return interaction.reply({ content: "❌ No permission", ephemeral: true });
        await interaction.reply({ content: "Closing in 5s..." });
        setTimeout(async () => {
          const ticketsRef = collection(db, "tickets");
          const qSnap = await getDocs(query(ticketsRef, where("channelId", "==", interaction.channelId)));
          if (!qSnap.empty) await updateDoc(qSnap.docs[0].ref, { status: 'closed' });
          await interaction.channel?.delete().catch(() => {});
        }, 5000);
      }

      if (interaction.customId.startsWith("pv_ticket_") || interaction.customId === "create_ticket") {
        const guild = interaction.guild;
        if (!guild) return;
        try {
          let targetCategory = null;
          let ticketTypeLabel = "Support";
          if (interaction.customId.startsWith("pv_ticket_")) {
            const [, categoryId, label] = interaction.customId.split("|");
            targetCategory = (categoryId && /^\d+$/.test(categoryId)) ? categoryId : null;
            ticketTypeLabel = label || "Support";
          }
          const ticketsRef = collection(db, "tickets");
          const qCount = query(ticketsRef, where("guildId", "==", guild.id));
          const countSnap = await getDocs(qCount);
          const ticketNumber = countSnap.size + 1;
          const channel = await guild.channels.create({
            name: `ticket-${ticketNumber}-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: targetCategory || undefined,
            permissionOverwrites: [
              { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
              { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
            ],
          });
          await interaction.reply({ content: `Ticket created: ${channel}`, ephemeral: true });
          const welcomeEmbed = new EmbedBuilder().setTitle(`${ticketTypeLabel} Ticket`).setDescription(`${interaction.user}, admin will be with you shortly.`).setColor(0x3b82f6);
          const closeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId("close_ticket").setLabel("Close").setStyle(ButtonStyle.Danger));
          await (channel as any).send({ embeds: [welcomeEmbed], components: [closeRow] });
          const ticketRef = await addDoc(collection(db, "tickets"), {
            guildId: guild.id, channelId: channel.id, userId: interaction.user.id, userName: interaction.user.tag,
            type: ticketTypeLabel, status: "open", createdAt: serverTimestamp(),
          });
          await addDoc(collection(db, `tickets/${ticketRef.id}/messages`), {
            ticketId: ticketRef.id, authorId: "system", authorName: "System", content: "Opened via Discord", source: "discord", createdAt: serverTimestamp(),
          });
        } catch (err) { console.error("Ticket create error:", err); }
      }
    });

    client.on("messageCreate", async (message) => {
      if (message.author.bot) return;
      try {
        await addDoc(collection(db, "global_logs"), {
          guildId: message.guildId, channelId: message.channelId, channelName: (message.channel as any).name || "unknown",
          authorId: message.author.id, authorName: message.author.tag, content: message.content, createdAt: serverTimestamp(),
        });
        const ticketsRef = collection(db, "tickets");
        const q = query(ticketsRef, where("channelId", "==", message.channel.id), where("status", "==", "open"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const ticketId = querySnapshot.docs[0].id;
          await addDoc(collection(db, `tickets/${ticketId}/messages`), {
            ticketId, authorId: message.author.id, authorName: message.author.tag, content: message.content, source: "discord", createdAt: serverTimestamp(),
          });
        }
      } catch (err) {}
    });

    client.on('voiceStateUpdate', (oldState, newState) => {
      const channelId = oldState.channelId || newState.channelId;
      if (!channelId) return;
      const guildId = newState.guild.id;
      wss.clients.forEach(c => {
        if (c.readyState === WebSocket.OPEN && (c as any).guildId === guildId) {
          c.send(JSON.stringify({ type: 'voice_update', channelId }));
        }
      });
    });

    return new Promise<Client | null>((resolve) => {
      client.once("ready", () => {
        console.log(`Bot logged in as ${client.user?.tag} (Token ID: ${tokenId})`);
        discordClients.set(tokenId, client);
        resolve(client);
      });
      client.login(token).catch(err => {
        console.error(`Failed to login bot ${tokenId}:`, err);
        resolve(null);
      });
    });
  }

  // Load existing bots
  async function loadBots() {
    try {
      const botsSnap = await getDocs(collection(db, "bot_tokens"));
      const initPromises = [];
      for (const b of botsSnap.docs) {
        const d = b.data();
        if (d.token) initPromises.push(initializeBot(b.id, d.token));
      }
      await Promise.all(initPromises);
    } catch (err) { console.error("Error loading bots:", err); }
  }
  loadBots();

  function getClientForGuild(guildId: string): Client | undefined {
    for (const c of discordClients.values()) {
      if (c.guilds.cache.has(guildId)) return c;
    }
    return undefined;
  }

  app.get("/api/bot/config", async (req, res) => {
    const bots: any[] = [];
    discordClients.forEach((client, id) => {
      bots.push({ id, user: client.user?.tag || "Connecting..." });
    });
    res.json(bots);
  });

  app.post("/api/bot/tokens", async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token required" });
    const botsSnap = await getDocs(collection(db, "bot_tokens"));
    if (botsSnap.size >= 2) return res.status(400).json({ error: "Limit 2 bots" });
    try {
      const botRef = await addDoc(collection(db, "bot_tokens"), { token, createdAt: serverTimestamp() });
      const client = await initializeBot(botRef.id, token);
      res.json({ id: botRef.id, user: client?.user?.tag });
    } catch (error: any) { res.status(500).json({ error: error.message }); }
  });

  app.delete("/api/bot/tokens/:id", async (req, res) => {
    try {
      const tokenId = req.params.id;
      const client = discordClients.get(tokenId);
      if (client) {
        client.destroy();
        discordClients.delete(tokenId);
      }
      await deleteDoc(doc(db, "bot_tokens", tokenId));
      res.json({ status: "success" });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.get("/api/bot/guilds", async (req, res) => {
    const allGuilds: any[] = [];
    for (const [tokenId, client] of discordClients.entries()) {
      if (!client.isReady()) continue;
      client.guilds.cache.forEach(g => {
        allGuilds.push({
          id: g.id,
          name: g.name,
          icon: g.iconURL(),
          botTokenId: tokenId,
          botTag: client.user?.tag
        });
      });
    }
    res.json(allGuilds);
  });

  app.get("/api/bot/guilds/:guildId/channels", async (req, res) => {
    const guildId = req.params.guildId;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });
    try {
      const guild = await client.guilds.fetch(guildId);
      const channels = guild.channels.cache
        .filter(c => c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement)
        .map(c => ({
          id: c.id,
          name: c.name,
          parentId: c.parentId
        }));
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bot/search-logs", async (req, res) => {
    const { query: q } = req.query;
    if (!q) return res.json([]);
    try {
      const logsRef = collection(db, "global_logs");
      const snapshot = await getDocs(query(logsRef, limit(100)));
      const results = snapshot.docs
        .map(doc => ({ id: doc.data().channelId, name: doc.data().channelName, guildId: doc.data().guildId }))
        .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
        .filter(c => c.name?.toLowerCase().includes((q as string).toLowerCase()) || c.id === q);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tickets/respond", async (req, res) => {
    const { channelId, content, guildId } = req.body;
    const client = guildId ? getClientForGuild(guildId) : Array.from(discordClients.values())[0];
    if (!client || !channelId || !content) return res.status(400).json({ error: "Invalid request" });

    try {
      const channel = await client.channels.fetch(channelId);
      if (channel && (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement)) {
        await (channel as any).send(content);
        res.json({ status: "success" });
      } else {
        res.status(400).json({ error: "Channel not found or not text-based" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tickets/close", async (req, res) => {
    const { channelId, guildId } = req.body;
    const client = guildId ? getClientForGuild(guildId) : Array.from(discordClients.values())[0];
    if (!client || !channelId) return res.status(400).json({ error: "Invalid request" });

    try {
      const channel = await client.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        const embed = new EmbedBuilder()
          .setTitle("Ticket Closed")
          .setDescription("This support ticket has been closed by an admin.")
          .setColor(0xf43f5e)
          .setTimestamp();
        
        // @ts-ignore
        await channel.send({ embeds: [embed] });
        // Optionally delete channel after a delay
        // setTimeout(() => channel.delete().catch(() => {}), 5000);
        res.json({ status: "success" });
      } else {
        res.status(400).json({ error: "Channel not found" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bot/guilds/:guildId/roles", async (req, res) => {
    const guildId = req.params.guildId;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });
    try {
      const guild = await client.guilds.fetch(guildId);
      const roles = guild.roles.cache
        .filter(r => r.name !== "@everyone")
        .map(r => ({
          id: r.id,
          name: r.name,
          color: r.hexColor
        }));
      res.json(roles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bot/guilds/:guildId/categories", async (req, res) => {
    const guildId = req.params.guildId;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });
    try {
      const guild = await client.guilds.fetch(guildId);
      const categories = guild.channels.cache
        .filter(c => c.type === ChannelType.GuildCategory)
        .map(c => ({
          id: c.id,
          name: c.name
        }));
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/guilds/setup-dynamic-panel", async (req, res) => {
    const { guildId, channelId, embed, buttons } = req.body;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });

    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(channelId);
      if (channel?.isTextBased()) {
        const discordEmbed = new EmbedBuilder()
          .setTitle(embed.title || "Support Panel")
          .setDescription(embed.description || "Click below to open a ticket")
          .setColor(embed.color || 0x3b82f6);
        
        if (embed.image) discordEmbed.setImage(embed.image);
        if (embed.thumbnail) discordEmbed.setThumbnail(embed.thumbnail);
        if (embed.footer) discordEmbed.setFooter({ text: embed.footer });

        const row = new ActionRowBuilder<ButtonBuilder>();
        
        buttons.forEach((btn: any) => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`pv_ticket_|${btn.categoryId}|${btn.label}`)
              .setLabel(btn.label)
              .setStyle(btn.style || ButtonStyle.Primary)
              .setEmoji(btn.emoji || "🎫")
          );
        });

        // @ts-ignore
        await channel.send({ embeds: [discordEmbed], components: [row] });
        res.json({ status: "success" });
      } else {
        res.status(400).json({ error: "Invalid channel" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/bot/guilds/:guildId/voice-channels/:channelId/members", async (req, res) => {
    const guildId = req.params.guildId;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });
    try {
      const guild = await client.guilds.fetch(guildId);
      const channel = await guild.channels.fetch(req.params.channelId);
      if (channel?.type === ChannelType.GuildVoice) {
        const members = channel.members.map(m => ({
          id: m.id,
          name: m.displayName,
          avatar: m.user.displayAvatarURL(),
          deaf: m.voice.selfDeaf || m.voice.serverDeaf,
          mute: m.voice.selfMute || m.voice.serverMute
        }));
        res.json(members);
      } else {
        res.status(400).json({ error: "Not a voice channel" });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const voicePlayers = new Map<string, any>(); 
  const voiceStreams = new Map<string, PassThrough>(); 

  app.get("/api/bot/guilds/:guildId/voice-channels", async (req, res) => {
    const guildId = req.params.guildId;
    const client = getClientForGuild(guildId);
    if (!client) return res.status(404).json({ error: "Bot not found for this guild" });
    try {
      const guild = await client.guilds.fetch(guildId);
      const channels = guild.channels.cache
        .filter(c => c.type === ChannelType.GuildVoice)
        .map(c => ({ id: c.id, name: c.name }));
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bot/voice/join", async (req, res) => {
    const { guildId, channelId } = req.body;
    const client = getClientForGuild(guildId);
    if (!client || !guildId || !channelId) return res.status(400).json({ error: "Missing params or bot not found" });

    try {
      const guild = await client.guilds.fetch(guildId);
      const connection = joinVoiceChannel({
        channelId,
        guildId,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false
      });

      // Listen for people speaking
      const receiverSubscriptions = new Map<string, any>();

      const setupUserReceiver = (userId: string) => {
        if (receiverSubscriptions.has(userId) || userId === client?.user?.id) return;

        try {
          const opusStream = connection.receiver.subscribe(userId, {
            autoDestroy: true,
            emitClose: true
          });

          const decoder = new prism.opus.Decoder({ frameSize: 960, channels: 2, rate: 48000 });
          opusStream.pipe(decoder);

          receiverSubscriptions.set(userId, { opusStream, decoder });

          decoder.on('data', (chunk: Buffer) => {
            const userIdBuf = Buffer.from(userId);
            const packet = Buffer.alloc(1 + userIdBuf.length + chunk.length);
            packet[0] = userIdBuf.length;
            userIdBuf.copy(packet, 1);
            chunk.copy(packet, 1 + userIdBuf.length);

            wss.clients.forEach(c => {
              if (c.readyState === WebSocket.OPEN && (c as any).guildId === guildId) {
                c.send(packet);
              }
            });
          });

          const cleanup = () => {
            if (receiverSubscriptions.has(userId)) {
              receiverSubscriptions.delete(userId);
              decoder.destroy();
              opusStream.destroy();
            }
          };

          decoder.on('end', cleanup);
          decoder.on('error', cleanup);
          opusStream.on('end', cleanup);
          opusStream.on('error', cleanup);
        } catch (err) {
          console.error(`Error setting up receiver for ${userId}:`, err);
        }
      };

      connection.receiver.speaking.on('start', setupUserReceiver);

      connection.on(VoiceConnectionStatus.Ready, () => {
        const channel = client.channels.cache.get(channelId) as any;
        if (channel && channel.members) {
          channel.members.forEach((m: any) => setupUserReceiver(m.id));
        }
      });

      const player = createAudioPlayer({
        behaviors: { noSubscriber: NoSubscriberBehavior.Play }
      });

      const stream = new PassThrough();
      voiceStreams.set(guildId, stream);
      
      const resource = createAudioResource(stream, {
        inputType: StreamType.Raw
      });

      player.play(resource);
      connection.subscribe(player);
      voicePlayers.set(guildId, player);

      res.json({ status: "joined" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/bot/voice/leave", async (req, res) => {
    const { guildId } = req.body;
    const connection = getVoiceConnection(guildId);
    if (connection) {
      connection.destroy();
      voiceStreams.delete(guildId);
      voicePlayers.delete(guildId);
      res.json({ status: "left" });
    } else {
      res.status(400).json({ error: "No connection" });
    }
  });

  app.post("/api/bot/voice/play-music", async (req, res) => {
    const { guildId, url } = req.body;
    if (!guildId || !url) return res.status(400).json({ error: "Missing guildId or url" });

    const connection = getVoiceConnection(guildId);
    if (!connection) return res.status(400).json({ error: "Bot not in a voice channel. Join first." });

    try {
      let player = voicePlayers.get(guildId);
      if (!player) {
         player = createAudioPlayer({
            behaviors: { noSubscriber: NoSubscriberBehavior.Play }
         });
         connection.subscribe(player);
         voicePlayers.set(guildId, player);
      }

      const stream = await play.stream(url);
      const resource = createAudioResource(stream.stream, {
        inputType: stream.type
      });

      player.play(resource);
      res.json({ status: "playing", title: url });
    } catch (err: any) {
      console.error("Play music error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/bot/voice/stop-music", async (req, res) => {
    const { guildId } = req.body;
    const player = voicePlayers.get(guildId);
    if (player) {
      player.stop();
      res.json({ status: "stopped" });
    } else {
      res.status(400).json({ error: "No player found" });
    }
  });
  app.post("/api/bot/guilds/:guildId/sync-all-history", async (req, res) => {
    if (!discordClients.size) return res.status(400).json({ error: "No bots active" });
    const guildId = req.params.guildId;
    
    // Find client that has this guild
    let client: Client | undefined;
    for (const c of discordClients.values()) {
      if (c.guilds.cache.has(guildId)) {
        client = c;
        break;
      }
    }

    if (!client) return res.status(404).json({ error: "Guild not found on active bots" });

    try {
      const guild = await client.guilds.fetch(guildId);
      const textChannels = guild.channels.cache.filter(c => 
        (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) && 
        c.isTextBased()
      );
      
      let totalSynced = 0;
      const historyCollection = collection(db, "global_logs");

      // Process channels in parallel with limited concurrency
      const channelSyncPromises = Array.from(textChannels.values()).map(async (channel) => {
        if (!channel.isTextBased()) return;
        
        try {
          const messages = await (channel as any).messages.fetch({ limit: 50 });
          const syncPromises = [];

          for (const [msgId, message] of messages) {
            if (message.author.bot) continue;
            
            const promise = addDoc(historyCollection, {
              guildId: guild.id,
              guildName: guild.name,
              channelId: channel.id,
              channelName: (channel as any).name,
              messageId: message.id,
              authorId: message.author.id,
              authorName: message.author.tag,
              authorAvatar: message.author.displayAvatarURL(),
              content: message.content,
              timestamp: message.createdTimestamp,
              createdAt: serverTimestamp(),
              attachments: message.attachments.map((a: any) => a.url),
            }).catch(err => console.error(`Sync error for message ${msgId}:`, err));
            
            syncPromises.push(promise);
            totalSynced++;
          }
          await Promise.all(syncPromises);
        } catch (err) {
          console.error(`Error syncing channel ${channel.name}:`, err);
        }
      });

      await Promise.all(channelSyncPromises);
      res.json({ status: "success", syncedCount: totalSynced });
    } catch (error: any) {
      console.error("Sync all history error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const httpServer = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  wss.on('connection', (ws: WebSocket) => {
    let currentGuildId: string | null = null;
    console.log('WS Client Connected');

    ws.on('message', (data: Buffer) => {
      try {
        const msg = data.toString();
        if (msg.startsWith('{')) {
          const config = JSON.parse(msg);
          if (config.type === 'init' && config.guildId) {
            currentGuildId = config.guildId;
            (ws as any).guildId = config.guildId;
          }
          return;
        }

        if (currentGuildId && voiceStreams.has(currentGuildId)) {
          const monoBuffer = data;
          if (monoBuffer.length % 2 !== 0) return;
          const stereoBuffer = Buffer.alloc(monoBuffer.length * 2);
          for (let i = 0; i < monoBuffer.length; i += 2) {
            // Read 16-bit sample
            const sample = monoBuffer.readInt16LE(i);
            // Write to stereo buffer (Left)
            stereoBuffer.writeInt16LE(sample, i * 2);
            // Write to stereo buffer (Right)
            stereoBuffer.writeInt16LE(sample, i * 2 + 2);
          }
          voiceStreams.get(currentGuildId)?.write(stereoBuffer);
        }
      } catch (err) {}
    });
  });

}

startServer();
