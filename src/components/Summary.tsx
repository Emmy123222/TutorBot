import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Target } from 'lucide-react';
import { StudySession } from '../types';

interface SummaryProps {
  session: StudySession;
}

const Summary: React.FC<SummaryProps> = ({ session }) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const estimatedReadTime = Math.ceil(session.content.length / 1000); // Rough estimate

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Study Summary
        </h2>
        <p className="text-gray-500 text-lg">
          AI-generated summary of your study material
        </p>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Title</span>
          </div>
          <p className="text-white font-medium">{session.title}</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Created</span>
          </div>
          <p className="text-white font-medium">{formatDate(session.createdAt)}</p>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Read Time</span>
          </div>
          <p className="text-white font-medium">{estimatedReadTime} min</p>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        <h3 className="text-xl font-bold mb-6 flex items-center">
          <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3"></span>
          AI Summary
        </h3>
        
        {session.summary ? (
          <div className="prose prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {session.summary}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No summary available. The AI summary will appear here once generated.</p>
          </div>
        )}
      </div>

      {/* Original Content Preview */}
      <div className="mt-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-300">Original Content Preview</h3>
        <div className="text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto">
          {session.content.substring(0, 500)}
          {session.content.length > 500 && '...'}
        </div>
      </div>
    </motion.div>
  );
};

export default Summary;