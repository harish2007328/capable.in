import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProjectHeader from '../components/ProjectHeader';
import Questionnaire from '../components/Questionnaire';
import OnboardSummary from '../components/OnboardSummary';
import AnalysisReport from '../components/AnalysisReport';
import TaskView from '../components/TaskView';
import SkeletonWizard from '../components/SkeletonWizard';
import SkeletonReport from '../components/SkeletonReport';
import { generateAnalysisQuestions, generateAnalysisReport, generatePlanStructure, generatePhaseTasks, generateReportStructure, generateReportSection } from '../services/ai';
import { ProjectStorage } from '../services/projectStorage';
import FullScreenLoader from '../components/FullScreenLoader';

const VenturePage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Project ID handling
    const currentId = projectId || ProjectStorage.getActiveId();

    const [activeTab, setActiveTab] = useState('context');
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState(null);

    // Business Logic State
    const [questions, setQuestions] = useState([]);
    const [wizardLoading, setWizardLoading] = useState(true);
    const [isTitleGenerating, setIsTitleGenerating] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [completedAnswers, setCompletedAnswers] = useState(null);
    const [report, setReport] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [hasPlan, setHasPlan] = useState(false);
    const [actionPlan, setActionPlan] = useState(null);
    const [planLoading, setPlanLoading] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');

    // Operational Refs
    const isMounted = useRef(true);
    const hasInitialized = useRef(false);



    // --- HELPERS ---
    const normalizePlan = (plan) => {
        if (!plan) return plan;
        const days = plan.days || [];
        return {
            ...plan,
            days: days.map(d => ({
                ...d,
                id: d.id || d.day,
                day_number: d.day_number || d.day,
                title: d.title || d.task,
                isPlaceholder: !d.task
            }))
        };
    };

    // --- EFFECTS ---

    // 1. Initial Load & Synchronization
    useEffect(() => {
        isMounted.current = true;

        if (!currentId) {
            navigate('/');
            return;
        }

        const loadProjectData = async () => {
            const p = await ProjectStorage.getById(currentId);
            if (!p) {
                navigate('/dashboard#projects');
                return;
            }

            setProject(p);
            const data = p.data || {};

            // Sync States from Storage
            if (data.questions) {
                setQuestions(data.questions);
                setWizardLoading(false);
            }

            if (data.answers) {
                setCompletedAnswers(data.answers);
                setShowSummary(true);
            }

            if (data.report && !reportLoading) setReport(data.report);

            if (data.plan) {
                const normalized = normalizePlan(data.plan);
                setActionPlan(normalized);
                setHasPlan(true);
            }

            // Logical Routing
            if (data.plan) setActiveTab('plan');
            if (isMounted.current) setPlanLoading(false); // Progressive UX - dismiss loader instantly!
            else if (data.report) setActiveTab('strategy');
            else setActiveTab('context');

            setLoading(false);

            // Fetch questions if missing and we have an idea
            if (!data.questions && data.idea) {
                fetchQuestions(data.idea);
            }
        };

        const fetchQuestions = async (idea) => {
            setWizardLoading(true);
            setIsTitleGenerating(true);
            try {
                const result = await generateAnalysisQuestions(idea);
                if (result?.questions && isMounted.current) {
                    await ProjectStorage.updateData(currentId, {
                        questions: result.questions,
                        projectTitle: result.projectTitle || p?.title,
                        projectDescription: result.projectDescription
                    });
                    setQuestions(result.questions);
                    // Refresh project state to show new title/desc
                    const updatedProject = await ProjectStorage.getById(currentId);
                    setProject(updatedProject);
                }
            } catch (e) {
                console.error("Discovery failed", e);
                // Check if this is a content moderation block
                if (e.response?.status === 403 && e.response?.data?.blocked) {
                    setBlockedMessage(e.response.data.error || "This idea has been flagged and cannot be processed.");
                }
            } finally {
                if (isMounted.current) {
                    setWizardLoading(false);
                    setIsTitleGenerating(false);
                }
            }
        };

        loadProjectData();

        return () => {
            isMounted.current = false;
        };
    }, [currentId, navigate]);

    // 2. Report Generation Trigger
    useEffect(() => {
        if (activeTab === 'strategy' && !report && !reportLoading && completedAnswers) {
            fetchReport();
        }
    }, [activeTab, report, reportLoading, completedAnswers]);

    // --- ACTIONS ---

    const fetchReport = async () => {
        if (reportLoading || !project) return;
        setReportLoading(true);

        const idea = project.data.idea;
        const answers = completedAnswers;
        const webSignals = project.data.webSignals || {};

        try {
            const contextString = Array.isArray(answers)
                ? answers.map(a => `Q: ${a.question} | A: ${a.answer}`).join('\n')
                : String(answers);

            // Step 1: Generate Structure
            const structure = await generateReportStructure(idea, webSignals);
            if (isMounted.current) {
                setReport(structure);
                await ProjectStorage.updateData(currentId, { report: structure });
            }

            // Step 2: Generate Content for each section
            let updatedReport = { ...structure };
            for (const page of structure.pages) {
                if (!isMounted.current) break;

                try {
                    let sectionContent = await generateReportSection(
                        idea, 
                        webSignals, 
                        contextString, 
                        page.id, 
                        page.title
                    );

                    // Aggressive Resolver: Always unwrap if there's exactly one key that is an object
                    if (sectionContent && typeof sectionContent === 'object' && !Array.isArray(sectionContent)) {
                        const keys = Object.keys(sectionContent);
                        if (keys.length === 1 && typeof sectionContent[keys[0]] === 'object' && !Array.isArray(sectionContent[keys[0]])) {
                            // Only unwrap if the internal object has more than 1 key (to avoid unwrapping real data that just happens to have 1 key)
                            // OR if the key matches common wrapper patterns
                            const wrapperKey = keys[0].toLowerCase();
                            const matchesId = wrapperKey === page.id.toLowerCase();
                            const isGeneric = ['content', 'data', 'section', 'result'].includes(wrapperKey);
                            const hasSubKeys = Object.keys(sectionContent[keys[0]]).length > 1;

                            if (matchesId || isGeneric || hasSubKeys) {
                                sectionContent = sectionContent[keys[0]];
                            }
                        }
                    }

                    if (isMounted.current) {
                        updatedReport.pages = updatedReport.pages.map(p => 
                            p.id === page.id ? { ...p, content: sectionContent, isPlaceholder: false } : p
                        );
                        // State update first
                        setReport({ ...updatedReport });
                        // Database update second
                        await ProjectStorage.updateData(currentId, { report: { ...updatedReport } });
                    }
                } catch (secErr) {
                    console.error(`Failed to generate section ${page.id}:`, secErr);
                }
            }
        } catch (e) {
            console.error("Strategy generation failed", e);
        } finally {
            if (isMounted.current) setReportLoading(false);
        }
    };

    const handleAcceptStrategy = async () => {
        if (planLoading) return;
        if (hasPlan && actionPlan) {
            setActiveTab('plan');
            return;
        }

        setPlanLoading(true);
        try {
            const idea = project.data.idea;
            const reportStr = JSON.stringify(report);
            const answersStr = JSON.stringify(completedAnswers);

            // Step 1: Generate Structure (With local retry)
            let structure;
            let retryCount = 0;
            while (retryCount < 2) {
                try {
                    structure = await generatePlanStructure(idea, reportStr, answersStr);
                    if (structure) break;
                } catch (e) {
                    retryCount++;
                    if (retryCount >= 2) throw e;
                    console.warn(`Structure generation attempt ${retryCount} failed, retrying...`);
                    await new Promise(res => setTimeout(res, 1000));
                }
            }

            // Intelligent unwrap if AI nested the JSON
            if (structure && structure.plan && Array.isArray(structure.plan.phases)) {
                structure = structure.plan;
            }

            // Ensure structure is valid
            if (!structure || !structure.phases || !Array.isArray(structure.phases) || structure.phases.length === 0) {
                console.warn('AI structure returned incorrectly, applying robust default schema.');
                structure = {
                    short_title: "Strategic Execution",
                    phases: [
                        { id: 1, name: "Deep Research", color: "#8B5CF6", range: "1-15" },
                        { id: 2, name: "Local Validation", color: "#3B82F6", range: "16-30" },
                        { id: 3, "name": "Build & Pre-Launch", "color": "#10B981", "range": "31-45" },
                        { id: 4, "name": "Launch & Iterate", "color": "#F59E0B", "range": "46-60" }
                    ]
                };
            }
            
            // Create a skeleton plan with 60 days
            const skeletonDays = Array.from({ length: 60 }, (_, i) => ({
                day: i + 1,
                day_number: i + 1,
                id: i + 1,
                title: (structure.day_titles && structure.day_titles[i]) ? structure.day_titles[i] : `Task ${i + 1}...`,
                task: '',
                deliverable: '',
                details: [],
                phase_id: structure.phases.find(p => {
                    const [s, e] = p.range.split('-').map(Number);
                    return (i + 1) >= s && (i + 1) <= e;
                })?.id || 1,
                isPlaceholder: true
            }));

            const initialPlan = {
                ...structure,
                days: skeletonDays
            };

            setActionPlan(initialPlan);
            setHasPlan(true);
            setActiveTab('plan');
            if (isMounted.current) setPlanLoading(false);
            
            // Step 2: Generate all 60 days in batches of 5 to avoid timeouts
            let currentFullPlan = { ...initialPlan };
            const BATCH_SIZE = 3; // Progressive streaming (3 per 1s)
            
            for (let batchStart = 1; batchStart <= 60; batchStart += BATCH_SIZE) {
                const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, 60);
                
                // Find which phase this batch falls into for context
                const relevantPhase = structure.phases.find(p => {
                    const [s, e] = p.range.split('-').map(Number);
                    return batchStart >= s && batchStart <= e;
                }) || structure.phases[0];

                try {
                    const batchResult = await generatePhaseTasks(
                        idea, 
                        reportStr, 
                        answersStr, 
                        { ...relevantPhase, range: `${batchStart}-${batchEnd}` },
                        currentFullPlan.days.filter(d => !d.isPlaceholder),
                        currentFullPlan.days.slice(batchStart - 1, batchEnd).map(d => d.title)
                    );

                    if (batchResult?.days) {
                        const updatedDays = currentFullPlan.days.map(existingDay => {
                            const generatedDay = batchResult.days.find(d => d.day === existingDay.day);
                            if (generatedDay) {
                                return {
                                    ...generatedDay,
                                    isPlaceholder: false,
                                    id: generatedDay.day,
                                    day_number: generatedDay.day
                                };
                            }
                            return existingDay;
                        });

                        currentFullPlan = { ...currentFullPlan, days: updatedDays };
                        setActionPlan({ ...currentFullPlan });
                        await ProjectStorage.updateData(currentId, { plan: currentFullPlan });
                    }
                } catch (batchErr) {
                    console.error(`Failed to generate tasks for days ${batchStart}-${batchEnd}`, batchErr);
                }
                await new Promise(r => setTimeout(r, 600)); // Rate limit breathing room
            }

        } catch (error) {
            console.error('Action plan structure failed', error);
            alert('Consultant unavailable. Please try again.');
        } finally {
            // Loader already dismissed earlier progressively
        }
    };

    const handleWizardComplete = async (answers) => {
        await ProjectStorage.updateData(currentId, { answers });
        setCompletedAnswers(answers);
        setShowSummary(true);
        setActiveTab('strategy');
    };



    if (loading) return <FullScreenLoader />;

    return (
        <div className="flex flex-col h-screen w-full bg-[#FAFAFA] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            {/* HEADER */}
            <div className="flex-none z-50">
                <ProjectHeader
                    projectTitle={project?.title || 'New Venture'}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    hasPlan={hasPlan}
                    isTitleLoading={isTitleGenerating}
                />
            </div>

            {/* CONTENT STAGE */}
            <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                {activeTab === 'context' ? (
                    <div className={`flex-1 flex flex-col min-h-0 ${(!wizardLoading && questions.length > 0 && !showSummary) ? '' : 'overflow-y-auto custom-scrollbar px-6 pt-8 pb-32'}`}>
                        <div className={`${(!wizardLoading && questions.length > 0 && !showSummary) ? 'w-full h-full' : 'max-w-7xl mx-auto w-full'}`}>
                            <div className={`w-full h-full ${(!wizardLoading && questions.length > 0 && !showSummary) ? '' : 'animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both'}`}>
                                {wizardLoading ? <SkeletonWizard /> : (
                                    questions.length === 0 ? (
                                        blockedMessage ? (
                                            /* Content Blocked Popup - matches OnboardSummary style */
                                            <div className="max-w-md mx-auto text-center py-12">
                                                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 flex flex-col items-center">
                                                    {/* Badge */}
                                                    <div className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-red-500 uppercase">Content Blocked</span>
                                                    </div>

                                                    {/* Icon */}
                                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-5">
                                                        <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                            <line x1="9" y1="9" x2="15" y2="15" />
                                                            <line x1="15" y1="9" x2="9" y2="15" />
                                                        </svg>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="text-2xl font-normal text-gray-900 mb-2">
                                                        We Can't Process This
                                                    </h3>

                                                    {/* Message */}
                                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-8">
                                                        {blockedMessage}
                                                    </p>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-3 w-full">
                                                        <button
                                                            onClick={() => navigate('/')}
                                                            className="flex-1 px-5 py-3 bg-gradient-to-r from-[var(--brand-accent)] to-[var(--brand-accent-hover)] text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                                                        >
                                                            Try a New Idea
                                                        </button>
                                                        <button
                                                            onClick={() => navigate('/dashboard')}
                                                            className="flex-1 px-5 py-3 bg-gray-50 text-gray-600 rounded-lg font-bold text-sm hover:bg-gray-100 transition-all active:scale-95 border border-gray-200"
                                                        >
                                                            Dashboard
                                                        </button>
                                                    </div>

                                                    {/* Footer badge */}
                                                    <div className="flex items-center gap-2 text-gray-400 mt-6">
                                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                                            <polyline points="9 12 12 15 22 5" />
                                                        </svg>
                                                        <span className="text-[10px] font-bold uppercase">Safety Filter Active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-md mx-auto text-center py-20 glass-card bg-white/80 p-10 border border-slate-200">
                                                <h3 className="text-xl font-normal text-slate-900 mb-4 uppercase">Connection Interrupted</h3>
                                                <p className="text-slate-500 mb-8">The strategy core is taking longer than expected.</p>
                                                <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase text-xs">
                                                    Restart Core
                                                </button>
                                            </div>
                                        )
                                    ) : showSummary ? (
                                        <OnboardSummary
                                            questions={questions}
                                            answers={completedAnswers}
                                            onProceed={() => setActiveTab('strategy')}
                                            isReadonly={!!report}
                                        />
                                    ) : (
                                        <Questionnaire questions={questions} onComplete={handleWizardComplete} />
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ) : activeTab === 'strategy' ? (
                    <div className="flex-1 min-h-0">
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
                            {report ? (
                                <AnalysisReport
                                    report={report}
                                    onRestart={() => { setReport(null); }}
                                    onAccept={handleAcceptStrategy}
                                    hasPlan={hasPlan}
                                    planLoading={planLoading}
                                    reportLoading={reportLoading}
                                />
                            ) : (
                                <SkeletonReport />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <TaskView plan={actionPlan} report={report} projectId={currentId} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default VenturePage;
