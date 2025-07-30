import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { CivicAuthProvider, useUser } from '@civic/auth/react';
import Header from './components/Header';
import StudyMaterialUpload from './components/StudyMaterialUpload';
import Summary from './components/Summary';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import StudyPlan from './components/StudyPlan';
import ChatCoach from './components/ChatCoach';
import StarBackground from './components/StarBackground';
import { StudySession } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  // Log to debug Civic Auth initialization
  useEffect(() => {
    console.log('App initialized with CivicAuthProvider, clientId: 7f8e5073-ab64-46df-825e-07d489f612ff');
  }, []);

  useEffect(() => {
    // Load sessions from localStorage
    const saved = localStorage.getItem('tutorbot-sessions');
    if (saved) {
      setSessions(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save sessions to localStorage
    localStorage.setItem('tutorbot-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const saveSession = (session: StudySession) => {
    const updatedSessions = [...sessions];
    const existingIndex = updatedSessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      updatedSessions[existingIndex] = session;
    } else {
      updatedSessions.push(session);
    }
    
    setSessions(updatedSessions);
    setCurrentSession(session);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upload':
        return <StudyMaterialUpload onSessionCreate={saveSession} />;
      case 'summary':
        return currentSession ? <Summary session={currentSession} /> : <div className="text-center text-gray-400">No study material uploaded yet</div>;
      case 'flashcards':
        return currentSession ? <Flashcards session={currentSession} onUpdate={saveSession} /> : <div className="text-center text-gray-400">No study material uploaded yet</div>;
      case 'quiz':
        return currentSession ? <Quiz session={currentSession} onUpdate={saveSession} /> : <div className="text-center text-gray-400">No study material uploaded yet</div>;
      case 'plan':
        return currentSession ? <StudyPlan session={currentSession} onUpdate={saveSession} /> : <div className="text-center text-gray-400">No study material uploaded yet</div>;
      case 'chat':
        return currentSession ? <ChatCoach session={currentSession} onUpdate={saveSession} /> : <div className="text-center text-gray-400">No study material uploaded yet</div>;
      default:
        return <StudyMaterialUpload onSessionCreate={saveSession} />;
    }
  };

  return (
    <CivicAuthProvider clientId="7f8e5073-ab64-46df-825e-07d489f612ff">
      <AppContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        currentSession={currentSession}
        sessions={sessions}
        saveSession={saveSession}
        renderContent={renderContent}
      />
    </CivicAuthProvider>
  );
}

interface AppContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  currentSession: StudySession | null;
  sessions: StudySession[];
  saveSession: (session: StudySession) => void;
  renderContent: () => JSX.Element;
}

const AppContent: React.FC<AppContentProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  currentSession,
  renderContent,
}) => {
  const { user, isLoading, error, signIn } = useUser();

  // Log auth state for debugging
  useEffect(() => {
    console.log('Auth state:', { user, isLoading, error });
  }, [user, isLoading, error]);

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
          <p className="text-gray-400 mb-6">Please sign in to access your AI Study Coach.</p>
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
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          hasSession={!!user && !!currentSession}
        />
        
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