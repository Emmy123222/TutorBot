import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { StudySession, Flashcard } from '../types';
import { generateFlashcards } from '../utils/api';

interface FlashcardsProps {
  session: StudySession;
  onUpdate: (session: StudySession) => void;
}

const Flashcards: React.FC<FlashcardsProps> = ({ session, onUpdate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(session.flashcards || []);

  useEffect(() => {
    if (!session.flashcards || session.flashcards.length === 0) {
      generateCards();
    }
  }, []);

  const generateCards = async () => {
    setLoading(true);
    try {
      const cards = await generateFlashcards(session.content);
      setFlashcards(cards);
      
      const updatedSession = {
        ...session,
        flashcards: cards,
        lastAccessed: new Date(),
      };
      onUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (mastered: boolean) => {
    const updatedCards = [...flashcards];
    updatedCards[currentIndex] = {
      ...updatedCards[currentIndex],
      mastered,
      reviewCount: updatedCards[currentIndex].reviewCount + 1,
      lastReviewed: new Date(),
    };
    
    setFlashcards(updatedCards);
    
    const updatedSession = {
      ...session,
      flashcards: updatedCards,
      progress: {
        ...session.progress,
        flashcardsCompleted: updatedCards.filter(c => c.mastered).length,
      },
      lastAccessed: new Date(),
    };
    onUpdate(updatedSession);
    
    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };

  const resetProgress = () => {
    const resetCards = flashcards.map(card => ({
      ...card,
      mastered: false,
      reviewCount: 0,
      lastReviewed: undefined,
    }));
    
    setFlashcards(resetCards);
    
    const updatedSession = {
      ...session,
      flashcards: resetCards,
      progress: {
        ...session.progress,
        flashcardsCompleted: 0,
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
          <p className="text-lg text-gray-300">Generating flashcards...</p>
        </div>
      </motion.div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto text-center"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 border border-gray-700">
          <p className="text-lg text-gray-300 mb-4">No flashcards available</p>
          <button
            onClick={generateCards}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Flashcards
          </button>
        </div>
      </motion.div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const masteredCount = flashcards.filter(c => c.mastered).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Flashcards
        </h2>
        <p className="text-gray-500 text-lg">
          Review your study material with AI-generated flashcards
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-400">
            Progress: {masteredCount} / {flashcards.length} mastered
          </span>
          <button
            onClick={resetProgress}
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center space-x-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(masteredCount / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card Counter */}
      <div className="text-center mb-6">
        <span className="text-gray-400">
          {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div className="relative mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="perspective-1000"
          >
            <div
              className={`relative w-full h-80 cursor-pointer transition-transform duration-500 preserve-3d ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front of card */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-8 flex items-center justify-center backface-hidden">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-white">Question</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {currentCard.question}
                  </p>
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl p-8 flex items-center justify-center backface-hidden rotate-y-180">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-4 text-white">Answer</h3>
                  <p className="text-white/90 text-lg leading-relaxed">
                    {currentCard.answer}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={prevCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-4">
          <button
            onClick={() => handleAnswer(false)}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Need Review</span>
          </button>
          
          <button
            onClick={() => handleAnswer(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Check className="w-5 h-5" />
            <span>Mastered</span>
          </button>
        </div>

        <button
          onClick={nextCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Card Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-2xl font-bold text-purple-400">{currentCard.reviewCount}</p>
          <p className="text-sm text-gray-400">Reviews</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-2xl font-bold text-green-400">{masteredCount}</p>
          <p className="text-sm text-gray-400">Mastered</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-2xl font-bold text-orange-400">{flashcards.length - masteredCount}</p>
          <p className="text-sm text-gray-400">Remaining</p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-2xl font-bold text-blue-400">{currentCard.difficulty}</p>
          <p className="text-sm text-gray-400">Difficulty</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Flashcards;