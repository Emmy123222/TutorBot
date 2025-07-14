import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Trophy, RotateCcw, Loader2 } from 'lucide-react';
import { StudySession, QuizQuestion } from '../types';
import { generateQuiz } from '../utils/api';

interface QuizProps {
  session: StudySession;
  onUpdate: (session: StudySession) => void;
}

const Quiz: React.FC<QuizProps> = ({ session, onUpdate }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[]>(session.quiz || []);

  useEffect(() => {
    if (!session.quiz || session.quiz.length === 0) {
      generateQuizQuestions();
    }
  }, []);

  const generateQuizQuestions = async () => {
    setLoading(true);
    try {
      const questions = await generateQuiz(session.content);
      setQuiz(questions);
      
      const updatedSession = {
        ...session,
        quiz: questions,
        lastAccessed: new Date(),
      };
      onUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to generate quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    
    const updatedQuiz = [...quiz];
    updatedQuiz[currentQuestion] = {
      ...updatedQuiz[currentQuestion],
      answered: true,
      userAnswer: answerIndex,
      isCorrect: answerIndex === updatedQuiz[currentQuestion].correctAnswer,
    };
    
    setQuiz(updatedQuiz);
    setShowResult(true);
    
    // Update session
    const score = updatedQuiz.filter(q => q.isCorrect).length;
    const updatedSession = {
      ...session,
      quiz: updatedQuiz,
      progress: {
        ...session.progress,
        quizScore: Math.round((score / updatedQuiz.length) * 100),
      },
      lastAccessed: new Date(),
    };
    onUpdate(updatedSession);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const resetQuiz = () => {
    const resetQuiz = quiz.map(q => ({
      ...q,
      answered: false,
      userAnswer: undefined,
      isCorrect: undefined,
    }));
    
    setQuiz(resetQuiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizComplete(false);
    
    const updatedSession = {
      ...session,
      quiz: resetQuiz,
      progress: {
        ...session.progress,
        quizScore: 0,
      },
      lastAccessed: new Date(),
    };
    onUpdate(updatedSession);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-lg text-gray-300">Generating quiz questions...</p>
        </div>
      </motion.div>
    );
  }

  if (quiz.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <p className="text-lg text-gray-300 mb-4">No quiz available</p>
          <button
            onClick={generateQuizQuestions}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Quiz
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQ = quiz[currentQuestion];
  const score = quiz.filter(q => q.isCorrect).length;
  const totalAnswered = quiz.filter(q => q.answered).length;

  if (quizComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quiz Complete!
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Your Score: {score} / {quiz.length} ({Math.round((score / quiz.length) * 100)}%)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">{score}</p>
              <p className="text-sm text-gray-400">Correct</p>
            </div>
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-400">{quiz.length - score}</p>
              <p className="text-sm text-gray-400">Incorrect</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-400">{Math.round((score / quiz.length) * 100)}%</p>
              <p className="text-sm text-gray-400">Score</p>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Retake Quiz</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Quiz Time
        </h2>
        <p className="text-gray-500 text-lg">
          Test your knowledge with AI-generated questions
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {quiz.length}
          </span>
          <span className="text-sm text-gray-400">
            Score: {score} / {totalAnswered}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentQ.difficulty === 'easy' 
                ? 'bg-green-600/20 text-green-400'
                : currentQ.difficulty === 'medium'
                ? 'bg-yellow-600/20 text-yellow-400'
                : 'bg-red-600/20 text-red-400'
            }`}>
              {currentQ.difficulty}
            </span>
            <span className="text-sm text-gray-400">{currentQ.type}</span>
          </div>

          <h3 className="text-xl font-bold mb-6 text-white leading-relaxed">
            {currentQ.question}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswer(index)}
                disabled={showResult}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  showResult
                    ? index === currentQ.correctAnswer
                      ? 'bg-green-600/20 border-green-600 text-green-400'
                      : selectedAnswer === index
                      ? 'bg-red-600/20 border-red-600 text-red-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                    : selectedAnswer === index
                    ? 'bg-purple-600/20 border-purple-600 text-purple-400'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showResult && index === currentQ.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  )}
                  {showResult && selectedAnswer === index && index !== currentQ.correctAnswer && (
                    <XCircle className="w-5 h-5 text-red-400 ml-auto" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 pt-6 border-t border-gray-700"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {selectedAnswer === currentQ.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className={selectedAnswer === currentQ.correctAnswer ? 'text-green-400' : 'text-red-400'}>
                    {selectedAnswer === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                <button
                  onClick={nextQuestion}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {currentQuestion < quiz.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Quiz;