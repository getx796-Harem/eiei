import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Settings,
  Users,
  ChevronRight,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Ticket, label: 'Tickets', path: '/tickets' },
    ...(user?.role === 'admin'
      ? [
          { icon: Settings, label: 'Settings', path: '/settings' },
          { icon: Users, label: 'Admin Panel', path: '/admin' },
        ]
      : []),
  ];

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="hidden lg:block w-64 bg-[var(--color-bg-primary)] border-r border-[var(--color-border)] h-screen sticky top-16 overflow-y-auto"
    >
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                )}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight size={18} className="ml-auto" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;