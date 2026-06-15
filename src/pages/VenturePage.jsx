import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Questionnaire from '../components/Questionnaire';
import { ProjectStorage } from '../services/projectStorage';
import FullScreenLoader from '../components/FullScreenLoader';
import { useAuth } from '../context/AuthContext';

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

const DEFAULT_PHASES = [
    { id: 'p1', title: 'Ideation' },
    { id: 'p2', title: 'Execution' }
];

const VenturePage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();

    // Project ID handling
    const currentId = projectId || ProjectStorage.getActiveId();
    const cachedProject = currentId ? ProjectStorage.getCached(currentId) : null;

    const [loading, setLoading] = useState(!cachedProject);
    const [project, setProject] = useState(cachedProject);

    // Business Logic State
    // isNewProjectFlow: true only when we have a projectId but no idea yet
    const [isNewProjectFlow, setIsNewProjectFlow] = useState(() => {
        if (cachedProject && !cachedProject.data?.idea) return true;
        return false;
    });

    const [wizardLoading, setWizardLoading] = useState(() => {
        if (cachedProject) {
            return !cachedProject.data?.idea;
        }
        return !!currentId;
    });
    
    const [actionPlan, setActionPlan] = useState(() => normalizePlan(cachedProject?.data?.plan));
    const [submittedIdea, setSubmittedIdea] = useState('');

    const isMounted = useRef(true);

    // 1. Initial Load & Synchronization
    useEffect(() => {
        isMounted.current = true;

        if (!currentId) {
            navigate('/onboard', { replace: true });
            return;
        }

        setIsNewProjectFlow(false);

        const loadProjectData = async () => {
            const p = await ProjectStorage.getById(currentId);
            if (!p) {
                setIsNewProjectFlow(true);
                setWizardLoading(false);
                setLoading(false);
                return;
            }

            setProject(p);
            const data = p.data || {};

            if (data.plan) {
                setActionPlan(normalizePlan(data.plan));
                setIsNewProjectFlow(false);
            } else if (!data.idea) {
                setIsNewProjectFlow(true);
            } else {
                setIsNewProjectFlow(false);
            }

            setWizardLoading(false);
            setLoading(false);
        };

        loadProjectData();

        return () => {
            isMounted.current = false;
        };
    }, [currentId, navigate]);

    const handleOnboardingComplete = async (onboardingData) => {
        setWizardLoading(true);
        try {
            const { name, role, companyName, idea, stage } = onboardingData;
            setSubmittedIdea(idea);

            const activeId = ProjectStorage.getActiveId();
            let finalId = activeId;

            const emptyPlan = {
                short_title: companyName || "New Project",
                phases: DEFAULT_PHASES,
                days: []
            };

            if (activeId) {
                await ProjectStorage.updateData(activeId, {
                    idea: idea,
                    plan: emptyPlan
                });
            } else {
                finalId = await ProjectStorage.create(idea, companyName);
                await ProjectStorage.updateData(finalId, {
                    userName: name,
                    userRole: role,
                    companyName: companyName,
                    stage: stage,
                    plan: emptyPlan
                });
            }

            if (user && name) {
                try {
                    await updateUser({ name, full_name: name });
                } catch (e) {
                    console.warn("Failed to sync name:", e.message);
                }
            }
            
            setActionPlan(emptyPlan);
            setIsNewProjectFlow(false);
            navigate(`/project/${finalId}`);
        } catch (error) {
            console.error("Onboarding failed:", error);
            alert("Failed to initialize project. Please try again.");
            setWizardLoading(false);
        }
    };

    if (loading) return <FullScreenLoader />;

    // Idea-capture step
    if (isNewProjectFlow) {
        const stageName = project?.data?.stage;
        const companyName = project?.data?.companyName;
        
        let dynamicText = 'Tell me about your idea';
        if (stageName && companyName && companyName.trim() !== '') {
            const formattedStage = stageName.toLowerCase() === 'pre-idea' ? 'idea for' : stageName;
            dynamicText = `Tell me about your ${formattedStage} ${companyName}`;
        } else if (companyName && companyName.trim() !== '') {
            dynamicText = `Tell me about your idea for ${companyName}`;
        } else if (stageName) {
            const formattedStage = stageName.toLowerCase() === 'pre-idea' ? 'idea' : stageName;
            dynamicText = `Tell me about your ${formattedStage}`;
        }

        return (
            <div className="flex flex-col h-screen w-full bg-white overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
                <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                    <Questionnaire
                        questions={[
                            {
                                id: 'idea',
                                type: 'chat-idea',
                                text: dynamicText,
                                placeholder: 'e.g. A marketplace connecting local bakeries with customers who want custom wedding cakes...'
                            }
                        ]}
                        onOnboardingSubmit={handleOnboardingComplete}
                        onBack={() => navigate('/onboard')}
                        isLoading={wizardLoading}
                        isGeneratedPhase={wizardLoading}
                        originalIdea={submittedIdea}
                    />
                </main>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-[#FAFAFA] overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <main className="flex-1 relative overflow-hidden flex flex-col items-center justify-center min-h-0">
                <p className="text-slate-400">Blank Workspace</p>
            </main>
        </div>
    );
};

export default VenturePage;
