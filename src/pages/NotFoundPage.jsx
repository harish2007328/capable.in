import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Globe, ChevronDown } from 'lucide-react';
import Logo from '../components/Logo';

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

  const handleGoBack = (e) => {
    e.preventDefault();
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
      
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 md:px-12 flex items-center justify-between select-none">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo color="dark" showText={true} />
        </Link>

        {/* Custom premium language selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-full text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 cursor-pointer transition-colors duration-200">
          <Globe size={13} className="text-slate-400" />
          <span>English (English)</span>
          <ChevronDown size={11} className="text-slate-400" />
        </div>
      </header>

      {/* Main Centered Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-grow flex flex-col items-center justify-center text-center px-6 py-8 relative z-10 max-w-xl mx-auto w-full my-auto"
      >
        {/* Premium Glass Card for the 404 Text */}
        <motion.div 
          variants={itemVariants}
          className="relative px-12 py-4 bg-gradient-to-br from-white/70 to-white/30 backdrop-blur-md border border-slate-200/50 rounded-2xl flex items-center justify-center mb-6 overflow-hidden shadow-sm"
          style={{
            boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 10px 30px -10px rgba(0, 102, 204, 0.05)'
          }}
        >
          {/* Subtle gloss sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/35 pointer-events-none"></div>
          <span className="text-6xl sm:text-7xl font-sans font-light tracking-tighter text-slate-800/90 leading-none select-none cursor-default">
            404
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          variants={itemVariants}
          className="text-3xl sm:text-4xl font-sans font-normal text-slate-900 mb-4 tracking-tight"
        >
          Page not found
        </motion.h1>

        {/* Detailed Copy */}
        <motion.p 
          variants={itemVariants}
          className="text-slate-500 font-sans text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-8 px-4"
        >
          Uh oh, we can’t seem to find the page you’re looking for. Try going back to the <button onClick={handleGoBack} className="text-[var(--brand-accent)] hover:underline font-bold focus:outline-none">previous page</button> or see our <Link to={user ? "/dashboard" : "/"} className="text-[var(--brand-accent)] hover:underline font-bold">Help Center</Link> for more information.
        </motion.p>

        {/* Action Button */}
        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-center w-full"
        >
          <Link
            to={user ? "/dashboard" : "/"}
            className="px-6 py-2 border border-[var(--brand-accent)] text-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/5 rounded-full font-sans font-semibold text-sm transition-colors duration-200"
          >
            {user ? "Go to your dashboard" : "Go to homepage"}
          </Link>
        </motion.div>
      </motion.div>

      {/* Subtle brand vector landscape at the bottom */}
      <div className="relative w-full h-[180px] md:h-[220px] pointer-events-none z-0 overflow-hidden select-none">
        <svg className="w-full h-full" viewBox="0 0 1200 240" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Ground/Floor */}
          <path d="M 0 205 Q 600 185, 1200 205 L 1200 240 L 0 240 Z" fill="#f4f9fd" />
          <path d="M 0 215 Q 600 200, 1200 215 L 1200 240 L 0 240 Z" fill="#eaf5fc" />

          {/* Left Mountains/Pine Trees (Solid Fills) */}
          {/* Far left back: tall, lightest blue */}
          <path d="M -10 240 L 35 90 L 100 240 Z" fill="#e6f7ff" />
          {/* Left mid: medium blue */}
          <path d="M -40 240 L 15 120 L 70 240 Z" fill="#bae7ff" />
          {/* Left front: tallest/darkest of the left side */}
          <path d="M 40 240 L 95 100 L 160 240 Z" fill="#7ec2f3" />
          {/* Smallest left peak */}
          <path d="M 10 240 L 45 155 L 85 240 Z" fill="#91d5ff" />

          {/* Right Mountains/Pine Trees (Solid Fills) */}
          {/* Far right back: tall, lightest blue */}
          <path d="M 1100 240 L 1165 80 L 1220 240 Z" fill="#e6f7ff" />
          {/* Right mid: medium blue */}
          <path d="M 1030 240 L 1095 110 L 1160 240 Z" fill="#bae7ff" />
          {/* Right front: darkest */}
          <path d="M 1070 240 L 1125 130 L 1180 240 Z" fill="#7ec2f3" />

          {/* Center Telescope pointing up-right */}
          <g transform="translate(600, 160)">
            {/* Crate/Box next to telescope base */}
            <rect x="-45" y="25" width="22" height="15" rx="1.5" fill="white" stroke="#0066CC" strokeWidth="1.8" />
            <line x1="-45" y1="30" x2="-23" y2="30" stroke="#0066CC" strokeWidth="1.2" />
            <line x1="-34" y1="25" x2="-34" y2="40" stroke="#0066CC" strokeWidth="1.2" />

            {/* Tripod Legs */}
            <line x1="0" y1="0" x2="-22" y2="40" stroke="#0066CC" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="0" y2="40" stroke="#0066CC" strokeWidth="2.2" strokeLinecap="round" />
            <line x1="0" y1="0" x2="22" y2="40" stroke="#0066CC" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3" fill="#0066CC" />

            {/* Telescope Barrel tilted at -35 degrees (up-right) */}
            <g transform="rotate(-35)">
              <rect x="-30" y="-4.5" width="60" height="9" rx="1.5" fill="white" stroke="#0066CC" strokeWidth="2" />
              {/* Finder scope */}
              <rect x="-10" y="-9" width="16" height="3" fill="#0066CC" rx="0.5" />
              <line x1="-6" y1="-6" x2="-6" y2="-4.5" stroke="#0066CC" strokeWidth="1.5" />
              <line x1="2" y1="-6" x2="2" y2="-4.5" stroke="#0066CC" strokeWidth="1.5" />
              {/* Focus wheel */}
              <circle cx="-18" cy="7" r="2.5" fill="#0066CC" />
              {/* Diagonal and Eyepiece */}
              <path d="M -30 -1 L -35 -4 L -38 -4 L -38 2 L -34 2 Z" fill="#0066CC" />
              {/* Dew shield (front cap) */}
              <rect x="30" y="-6" width="5" height="12" fill="#0066CC" rx="1" />
            </g>
          </g>

          {/* Stars (Pluses and Dots) */}
          {/* Plus sign 1 */}
          <g transform="translate(250, 60)" stroke="#7ec2f3" strokeWidth="1.5">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
          </g>
          {/* Plus sign 2 */}
          <g transform="translate(950, 70)" stroke="#7ec2f3" strokeWidth="1.5">
            <line x1="-5" y1="0" x2="5" y2="0" />
            <line x1="0" y1="-5" x2="0" y2="5" />
          </g>
          {/* Plus sign 3 */}
          <g transform="translate(420, 90)" stroke="#bae7ff" strokeWidth="1.2">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
          </g>
          {/* Plus sign 4 */}
          <g transform="translate(780, 50)" stroke="#bae7ff" strokeWidth="1.2">
            <line x1="-4" y1="0" x2="4" y2="0" />
            <line x1="0" y1="-4" x2="0" y2="4" />
          </g>

          {/* Dot stars */}
          <circle cx="150" cy="80" r="1.5" fill="#bae7ff" />
          <circle cx="340" cy="40" r="1.5" fill="#bae7ff" />
          <circle cx="560" cy="70" r="2" fill="#7ec2f3" />
          <circle cx="850" cy="100" r="1.5" fill="#bae7ff" />
          <circle cx="1020" cy="50" r="1.5" fill="#bae7ff" />
        </svg>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#f3f6f8] border-t border-slate-200 py-3.5 px-6 z-10 select-none">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] font-semibold text-slate-500 font-sans">
          <span className="flex items-center gap-1">
            <span className="font-bold text-slate-700">capable</span> © 2026
          </span>
          <a href="/user-agreement" className="hover:text-[var(--brand-accent)] hover:underline">User Agreement</a>
          <a href="/privacy-policy" className="hover:text-[var(--brand-accent)] hover:underline">Privacy Policy</a>
          <a href="/community-guidelines" className="hover:text-[var(--brand-accent)] hover:underline">Community Guidelines</a>
          <a href="/cookie-policy" className="hover:text-[var(--brand-accent)] hover:underline">Cookie Policy</a>
          <a href="/copyright-policy" className="hover:text-[var(--brand-accent)] hover:underline">Copyright Policy</a>
          <a href="/guest-controls" className="hover:text-[var(--brand-accent)] hover:underline">Guest Controls</a>
        </div>
      </footer>

    </div>
  );
};

export default NotFoundPage;
