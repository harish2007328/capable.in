import React, { useState } from 'react';

const QuestionList = ({ questions, onSubmit }) => {
    const [answers, setAnswers] = useState('');

    const handleSubmit = () => {
        if (answers.trim()) {
            onSubmit(answers);
        }
    };

    return (
        <div className="w-full max-w-3xl flex flex-col items-center space-y-8 animate-fade-in-up">
            <div className="text-center space-y-2">
                <h2 className="text-2xl md:text-3xl font-display font-normal text-paper">
                    Let's reduce the ambiguity.
                </h2>
                <p className="text-stone text-sm md:text-base">
                    Answer strictly. The better your answers, the sharper the analysis.
                </p>
            </div>

            {/* Questions Display */}
            <div className="w-full bg-zinc-900/30 border border-white/10 rounded-xl p-6 md:p-8 space-y-4">
                <ul className="list-disc list-outside ml-5 space-y-2 text-paper/80 font-body text-sm md:text-base">
                    {questions.map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                            {q}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Answer Input */}
            <div className="w-full space-y-4">
                <textarea
                    value={answers}
                    onChange={(e) => setAnswers(e.target.value)}
                    placeholder="Type your answers here (e.g., 1. Yes, 2. No...)"
                    rows={6}
                    className="w-full bg-transparent border border-stone/20 rounded-xl p-4 text-paper placeholder-stone/30 focus:outline-none focus:border-paper/40 transition-colors font-body"
                />

                <button
                    onClick={handleSubmit}
                    disabled={!answers.trim()}
                    className={`
             w-full py-4 rounded-xl font-bold font-body tracking-widest uppercase text-sm
             transition-all duration-300
             ${answers.trim()
                            ? 'bg-paper text-noir hover:bg-white hover:shadow-lg cursor-pointer'
                            : 'bg-stone/10 text-stone/40 cursor-not-allowed'}
          `}
                >
                    Generate Analysis
                </button>
            </div>
        </div>
    );
};

export default QuestionList;
