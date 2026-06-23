export const parseThinkingContent = (content) => {
    if (!content) return { thinking: "", cleanText: "", isUnclosed: false };
    const thinkStart = content.search(/<think>/i);
    if (thinkStart !== -1) {
        const thinkEnd = content.search(/<\/think>/i);
        if (thinkEnd !== -1) {
            const thinking = content.substring(thinkStart + 7, thinkEnd).trim();
            const cleanText = (content.substring(0, thinkStart) + content.substring(thinkEnd + 8)).trim();
            return { thinking, cleanText, isUnclosed: false };
        } else {
            const thinking = content.substring(thinkStart + 7).trim();
            const cleanText = content.substring(0, thinkStart).trim();
            return { thinking, cleanText, isUnclosed: true };
        }
    }
    return { thinking: "", cleanText: content, isUnclosed: false };
};

export const parseAnswersFromText = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const answers = [];

    // Check if the text contains the arrow character '↳'
    const hasArrow = text.includes('↳');

    if (hasArrow) {
        let currentQuestion = null;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                // It's a question line. Extract the full question text.
                let qText = trimmed.replace(/^[•\-\*\s]+/, '').trim();
                // Strip wrapping asterisks
                qText = qText.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                currentQuestion = qText;
            } else if (trimmed.startsWith('↳') && currentQuestion) {
                let aText = trimmed.replace(/^↳/, '').trim();
                aText = aText.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                answers.push({
                    questionText: currentQuestion,
                    answer: aText
                });
                currentQuestion = null;
            }
        }
    } else {
        // Fallback or legacy format parsing
        let currentQuestion = null;
        for (let line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            // Try single-line format first: e.g. "- **Question Text**: Answer Text"
            // Make sure we only match if there is a colon and it's not a question line followed by a separate answer line
            const singleLineMatch = trimmed.match(/^[•\-\*\s]+(?:\*\*)?(.*?)(?:\*\*)?\s*:\s*(.*)$/);
            if (singleLineMatch) {
                const q = singleLineMatch[1].replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
                const a = singleLineMatch[2].trim();
                if (q && a && !a.startsWith('↳')) {
                    answers.push({ questionText: q, answer: a });
                    continue;
                }
            }

            if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
                let qText = trimmed.replace(/^[•\-\s\*]+/, '').trim();
                qText = qText.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, '').trim();
                currentQuestion = qText;
            } else if ((trimmed.startsWith('Answer:') || trimmed.startsWith('Answer is:')) && currentQuestion) {
                let aText = trimmed.replace(/^(Answer:|Answer is:)/, '').trim();
                aText = aText.replace(/^\*+/, '').replace(/\*+$/, '').trim();
                answers.push({
                    questionText: currentQuestion,
                    answer: aText
                });
                currentQuestion = null;
            } else if (currentQuestion && trimmed.length > 0) {
                answers.push({
                    questionText: currentQuestion,
                    answer: trimmed
                });
                currentQuestion = null;
            }
        }
    }

    return answers.length > 0 ? answers : null;
};

export const calculateTaskLayout = (tasks = [], dayY, taskHeights = {}) => {
    const GAP = 12; // constant spacing of 12px between cards
    const N = tasks.length;
    if (N === 0) return [];
    
    const heights = tasks.map(task => {
        const measured = taskHeights[task.id];
        if (measured) return measured;
        
        const text = task.text || "";
        const charCount = text.length;
        const lineCount = Math.max(1, Math.ceil(charCount / 26));
        return Math.max(40, 20 + lineCount * 14);
    });
    
    const coords = new Array(N);
    const M = Math.floor((N - 1) / 2); // Middle task index
    
    // Set middle task centered at dayY
    coords[M] = { taskY: dayY, height: heights[M] };
    
    // Lay out tasks above middle task (going up)
    for (let i = M - 1; i >= 0; i--) {
        const prev = coords[i + 1];
        const taskY = prev.taskY - prev.height / 2 - GAP - heights[i] / 2;
        coords[i] = { taskY, height: heights[i] };
    }
    
    // Lay out tasks below middle task (going down)
    for (let i = M + 1; i < N; i++) {
        const prev = coords[i - 1];
        const taskY = prev.taskY + prev.height / 2 + GAP + heights[i] / 2;
        coords[i] = { taskY, height: heights[i] };
    }
    
    return coords;
};

export const generateFallbackValidationReport = (title) => {
    return {
        overview: {
            elevator_pitch: `A specialized service that makes it extremely simple to launch and validate a ${title} business.`,
            problem: `Many founders struggle to test the real-world demand for ${title} before spending thousands on building a product.`,
            solution: `Capable provides automated validation agents, roadmap engines, and custom user workspaces to fast-track testing.`,
            target_users: [
                { segment: "Early stage founders", description: "Aspiring entrepreneurs looking to validate their new idea." },
                { segment: "Product managers", description: "Corporate innovation teams testing new feature concepts." }
            ],
            why_now: `The barrier to entry for building software is lower than ever, making rapid market validation the ultimate competitive advantage.`
        },
        market: {
            market_size: `An estimated 300,000+ new startup concepts are drafted monthly, representing a massive addressable user base.`,
            growth_signals: [
                "Increased focus on capital-efficient building and bootstrapping.",
                "Surge in early-stage validation tools and micro-SaaS interest."
            ],
            competitors: [
                { name: "Traditional incubators", what_they_do: "Slow, manual mentorship cohorts.", weakness: "Expensive and non-scalable." },
                { name: "Landing page builders", what_they_do: "Quick site creation.", weakness: "Doesn't offer strategic AI validation or task guidance." }
            ],
            unique_edge: `Capable offers an integrated co-founder agent workspace that combines market intelligence, strategic reports, and roadmaps.`
        },
        execution: {
            how_it_works: [
                { step: 1, action: "Founder inputs basic venture idea details" },
                { step: 2, action: "Capable clarifies scope via structured questions" },
                { step: 3, action: "Capable structures custom validation roadmap" },
                { step: 4, action: "Founder runs the 6-day validation timeline" }
            ],
            business_model: "Subscription-based freemium SaaS model with custom add-ons.",
            revenue_streams: ["Standard monthly tier", "Premium custom agency tier"],
            feasibility: "Highly feasible, utilizing robust API integrations and clean component structures.",
            est_mvp_cost: "$500 - $1,500",
            est_timeline: "1-2 weeks"
        },
        reality: {
            risks: [
                { category: "Market Risk", description: "Users might prefer manual consulting over AI co-founders.", severity: "Medium" },
                { category: "Feasibility Risk", description: "API latency might slow down report generation.", severity: "Low" }
            ],
            open_questions: [
                "Will users pay for validation reports?",
                "What is the average retention of founders on Capable?",
                "Can we scrape competition data with 100% accuracy?"
            ],
            validation_plan: [
                { step: 1, action: "Create a simple landing page explaining Capable." },
                { step: 2, action: "Drive 100 targeted visitors to the page via posts." },
                { step: 3, action: "Collect at least 15 waitlist signups." }
            ]
        }
    };
};

