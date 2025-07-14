import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { StudySession, ChatMessage } from '../types';
import { generateChatResponse } from '../utils/api';

interface ChatCoachProps {
  session: StudySession;
  onUpdate: (session: StudySession) => void;
}

const ChatCoach: React.FC<ChatCoachProps> = ({ session, onUpdate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(session.chatHistory || []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize chat with daily questions if no messages exist
    if (messages.length === 0) {
      initializeDailyQuestions();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeDailyQuestions = async () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'bot',
      content: `Hello! I'm your AI Study Coach. I'm here to help you review your study material on "${session.title}". Let me start with some questions to test your understanding.`,
      timestamp: new Date(),
      questionType: 'encouragement',
    };

    const updatedMessages = [welcomeMessage];
    setMessages(updatedMessages);

    // Generate daily questions
    try {
      const dailyQuestions = await generateChatResponse(
        session.content,
        'Generate 3 review questions about this study material to help the student review. Make them varied in difficulty.',
        []
      );

      const questionMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: dailyQuestions,
        timestamp: new Date(),
        questionType: 'review',
      };

      const finalMessages = [...updatedMessages, questionMessage];
      setMessages(finalMessages);
      
      const updatedSession = {
        ...session,
        chatHistory: finalMessages,
        lastAccessed: new Date(),
      };
      onUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to generate daily questions:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await generateChatResponse(
        session.content,
        input,
        messages.slice(-10) // Send last 10 messages for context
      );

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        questionType: 'review',
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);
      
      const updatedSession = {
        ...session,
        chatHistory: finalMessages,
        lastAccessed: new Date(),
      };
      onUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to get chat response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Study Coach
        </h2>
        <p className="text-gray-500 text-lg">
          Get personalized help and daily questions from your AI tutor
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {message.type === 'bot' ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="text-xs opacity-75">
                      {message.type === 'bot' ? 'AI Coach' : 'You'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-gray-700 text-gray-200 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4" />
                  <span className="text-xs opacity-75">AI Coach</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your study material..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Study Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-purple-400 mb-2">Daily Questions</h3>
          <p className="text-sm text-gray-400">
            I'll ask you 3-5 questions daily to help reinforce your learning
          </p>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-blue-400 mb-2">Weakness Tracking</h3>
          <p className="text-sm text-gray-400">
            I'll identify areas where you need more practice
          </p>
        </div>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <h3 className="font-semibold text-green-400 mb-2">Encouragement</h3>
          <p className="text-sm text-gray-400">
            I'll provide tips and motivation to keep you going
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatCoach;