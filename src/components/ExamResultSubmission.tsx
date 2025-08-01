import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Upload, AlertCircle } from 'lucide-react';
import { ExamResult, ExamQuestion } from '../types';

interface ExamResultSubmissionProps {
  registrationId: string;
  onResultSubmitted: (result: ExamResult) => void;
}

const ExamResultSubmission: React.FC<ExamResultSubmissionProps> = ({ 
  registrationId, 
  onResultSubmitted 
}) => {
  const [examResult, setExamResult] = useState<'pass' | 'fail' | null>(null);
  const [agreedToShare, setAgreedToShare] = useState(false);
  const [questions, setQuestions] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!examResult) return;

    setLoading(true);
    
    try {
      // Parse contributed questions if user passed and agreed to share
      let contributedQuestions: ExamQuestion[] = [];
      
      if (examResult === 'pass' && agreedToShare && questions.trim()) {
        // In a real app, this would be processed more carefully
        const questionLines = questions.split('\n').filter(line => line.trim());
        contributedQuestions = questionLines.map((line, index) => ({
          id: `contributed_${Date.now()}_${index}`,
          examType: 'contributed', // Would be set based on registration
          state: 'contributed', // Would be set based on registration
          question: line.trim(),
          correctAnswer: '', // Would need to be provided separately
          explanation: '',
          difficulty: 'medium' as const,
          timeAllowed: 120,
          category: 'general',
          verified: false,
          createdAt: new Date(),
        }));
      }

      const result: ExamResult = {
        id: Date.now().toString(),
        registrationId,
        actualExamResult: examResult,
        contributedQuestions: contributedQuestions.length > 0 ? contributedQuestions : undefined,
        agreedToShare,
        submittedAt: new Date(),
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onResultSubmitted(result);
    } catch (error) {
      console.error('Failed to submit exam result:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Report Your Exam Results
        </h2>
        <p className="text-gray-500 text-lg">
          Help us improve the platform by sharing your exam experience
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        {/* Exam Result Selection */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-white">How did your exam go?</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setExamResult('pass')}
              className={`p-6 rounded-lg border-2 transition-all ${
                examResult === 'pass'
                  ? 'border-green-500 bg-green-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:border-green-500/50'
              }`}
            >
              <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${
                examResult === 'pass' ? 'text-green-400' : 'text-gray-400'
              }`} />
              <h4 className="font-semibold text-white mb-2">I Passed!</h4>
              <p className="text-sm text-gray-400">
                Congratulations! Your study features will be reactivated.
              </p>
            </button>

            <button
              onClick={() => setExamResult('fail')}
              className={`p-6 rounded-lg border-2 transition-all ${
                examResult === 'fail'
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:border-red-500/50'
              }`}
            >
              <XCircle className={`w-12 h-12 mx-auto mb-3 ${
                examResult === 'fail' ? 'text-red-400' : 'text-gray-400'
              }`} />
              <h4 className="font-semibold text-white mb-2">I Didn't Pass</h4>
              <p className="text-sm text-gray-400">
                Don't worry! You'll get access to questions from successful candidates.
              </p>
            </button>
          </div>
        </div>

        {/* Data Sharing Agreement */}
        {examResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="p-6 bg-blue-600/20 border border-blue-600 rounded-lg mb-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-300 mb-2">Help Future Students</h4>
                  <p className="text-blue-200 text-sm">
                    {examResult === 'pass' 
                      ? 'Since you passed, sharing your exam questions will help future students prepare better. Your contributions will be anonymized and verified.'
                      : 'By sharing your experience, you help us understand common challenges and improve our study materials for everyone.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToShare}
                onChange={(e) => setAgreedToShare(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
              />
              <div>
                <span className="text-white font-medium">
                  I agree to share my exam experience to help improve the platform
                </span>
                <p className="text-sm text-gray-400 mt-1">
                  {examResult === 'pass' 
                    ? 'This includes questions you remember from the exam (optional)'
                    : 'This includes feedback about areas that were challenging'
                  }
                </p>
              </div>
            </label>
          </motion.div>
        )}

        {/* Question Contribution (for passed exams) */}
        {examResult === 'pass' && agreedToShare && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h4 className="font-semibold text-white mb-3 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-purple-400" />
              Share Questions You Remember (Optional)
            </h4>
            
            <textarea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder="Enter any questions you remember from the exam, one per line. These will help future students prepare better."
              className="w-full h-32 p-4 bg-gray-900/50 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            />
            
            <p className="text-xs text-gray-500 mt-2">
              Your contributions will be reviewed and verified before being added to our question bank.
            </p>
          </motion.div>
        )}

        {/* Benefits Information */}
        {examResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className={`p-4 rounded-lg border ${
              examResult === 'pass' 
                ? 'bg-green-600/20 border-green-600'
                : 'bg-orange-600/20 border-orange-600'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                examResult === 'pass' ? 'text-green-300' : 'text-orange-300'
              }`}>
                What happens next?
              </h4>
              <ul className={`text-sm space-y-1 ${
                examResult === 'pass' ? 'text-green-200' : 'text-orange-200'
              }`}>
                {examResult === 'pass' ? (
                  <>
                    <li>• Your study features will be reactivated immediately</li>
                    <li>• You can use the platform to prepare for additional certifications</li>
                    <li>• Your contributed questions will help future students</li>
                  </>
                ) : (
                  <>
                    <li>• Your study features will be reactivated immediately</li>
                    <li>• You'll get access to questions from students who passed in your state</li>
                    <li>• Improved study materials based on common challenge areas</li>
                  </>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!examResult || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Submit Results</span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ExamResultSubmission;