export const generateFallback6DayRoadmap = (title) => {
    return {
        title: "6-Day Validation Sprint",
        days: [
            {
                day: 1,
                title: "Audience Definition",
                objective: "Identify and document the exact profiles of your first 10 core customers.",
                tasks: [
                    { id: "d1-t1", text: "Write down 3 customer personas for your product.", completed: false },
                    { id: "d1-t2", text: "Find 2 online communities where these personas gather.", completed: false },
                    { id: "d1-t3", text: "Draft a 100-word introduction post for feedback.", completed: false }
                ]
            },
            {
                day: 2,
                title: "Value Proposition",
                objective: "Refine your unique sales hook and competitive advantage.",
                tasks: [
                    { id: "d2-t1", text: "Compare your offer to 3 close competitors.", completed: false },
                    { id: "d2-t2", text: "Draft a clean headline and 3 core value bullet points.", completed: false },
                    { id: "d2-t3", text: "Choose a primary color scheme and visual layout.", completed: false }
                ]
            },
            {
                day: 3,
                title: "Landing Page Pitch",
                objective: "Deploy a simple validation landing page with a waitlist form.",
                tasks: [
                    { id: "d3-t1", text: "Setup a clean landing page project structure.", completed: false },
                    { id: "d3-t2", text: "Add an input field for capturing emails.", completed: false },
                    { id: "d3-t3", text: "Verify that form submissions save correctly to your database.", completed: false }
                ]
            },
            {
                day: 4,
                title: "Traffic Generation",
                objective: "Drive initial organic visitors to your validation page.",
                tasks: [
                    { id: "d4-t1", text: "Share your product hook in 2 target communities.", completed: false },
                    { id: "d4-t2", text: "Message 5 potential users directly on social channels.", completed: false },
                    { id: "d4-t3", text: "Monitor visitor analytics and scroll rates.", completed: false }
                ]
            },
            {
                day: 5,
                title: "Feedback Interviews",
                objective: "Talk to early signups to gather product critiques.",
                tasks: [
                    { id: "d5-t1", text: "Send a friendly follow-up email to all signups.", completed: false },
                    { id: "d5-t2", text: "Schedule 3 brief feedback calls.", completed: false },
                    { id: "d5-t3", text: "Log key feature requests and user concerns.", completed: false }
                ]
            },
            {
                day: 6,
                title: "Validation Review",
                objective: "Analyze conversion rates and make a pivot or proceed decision.",
                tasks: [
                    { id: "d6-t1", text: "Calculate waitlist conversion percentage (signups/visitors).", completed: false },
                    { id: "d6-t2", text: "Summarize top 3 validation blockers.", completed: false },
                    { id: "d6-t3", text: "Determine the go/no-go choice for full MVP build.", completed: false }
                ]
            }
        ]
    };
};

