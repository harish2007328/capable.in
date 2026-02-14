import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

const OnboardSummary = ({ questions, answers, onProceed, isReadonly = false }) => {
    // Robust Answer Parsing
    let parsedAnswers = [];
    if (typeof answers === 'string') {
        try {
            parsedAnswers = JSON.parse(answers);
        } catch (e) {
            // Fallback for plain text format
            const lines = answers.split('\n');
            lines.forEach(line => {
                const parts = line.match(/Q: (.*?) A: (.*)/);
                if (parts) parsedAnswers.push({ question: parts[1], answer: parts[2] });
            });
        }
    } else if (Array.isArray(answers)) {
        parsedAnswers = answers;
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    const getAnswerText = (entry) => {
        if (!entry) return 'Signal missing';

        let val = entry;
        // If entry is an object {question, answer}, extract answer
        if (typeof entry === 'object' && entry !== null && 'answer' in entry) {
            val = entry.answer;
        }

        // If the extracted value is still an object (e.g. nested), stringify it or fallback
        if (typeof val === 'object' && val !== null) {
            if (Array.isArray(val)) return val.join(', ');
            return JSON.stringify(val);
        }

        return String(val || 'Not provided');
    };

    return (
        <div className="w-full h-full flex flex-col items-center">

            <div className="w-full px-6 py-8">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 border-b border-gray-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-50 rounded-md">
                                <FileText size={16} className="text-[var(--brand-accent)]" />
                            </div>
                            <span className="text-xs font-bold text-[var(--brand-accent)] uppercase tracking-widest">
                                Project Brief
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Discovery Context
                        </h2>
                        <p className="text-gray-500 mt-1 max-w-xl text-sm">
                            {isReadonly
                                ? "This foundational data is currently driving your strategy engine."
                                : "Review your inputs. This data will be used to generate your strategic roadmap."}
                        </p>
                    </div>

                    {!isReadonly && (
                        <button
                            onClick={onProceed}
                            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white rounded-lg font-bold hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                        >
                            <span className="text-sm">Initialize Strategy</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    )}
                </motion.div>

                {/* Data Grid - Manifest Style (Grid View) */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                    {questions.map((q, index) => {
                        const questionText = q.text || q;
                        const entry = parsedAnswers[index] || parsedAnswers.find(a => a.question === questionText);
                        const answerText = getAnswerText(entry);
                        const theme = q.theme || `Signal 0${index + 1}`;

                        return (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md hover:border-[var(--brand-accent)]/30 transition-all group flex flex-col h-full"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="w-1.5 h-1.5 bg-[var(--brand-accent)] rounded-full"></span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        {theme}
                                    </span>
                                </div>

                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-relaxed mb-4 min-h-[3rem]">
                                    {questionText}
                                </h3>

                                <div className="mt-auto pt-4 border-t border-gray-50">
                                    <p className="text-sm md:text-base font-medium text-gray-900 leading-relaxed selection:bg-blue-50 selection:text-[var(--brand-accent)] line-clamp-4 hover:line-clamp-none transition-all">
                                        {answerText}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Footer Actions */}
                {!isReadonly && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 flex justify-between items-center border-t border-gray-100 pt-8"
                    >
                        <button
                            onClick={() => {
                                if (window.confirm("This will erase your current session. Restart discovery?")) {
                                    localStorage.removeItem('userAnswers');
                                    localStorage.removeItem('wizardConfirmed');
                                    window.location.reload();
                                }
                            }}
                            className="flex items-center gap-2 text-gray-400 hover:text-red-600 transition-colors text-xs font-bold uppercase tracking-widest"
                        >
                            <RotateCcw size={14} />
                            Reset Data
                        </button>

                        <div className="flex items-center gap-2 text-[var(--brand-accent)] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                            <ShieldCheck size={14} />
                            <span className="text-xs font-bold uppercase tracking-wide">Secure Context</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default OnboardSummary;
