import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CivicAuthProvider, useUser } from '@civic/auth/react';
import LandingPage from './components/LandingPage';
import ExamRegistration from './components/ExamRegistration';
import StudyStrategies from './components/StudyStrategies';
import ExamResultSubmission from './components/ExamResultSubmission';
import StarBackground from './components/StarBackground';
import { ExamRegistration as ExamRegistrationType, ExamQuestion, ExamResult } from './types';

// Mock exam questions for demo
const MOCK_QUESTIONS: ExamQuestion[] = [
  {
    id: '1',
    examType: 'usmle-step1',
    state: 'CA',
    question: 'A 45-year-old patient presents with chest pain. What is the most likely diagnosis?',
    options: ['Myocardial infarction', 'Gastroesophageal reflux', 'Pulmonary embolism', 'Anxiety disorder', 'Costochondritis'],
    correctAnswer: 0,
    explanation: 'Given the age and presentation, myocardial infarction should be the primary consideration.',
    difficulty: 'medium',
    timeAllowed: 90,
    category: 'cardiology',
    verified: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    examType: 'bar-exam',
    state: 'NY',
    question: 'In contract law, what constitutes a valid offer?',
    options: ['Intent to be bound', 'Definite terms', 'Communication to offeree', 'All of the above', 'None of the above'],
    correctAnswer: 3,
    explanation: 'A valid offer requires intent, definite terms, and communication to the offeree.',
    difficulty: 'easy',
    timeAllowed: 120,
    category: 'contracts',
    verified: true,
    createdAt: new Date(),
  },
];

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'registration' | 'study' | 'results'>('landing');
  const [currentRegistration, setCurrentRegistration] = useState<ExamRegistrationType | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [examExpired, setExamExpired] = useState(false);

  useEffect(() => {
    // Check if exam date has passed
    if (currentRegistration && new Date() > currentRegistration.examDate) {
      setExamExpired(true);
    }
  }, [currentRegistration]);

  const handleRegistrationComplete = (registration: ExamRegistrationType) => {
    setCurrentRegistration(registration);
    setCurrentView('study');
  };

  const handleResultSubmitted = (result: ExamResult) => {
    // Reactivate study features
    setExamExpired(false);
    setCurrentView('study');
    
    // If failed, could load questions from successful candidates here
    if (result.actualExamResult === 'fail') {
      console.log('Loading questions from successful candidates...');
    }
  };

  const handleStudySessionComplete = (answers: any[], score: number) => {
    console.log('Study session completed:', { answers, score });
  };

  // Check if user needs to report exam results
  useEffect(() => {
    if (examExpired && currentRegistration && !currentRegistration.examResult) {
      setCurrentView('results');
    }
  }, []);

  useEffect(() => {
    // Load registration from localStorage
    const saved = localStorage.getItem('exam-registration');
    if (saved) {
      const registration = JSON.parse(saved);
      setCurrentRegistration(registration);
      if (registration.isActive) {
        setCurrentView('study');
      }
    }
  }, []);

  useEffect(() => {
    // Save registration to localStorage
    if (currentRegistration) {
      localStorage.setItem('exam-registration', JSON.stringify(currentRegistration));
    }
  }, [currentRegistration]);

  return (
    <CivicAuthProvider clientId="7f8e5073-ab64-46df-825e-07d489f612ff">
      <AppContent
        currentView={currentView}
        setCurrentView={setCurrentView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentRegistration={currentRegistration}
        examExpired={examExpired}
        onRegistrationComplete={handleRegistrationComplete}
        onResultSubmitted={handleResultSubmitted}
        onStudySessionComplete={handleStudySessionComplete}
      />
    </CivicAuthProvider>
  );
}

interface AppContentProps {
  currentView: 'landing' | 'registration' | 'study' | 'results';
  setCurrentView: (view: 'landing' | 'registration' | 'study' | 'results') => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentRegistration: ExamRegistrationType | null;
  examExpired: boolean;
  onRegistrationComplete: (registration: ExamRegistrationType) => void;
  onResultSubmitted: (result: ExamResult) => void;
  onStudySessionComplete: (answers: any[], score: number) => void;
}

const AppContent: React.FC<AppContentProps> = ({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  currentRegistration,
  examExpired,
  onRegistrationComplete,
  onResultSubmitted,
  onStudySessionComplete,
}) => {
  const { user, isLoading, error, signIn } = useUser();

  const renderContent = () => {
    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentView('registration')} />;
      case 'registration':
        return <ExamRegistration onRegistrationComplete={onRegistrationComplete} />;
      case 'study':
        if (examExpired) {
          return (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">Study Features Deactivated</h2>
              <p className="text-gray-400 mb-6">
                Your exam date has passed. Please report your results to reactivate your study features.
              </p>
              <button
                onClick={() => setCurrentView('results')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Report Exam Results
              </button>
            </div>
          );
        }
        return (
          <StudyStrategies 
            questions={MOCK_QUESTIONS} 
            onSessionComplete={onStudySessionComplete}
          />
        );
      case 'results':
        return currentRegistration ? (
          <ExamResultSubmission 
            registrationId={currentRegistration.id}
            onResultSubmitted={onResultSubmitted}
          />
        ) : null;
      default:
        return <LandingPage onGetStarted={() => setCurrentView('registration')} />;
    }
  };

  // If authentication is loading, show a loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center">
          <p className="text-red-500 text-lg">Error: {error.message}</p>
          <button
            onClick={() => {
              try {
                signIn();
              } catch (err) {
                console.error('Sign-in error:', err);
              }
            }}
            className="mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no user is authenticated, show a login prompt
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center p-8 rounded-lg bg-opacity-80 backdrop-blur-md ${darkMode ? 'bg-gray-800/80' : 'bg-white/80'}">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Welcome to TutorBot
          </h1>
          <p className="text-gray-400 mb-6">Please sign in to access your Professional Exam Prep Platform.</p>
          <button
            onClick={() => {
              try {
                signIn();
              } catch (err) {
                console.error('Sign-in error:', err);
              }
            }}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 transition-all shadow-lg"
          >
            Sign In with Civic
          </button>
        </div>
      </div>
    );
  }

  // If authenticated, render the full app
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <StarBackground darkMode={darkMode} />
      
      <div className="relative z-10">
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;