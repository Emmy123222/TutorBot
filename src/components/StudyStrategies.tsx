import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Play, 
  Pause,
  ArrowRight,
  Trophy,
  Target,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { ExamQuestion, StudyStrategy, UserAnswer } from '../types';
import { generateExamQuestions } from '../utils/api';

interface StudyStrategiesProps {
  examType: string;
  state: string;
  onSessionComplete: (answers: UserAnswer[], score: number) => void;
}

const StudyStrategies: React.FC<StudyStrategiesProps> = ({ examType, state, onSessionComplete }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<StudyStrategy['type'] | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [sessionComplete, setSessionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (sessionActive && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [sessionActive, timeLeft, isPaused]);

  const loadQuestions = async (difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedQuestions = await generateExamQuestions(examType, state, difficulty, 10);
      setQuestions(generatedQuestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const startStrategy = async (strategy: StudyStrategy['type']) => {
    if (questions.length === 0) {
      await loadQuestions();
    }
    
    if (questions.length === 0) {
      setError('No questions available. Please try again.');
      return;
    }

    setSelectedStrategy(strategy);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSessionActive(true);
    setSessionComplete(false);
    setScore(0);
    setError(null);
    
    const currentQuestion = questions[0];
    if (strategy === 'flashcards') {
      setTimeLeft(10); // 10 seconds total (5 to show question, 5 to show answer)
      setShowAnswer(false);
    } else if (strategy === 'multiple-choice') {
      setTimeLeft(currentQuestion.timeAllowed);
      setShowAnswer(false);
    } else if (strategy === 'typed-answer') {
      setTimeLeft(currentQuestion.timeAllowed);
      setShowAnswer(false);
    }
  };

  const handleTimeUp = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (selectedStrategy === 'flashcards') {
      if (!showAnswer) {
        // Show answer after 5 seconds
        setShowAnswer(true);
        setTimeLeft(5);
      } else {
        // Move to next question after showing answer
        nextQuestion();
      }
    } else {
      // Time up for other strategies - record as incorrect
      const answer: UserAnswer = {
        questionId: currentQuestion.id,
        userAnswer: userInput || '',
        isCorrect: false,
        timeSpent: currentQuestion.timeAllowed,
        timestamp: new Date(),
      };
      
      setAnswers(prev => [...prev, answer]);
      nextQuestion();
    }
  };

  const handleAnswer = (selectedAnswer: string | number) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = currentQuestion.timeAllowed - timeLeft;
    const isCorrect = selectedAnswer.toString() === currentQuestion.correctAnswer.toString();
    
    const answer: UserAnswer = {
      questionId: currentQuestion.id,
      userAnswer: selectedAnswer.toString(),
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    };
    
    setAnswers(prev => [...prev, answer]);
    
    if (selectedStrategy === 'multiple-choice') {
      setShowAnswer(true);
      setTimeout(() => {
        nextQuestion();
      }, 3000);
    } else {
      nextQuestion();
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setShowAnswer(false);
      setUserInput('');
      
      const nextQuestion = questions[nextIndex];
      if (selectedStrategy === 'flashcards') {
        setTimeLeft(10);
      } else {
        setTimeLeft(nextQuestion.timeAllowed);
      }
    } else {
      // Session complete
      completeSession();
    }
  };

  const completeSession = () => {
    setSessionActive(false);
    setSessionComplete(true);
    
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const finalScore = Math.round((correctAnswers / questions.length) * 100);
    setScore(finalScore);
    
    onSessionComplete(answers, finalScore);
  };

  const resetSession = () => {
    setSelectedStrategy(null);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSessionActive(false);
    setSessionComplete(false);
    setShowAnswer(false);
    setUserInput('');
    setScore(0);
    setError(null);
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
          <p className="text-lg text-gray-300">Loading AI-generated exam questions...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadQuestions()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  if (!selectedStrategy) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Choose Your Study Strategy
          </h2>
          <p className="text-gray-500 text-lg">
            Select the learning method that works best for your {examType} preparation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Flashcards Strategy */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 cursor-pointer"
            onClick={() => startStrategy('flashcards')}
          >
            <div className="text-center">
              <Brain className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-3 text-white">Flashcards</h3>
              <p className="text-gray-400 mb-4">
                Quick review with timed question and answer reveals
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>5s question + 5s answer</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Memory reinforcement</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Multiple Choice Strategy */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 cursor-pointer"
            onClick={() => startStrategy('multiple-choice')}
          >
            <div className="text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-3 text-white">Multiple Choice</h3>
              <p className="text-gray-400 mb-4">
                Practice with realistic exam-style questions
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Timed questions</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span>Instant feedback</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Typed Answer Strategy */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 cursor-pointer"
            onClick={() => startStrategy('typed-answer')}
          >
            <div className="text-center">
              <ArrowRight className="w-12 h-12 mx-auto mb-4 text-blue-400" />
              <h3 className="text-xl font-bold mb-3 text-white">Typed Answers</h3>
              <p className="text-gray-400 mb-4">
                Write detailed responses under time pressure
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>Real exam timing</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>Deep understanding</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  if (sessionComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-500" />
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Session Complete!
          </h2>
          <p className="text-xl text-gray-300 mb-6">
            Your Score: {score}% ({answers.filter(a => a.isCorrect).length} / {questions.length})
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-400">{answers.filter(a => a.isCorrect).length}</p>
              <p className="text-sm text-gray-400">Correct</p>
            </div>
            <div className="bg-red-600/20 border border-red-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-400">{answers.filter(a => !a.isCorrect).length}</p>
              <p className="text-sm text-gray-400">Incorrect</p>
            </div>
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-400">{score >= 70 ? 'PASS' : 'FAIL'}</p>
              <p className="text-sm text-gray-400">Result</p>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetSession}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={() => setSelectedStrategy(null)}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Choose Different Strategy
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <p className="text-lg text-gray-300 mb-4">Loading exam questions...</p>
          <button
            onClick={() => loadQuestions()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Load Questions
          </button>
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {selectedStrategy === 'flashcards' && 'Flashcard Study'}
            {selectedStrategy === 'multiple-choice' && 'Multiple Choice Practice'}
            {selectedStrategy === 'typed-answer' && 'Typed Answer Practice'}
          </h2>
          <p className="text-gray-400">
            Question {currentQuestionIndex + 1} of {questions.length} • {examType} • {state}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-lg font-mono">
            <Clock className="w-5 h-5 text-purple-400" />
            <span className={timeLeft <= 10 ? 'text-red-400' : 'text-white'}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-6">
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentQuestion.difficulty === 'easy' 
              ? 'bg-green-600/20 text-green-400'
              : currentQuestion.difficulty === 'medium'
              ? 'bg-yellow-600/20 text-yellow-400'
              : 'bg-red-600/20 text-red-400'
          }`}>
            {currentQuestion.difficulty}
          </span>
          <span className="ml-3 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
            {currentQuestion.category}
          </span>
        </div>

        <h3 className="text-xl font-bold mb-6 text-white leading-relaxed">
          {currentQuestion.question}
        </h3>

        {/* Flashcards */}
        {selectedStrategy === 'flashcards' && (
          <AnimatePresence mode="wait">
            {!showAnswer ? (
              <motion.div
                key="question"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <p className="text-gray-400">Think about your answer...</p>
                <p className="text-sm text-gray-500 mt-2">Answer will appear in {timeLeft} seconds</p>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-green-600/20 border border-green-600 rounded-lg p-6"
              >
                <h4 className="font-semibold text-green-400 mb-2">Answer:</h4>
                <p className="text-white">{currentQuestion.options?.[currentQuestion.correctAnswer as number] || currentQuestion.correctAnswer}</p>
                {currentQuestion.explanation && (
                  <div className="mt-4">
                    <h5 className="font-medium text-green-300 mb-1">Explanation:</h5>
                    <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Multiple Choice */}
        {selectedStrategy === 'multiple-choice' && currentQuestion.options && (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showAnswer && handleAnswer(index)}
                disabled={showAnswer}
                className={`w-full p-4 text-left rounded-lg border transition-all ${
                  showAnswer
                    ? index === currentQuestion.correctAnswer
                      ? 'bg-green-600/20 border-green-600 text-green-400'
                      : 'bg-gray-700/50 border-gray-600 text-gray-400'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                  {showAnswer && index === currentQuestion.correctAnswer && (
                    <CheckCircle className="w-5 h-5 text-green-400 ml-auto" />
                  )}
                </div>
              </button>
            ))}
            
            {showAnswer && currentQuestion.explanation && (
              <div className="mt-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
                <h5 className="font-medium text-blue-300 mb-2">Explanation:</h5>
                <p className="text-gray-300 text-sm">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        )}

        {/* Typed Answer */}
        {selectedStrategy === 'typed-answer' && (
          <div>
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-32 p-4 bg-gray-900/50 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              disabled={showAnswer}
            />
            
            {!showAnswer && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => handleAnswer(userInput)}
                  disabled={!userInput.trim()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              </div>
            )}
            
            {showAnswer && (
              <div className="mt-6 space-y-4">
                <div className="p-4 bg-green-600/20 border border-green-600 rounded-lg">
                  <h5 className="font-medium text-green-300 mb-2">Correct Answer:</h5>
                  <p className="text-white">{currentQuestion.correctAnswer}</p>
                </div>
                
                {currentQuestion.explanation && (
                  <div className="p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
                    <h5 className="font-medium text-blue-300 mb-2">Explanation:</h5>
                    <p className="text-gray-300">{currentQuestion.explanation}</p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Next Question
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudyStrategies;