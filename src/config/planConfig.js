/**
 * Single source of truth for Free vs Pro plan features.
 * Used across PricingPage, PricingModal, Sidebar, ProjectHeader, and feature gates.
 */

export const PLANS = {
    free: {
        name: 'Free Plan',
        tagline: 'Perfect for individuals looking to validate their first idea.',
        price: { monthly: 0, annual: 0 },
        priceLabel: '/ forever',
        cta: 'Start Free',
        features: [
            { text: '1 Active Project', included: true },
            { text: 'Basic Market Analysis', included: true },
            { text: '30-Day Static Roadmap', included: true },
            { text: 'Limited AI Mentor', included: true },
            { text: 'CSV/PDF Exporting', included: false },
        ],
    },
    pro: {
        name: 'Pro Plan',
        tagline: 'Deep market intelligence and real-time execution tracking.',
        price: { monthly: 14.99, annual: 11.99 },
        priceLabel: { monthly: '/ mo', annual: '/ mo, billed yearly' },
        cta: 'Go Capable',
        features: [
            { text: 'Unlimited Projects', included: true },
            { text: 'Deep Market Intelligence', included: true },
            { text: '60-Day Adaptive Roadmap', included: true },
            { text: 'Unlimited AI Execution', included: true },
            { text: 'PDF & CSV Report Export', included: true },
        ],
    },
};

// --- Feature Limits ---
export const FREE_LIMITS = {
    maxProjects: 1,
    maxRoadmapDays: 30,
    aiMentorMessagesPerDay: 10,
    canExportPDF: false,
    canExportCSV: false,
    canExportDocx: false,
    reportDepth: 'basic', // 'basic' vs 'deep'
};

export const PRO_LIMITS = {
    maxProjects: Infinity,
    maxRoadmapDays: 60,
    aiMentorMessagesPerDay: Infinity,
    canExportPDF: true,
    canExportCSV: true,
    canExportDocx: true,
    reportDepth: 'deep',
};

/**
 * Get the limits for a user based on their subscription status.
 * @param {object} user - The user object from AuthContext
 * @returns {object} - The feature limits for this user
 */
export const getUserLimits = (user) => {
    const status = user?.profile?.subscription_status;
    return status === 'pro' ? PRO_LIMITS : FREE_LIMITS;
};

/**
 * Check if a user has Pro subscription
 * @param {object} user - The user object from AuthContext
 * @returns {boolean}
 */
export const isPro = (user) => {
    return user?.profile?.subscription_status === 'pro';
};
