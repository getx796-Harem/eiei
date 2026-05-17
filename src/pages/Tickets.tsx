import React, { useState } from 'react';
import { motion } from 'motion/react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Search, Filter, Plus } from 'lucide-react';

const Tickets: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const tickets = [
    {
      id: '#001',
      title: 'Payment Issue',
      author: 'John Doe',
      status: 'open',
      priority: 'high',
      created: '2 hours ago',
    },
    {
      id: '#002',
      title: 'Account Verification',
      author: 'Jane Smith',
      status: 'in-progress',
      priority: 'medium',
      created: '4 hours ago',
    },
    {
      id: '#003',
      title: 'Feature Request',
      author: 'Mike Johnson',
      status: 'closed',
      priority: 'low',
      created: '1 day ago',
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-[var(--color-text-primary)] mb-6">
          Support Tickets
        </h1>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tickets..."
              icon={<Search size={18} />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button icon={<Filter size={20} />} variant="secondary">
            Filter
          </Button>
          <Button icon={<Plus size={20} />}>New Ticket</Button>
        </div>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-3">
        {tickets.map((ticket, idx) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-1">
                    {ticket.id}
                  </p>
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {ticket.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-secondary)] mt-2">
                    by {ticket.author} • {ticket.created}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.priority === 'high'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : ticket.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.status === 'open'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : ticket.status === 'in-progress'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}
                  >
                    {ticket.status}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Tickets;