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

// New types for professional exam platform
export interface ExamRegistration {
  id: string;
  userId: string;
  examType: ProfessionalExamType;
  state: USState;
  examDate: Date;
  paymentStatus: 'pending' | 'completed' | 'failed';
  stripePaymentId?: string;
  isActive: boolean;
  examResult?: 'pass' | 'fail';
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalExamType {
  id: string;
  name: string;
  description: string;
  category: ExamCategory;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questionCount: number;
}

export type ExamCategory = 
  | 'medical'
  | 'legal'
  | 'engineering'
  | 'accounting'
  | 'real-estate'
  | 'nursing'
  | 'pharmacy'
  | 'architecture'
  | 'education'
  | 'finance'
  | 'other';

export interface USState {
  code: string;
  name: string;
}

export interface ExamQuestion {
  id: string;
  examType: string;
  state: string;
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer: string | number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeAllowed: number; // in seconds
  category: string;
  submittedBy?: string; // user who passed and contributed
  verified: boolean;
  createdAt: Date;
}

export interface StudyStrategy {
  type: 'flashcards' | 'multiple-choice' | 'typed-answer';
  timeLimit: number;
  showAnswer: boolean;
  answerDelay?: number; // for flashcards
}

export interface StudySession2 {
  id: string;
  registrationId: string;
  strategy: StudyStrategy;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answers: UserAnswer[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  passed?: boolean;
  createdAt: Date;
}

export interface UserAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent: number; // in seconds
  timestamp: Date;
}

export interface ExamResult {
  id: string;
  registrationId: string;
  actualExamResult: 'pass' | 'fail';
  contributedQuestions?: ExamQuestion[];
  agreedToShare: boolean;
  submittedAt: Date;
}

export interface PaymentInfo {
  amount: number;
  currency: string;
  description: string;
  examRegistrationId: string;
}