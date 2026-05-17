# TicketMaster & Control Terminal

This application is a full-stack support system integrating Discord bots with a web-based management terminal featuring real-time audio broadcasting and dynamic branding.

## Prerequisites
- Node.js (v18+)
- A Discord Bot Token (from Discord Developer Portal)
- Firebase Project (Firestore enabled)

## Local Setup

1. **Extract the files** to your project directory.
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Environment Variables**:
   Create a `.env` file in the root:
   ```env
   VITE_DISCORD_TOKEN=your_discord_bot_token
   VITE_GUILD_ID=your_target_server_id
   GEMINI_API_KEY=your_gemini_key
   ```
4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## Admin Access
- **Default Username**: `Admin`
- **Default Password**: `888`
- New users who register must be approved by the Admin in the **Staff Management** tab before they can log in.

## Music Sync
- Browsers require user interaction before playing audio. 
- Click the **"Join Sync"** button in the sidebar to hear the global broadcast.
- Only Admins can change the music in the **Terminal Config** tab.
