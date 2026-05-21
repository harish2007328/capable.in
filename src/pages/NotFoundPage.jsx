import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import ParticleBackground from '../components/ParticleBackground';

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
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="relative min-h-[92vh] w-full flex flex-col items-center justify-center pt-[130px] pb-[80px] px-6 overflow-hidden bg-gradient-to-br from-[#051F5F] via-[#004A9E] to-[#0066CC]">
      
      {/* 3D Wave Particle Background */}
      <ParticleBackground />

      {/* Decorative Aura / Glowing Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/20 rounded-full blur-[140px] pointer-events-none -z-0"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-xl bg-white/10 backdrop-blur-2xl border border-white/15 rounded-3xl p-10 md:p-12 text-center shadow-2xl relative flex flex-col items-center z-10"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
      >
        {/* Glowing top line decorator */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-sky-400 via-white to-blue-400 rounded-t-3xl"></div>

        {/* Brand Logo inside card */}
        <motion.div variants={itemVariants} className="mb-8">
          <Logo color="white" showText={true} className="scale-[1.1]" />
        </motion.div>

        {/* Massive 404 Typography */}
        <motion.h1 
          variants={itemVariants}
          className="text-8xl sm:text-[130px] font-sans font-extralight text-white tracking-tighter leading-none mb-2 select-none cursor-default"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          404
        </motion.h1>

        {/* Subtitle category */}
        <motion.span 
          variants={itemVariants}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-200/80 mb-6 block"
        >
          Error Code: Page Not Found
        </motion.span>

        {/* Elegant headline */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-sans font-normal text-white leading-tight tracking-tightest mb-4"
        >
          We can’t find this page, <br />
          but we can build your <span className="font-instrument-serif italic text-sky-200">venture.</span>
        </motion.h2>

        {/* Descriptive paragraph */}
        <motion.p 
          variants={itemVariants}
          className="text-white/70 font-sans text-sm leading-relaxed max-w-sm mx-auto mb-8 font-medium"
        >
          The page you are looking for might have been moved, deleted, or is temporarily unavailable. Let’s get you back on track.
        </motion.p>

        {/* Premium action buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-3.5 justify-center w-full max-w-sm mx-auto"
        >
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3 border border-white/20 hover:border-white/30 hover:bg-white/10 text-white font-sans font-semibold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>

          <Link
            to={user ? "/dashboard" : "/"}
            className="w-full sm:w-auto px-7 py-3 bg-white text-slate-900 hover:bg-slate-50 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
          >
            <Home size={14} />
            <span>{user ? "Go to Dashboard" : "Return to Home"}</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
