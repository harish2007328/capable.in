import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, HelpCircle, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Set page title for SEO / Document title
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
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const pathVariants = {
    hidden: { strokeDashoffset: 400, opacity: 0 },
    visible: {
      strokeDashoffset: 0,
      opacity: 1,
      transition: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "loop" }
    }
  };

  return (
    <div className="relative min-h-[90vh] w-full flex flex-col items-center justify-center pt-[150px] pb-[100px] px-6 overflow-hidden">
      
      {/* Decorative Aura / Glowing Ambient Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]"></div>
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl text-center flex flex-col items-center z-10"
      >
        {/* Animated Custom Visual representation of lost path */}
        <motion.div 
          variants={itemVariants} 
          className="relative w-48 h-48 mb-8 flex items-center justify-center"
        >
          {/* Pulsing ring background */}
          <div className="absolute inset-0 rounded-full border border-blue-50/50 bg-gradient-to-b from-blue-50/10 to-transparent animate-ping duration-[3000ms]"></div>
          
          {/* Animated SVG Path finder */}
          <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="30" stroke="#E2E8F0" strokeWidth="1" />
            
            {/* Animated target orbit */}
            <motion.circle 
              cx="50" 
              cy="50" 
              r="30" 
              stroke="#0066CC" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="20 180"
              animate={{ rotate: 360 }}
              transition={{ duration: 6, ease: "linear", repeat: Infinity }}
              style={{ originX: "50px", originY: "50px" }}
            />

            {/* Glowing path */}
            <motion.path 
              d="M 50 15 A 35 35 0 0 1 85 50 L 50 50 Z" 
              stroke="url(#neon-gradient)" 
              strokeWidth="2" 
              strokeLinecap="round"
              className="opacity-75"
              animate={{ rotate: -360 }}
              transition={{ duration: 12, ease: "linear", repeat: Infinity }}
              style={{ originX: "50px", originY: "50px" }}
            />
            
            <defs>
              <linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066CC" />
                <stop offset="100%" stopColor="#00E5FF" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Logo/Icon inside center */}
            <g transform="translate(38, 38)">
              <Compass className="w-6 h-6 text-brand-blue" strokeWidth={1.5} />
            </g>
          </svg>
          
          {/* Large elegant 404 floating indicator */}
          <div className="absolute -bottom-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm">
            <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Error 404</span>
          </div>
        </motion.div>

        {/* Serif-styled primary message */}
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl font-sans font-normal text-slate-900 leading-tight tracking-tightest mb-4"
        >
          Lost in <span className="font-instrument-serif italic text-brand-blue">development?</span>
        </motion.h1>

        {/* Friendly explanation */}
        <motion.p 
          variants={itemVariants}
          className="text-slate-500 font-sans text-base sm:text-lg leading-relaxed max-w-lg mx-auto mb-10"
        >
          The page you are looking for has either moved, been renamed, or doesn't exist. Let's get your business back on track.
        </motion.p>

        {/* Premium Actions Grid */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center gap-4 justify-center w-full max-w-md mx-auto"
        >
          {/* Go Back button (secondary style) */}
          <button
            onClick={handleGoBack}
            className="w-full sm:w-auto px-6 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-sans font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          {/* Primary Action to Home or Dashboard */}
          <Link
            to={user ? "/dashboard" : "/"}
            className="w-full sm:w-auto px-8 py-3.5 bg-brand-black text-white hover:bg-slate-800 font-sans font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-black/5"
          >
            <Home size={16} />
            <span>{user ? "Go to Dashboard" : "Return to Home"}</span>
          </Link>
        </motion.div>

        {/* Small footer link/support reference */}
        <motion.div 
          variants={itemVariants}
          className="mt-12 text-slate-400 text-xs flex items-center justify-center gap-1.5"
        >
          <HelpCircle size={14} />
          <span>Need help? Contact <a href="mailto:support@capable.in" className="text-brand-blue hover:underline">support@capable.in</a></span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
