/**
 * Project Storage Service
 * Manages multiple projects in localStorage.
 */

const STORAGE_KEY = 'capable_projects';
const ACTIVE_PROJECT_ID = 'capable_active_project_id';

const getProjects = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
};

const saveProjects = (projects) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

const migrateLegacyData = () => {
    const idea = localStorage.getItem('userIdea');
    const questions = localStorage.getItem('analysisQuestions');
    const answers = localStorage.getItem('userAnswers');
    const report = localStorage.getItem('analysisReport');
    const plan = localStorage.getItem('actionPlan');
    const webSignals = localStorage.getItem('webSignals');

    if (idea && !localStorage.getItem(STORAGE_KEY)) {
        const legacyId = 'p-' + Date.now();
        const legacyProject = {
            id: legacyId,
            title: localStorage.getItem('project_name') || idea.split(' ').slice(0, 2).join(' ') || 'Legacy Project',
            data: {
                idea,
                questions: questions ? JSON.parse(questions) : null,
                answers: answers ? JSON.parse(answers) : null,
                report: report ? JSON.parse(report) : null,
                plan: plan ? JSON.parse(plan) : null,
                webSignals: webSignals ? JSON.parse(webSignals) : null,
            },
            createdAt: new Date().toISOString()
        };
        saveProjects({ [legacyId]: legacyProject });
        localStorage.setItem(ACTIVE_PROJECT_ID, legacyId);

        // Optionally keep old keys for a while or clear them
        // For safety, we keep them for now but multi-project logic will ignore them
    }
};

export const ProjectStorage = {
    init: () => {
        migrateLegacyData();
    },

    getAll: () => {
        return Object.values(getProjects()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getById: (id) => {
        return getProjects()[id] || null;
    },

    create: (idea, title = 'New Project') => {
        const id = 'p-' + Date.now();
        const projects = getProjects();
        projects[id] = {
            id,
            title: title || idea.split(' ').slice(0, 2).join(' '),
            data: { idea },
            createdAt: new Date().toISOString()
        };
        saveProjects(projects);
        localStorage.setItem(ACTIVE_PROJECT_ID, id);
        return id;
    },

    updateData: (id, updates) => {
        const projects = getProjects();
        if (projects[id]) {
            projects[id].data = { ...projects[id].data, ...updates };
            if (updates.projectTitle) projects[id].title = updates.projectTitle;
            if (updates.project_name) projects[id].title = updates.project_name;
            saveProjects(projects);
        }
    },

    delete: (id) => {
        const projects = getProjects();
        delete projects[id];
        saveProjects(projects);

        // Cleanup isolated data
        localStorage.removeItem(`capable_progress_${id}`);
        localStorage.removeItem(`mentor_sessions_${id}`);

        if (localStorage.getItem(ACTIVE_PROJECT_ID) === id) {
            localStorage.removeItem(ACTIVE_PROJECT_ID);
        }
    },

    getActiveId: () => {
        return localStorage.getItem(ACTIVE_PROJECT_ID);
    },

    setActiveId: (id) => {
        localStorage.setItem(ACTIVE_PROJECT_ID, id);
    }
};
