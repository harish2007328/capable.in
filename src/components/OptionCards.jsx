import React from 'react';

const OptionCards = ({ cards, onSelect }) => {
    if (!cards || cards.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl animate-fade-in-up">
            {cards.map((card, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(card)}
                    className="
            group flex flex-col items-start text-left p-6 md:p-8
            bg-zinc-900/30 backdrop-blur-sm border border-white/5 rounded-2xl
            hover:bg-zinc-800/50 hover:border-white/20 hover:scale-[1.02]
            transition-all duration-300 ease-out
          "
                >
                    <span className="text-xl md:text-2xl font-display font-bold text-paper mb-3 group-hover:text-white transition-colors">
                        {card.title}
                    </span>
                    <p className="text-sm md:text-base text-stone font-body leading-relaxed group-hover:text-stone/80">
                        {card.hint}
                    </p>
                </button>
            ))}
        </div>
    );
};

export default OptionCards;