export const generateNextPhase = (currentPhases, concept, companyName, requestedDaysCount) => {
    const phaseIndex = currentPhases.length;
    const dayCount = requestedDaysCount || (6 + Math.floor(Math.random() * 4)); // default 6-9 days
    
    // Find the starting day number
    let startDayNum = 1;
    currentPhases.forEach(p => {
        if (p.days) {
            p.days.forEach(d => {
                if (d.day >= startDayNum) {
                    startDayNum = d.day + 1;
                }
            });
        }
    });

    const phaseTitles = [
        "Validation Phase", // Phase 0
        "MVP Development Phase", // Phase 1
        "Beta Launch & Early Traction", // Phase 2
        "Scaling & Monetization", // Phase 3
        "Market Expansion & Growth" // Phase 4+
    ];
    const phaseTitle = phaseTitles[phaseIndex] || `Phase ${phaseIndex}: Expansion Phase`;

    // Define Day templates depending on phaseIndex
    const days = [];
    for (let i = 0; i < dayCount; i++) {
        const currentDayNum = startDayNum + i;
        let dayTitle = "";
        let objective = "";
        let tasks = [];

        if (phaseIndex === 1) {
            // MVP Development
            const templates = [
                {
                    title: "Tech Stack & Dev Env",
                    objective: `Configure the development workspace for ${companyName || 'the venture'}.`,
                    tasks: [
                        `Initialize code repository and configure environment variables.`,
                        `Install key packages and structure the source code directory.`,
                        `Verify local server and baseline database connections.`
                    ]
                },
                {
                    title: "Database & Schema",
                    objective: "Design data models to support core application features.",
                    tasks: [
                        `Draft entity-relationship diagram for core venture models.`,
                        `Run database migrations to initialize tables.`,
                        `Seed database with sample testing records.`
                    ]
                },
                {
                    title: "Auth & User Management",
                    objective: "Secure application access with robust login/signup.",
                    tasks: [
                        `Implement Email and Social sign-in flows.`,
                        `Create profile setup page for capturing user attributes.`,
                        `Verify session tokens persistence and security policies.`
                    ]
                },
                {
                    title: "Core Feature Engineering",
                    objective: `Build the primary unique selling value of ${companyName || 'the venture'}.`,
                    tasks: [
                        `Code the functional logic of the main product dashboard.`,
                        `Connect front-end forms to backend API endpoints.`,
                        `Implement loading states and basic input validations.`
                    ]
                },
                {
                    title: "AI & External APIs",
                    objective: "Connect third-party modules and intelligence.",
                    tasks: [
                        `Integrate LLM API calls with custom prompts.`,
                        `Establish error handling and fallbacks for API failure.`,
                        `Test response payload parsing and state updating.`
                    ]
                },
                {
                    title: "UI Polishing & UX",
                    objective: "Refine interface transitions, layouts, and responsiveness.",
                    tasks: [
                        `Apply uniform styling, theme palettes, and typography.`,
                        `Test UI layouts on mobile, tablet, and desktop breakpoints.`,
                        `Optimize rendering performance and image asset load times.`
                    ]
                },
                {
                    title: "Staging Deployment",
                    objective: "Deploy MVP draft to a live staging URL for internal testing.",
                    tasks: [
                        `Build production bundle and resolve compilation warnings.`,
                        `Configure hosting provider and point to custom subdomain.`,
                        `Perform full end-to-end user journey test on live site.`
                    ]
                }
            ];
            const temp = templates[i % templates.length];
            dayTitle = temp.title;
            objective = temp.objective;
            tasks = temp.tasks;
        } else if (phaseIndex === 2) {
            // Beta Launch & Traction
            const templates = [
                {
                    title: "Beta Launch Readiness",
                    objective: "Perform pre-flight sanity tests and analytics check.",
                    tasks: [
                        `Ensure analytics tracking is firing on registration.`,
                        `Set up error-logging dashboard to capture client crashes.`,
                        `Draft a welcome email template for beta users.`
                    ]
                },
                {
                    title: "Early Cohort Invite",
                    objective: `Onboard the first batch of testers to ${companyName || 'the venture'}.`,
                    tasks: [
                        `Send access invites to the top 15 validation waitlist signups.`,
                        `Monitor first-login success rates and capture signup drops.`,
                        `Verify database stores profile data correctly.`
                    ]
                },
                {
                    title: "Feedback Loop Setup",
                    objective: "Gather friction points directly from active testers.",
                    tasks: [
                        `Embed a quick feedback widget in the main application view.`,
                        `Configure a direct Discord or Slack community channel for bug reports.`,
                        `Review initial logs to locate slow API response times.`
                    ]
                },
                {
                    title: "Key Bug Fixing",
                    objective: "Rapidly address friction points identified by cohort.",
                    tasks: [
                        `Fix highest-priority login or feature-blocking bugs.`,
                        `Deploy quick patches to staging and promote to production.`,
                        `Notify reporting users directly once their bug is resolved.`
                    ]
                },
                {
                    title: "Engagement Review",
                    objective: "Measure session length and repeat visit rates.",
                    tasks: [
                        `Extract cohort retention metrics from analytics dashboard.`,
                        `Identify which features are used most frequently.`,
                        `Note the common usage drops in the onboarding funnel.`
                    ]
                },
                {
                    title: "User Interviews",
                    objective: "Conduct deep-dive conversations with 3 power users.",
                    tasks: [
                        `Schedule brief video calls with highly engaged users.`,
                        `Ask open-ended questions about their core problems and value found.`,
                        `Document qualitative feature requests and UI suggestions.`
                    ]
                },
                {
                    title: "Beta Phase Review",
                    objective: "Prepare product updates for public launch.",
                    tasks: [
                        `Collate all feedback into a features roadmap spreadsheet.`,
                        `Prioritize the top 3 improvements needed before public release.`,
                        `Update the marketing copy with early user testimonials.`
                    ]
                }
            ];
            const temp = templates[i % templates.length];
            dayTitle = temp.title;
            objective = temp.objective;
            tasks = temp.tasks;
        } else {
            // Generic Expansion / Scale Phase
            const templates = [
                {
                    title: "Growth Channel Audit",
                    objective: "Identify top acquisition channels.",
                    tasks: [
                        `Compare traffic source conversion percentages.`,
                        `Draft 3 ad copy variations for the highest converting channel.`,
                        `Allocate test budget for paid acquisition trials.`
                    ]
                },
                {
                    title: "Payment Gateway",
                    objective: "Prepare checkout rails and subscription tiers.",
                    tasks: [
                        `Create Stripe pricing plans in developer dashboard.`,
                        `Embed checkout buttons and portal link in user settings.`,
                        `Test webhook integration for subscription events.`
                    ]
                },
                {
                    title: "Referral Engine",
                    objective: "Incentivize organic user invite loops.",
                    tasks: [
                        `Design sharing UI with personalized invite links.`,
                        `Implement credit or discount logic for successful referral.`,
                        `Verify invite tracking works across sessions.`
                    ]
                },
                {
                    title: "Marketing Automation",
                    objective: "Automate user retention email journeys.",
                    tasks: [
                        `Draft 3 onboarding drip email sequences.`,
                        `Set triggers for inactive users after 3 days of silence.`,
                        `Verify email deliverability and click tracking.`
                    ]
                },
                {
                    title: "Performance Optimizations",
                    objective: "Reduce page load and database query latency.",
                    tasks: [
                        `Add database indexes to frequently queried tables.`,
                        `Enable caching layers on public static endpoints.`,
                        `Audit bundle size and defer non-critical JS assets.`
                    ]
                },
                {
                    title: "Public Launch Prep",
                    objective: "Coordinate press kits and community submissions.",
                    tasks: [
                        `Draft Product Hunt submission kit and schedule date.`,
                        `Reach out to 5 industry newsletters for feature coverage.`,
                        `Record a 2-minute walkthrough demo video of the product.`
                    ]
                },
                {
                    title: "Milestone Assessment",
                    objective: "Compare actual growth metrics against target plan.",
                    tasks: [
                        `Compile monthly recurring revenue and user growth logs.`,
                        `Present results in the workspace dashboard.`,
                        `Plan next growth sprint based on conversion analytics.`
                    ]
                }
            ];
            const temp = templates[i % templates.length];
            dayTitle = temp.title;
            objective = temp.objective;
            tasks = temp.tasks;
        }

        days.push({
            day: currentDayNum,
            title: dayTitle,
            objective: objective,
            tasks: tasks.map((tText, tIdx) => ({
                id: `d${currentDayNum}-t${tIdx + 1}`,
                text: tText,
                completed: false
            }))
        });
    }
    return {
        id: phaseIndex,
        title: phaseTitle,
        days: days
    };
};

