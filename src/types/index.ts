export interface StudySession {
  id: string;
  title: string;
  content: string;
  summary?: string;
  flashcards?: Flashcard[];
  quiz?: QuizQuestion[];
  studyPlan?: StudyPlanDay[];
  chatHistory?: ChatMessage[];
  createdAt: Date;
  lastAccessed: Date;
  progress: {
    flashcardsCompleted: number;
    quizScore: number;
    studyDaysCompleted: number;
  };
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false';
  difficulty: 'easy' | 'medium' | 'hard';
  answered?: boolean;
  userAnswer?: number;
  isCorrect?: boolean;
}

export interface StudyPlanDay {
  day: number;
  date: Date;
  topics: string[];
  duration: number; // in minutes
  completed: boolean;
  activities: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  questionType?: 'review' | 'encouragement' | 'weakness';
}