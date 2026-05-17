import React from 'react';
import { motion } from 'motion/react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { BarChart3, Users, Zap, MessageSquare, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Total Tickets',
      value: '24',
      icon: Zap,
      gradient: true,
    },
    {
      label: 'Active Members',
      value: '156',
      icon: Users,
      gradient: false,
    },
    {
      label: 'Messages',
      value: '1.2K',
      icon: MessageSquare,
      gradient: false,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold text-[var(--color-text-primary)]">
            Welcome back, <span className="bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">{user?.name}</span>! 👋
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-2 text-lg">
            Here's what's happening with your Discord Bot today.
          </p>
        </div>
        <Button icon={<Plus size={20} />} size="lg">
          New Ticket
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card gradient={stat.gradient}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{stat.label}</p>
                    <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.gradient ? 'bg-white/20' : 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20'}`}>
                    <Icon size={32} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tickets */}
        <motion.div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Zap size={24} className="text-indigo-500" />
              Recent Tickets
            </h2>
            <div className="space-y-3">
              {[
                {
                  id: '#001',
                  title: 'Payment Issue',
                  status: 'open',
                  time: '2 hours ago',
                },
                {
                  id: '#002',
                  title: 'Account Verification',
                  status: 'in-progress',
                  time: '4 hours ago',
                },
                {
                  id: '#003',
                  title: 'Feature Request',
                  status: 'closed',
                  time: '1 day ago',
                },
              ].map((ticket, idx) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] hover:border-indigo-500/50 transition-all"
                >
                  <div>
                    <p className="font-semibold text-[var(--color-text-primary)]">
                      {ticket.id} - {ticket.title}
                    </p>
                    <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                      {ticket.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'open'
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300'
                        : ticket.status === 'in-progress'
                        ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300'
                        : 'bg-green-500/20 text-green-600 dark:text-green-300'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </motion.div>
              ))}
            </div>
            <Button variant="ghost" className="mt-4 w-full justify-center">
              View All Tickets <ArrowRight size={16} />
            </Button>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div>
          <Card>
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button variant="primary" fullWidth>
                🎤 Join Voice
              </Button>
              <Button variant="secondary" fullWidth>
                📢 Broadcast
              </Button>
              <Button variant="success" fullWidth>
                ✨ Support Panel
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;