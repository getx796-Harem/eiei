import React from 'react';
import { motion } from 'motion/react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Users, Shield, Activity, TrendingUp } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const staffMembers = [
    { id: 1, name: 'Alice Johnson', role: 'Senior Moderator', status: 'online' },
    { id: 2, name: 'Bob Smith', role: 'Moderator', status: 'offline' },
    { id: 3, name: 'Charlie Brown', role: 'Support Agent', status: 'online' },
  ];

  const systemStats = [
    { label: 'Bot Uptime', value: '99.8%', icon: Activity },
    { label: 'Response Time', value: '124ms', icon: TrendingUp },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-2">
          Admin Panel
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage staff, users, and monitor system health
        </p>
      </motion.div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {systemStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-[var(--color-text-primary)] mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <Icon size={40} className="text-[var(--color-primary)] opacity-20" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Staff Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-[var(--color-primary)]" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Staff Management
            </h2>
          </div>

          <div className="space-y-3">
            {staffMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white font-bold">
                    {member.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {member.name}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {member.role}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      member.status === 'online'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                    {member.status}
                  </span>
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <Button variant="secondary" fullWidth className="mt-4">
            Add New Staff Member
          </Button>
        </Card>
      </motion.div>

      {/* Moderation Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-[var(--color-primary)]" />
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
              Moderation Tools
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" fullWidth>
              Ban User
            </Button>
            <Button variant="secondary" fullWidth>
              Mute User
            </Button>
            <Button variant="secondary" fullWidth>
              View Logs
            </Button>
            <Button variant="secondary" fullWidth>
              Settings
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default AdminPanel;