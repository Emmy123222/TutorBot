import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
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
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <StarBackground darkMode={darkMode} />
      
      <div className="relative z-10">
        <Header 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          hasSession={!!currentSession}
        />
        
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;