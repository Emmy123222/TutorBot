import React from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  BookOpen, 
  Brain, 
  HelpCircle, 
  Calendar, 
  MessageCircle, 
  Sun, 
  Moon,
  Sparkles
} from 'lucide-react';
import { CivicAuthProvider } from '@civic/auth/react';
import CivicLoginButton from './CivicLoginButton';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  hasSession: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  setActiveTab, 
  darkMode, 
  setDarkMode, 
  hasSession 
}) => {
  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'summary', label: 'Summary', icon: BookOpen, disabled: !hasSession },
    { id: 'flashcards', label: 'Flashcards', icon: Brain, disabled: !hasSession },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, disabled: !hasSession },
    { id: 'plan', label: 'Study Plan', icon: Calendar, disabled: !hasSession },
    { id: 'chat', label: 'AI Coach', icon: MessageCircle, disabled: !hasSession },
  ];

  return (
    <CivicAuthProvider clientId="7f8e5073-ab64-46df-825e-07d489f612ff">
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        darkMode 
          ? 'bg-gray-900/80 border-gray-800' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  TutorBot
                </h1>
                <p className="text-xs md:text-sm text-gray-500 -mt-1">AI Study Coach</p>
              </div>
            </motion.div>
            <nav className="flex space-x-1 overflow-x-auto pb-3 scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: tab.disabled ? 1 : 1.02 }}
                    whileTap={{ scale: tab.disabled ? 1 : 0.98 }}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-all relative whitespace-nowrap ${
                      activeTab === tab.id
                        ? darkMode
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 shadow-md'
                        : tab.disabled
                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                        : darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
             
              <CivicLoginButton darkMode={darkMode} />
            </motion.div>
          </div>
        </div>
      </header>
    </CivicAuthProvider>
  );
};

export default Header;