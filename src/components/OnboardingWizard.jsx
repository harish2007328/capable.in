import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Building2, Lightbulb, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { id: 'founder', label: 'Founder / Entrepreneur' },
  { id: 'engineering', label: 'Software Engineer' },
  { id: 'product', label: 'Product Manager' },
  { id: 'designer', label: 'Designer / Creative' },
  { id: 'sales', label: 'Sales representative' },
  { id: 'marketing', label: 'Marketing specialist' },
  { id: 'operations', label: 'Operations lead' },
  { id: 'finance', label: 'Finance / Investor' },
  { id: 'consultant', label: 'Business Consultant' },
  { id: 'other', label: 'Other' }
];

const OnboardingWizard = ({ onComplete, onBackToHome }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    companyName: '',
    idea: ''
  });

  const [errors, setErrors] = useState({});

  // Prefill name from authenticated user if available
  useEffect(() => {
    if (user) {
      const authName = user.profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || '';
      if (authName && !formData.name) {
        setFormData(prev => ({ ...prev, name: authName }));
      }
    }
  }, [user]);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1 && !formData.name.trim()) {
      newErrors.name = 'Please enter your name to proceed.';
    }
    if (step === 2 && !formData.role) {
      newErrors.role = 'Please select a role that best describes you.';
    }
    if (step === 4 && !formData.companyName.trim()) {
      newErrors.companyName = 'Please enter a name for your company or project.';
    }
    if (step === 5) {
      const words = formData.idea.trim().split(/\s+/).filter(w => w.length > 0);
      if (!formData.idea.trim()) {
        newErrors.idea = 'Please describe your business idea or company.';
      } else if (words.length < 3) {
        newErrors.idea = 'Please provide a slightly more descriptive explanation (at least 3 words).';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 5) {
        onComplete(formData);
      } else {
        setStep(prev => prev + 1);
      }
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBackToHome();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] }
    })
  };

  const [direction, setDirection] = useState(1);

  const setStepWithDirection = (newStep) => {
    setDirection(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  // Helper to change step with validation
  const goToNextStep = () => {
    if (validateStep()) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const goToPrevStep = () => {
    setDirection(-1);
    if (step === 1) {
      onBackToHome();
    } else {
      setStep(prev => prev - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-10 px-4 md:px-8 bg-gradient-to-b from-[#FAFAFA] to-[#F3F4F6] min-h-[85vh]">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-[32px] shadow-2xl p-6 md:p-10 relative overflow-hidden flex flex-col min-h-[480px] justify-between">
        
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Header indicator */}
        <div className="flex justify-between items-center mb-6 pt-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Step {step} of 5
          </span>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {Math.round((step / 5) * 100)}% Complete
          </span>
        </div>

        {/* Step Content Stage */}
        <div className="flex-1 flex flex-col justify-center py-4">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full flex flex-col"
            >
              {step === 1 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User size={22} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display text-gray-900 leading-tight">
                      First, what should we call you?
                    </h2>
                    <p className="text-gray-500 text-sm">
                      We'll personalize your roadmap and onboarding reports using your name.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && goToNextStep()}
                      className={`w-full px-5 py-4 border rounded-2xl text-lg outline-none transition-all ${
                        errors.name 
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                      autoFocus
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs font-medium pl-1">{errors.name}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Briefcase size={22} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display text-gray-900 leading-tight">
                      Which best describes you?
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Select your primary role or background to help us tailor recommendations.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                    {ROLES.map((role) => (
                      <button
                        key={role.id}
                        onClick={() => {
                          setFormData({ ...formData, role: role.label });
                          if (errors.role) setErrors({ ...errors, role: '' });
                        }}
                        className={`p-3 text-left border rounded-xl font-medium text-sm transition-all flex justify-between items-center ${
                          formData.role === role.label
                            ? 'border-blue-600 bg-blue-50/40 text-blue-700 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{role.label}</span>
                        {formData.role === role.label && (
                          <Check size={14} className="text-blue-600 shrink-0 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-red-500 text-xs font-medium pl-1">{errors.role}</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 text-center py-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-100">
                    <Sparkles size={28} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-display text-gray-900 leading-tight">
                      Hi {formData.name.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-600 text-base max-w-md mx-auto leading-relaxed">
                      You're about to map out the strategy and action plan for your venture. Let's design your roadmap together.
                    </p>
                  </div>
                  <button
                    onClick={goToNextStep}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-[16px] shadow-lg shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <span>Turn your idea into business</span>
                    <ArrowRight size={18} />
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Building2 size={22} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display text-gray-900 leading-tight">
                      What is your company or project name?
                    </h2>
                    <p className="text-gray-500 text-sm">
                      If you haven't decided on one yet, a working title is perfectly fine.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp, SolarFlow, local bakery"
                      value={formData.companyName}
                      onChange={(e) => {
                        setFormData({ ...formData, companyName: e.target.value });
                        if (errors.companyName) setErrors({ ...errors, companyName: '' });
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && goToNextStep()}
                      className={`w-full px-5 py-4 border rounded-2xl text-lg outline-none transition-all ${
                        errors.companyName 
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                      autoFocus
                    />
                    {errors.companyName && (
                      <p className="text-red-500 text-xs font-medium pl-1">{errors.companyName}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <Lightbulb size={22} />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display text-gray-900 leading-tight">
                      Describe your idea or company
                    </h2>
                    <p className="text-gray-500 text-sm">
                      Tell us what you want to build. The more context you provide, the better questions our AI can generate for you.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      placeholder="e.g. A marketplace connecting local bakeries with customers who want custom wedding cakes, including delivery tracking and review systems..."
                      value={formData.idea}
                      onChange={(e) => {
                        setFormData({ ...formData, idea: e.target.value });
                        if (errors.idea) setErrors({ ...errors, idea: '' });
                      }}
                      className={`w-full h-32 px-5 py-4 border rounded-2xl text-base outline-none resize-none transition-all custom-scrollbar ${
                        errors.idea 
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                          : 'border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                      autoFocus
                    />
                    {errors.idea && (
                      <p className="text-red-500 text-xs font-medium pl-1">{errors.idea}</p>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Actions - Skip for step 3 since it has its own prominent CTA */}
        {step !== 3 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={goToPrevStep}
              className="px-5 py-3 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors active:scale-95 flex items-center gap-1.5"
            >
              <span>{step === 5 ? 'Launch Setup' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingWizard;
