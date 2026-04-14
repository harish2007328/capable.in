import axios from 'axios';

// --- API CONFIGURATION ---
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
axios.defaults.baseURL = API_BASE_URL;

// API_BASE_URL intentionally not logged in production

// Ensure authentication token is sent if available
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('insforge_session_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
 * Strategic Assessment Service (Chunked Phase 1: Structure)
 */
export const generateReportStructure = async (idea, webSignals, answers) => {
    try {
        const response = await axios.post('/api/generate-report-structure', {
            idea,
            webSignals,
            answers
        });
        return response.data;
    } catch (error) {
        console.error('Error generating report structure:', error);
        throw error;
    }
};

/**
 * Strategic Assessment Service (Chunked Phase 2: Section Content)
 */
export const generateReportSection = async (idea, webSignals, answers, sectionId, sectionTitle) => {
    try {
        const response = await axios.post('/api/generate-report-section', {
            idea,
            webSignals,
            answers,
            sectionId,
            sectionTitle
        });
        return response.data;
    } catch (error) {
        console.error(`Error generating report section ${sectionId}:`, error);
        throw error;
    }
};

/**
 * Strategic Assessment Service
 * Generates the analytical report once questions are answered.
 * @deprecated Use generateReportStructure and generateReportSection for chunked loading
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
 * Execution Roadmap Service (Phase 1: Structure)
 */
export const generatePlanStructure = async (idea, report, answers) => {
    try {
        const response = await axios.post('/api/generate-plan-structure', {
            idea,
            report,
            answers
        });
        return response.data;
    } catch (error) {
        console.error('Error generating plan structure:', error);
        throw error;
    }
};

/**
 * Execution Roadmap Service (Phase 2: Task Generation - single batch)
 */
export const generatePhaseTasks = async (idea, report, answers, phase, allPreviousTasks, predefined_titles) => {
    try {
        const response = await axios.post('/api/generate-phase-tasks', {
            idea,
            report,
            answers,
            phase,
            allPreviousTasks,
            predefined_titles
        });
        return response.data;
    } catch (error) {
        console.error(`Error generating tasks for days ${phase?.range}:`, error);
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
