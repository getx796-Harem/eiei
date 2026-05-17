import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Button from '../components/common/Button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-primary relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center relative z-10"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl font-bold text-white mb-4"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-white/80 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          icon={<Home size={20} />}
          onClick={() => navigate('/')}
          size="lg"
          className="bg-white text-indigo-600 hover:bg-gray-100"
        >
          Go Back Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;