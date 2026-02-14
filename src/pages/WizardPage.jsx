import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Questionnaire from '../components/Questionnaire';
import LocationForm from '../components/LocationForm';
import { generateAnalysisQuestions } from '../services/ai';
import { Loader, ShieldAlert } from 'lucide-react';
import ProjectHeader from '../components/ProjectHeader';
import SkeletonWizard from '../components/SkeletonWizard';
import OnboardSummary from '../components/OnboardSummary';

const WizardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState([]);
    const [showSummary, setShowSummary] = useState(false);
    const [completedAnswers, setCompletedAnswers] = useState(null);
    const [locationConfirmed, setLocationConfirmed] = useState(false);
    const [blockedMessage, setBlockedMessage] = useState('');

    // Initial Check
    useEffect(() => {
        const savedLoc = localStorage.getItem('userLocation');
        // If we have saved questions, we assume location was handled or not needed for legacy
        const savedQuestions = localStorage.getItem('analysisQuestions');
        if (savedLoc || savedQuestions) {
            setLocationConfirmed(true);
        } else {
            setLoading(false); // Stop loading to show LocationForm
        }
    }, []);

    useEffect(() => {
        if (!locationConfirmed) return;

        const loadQuestions = async () => {
            setLoading(true);
            const idea = localStorage.getItem('userIdea');
            if (!idea) {
                navigate('/');
                return;
            }

            // Check if we already have questions
            const cachedQuestions = localStorage.getItem('analysisQuestions');
            if (cachedQuestions) {
                try {
                    const parsed = JSON.parse(cachedQuestions);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setQuestions(parsed);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem('analysisQuestions');
                }
            }

            // Generate new questions
            try {
                const loc = JSON.parse(localStorage.getItem('userLocation') || 'null');
                const result = await generateAnalysisQuestions(idea, loc);
                setQuestions(result.questions);
                localStorage.setItem('analysisQuestions', JSON.stringify(result.questions));
                if (result.webSignals) {
                    localStorage.setItem('webSignals', JSON.stringify(result.webSignals));
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to generate questions", error);
                // Check if this is a content moderation block
                if (error.response?.status === 403 && error.response?.data?.blocked) {
                    setBlockedMessage(error.response.data.error || "This idea has been flagged and cannot be processed.");
                    setLoading(false);
                } else {
                    setQuestions('error');
                    setLoading(false);
                }
            }
        };

        loadQuestions();
    }, [navigate, locationConfirmed]);

    const handleRetry = () => {
        setQuestions([]);
        setLoading(true);
        localStorage.removeItem('analysisQuestions');
        window.location.reload();
    };

    const handleLocationSubmit = (loc) => {
        localStorage.setItem('userLocation', JSON.stringify(loc));
        setLocationConfirmed(true);
    };

    if (blockedMessage) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ProjectHeader activeStep="onboard" onBack={() => navigate('/')} />
                <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <ShieldAlert className="text-red-500" size={28} />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900">
                            Content Blocked
                        </h3>

                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            {blockedMessage}
                        </p>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (questions === 'error') {
        return (
            <div className="min-h-screen bg-slate-50">
                <ProjectHeader activeStep="onboard" onBack={() => navigate('/')} />
                <div className="w-full h-[60vh] flex flex-col items-center justify-center text-center px-4">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <Loader className="text-red-500 animate-spin" />
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900">
                            Connection Error
                        </h3>

                        <p className="text-slate-500 text-sm max-w-md mx-auto">
                            We encountered an issue while connecting to the intelligence core.
                        </p>

                        <div className="flex justify-center gap-4 pt-4">
                            <button
                                onClick={handleRetry}
                                className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                            >
                                Retry
                            </button>
                            <button
                                onClick={() => navigate('/')}
                                className="px-6 py-3 text-slate-500 text-sm font-medium hover:text-slate-900 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleComplete = (answers) => {
        // Retrieve location for report gen if needed, but context is already baked into questions
        localStorage.setItem('userAnswers', JSON.stringify(answers));
        localStorage.removeItem('analysisReport'); // Force new report generation
        setCompletedAnswers(answers);
        setShowSummary(true);
    };

    const handleProceedToReport = () => {
        navigate('/report');
    };

    if (!locationConfirmed) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ProjectHeader activeStep="onboard" onBack={() => navigate('/')} />
                <div className="w-full flex flex-col items-center min-h-[60vh] pb-12 px-4 md:px-0">
                    <LocationForm onSubmit={handleLocationSubmit} />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <ProjectHeader activeStep="onboard" onBack={() => navigate('/')} />
                <div className="w-full flex flex-col items-center min-h-[60vh] pb-12 px-4 md:px-0">
                    <SkeletonWizard />
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-white overflow-hidden flex flex-col">
            {/* Only show header if NOT in questionnaire mode OR if we want a minimal header overlay */}
            {/* For split layout, we might want to hide the standard header or overlay it */}

            <div className="flex-1 flex overflow-hidden">
                {showSummary ? (
                    <div className="w-full h-full overflow-y-auto bg-slate-50">
                        <ProjectHeader activeStep="onboard" onBack={() => navigate('/')} />
                        <div className="max-w-4xl mx-auto pb-12 px-4 md:px-0 pt-10">
                            <OnboardSummary
                                questions={questions}
                                answers={completedAnswers}
                                onProceed={handleProceedToReport}
                            />
                        </div>
                    </div>
                ) : (
                    <Questionnaire questions={questions} onComplete={handleComplete} onBack={() => navigate('/')} />
                )}
            </div>
        </div>
    );
};

export default WizardPage;

