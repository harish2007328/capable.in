import { supabase } from './supabase';

export const Database = {
    // Projects
    getProjects: async () => {
        const { data, error } = await supabase.database
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    getProjectById: async (id) => {
        const { data, error } = await supabase.database
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    createProject: async (userId, title, projectData) => {
        const { data, error } = await supabase.database
            .from('projects')
            .insert([
                { user_id: userId, title, data: projectData }
            ])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    updateProject: async (id, updates) => {
        const { data, error } = await supabase.database
            .from('projects')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    deleteProject: async (id) => {
        const { error } = await supabase.database
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    deleteAllProjects: async (userId) => {
        const { error } = await supabase.database
            .from('projects')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;
    }
};
