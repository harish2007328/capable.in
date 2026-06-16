import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Questionnaire from '../components/Questionnaire';
import { ProjectStorage } from '../services/projectStorage';
import { useAuth } from '../context/AuthContext';

// Only the first 4 steps — up to and including stage selection
const ONBOARD_QUESTIONS = [
    {
        id: 'name',
        type: 'text',
        text: 'What should we call you?',
        placeholder: 'Your name'
    },
    {
        id: 'role',
        type: 'role',
        text: 'Which best describes you?',
        description: 'Select your primary role or background to help us tailor recommendations.'
    },
    {
        id: 'companyName',
        type: 'text',
        text: 'Create a business name',
        placeholder: 'e.g. Acme Corp, SolarFlow, local bakery',
        description: "Don't worry, this can be changed at any time."
    },
    {
        id: 'stage',
        type: 'stage-slider',
        text: 'What Stage is Your Business?',
        options: ['Pre-idea', 'idea', 'Pre-MVP', 'MVP', 'Customers', 'Revenue', 'Public']
    }
];

const OnboardPage = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [stageLoading, setStageLoading] = useState(false);

    // Called when the user clicks Next on the stage step
    const handleStageSubmit = async (onboardingData, next) => {
        setStageLoading(true);
        try {
            const { name, role, companyName, stage } = onboardingData;

            // Create project entry in storage
            const newId = await ProjectStorage.create('', companyName || 'New Venture');

            // Save onboarding metadata
            await ProjectStorage.updateData(newId, {
                userName: name,
                userRole: role,
                companyName: companyName,
                stage: stage
            });

            // Sync name to user profile if authenticated
            if (user && name) {
                try {
                    await updateUser({ name, full_name: name });
                } catch (e) {
                    console.warn('Failed to sync name to profile:', e.message);
                }
            }

            // Navigate to the project page
            navigate(`/project/${newId}`);
        } catch (error) {
            console.error('Failed to save stage selection:', error);
        } finally {
            setStageLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
            <main className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                <Questionnaire
                    questions={ONBOARD_QUESTIONS}
                    onStageSubmit={handleStageSubmit}
                    onBack={() => navigate('/')}
                    isLoading={false}
                    isStageSubmitting={stageLoading}
                />
            </main>
        </div>
    );
};

export default OnboardPage;
