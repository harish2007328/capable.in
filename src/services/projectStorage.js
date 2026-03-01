import { supabase } from './supabase';
import { Database } from './database';

/**
 * Project Storage Service
 * Manages multiple projects with sync support for Supabase.
 */

const STORAGE_KEY = 'capable_projects';
const ACTIVE_PROJECT_ID = 'capable_active_project_id';

const memoryCache = {
    allProjectsFetched: false,
    projects: {}
};

const getLocalProjects = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
};

const saveLocalProjects = (projects) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const ProjectStorage = {
    init: async () => {
        // Migration logic from old individual keys
        const idea = localStorage.getItem('userIdea');
        if (idea && !localStorage.getItem(STORAGE_KEY)) {
            const legacyId = 'p-' + Date.now();

            // Scavenge chats and progress for this legacy project
            const legacyChats = JSON.parse(localStorage.getItem(`mentor_sessions_${legacyId}`) || 'null');
            const legacyProgress = JSON.parse(localStorage.getItem(`capable_progress_${legacyId}`) || 'null');

            const projects = {
                [legacyId]: {
                    id: legacyId,
                    title: localStorage.getItem('project_name') || idea.split(' ').slice(0, 2).join(' ') || 'Legacy Project',
                    data: {
                        idea,
                        questions: JSON.parse(localStorage.getItem('analysisQuestions') || 'null'),
                        answers: JSON.parse(localStorage.getItem('userAnswers') || 'null'),
                        report: JSON.parse(localStorage.getItem('analysisReport') || 'null'),
                        plan: JSON.parse(localStorage.getItem('actionPlan') || 'null'),
                        webSignals: JSON.parse(localStorage.getItem('webSignals') || 'null'),
                        chats: legacyChats,
                        progress: legacyProgress
                    },
                    createdAt: new Date().toISOString()
                }
            };
            saveLocalProjects(projects);
            localStorage.setItem(ACTIVE_PROJECT_ID, legacyId);
        }
    },

    getAll: async (forceRefresh = false) => {
        if (!forceRefresh && memoryCache.allProjectsFetched) {
            return Object.values(memoryCache.projects).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            try {
                const projects = await Database.getProjects();
                const formatted = projects.map(p => ({
                    id: p.id,
                    title: p.title,
                    data: p.data,
                    createdAt: p.created_at
                }));
                formatted.forEach(p => memoryCache.projects[p.id] = p);
                memoryCache.allProjectsFetched = true;
                return Object.values(memoryCache.projects).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            } catch (error) {
                console.error('Supabase fetch failed, falling back to local:', error);
            }
        }
        const local = getLocalProjects();
        Object.values(local).forEach(p => memoryCache.projects[p.id] = p);
        memoryCache.allProjectsFetched = true;
        return Object.values(memoryCache.projects).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getById: async (id, forceRefresh = false) => {
        if (!forceRefresh && memoryCache.projects[id]) {
            return memoryCache.projects[id];
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session && String(id).includes('-')) { // UUID check
            try {
                const p = await Database.getProjectById(id);
                if (p) {
                    const formatted = { id: p.id, title: p.title, data: p.data, createdAt: p.created_at };
                    memoryCache.projects[id] = formatted;
                    return formatted;
                }
            } catch (e) {
                console.warn('Project not found in DB, checking local');
            }
        }
        const localP = getLocalProjects()[id];
        if (localP) {
            memoryCache.projects[id] = localP;
            return localP;
        }
        return null;
    },

    create: async (idea, title = 'New Project') => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const project = await Database.createProject(session.user.id, title, { idea, chats: null, progress: {} });
            localStorage.setItem(ACTIVE_PROJECT_ID, project.id);
            memoryCache.projects[project.id] = { id: project.id, title: project.title, data: project.data, createdAt: project.created_at };
            return project.id;
        }

        const id = 'p-' + Date.now();
        const projects = getLocalProjects();
        const newLocal = {
            id,
            title: title || idea.split(' ').slice(0, 2).join(' '),
            data: { idea, chats: null, progress: {} },
            createdAt: new Date().toISOString()
        };
        projects[id] = newLocal;
        saveLocalProjects(projects);
        localStorage.setItem(ACTIVE_PROJECT_ID, id);
        memoryCache.projects[id] = newLocal;
        return id;
    },

    updateData: async (id, updates) => {
        const { data: { session } } = await supabase.auth.getSession();
        const titleUpdate = updates.projectTitle || updates.project_name;

        // Fetch current state to perform deep merge
        const current = await ProjectStorage.getById(id);
        if (!current) return;

        const newData = { ...current.data, ...updates };

        if (memoryCache.projects[id]) {
            memoryCache.projects[id].data = newData;
            if (titleUpdate) memoryCache.projects[id].title = titleUpdate;
        }

        if (session && String(id).includes('-')) {
            await Database.updateProject(id, {
                data: newData,
                ...(titleUpdate && { title: titleUpdate })
            });
            return;
        }

        const projects = getLocalProjects();
        if (projects[id]) {
            projects[id].data = newData;
            if (titleUpdate) projects[id].title = titleUpdate;
            saveLocalProjects(projects);
        }
    },

    delete: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        delete memoryCache.projects[id];

        if (session && id.length > 10) {
            await Database.deleteProject(id);
        } else {
            const projects = getLocalProjects();
            delete projects[id];
            saveLocalProjects(projects);
        }

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
    },

    clearAll: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            await Database.deleteAllProjects(session.user.id);
        }
        memoryCache.allProjectsFetched = false;
        memoryCache.projects = {};

        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(ACTIVE_PROJECT_ID);
        // Clear all matching keys for progress and chats
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('capable_progress_') || key.startsWith('mentor_sessions_')) {
                localStorage.removeItem(key);
            }
        });
    }
};
