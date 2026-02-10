import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ProjectHeader from '../components/ProjectHeader';
import Questionnaire from '../components/Questionnaire';
import OnboardSummary from '../components/OnboardSummary';
import AnalysisReport from '../components/AnalysisReport';
import TaskView from '../components/TaskView';
import SkeletonWizard from '../components/SkeletonWizard';
import SkeletonReport from '../components/SkeletonReport';
import { generateAnalysisQuestions, generateAnalysisReport, generateActionPlan } from '../services/ai';
import { ProjectStorage } from '../services/projectStorage';

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

    // Operational Refs
    const isMounted = useRef(true);
    const hasInitialized = useRef(false);

    // --- HELPERS ---
    const normalizePlan = (plan) => {
        if (!plan || !plan.days) return plan;
        return {
            ...plan,
            days: plan.days.map(d => ({
                ...d,
                id: d.id || d.day,
                day_number: d.day_number || d.day,
                title: d.title || d.task
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
            const p = ProjectStorage.getById(currentId);
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

            if (data.report) setReport(data.report);

            if (data.plan) {
                const normalized = normalizePlan(data.plan);
                setActionPlan(normalized);
                setHasPlan(true);
            }

            // Logical Routing
            if (data.plan) setActiveTab('plan');
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
                    ProjectStorage.updateData(currentId, {
                        questions: result.questions,
                        projectTitle: result.projectTitle || p?.title,
                        projectDescription: result.projectDescription
                    });
                    setQuestions(result.questions);
                    // Refresh project state to show new title/desc
                    setProject(ProjectStorage.getById(currentId));
                }
            } catch (e) {
                console.error("Discovery failed", e);
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

        try {
            let contextString = Array.isArray(answers)
                ? answers.map(a => `Q: ${a.question} | A: ${a.answer}`).join('\n')
                : String(answers);

            const rep = await generateAnalysisReport(idea, contextString);
            if (isMounted.current) {
                setReport(rep);
                ProjectStorage.updateData(currentId, { report: rep });
            }
        } catch (e) {
            console.error("Strategy generation failed", e);
        } finally {
            if (isMounted.current) setReportLoading(false);
        }
    };

    const handleWizardComplete = (answers) => {
        ProjectStorage.updateData(currentId, { answers });
        setCompletedAnswers(answers);
        setShowSummary(true);
        setActiveTab('strategy');
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
            const answers = JSON.stringify(completedAnswers);
            const result = await generateActionPlan(idea, JSON.stringify(report), answers);

            const normalized = normalizePlan(result);
            ProjectStorage.updateData(currentId, { plan: normalized });
            setActionPlan(normalized);
            setHasPlan(true);
            setActiveTab('plan');
        } catch (error) {
            console.error('Action plan failed', error);
            alert('Consultant unavailable. Please try again.');
        } finally {
            if (isMounted.current) setPlanLoading(false);
        }
    };

    if (loading) return null;

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
                                        <div className="max-w-md mx-auto text-center py-20 glass-card bg-white/80 p-10 border border-slate-200">
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tighter">Connection Interrupted</h3>
                                            <p className="text-slate-500 mb-8">The strategy core is taking longer than expected.</p>
                                            <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-xs">
                                                Restart Core
                                            </button>
                                        </div>
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
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="w-full h-full animate-in fade-in zoom-in-95 duration-500 fill-mode-both">
                            {reportLoading ? <SkeletonReport /> : (
                                report ? (
                                    <AnalysisReport
                                        report={report}
                                        onRestart={() => { setReport(null); }}
                                        onAccept={handleAcceptStrategy}
                                        hasPlan={hasPlan}
                                        planLoading={planLoading}
                                    />
                                ) : <SkeletonReport />
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <TaskView plan={actionPlan} projectId={currentId} />
                    </div>
                )}
            </main>
        </div>
    );
};

export default VenturePage;
