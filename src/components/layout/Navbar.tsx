import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, LogOut, Menu, X } from 'lucide-react';
import { motion } from 'motion/react';
import Button from '../common/Button';
import { useState } from 'react';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] sticky top-0 z-50 shadow-lg backdrop-blur"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center">
            <div className="text-2xl mr-3">✨</div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Terminal
            </h1>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon size={20} className="text-indigo-600" />
              ) : (
                <Sun size={20} className="text-yellow-400" />
              )}
            </motion.button>

            {user && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[var(--color-border)]">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full ring-2 ring-indigo-500"
                />
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {user.name}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<LogOut size={16} />}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-[var(--color-bg-secondary)]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 flex flex-col gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-border)] transition-colors flex items-center gap-2"
            >
              {theme === 'light' ? (
                <>
                  <Moon size={20} /> Dark Mode
                </>
              ) : (
                <>
                  <Sun size={20} /> Light Mode
                </>
              )}
            </motion.button>
            {user && (
              <Button
                variant="danger"
                size="sm"
                icon={<LogOut size={16} />}
                onClick={logout}
                fullWidth
              >
                Logout
              </Button>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;