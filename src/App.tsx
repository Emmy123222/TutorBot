import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CivicAuthProvider, useUser } from '@civic/auth/react';
import LandingPage from './components/LandingPage';
import ExamRegistration from './components/ExamRegistration';
import StudyStrategies from './components/StudyStrategies';
import ExamResultSubmission from './components/ExamResultSubmission';
import StarBackground from './components/StarBackground';
import { ExamRegistration as ExamRegistrationType, ExamResult, UserAnswer } from './types';
import { validateApiKey } from './utils/api';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'registration' | 'study' | 'results'>('landing');
  const [currentRegistration, setCurrentRegistration] = useState<ExamRegistrationType | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [examExpired, setExamExpired] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // Validate API key on app start
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const isValid = await validateApiKey();
        setApiKeyValid(isValid);
      } catch {
        setApiKeyValid(false);
      }
    };
    
    checkApiKey();
  }, []);

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
    
    // Update registration with result
    if (currentRegistration) {
      const updatedRegistration = {
        ...currentRegistration,
        examResult: result.actualExamResult,
        updatedAt: new Date(),
      };
      setCurrentRegistration(updatedRegistration);
      localStorage.setItem('exam-registration', JSON.stringify(updatedRegistration));
    }
  };

  const handleStudySessionComplete = (answers: UserAnswer[], score: number) => {
    console.log('Study session completed:', { 
      answers: answers.length, 
      score, 
      examType: currentRegistration?.examType.name,
      state: currentRegistration?.state.name 
    });
    
    // Save session results to localStorage for analytics
    const sessionResult = {
      timestamp: new Date(),
      examType: currentRegistration?.examType.id,
      state: currentRegistration?.state.code,
      score,
      totalQuestions: answers.length,
      correctAnswers: answers.filter(a => a.isCorrect).length,
    };
    
    const savedResults = JSON.parse(localStorage.getItem('study-sessions') || '[]');
    savedResults.push(sessionResult);
    localStorage.setItem('study-sessions', JSON.stringify(savedResults));
  };

  // Load registration from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('exam-registration');
    if (saved) {
      try {
        const registration = JSON.parse(saved);
        setCurrentRegistration(registration);
        if (registration.isActive && registration.paymentStatus === 'completed') {
          setCurrentView('study');
        }
      } catch (error) {
        console.error('Failed to load registration from localStorage:', error);
        localStorage.removeItem('exam-registration');
      }
    }
  }, []);

  // Save registration to localStorage
  useEffect(() => {
    if (currentRegistration) {
      localStorage.setItem('exam-registration', JSON.stringify(currentRegistration));
    }
  }, [currentRegistration]);

  // Check if user needs to report exam results
  useEffect(() => {
    if (examExpired && currentRegistration && !currentRegistration.examResult) {
      setCurrentView('results');
    }
  }, [examExpired, currentRegistration]);

  return (
    <CivicAuthProvider clientId="7f8e5073-ab64-46df-825e-07d489f612ff">
      <AppContent
        currentView={currentView}
        setCurrentView={setCurrentView}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentRegistration={currentRegistration}
        examExpired={examExpired}
        apiKeyValid={apiKeyValid}
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
  apiKeyValid: boolean | null;
  onRegistrationComplete: (registration: ExamRegistrationType) => void;
  onResultSubmitted: (result: ExamResult) => void;
  onStudySessionComplete: (answers: UserAnswer[], score: number) => void;
}

const AppContent: React.FC<AppContentProps> = ({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  currentRegistration,
  examExpired,
  apiKeyValid,
  onRegistrationComplete,
  onResultSubmitted,
  onStudySessionComplete,
}) => {
  const { user, isLoading, error, signIn } = useUser();

  const renderContent = () => {
    // Show API key error if invalid
    if (apiKeyValid === false) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-red-300 mb-4">Configuration Error</h2>
            <p className="text-red-200 mb-4">
              Groq API key is not configured or invalid. Please check your environment variables.
            </p>
            <p className="text-sm text-red-300">
              Add your Groq API key to the .env file as VITE_GROQ_API_KEY
            </p>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'landing':
        return <LandingPage onGetStarted={() => setCurrentView('registration')} />;
      case 'registration':
        return <ExamRegistration onRegistrationComplete={onRegistrationComplete} />;
      case 'study':
        if (examExpired) {
          return (
            <div className="text-center py-12">
              <div className="bg-orange-900/50 border border-orange-500 rounded-xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-orange-300 mb-4">Study Features Deactivated</h2>
                <p className="text-orange-200 mb-6">
                  Your exam date has passed. Please report your results to reactivate your study features.
                </p>
                <button
                  onClick={() => setCurrentView('results')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Report Exam Results
                </button>
              </div>
            </div>
          );
        }
        
        if (!currentRegistration) {
          return (
            <div className="text-center py-12">
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">No Active Registration</h2>
                <p className="text-gray-300 mb-6">
                  Please complete your exam registration to access study features.
                </p>
                <button
                  onClick={() => setCurrentView('registration')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Register for Exam
                </button>
              </div>
            </div>
          );
        }
        
        return (
          <StudyStrategies 
            examType={currentRegistration.examType.id}
            state={currentRegistration.state.code}
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

  // Loading state
  if (isLoading || apiKeyValid === null) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center relative z-10">
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-red-300 text-lg mb-4">Authentication Error</p>
            <p className="text-red-200 text-sm mb-4">{error.message}</p>
            <button
              onClick={() => {
                try {
                  signIn();
                } catch (err) {
                  console.error('Sign-in error:', err);
                }
              }}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:scale-105 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        <StarBackground darkMode={darkMode} />
        <div className="text-center p-8 rounded-lg bg-opacity-80 backdrop-blur-md bg-gray-800/80 relative z-10 max-w-md mx-auto">
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

  // Authenticated - render full app
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