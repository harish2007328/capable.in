import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Page Not Found | Capable";
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(user ? '/dashboard' : '/');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center pt-[150px] pb-[90px] px-6 overflow-hidden bg-transparent text-slate-900">
      
      {/* Subtle light ambient glow behind card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-50/30 rounded-full blur-[80px] pointer-events-none -z-10"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm text-center flex flex-col items-center z-10"
      >
        {/* Premium glossy glassmorphic card for the 404 text */}
        <motion.div 
          variants={itemVariants}
          className="relative px-12 py-8 bg-white/20 backdrop-blur-xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.03)] flex items-center justify-center mb-8 overflow-hidden group"
          style={{
            boxShadow: '0 20px 40px -15px rgba(0, 102, 204, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)'
          }}
        >
          {/* Subtle glossy highlight gradient */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/30 pointer-events-none"></div>
          
          {/* Big minimal 404 typography */}
          <span className="text-8xl sm:text-9xl font-sans font-light tracking-tighter text-slate-800/90 leading-none select-none cursor-default">
            404
          </span>
        </motion.div>

        {/* Minimal heading */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-sans font-normal text-slate-900 mb-3 tracking-tight"
        >
          Page not <span className="font-instrument-serif italic text-brand-blue">found.</span>
        </motion.h2>

        {/* Client-friendly paragraph */}
        <motion.p 
          variants={itemVariants}
          className="text-slate-400 text-sm font-sans mb-8 max-w-[280px] mx-auto leading-relaxed"
        >
          The page you followed may have been moved, deleted, or doesn't exist.
        </motion.p>

        {/* Minimal actions */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-3.5 justify-center w-full"
        >
          <button
            onClick={handleGoBack}
            className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 font-sans font-semibold text-xs uppercase tracking-wider rounded-xl transition-all duration-200"
          >
            Go Back
          </button>

          <Link
            to={user ? "/dashboard" : "/"}
            className="px-6 py-2.5 bg-brand-black text-white hover:bg-slate-800 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm"
          >
            {user ? "Dashboard" : "Home"}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
