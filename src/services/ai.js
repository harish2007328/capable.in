import axios from 'axios';

/**
 * Enhanced Idea Service
 * Shortens and punchifies a business idea.
 */
export const enhanceIdea = async (idea) => {
    try {
        const response = await axios.post('/api/enhance-idea', { idea });
        return response.data;
    } catch (error) {
        console.error('Error enhancing idea:', error);
        throw error;
    }
};

/**
 * Research Intelligence Service
 * Generates discovery questions based on the initial idea.
 */
export const generateAnalysisQuestions = async (idea, location) => {
    try {
        const response = await axios.post('/api/research', { idea, location });
        return response.data;
    } catch (error) {
        console.error('Error generating questions:', error);
        throw error;
    }
};

/**
 * Strategic Assessment Service
 * Generates the analytical report once questions are answered.
 */
export const generateAnalysisReport = async (idea, answers, webSignals = {}) => {
    try {
        const response = await axios.post('/api/analyze', {
            idea,
            answers,
            webSignals
        });
        return response.data;
    } catch (error) {
        console.error('Error generating analysis report:', error);
        throw error;
    }
};

/**
 * Execution Roadmap Service
 * Generates the 60-day action plan based on the assessment.
 */
export const generateActionPlan = async (idea, report, answers) => {
    try {
        const response = await axios.post('/api/generate-plan', {
            idea,
            report,
            answers
        });
        return response.data;
    } catch (error) {
        console.error('Error generating action plan:', error);
        throw error;
    }
};

/**
 * Mentor Chat Service
 * Handles AI-powered mentorship chat interactions.
 */
export const mentorChat = async (idea, plan, messages, completedDays = [], currentTaskId = null) => {
    try {
        const response = await axios.post('/api/chat', {
            idea,
            plan,
            messages,
            completedDays,
            currentTaskId
        });
        return response.data;
    } catch (error) {
        console.error('Error in mentor chat:', error);
        throw error;
    }
};
