import React, { useState } from 'react';
import { motion } from 'motion/react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Key, Server, Zap, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState({
    discordToken: '',
    guildId: '',
    geminiKey: '',
  });
  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    localStorage.setItem('botSettings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-3xl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          ⚙️ Bot Configuration
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Configure your Discord bot and API settings
        </p>
      </motion.div>

      {/* Discord Token */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Key size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Discord Bot Token
            </h2>
          </div>
          <Input
            label="Bot Token"
            type="password"
            placeholder="Enter your Discord bot token"
            helperText="Get your token from Discord Developer Portal"
            value={settings.discordToken}
            onChange={(e) => handleChange('discordToken', e.target.value)}
          />
        </Card>
      </motion.div>

      {/* Guild ID */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Server size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Guild ID
            </h2>
          </div>
          <Input
            label="Guild ID"
            type="text"
            placeholder="Enter your Discord server ID"
            helperText="Enable Developer Mode in Discord to get this ID"
            value={settings.guildId}
            onChange={(e) => handleChange('guildId', e.target.value)}
          />
        </Card>
      </motion.div>

      {/* Gemini API Key */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-lg">
              <Zap size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Google Gemini API Key
            </h2>
          </div>
          <Input
            label="API Key"
            type="password"
            placeholder="Enter your Gemini API key"
            helperText="Get your key from Google AI Studio"
            value={settings.geminiKey}
            onChange={(e) => handleChange('geminiKey', e.target.value)}
          />
        </Card>
      </motion.div>

      {/* Saved Notification */}
      {isSaved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-xl text-green-600 dark:text-green-300 font-bold flex items-center gap-2"
        >
          ✓ Settings saved successfully!
        </motion.div>
      )}

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Button
          size="lg"
          fullWidth
          icon={<Save size={20} />}
          onClick={handleSave}
          disabled={!settings.discordToken || !settings.guildId || !settings.geminiKey}
        >
          Save Configuration
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default Settings;