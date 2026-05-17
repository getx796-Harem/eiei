import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Button from '../components/common/Button';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-purple-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-9xl font-bold text-white mb-4"
        >
          404
        </motion.div>
        <h1 className="text-4xl font-bold text-white mb-4">Page Not Found</h1>
        <p className="text-xl text-white opacity-90 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button
          icon={<Home size={20} />}
          onClick={() => navigate('/')}
          size="lg"
          className="bg-white text-[var(--color-primary)] hover:bg-gray-100"
        >
          Go Back Home
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;