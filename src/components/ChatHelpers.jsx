import React, { useState, useEffect, useRef } from 'react';
import { LogoIcon } from './Logo';

export const ThinkingBubble = ({ text = "Thinking..." }) => {
    const [seconds, setSeconds] = useState("0.0");

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setSeconds(elapsed.toFixed(1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col w-full px-1 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 mb-1.5">
                <LogoIcon className="w-[15px] h-[15px]" style={{ filter: "brightness(0)", opacity: 0.7 }} />
                <span className="text-[#737373] text-[12px] font-medium">Capable</span>
                <span className="text-[#A3A3A3] text-[12px] font-medium">•</span>
                <span className="text-[#737373] text-[12px] font-medium">
                    <span className="animate-shine">{text} ({seconds}s)</span>
                </span>
            </div>
        </div>
    );
};

export const RunningToolText = ({ content }) => {
    const [seconds, setSeconds] = useState("0.0");

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            setSeconds(elapsed.toFixed(1));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return <span className="animate-shine font-medium text-[13px]">Running Tool: {content} ({seconds}s)</span>;
};

export const TypingText = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState("");
    const onCompleteRef = useRef(onComplete);

    // Keep the callback ref up-to-date
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        const words = text ? text.split(/\s+/) : [];
        if (words.length === 0) {
            if (onCompleteRef.current) onCompleteRef.current();
            return;
        }

        setDisplayedText(words[0]);
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex += 1;
            if (currentIndex < words.length) {
                setDisplayedText(prev => prev + " " + words[currentIndex]);
            } else {
                clearInterval(interval);
                if (onCompleteRef.current) onCompleteRef.current();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
};
