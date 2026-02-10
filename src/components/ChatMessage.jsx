import React, { useState } from 'react';

const ChatMessage = ({ message, question, onReply }) => {
    const [reply, setReply] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (reply.trim()) onReply(reply);
    };

    return (
        <div className="w-full max-w-3xl flex flex-col items-center space-y-12 animate-fade-in-up">
            {/* Mentor Content */}
            <div className="space-y-6 text-center">
                <p className="text-xl md:text-2xl lg:text-3xl text-paper font-display leading-relaxed">
                    {message}
                </p>
                <p className="text-lg md:text-xl text-stone/80 font-body italic">
                    {question}
                </p>
            </div>

            {/* User Reply Input */}
            <form onSubmit={handleSubmit} className="w-full relative group">
                <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="
            w-full bg-transparent border-b border-stone/20 py-4 
            text-center text-xl text-paper placeholder-stone/20
            focus:outline-none focus:border-stone/60
            transition-colors duration-300 font-body
          "
                    placeholder="Type your answer..."
                    autoFocus
                />
                <button
                    type="submit"
                    className={`
                absolute right-0 top-1/2 -translate-y-1/2 
                text-xs uppercase tracking-widest text-stone/50 hover:text-paper
                transition-all duration-300
                ${reply ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}
            `}
                >
                    Reply
                </button>
            </form>
        </div>
    );
};

export default ChatMessage;
