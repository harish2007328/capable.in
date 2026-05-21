import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';
import Logo from '../components/Logo';
import glass404Image from '../assets/glass_404_render.png';

const NotFoundPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Page Not Found | Capable";
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Prevent double scrollbar by disabling background body scrolling
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] w-screen h-screen flex flex-col justify-between bg-white overflow-y-auto text-slate-800 font-sans">
      
      {/* Header (Starman style but light theme) */}
      <header className="w-full bg-white py-6 px-6 md:px-12 flex items-center justify-between select-none">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo color="dark" showText={true} />
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition-colors">Home</Link>
          <Link to="/features" className="hover:text-slate-800 transition-colors">Features</Link>
          <Link to="/pricing" className="hover:text-slate-800 transition-colors">Pricing</Link>
          <Link to={user ? "/dashboard" : "/login"} className="hover:text-slate-800 transition-colors">
            {user ? "Dashboard" : "Sign In"}
          </Link>
        </nav>

        {/* Right: Search Icon */}
        <div className="flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer p-1">
          <Search size={18} />
        </div>
      </header>

      {/* Main Centered Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-grow flex flex-col items-center justify-center text-center px-6 py-6 relative z-10 max-w-xl mx-auto w-full my-auto"
      >
        {/* Main 404 Image with Glass Effect Sphere - Multiplied to blend seamlessly */}
        <motion.div variants={itemVariants} className="w-full flex justify-center mb-2">
          <img 
            src={glass404Image} 
            alt="404 - Page Not Found" 
            className="w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] h-auto select-none pointer-events-none object-contain mix-blend-multiply"
          />
        </motion.div>

        {/* Headline */}
        <motion.h1 
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-sans font-semibold text-slate-800 mb-2 tracking-tight"
        >
          Oops, you've gone off course.
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          variants={itemVariants}
          className="text-slate-400 font-sans text-sm sm:text-base mb-8 max-w-md mx-auto"
        >
          We can't find the page that you're looking for...
        </motion.p>

        {/* Action Button */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center w-full"
        >
          <Link
            to={user ? "/dashboard" : "/"}
            className="px-8 py-3 bg-[var(--brand-accent)] text-white hover:bg-[var(--brand-accent-hover)] rounded-full font-sans font-semibold text-xs tracking-wider uppercase transition-colors duration-200 shadow-md shadow-blue-500/10"
          >
            Go Home
          </Link>
        </motion.div>
      </motion.div>

      {/* Spacer to push content down and keep layout centered, replacing the footer */}
      <div className="h-16 w-full select-none pointer-events-none"></div>

    </div>
  );
};

export default NotFoundPage;
