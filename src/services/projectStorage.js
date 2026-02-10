import { supabase } from './supabase';
import { Database } from './database';

/**
 * Project Storage Service
 * Manages multiple projects with sync support for Supabase.
 */

const STORAGE_KEY = 'capable_projects';
const ACTIVE_PROJECT_ID = 'capable_active_project_id';

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
                    },
                    createdAt: new Date().toISOString()
                }
            };
            saveLocalProjects(projects);
            localStorage.setItem(ACTIVE_PROJECT_ID, legacyId);
        }
    },

    getAll: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            try {
                const projects = await Database.getProjects();
                return projects.map(p => ({
                    id: p.id,
                    title: p.title,
                    data: p.data,
                    createdAt: p.created_at
                }));
            } catch (error) {
                console.error('Supabase fetch failed, falling back to local:', error);
            }
        }
        return Object.values(getLocalProjects()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    getById: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && isNaN(id) && id.includes('-')) { // Simple check if it's a UUID vs local p-timestamp
            try {
                const p = await Database.getProjectById(id);
                return p ? { id: p.id, title: p.title, data: p.data, createdAt: p.created_at } : null;
            } catch (e) {
                console.warn('Project not found in DB, checking local');
            }
        }
        return getLocalProjects()[id] || null;
    },

    create: async (idea, title = 'New Project') => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const project = await Database.createProject(session.user.id, title, { idea });
            localStorage.setItem(ACTIVE_PROJECT_ID, project.id);
            return project.id;
        }

        const id = 'p-' + Date.now();
        const projects = getLocalProjects();
        projects[id] = {
            id,
            title: title || idea.split(' ').slice(0, 2).join(' '),
            data: { idea },
            createdAt: new Date().toISOString()
        };
        saveLocalProjects(projects);
        localStorage.setItem(ACTIVE_PROJECT_ID, id);
        return id;
    },

    updateData: async (id, updates) => {
        const { data: { session } } = await supabase.auth.getSession();

        // Handle title updates in the object
        const titleUpdate = updates.projectTitle || updates.project_name;

        if (session && id.length > 10) { // Primitive check for UUID
            const dbUpdates = { data: updates };
            if (titleUpdate) dbUpdates.title = titleUpdate;

            // We need to merge existing data first since Supabase update is shallow for jsonb if not careful
            // For now, let's assume 'data' is the whole object we want to update
            const { data: existing } = await supabase.from('projects').select('data').eq('id', id).single();
            await Database.updateProject(id, {
                data: { ...existing.data, ...updates },
                ...(titleUpdate && { title: titleUpdate })
            });
            return;
        }

        const projects = getLocalProjects();
        if (projects[id]) {
            projects[id].data = { ...projects[id].data, ...updates };
            if (titleUpdate) projects[id].title = titleUpdate;
            saveLocalProjects(projects);
        }
    },

    delete: async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
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
    }
};