export const getPhaseColorTheme = (pIdx) => {
    const themes = [
        {
            // Cobalt Blue (Phase 0)
            name: 'blue',
            accent: '#3b82f6',
            accentLight: '#60a5fa',
            glow: 'glow-blue',
            bgDark: 'bg-[#101b35]/95',
            bgLight: 'bg-[#f0f5ff]/95',
            borderDark: 'border-blue-500/50',
            borderLight: 'border-blue-300',
            hoverBorderDark: 'hover:border-blue-400/80',
            hoverBorderLight: 'hover:border-blue-400',
            textDark: 'text-blue-300',
            textLight: 'text-blue-600',
            progressFill: 'bg-blue-500',
            activeBgDark: 'bg-blue-600',
            activeBgLight: 'bg-blue-500',
            activeBorder: 'border-blue-400 dark:border-blue-450',
            activeShadowDark: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.3),_0_8px_24px_rgba(37,99,235,0.45)]',
            activeShadowLight: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.5),_0_8px_24px_rgba(37,99,235,0.3)]',
            activeRing: 'ring-blue-400/30',
            activeRingLight: 'ring-blue-300/40',
            textActive: 'text-blue-100/90',
            textInactiveDark: 'text-blue-300',
            textInactiveLight: 'text-blue-700',
            badgeBgDark: 'bg-blue-950/70 border border-blue-500/30 text-blue-300',
            badgeBgLight: 'bg-blue-100/70 border border-blue-200 text-blue-700',
            activeTaskBgDark: 'bg-[#1b2b54] border border-blue-500/60 text-blue-100 cursor-pointer hover:border-blue-400',
            activeTaskBgLight: 'bg-[#bfdbfe] border border-blue-400 text-blue-950 cursor-pointer hover:border-blue-500',
            inactiveTaskBgDark: 'bg-[#111e3b] border border-blue-900/60 text-blue-200 cursor-pointer hover:border-blue-800 hover:bg-[#1b2b54]',
            inactiveTaskBgLight: 'bg-[#dbeafe] border border-blue-300 text-blue-900 cursor-pointer hover:border-blue-400 hover:bg-[#bfdbfe]',
            activeCompletedTaskBgDark: 'bg-[#1b2b54]/40 border border-blue-500/20 text-blue-100/50 cursor-pointer hover:border-blue-500/30',
            activeCompletedTaskBgLight: 'bg-[#bfdbfe]/40 border border-blue-400/30 text-blue-900/60 cursor-pointer hover:border-blue-450/40',
            inactiveCompletedTaskBgDark: 'bg-[#111e3b]/40 border border-blue-900/20 text-blue-200/50 cursor-pointer hover:border-blue-900/30',
            inactiveCompletedTaskBgLight: 'bg-[#dbeafe]/40 border border-blue-300/30 text-blue-900/60 cursor-pointer hover:border-blue-400/40',
            checkboxActive: 'border-blue-400 dark:border-blue-400 bg-blue-500/10 text-blue-450 hover:border-blue-300 hover:bg-blue-500/20',
            lineColorActiveDark: '#3b82f6',
            lineColorActiveLight: '#3b82f6',
            lineColorUnlockedDark: '#3b82f655',
            lineColorUnlockedLight: '#93c5fd99',
        },
        {
            // Sky Blue (Phase 1)
            name: 'sky',
            accent: '#0ea5e9',
            accentLight: '#38bdf8',
            glow: 'glow-sky',
            bgDark: 'bg-[#0a2238]/95',
            bgLight: 'bg-[#f0f9ff]/95',
            borderDark: 'border-sky-500/50',
            borderLight: 'border-sky-300',
            hoverBorderDark: 'hover:border-sky-400/80',
            hoverBorderLight: 'hover:border-sky-400',
            textDark: 'text-sky-300',
            textLight: 'text-sky-600',
            progressFill: 'bg-sky-500',
            activeBgDark: 'bg-sky-600',
            activeBgLight: 'bg-sky-500',
            activeBorder: 'border-sky-400 dark:border-sky-450',
            activeShadowDark: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.3),_0_8px_24px_rgba(14,165,233,0.45)]',
            activeShadowLight: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.5),_0_8px_24px_rgba(14,165,233,0.3)]',
            activeRing: 'ring-sky-400/30',
            activeRingLight: 'ring-sky-300/40',
            textActive: 'text-sky-100/90',
            textInactiveDark: 'text-sky-300',
            textInactiveLight: 'text-sky-700',
            badgeBgDark: 'bg-sky-950/70 border border-sky-500/30 text-sky-300',
            badgeBgLight: 'bg-sky-100/70 border border-sky-200 text-sky-700',
            activeTaskBgDark: 'bg-[#0c3a5f] border border-sky-500/60 text-sky-100 cursor-pointer hover:border-sky-400',
            activeTaskBgLight: 'bg-[#bae6fd] border border-sky-400 text-sky-950 cursor-pointer hover:border-sky-500',
            inactiveTaskBgDark: 'bg-[#0a233c] border border-sky-900/60 text-sky-200 cursor-pointer hover:border-sky-800 hover:bg-[#0c3a5f]',
            inactiveTaskBgLight: 'bg-[#e0f2fe] border border-sky-300 text-sky-900 cursor-pointer hover:border-sky-400 hover:bg-[#bae6fd]',
            activeCompletedTaskBgDark: 'bg-[#0c3a5f]/40 border border-sky-500/20 text-sky-100/50 cursor-pointer hover:border-sky-500/30',
            activeCompletedTaskBgLight: 'bg-[#bae6fd]/40 border border-sky-400/30 text-sky-900/60 cursor-pointer hover:border-sky-450/40',
            inactiveCompletedTaskBgDark: 'bg-[#0a233c]/40 border border-sky-900/20 text-sky-200/50 cursor-pointer hover:border-sky-900/30',
            inactiveCompletedTaskBgLight: 'bg-[#e0f2fe]/40 border border-sky-300/30 text-sky-900/50 cursor-pointer hover:border-sky-300/40',
            checkboxActive: 'border-sky-400 dark:border-sky-400 bg-sky-500/10 text-sky-450 hover:border-sky-300 hover:bg-sky-500/20',
            lineColorActiveDark: '#0ea5e9',
            lineColorActiveLight: '#0ea5e9',
            lineColorUnlockedDark: '#0ea5e955',
            lineColorUnlockedLight: '#7dd3fc99',
        },
        {
            // Royal Indigo (Phase 2)
            name: 'indigo',
            accent: '#6366f1',
            accentLight: '#818cf8',
            glow: 'glow-indigo',
            bgDark: 'bg-[#12183c]/95',
            bgLight: 'bg-[#f5f3ff]/95',
            borderDark: 'border-indigo-500/50',
            borderLight: 'border-indigo-300',
            hoverBorderDark: 'hover:border-indigo-400/80',
            hoverBorderLight: 'hover:border-indigo-400',
            textDark: 'text-indigo-300',
            textLight: 'text-indigo-600',
            progressFill: 'bg-indigo-500',
            activeBgDark: 'bg-indigo-600',
            activeBgLight: 'bg-indigo-500',
            activeBorder: 'border-indigo-400 dark:border-indigo-450',
            activeShadowDark: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.3),_0_8px_24px_rgba(99,102,241,0.45)]',
            activeShadowLight: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.5),_0_8px_24px_rgba(99,102,241,0.3)]',
            activeRing: 'ring-indigo-400/30',
            activeRingLight: 'ring-indigo-300/40',
            textActive: 'text-indigo-100/90',
            textInactiveDark: 'text-indigo-300',
            textInactiveLight: 'text-indigo-700',
            badgeBgDark: 'bg-indigo-950/70 border border-indigo-500/30 text-indigo-300',
            badgeBgLight: 'bg-indigo-100/70 border border-indigo-200 text-indigo-700',
            activeTaskBgDark: 'bg-[#222565] border border-indigo-500/60 text-indigo-100 cursor-pointer hover:border-indigo-400',
            activeTaskBgLight: 'bg-[#c7d2fe] border border-indigo-400 text-indigo-950 cursor-pointer hover:border-indigo-500',
            inactiveTaskBgDark: 'bg-[#151940] border border-indigo-900/60 text-indigo-200 cursor-pointer hover:border-indigo-800 hover:bg-[#222565]',
            inactiveTaskBgLight: 'bg-[#e0e7ff] border border-indigo-300 text-indigo-900 cursor-pointer hover:border-indigo-400 hover:bg-[#c7d2fe]',
            activeCompletedTaskBgDark: 'bg-[#222565]/40 border border-indigo-500/20 text-indigo-100/50 cursor-pointer hover:border-indigo-500/30',
            activeCompletedTaskBgLight: 'bg-[#c7d2fe]/40 border border-indigo-400/30 text-indigo-900/60 cursor-pointer hover:border-indigo-450/40',
            inactiveCompletedTaskBgDark: 'bg-[#151940]/40 border border-indigo-900/20 text-indigo-200/50 cursor-pointer hover:border-indigo-900/30',
            inactiveCompletedTaskBgLight: 'bg-[#e0e7ff]/40 border border-indigo-300/30 text-indigo-900/50 cursor-pointer hover:border-indigo-300/40',
            checkboxActive: 'border-indigo-400 dark:border-indigo-400 bg-indigo-500/10 text-indigo-450 hover:border-indigo-300 hover:bg-indigo-500/20',
            lineColorActiveDark: '#6366f1',
            lineColorActiveLight: '#6366f1',
            lineColorUnlockedDark: '#6366f155',
            lineColorUnlockedLight: '#c7d2fe99',
        },
        {
            // Ocean Blue (Phase 3)
            name: 'blue',
            accent: '#1d4ed8',
            accentLight: '#3b82f6',
            glow: 'glow-blue',
            bgDark: 'bg-[#0a142c]/95',
            bgLight: 'bg-[#eff6ff]/95',
            borderDark: 'border-blue-600/50',
            borderLight: 'border-blue-300',
            hoverBorderDark: 'hover:border-blue-500/80',
            hoverBorderLight: 'hover:border-blue-500',
            textDark: 'text-blue-300',
            textLight: 'text-blue-700',
            progressFill: 'bg-blue-600',
            activeBgDark: 'bg-blue-700',
            activeBgLight: 'bg-blue-600',
            activeBorder: 'border-blue-500 dark:border-blue-550',
            activeShadowDark: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.3),_0_8px_24px_rgba(29,78,216,0.45)]',
            activeShadowLight: 'shadow-[inset_0_1.5px_3.5px_rgba(255,255,255,0.5),_0_8px_24px_rgba(29,78,216,0.3)]',
            activeRing: 'ring-blue-500/30',
            activeRingLight: 'ring-blue-400/40',
            textActive: 'text-blue-100/90',
            textInactiveDark: 'text-blue-300',
            textInactiveLight: 'text-blue-800',
            badgeBgDark: 'bg-blue-950/70 border border-blue-600/30 text-blue-200',
            badgeBgLight: 'bg-blue-100/70 border border-blue-300 text-blue-800',
            activeTaskBgDark: 'bg-[#112758] border border-blue-600/60 text-blue-100 cursor-pointer hover:border-blue-500',
            activeTaskBgLight: 'bg-[#bfdbfe] border border-blue-300 text-blue-950 cursor-pointer hover:border-blue-450',
            inactiveTaskBgDark: 'bg-[#081736] border border-blue-800/60 text-blue-200 cursor-pointer hover:border-blue-700 hover:bg-[#112758]',
            inactiveTaskBgLight: 'bg-[#eff6ff] border border-blue-200 text-blue-900 cursor-pointer hover:border-blue-400 hover:bg-[#bfdbfe]',
            activeCompletedTaskBgDark: 'bg-[#112758]/40 border border-blue-600/20 text-blue-100/50 cursor-pointer hover:border-blue-500/30',
            activeCompletedTaskBgLight: 'bg-[#bfdbfe]/40 border border-blue-350/30 text-blue-900/60 cursor-pointer hover:border-blue-400/50',
            inactiveCompletedTaskBgDark: 'bg-[#081736]/40 border border-blue-800/20 text-blue-200/50 cursor-pointer hover:border-blue-800/30',
            inactiveCompletedTaskBgLight: 'bg-[#eff6ff]/40 border border-blue-200/30 text-blue-900/50 cursor-pointer hover:border-blue-300/40',
            checkboxActive: 'border-blue-500 dark:border-blue-550 bg-blue-600/10 text-blue-500 hover:border-blue-400 hover:bg-blue-600/20',
            lineColorActiveDark: '#1d4ed8',
            lineColorActiveLight: '#1d4ed8',
            lineColorUnlockedDark: '#1d4ed855',
            lineColorUnlockedLight: '#93c5fd99',
        }
    ];

    return themes[0];
};
