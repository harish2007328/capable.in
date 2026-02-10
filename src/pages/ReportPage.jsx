import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AnalysisReport from '../components/AnalysisReport';
import { generateAnalysisReport } from '../services/ai';
import { Loader } from 'lucide-react';
import ProjectHeader from '../components/ProjectHeader';
import SkeletonReport from '../components/SkeletonReport';

const ReportPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [report, setReport] = useState(null);

    useEffect(() => {
        const loadReport = async () => {
            const idea = localStorage.getItem('userIdea');
            const questions = localStorage.getItem('analysisQuestions');
            const answers = localStorage.getItem('userAnswers');

            if (!idea || !questions || !answers) {
                console.warn("Required data missing for report. Redirecting to home.");
                navigate('/');
                return;
            }

            // Check cache
            const cachedReport = localStorage.getItem('analysisReport');
            if (cachedReport) {
                try {
                    const parsed = JSON.parse(cachedReport);
                    if (parsed && parsed.market_demand) {
                        setReport(parsed);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    localStorage.removeItem('analysisReport');
                }
            }

            // Generate Report
            try {
                const questionsObj = JSON.parse(questions).map(q => q.text);
                const webSignals = JSON.parse(localStorage.getItem('webSignals') || '{}');

                const result = await generateAnalysisReport(
                    idea,
                    questionsObj,
                    answers, // answers is already a formatted string from QuestionWizard
                    webSignals
                );

                if (result) {
                    setReport(result);
                    localStorage.setItem('analysisReport', JSON.stringify(result));
                }
                setLoading(false);
            } catch (error) {
                console.error("Failed to generate report:", error);
                setLoading(false);
            }
        };

        loadReport();
    }, [navigate]);

    const handleRestart = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleAccept = () => {
        // Save project to the persistent list
        const idea = localStorage.getItem('userIdea');
        const reportStr = localStorage.getItem('analysisReport');

        let newProjectId = 'active';

        if (idea && reportStr) {
            try {
                const reportLocal = JSON.parse(reportStr);
                newProjectId = `user_proj_${Date.now()}`;
                const newProject = {
                    id: newProjectId,
                    title: idea,
                    category: 'New Venture',
                    status: 'planning',
                    description: reportLocal.executive_summary || reportLocal.summary || 'New analysis project',
                };

                const existingProjectsStr = localStorage.getItem('capable_projects');
                const existingProjects = existingProjectsStr ? JSON.parse(existingProjectsStr) : [];

                // Avoid duplicates
                if (!existingProjects.some(p => p.title === idea)) {
                    const updatedProjects = [newProject, ...existingProjects];
                    localStorage.setItem('capable_projects', JSON.stringify(updatedProjects));
                }
            } catch (e) {
                console.error("Failed to save project", e);
            }
        }
        // Navigate to task page with the project
        navigate(`/task/${newProjectId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 pb-20">
                <ProjectHeader activeStep="report" onBack={() => navigate('/')} />
                <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8">
                    <div>
                        <div className="text-center space-y-4 pt-10 mb-12">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                Analyzing...
                            </span>
                            <h1 className="text-4xl md:text-5xl font-serif font-medium text-slate-200">
                                Generating Insights
                            </h1>
                        </div>
                        <SkeletonReport />
                    </div>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="w-full min-h-[60vh] flex flex-col items-center justify-center">
                <div className="text-center space-y-6 animate-fade-in-up">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <Loader className="text-red-500 animate-spin" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900">
                        Generation Failed
                    </h3>

                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        We couldn't generate a valid report at this time.
                    </p>

                    <button
                        onClick={handleRestart}
                        className="px-6 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <ProjectHeader activeStep="report" onBack={() => navigate('/')} />
            <div className="w-full max-w-[1400px] mx-auto px-6 md:px-8">
                <AnalysisReport report={report} onRestart={handleRestart} onAccept={handleAccept} />
            </div>
        </div>
    );
};

export default ReportPage;
