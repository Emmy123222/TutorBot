import { Flashcard, QuizQuestion, StudyPlanDay, ChatMessage, ExamQuestion } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not configured. Please add it to your .env file.');
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    type: string;
  };
}

async function callGroqAPI(prompt: string, systemPrompt?: string): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('Groq API key is not configured. Please check your environment variables.');
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: systemPrompt || 'You are TutorBot, an AI study coach designed to help students learn effectively. Provide clear, educational responses that help students understand their study material better.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GroqResponse = await response.json();
    
    if (data.error) {
      throw new Error(`Groq API error: ${data.error.message}`);
    }

    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to get AI response: ${error.message}`);
    }
    throw new Error('Failed to get AI response: Unknown error');
  }
}

export async function generateAISummary(content: string): Promise<string> {
  const systemPrompt = `You are an expert educational content summarizer. Create comprehensive, well-structured summaries that help students learn effectively.`;
  
  const prompt = `
    Create a comprehensive study summary for the following material. Structure your response as follows:

    # Study Summary

    ## Key Concepts
    [List the main concepts with brief explanations]

    ## Important Details
    [Highlight crucial information students must remember]

    ## Study Tips
    [Provide specific study strategies for this material]

    ## Quick Review Points
    [Bullet points for quick review]

    ## TL;DR
    [2-3 sentence summary of the most important takeaways]

    Study Material:
    ${content.substring(0, 4000)} ${content.length > 4000 ? '...' : ''}
  `;

  return await callGroqAPI(prompt, systemPrompt);
}

export async function generateFlashcards(content: string): Promise<Flashcard[]> {
  const systemPrompt = `You are an expert at creating educational flashcards. Generate high-quality question-answer pairs that test understanding and memory retention.`;
  
  const prompt = `
    Generate exactly 10 flashcards from the following study material. Return ONLY a valid JSON array with this exact structure:

    [
      {
        "id": "1",
        "question": "Clear, specific question",
        "answer": "Complete, accurate answer",
        "difficulty": "easy",
        "mastered": false,
        "reviewCount": 0
      }
    ]

    Requirements:
    - Questions should be clear and test key concepts
    - Mix difficulty levels: 3 easy, 4 medium, 3 hard
    - Answers should be complete but concise
    - Cover different aspects of the material
    - Use proper JSON formatting

    Study Material:
    ${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}
  `;

  try {
    const response = await callGroqAPI(prompt, systemPrompt);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const flashcards = JSON.parse(jsonMatch[0]);
      return flashcards.map((card: any, index: number) => ({
        id: `card_${Date.now()}_${index}`,
        question: card.question || `Question ${index + 1}`,
        answer: card.answer || 'Answer not available',
        difficulty: ['easy', 'medium', 'hard'].includes(card.difficulty) ? card.difficulty : 'medium',
        mastered: false,
        reviewCount: 0,
        lastReviewed: undefined,
      }));
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('Failed to parse flashcards:', error);
    throw new Error('Failed to generate flashcards. Please try again.');
  }
}

export async function generateQuiz(content: string): Promise<QuizQuestion[]> {
  const systemPrompt = `You are an expert at creating educational quiz questions. Generate challenging but fair multiple-choice questions that test comprehension.`;
  
  const prompt = `
    Generate exactly 8 multiple-choice quiz questions from the following study material. Return ONLY a valid JSON array with this exact structure:

    [
      {
        "id": "1",
        "question": "Clear, specific question",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "type": "multiple-choice",
        "difficulty": "medium"
      }
    ]

    Requirements:
    - Questions should test understanding, not just memorization
    - All 4 options should be plausible
    - correctAnswer is the index (0-3) of the correct option
    - Mix difficulty: 2 easy, 4 medium, 2 hard
    - Cover different concepts from the material
    - Use proper JSON formatting

    Study Material:
    ${content.substring(0, 3000)} ${content.length > 3000 ? '...' : ''}
  `;

  try {
    const response = await callGroqAPI(prompt, systemPrompt);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions.map((q: any, index: number) => ({
        id: `quiz_${Date.now()}_${index}`,
        question: q.question || `Question ${index + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 3 ? q.correctAnswer : 0,
        type: 'multiple-choice' as const,
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium',
        answered: false,
      }));
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('Failed to parse quiz questions:', error);
    throw new Error('Failed to generate quiz questions. Please try again.');
  }
}

export async function generateStudyPlan(content: string, days: number): Promise<StudyPlanDay[]> {
  const systemPrompt = `You are an expert study planner. Create realistic, achievable study schedules that optimize learning and retention.`;
  
  const prompt = `
    Create a ${days}-day study plan for the following material. Return ONLY a valid JSON array with this exact structure:

    [
      {
        "day": 1,
        "date": "2024-01-15",
        "topics": ["Topic 1", "Topic 2"],
        "duration": 60,
        "completed": false,
        "activities": ["Specific activity 1", "Specific activity 2", "Specific activity 3"]
      }
    ]

    Requirements:
    - Each day should have 30-90 minutes of study time
    - Topics should be broken down logically
    - Activities must be specific and actionable
    - Progress from basic to advanced concepts
    - Include review sessions every few days
    - Use proper JSON formatting

    Study Material:
    ${content.substring(0, 2000)} ${content.length > 2000 ? '...' : ''}
  `;

  try {
    const response = await callGroqAPI(prompt, systemPrompt);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return plan.slice(0, days).map((day: any, index: number) => ({
        day: index + 1,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
        topics: Array.isArray(day.topics) ? day.topics : [`Day ${index + 1} Topics`],
        duration: typeof day.duration === 'number' && day.duration >= 30 && day.duration <= 90 ? day.duration : 60,
        completed: false,
        activities: Array.isArray(day.activities) ? day.activities : ['Review material', 'Take notes', 'Practice questions'],
      }));
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('Failed to parse study plan:', error);
    throw new Error('Failed to generate study plan. Please try again.');
  }
}

export async function generateChatResponse(
  studyContent: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  const systemPrompt = `You are TutorBot, an AI study coach. You help students learn by:
  - Answering questions about their study material
  - Providing clear explanations with examples
  - Testing understanding with follow-up questions
  - Offering study tips and encouragement
  - Identifying areas needing more practice
  
  Keep responses conversational, supportive, and educational. Focus on helping the student understand concepts deeply.`;

  const historyContext = chatHistory
    .slice(-6)
    .map(msg => `${msg.type === 'user' ? 'Student' : 'TutorBot'}: ${msg.content}`)
    .join('\n');

  const prompt = `
    Study Material Context: "${studyContent.substring(0, 1000)}${studyContent.length > 1000 ? '...' : ''}"

    Recent Conversation:
    ${historyContext}

    Student's Current Message: ${userMessage}

    Respond as TutorBot, providing helpful, educational guidance. If the student asks about something not in their study material, gently redirect them back to their current topic while still being helpful.
  `;

  return await callGroqAPI(prompt, systemPrompt);
}

export async function generateExamQuestions(
  examType: string,
  state: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): Promise<ExamQuestion[]> {
  const systemPrompt = `You are an expert in professional licensing examinations. Generate realistic, high-quality exam questions that match the format and difficulty of actual professional exams.`;
  
  const prompt = `
    Generate exactly ${count} realistic exam questions for ${examType} in ${state}. Return ONLY a valid JSON array with this exact structure:

    [
      {
        "id": "1",
        "examType": "${examType}",
        "state": "${state}",
        "question": "Realistic exam question",
        "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
        "correctAnswer": 0,
        "explanation": "Clear explanation of why this answer is correct",
        "difficulty": "${difficulty}",
        "timeAllowed": 120,
        "category": "relevant_category",
        "verified": true
      }
    ]

    Requirements:
    - Questions must be realistic and exam-appropriate
    - All 5 options should be plausible
    - correctAnswer is the index (0-4) of the correct option
    - Explanations should be educational and clear
    - timeAllowed should be realistic (60-180 seconds)
    - category should match the exam subject area
    - Use proper JSON formatting
  `;

  try {
    const response = await callGroqAPI(prompt, systemPrompt);
    
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions.map((q: any, index: number) => ({
        id: `exam_${Date.now()}_${index}`,
        examType,
        state,
        question: q.question || `Question ${index + 1}`,
        options: Array.isArray(q.options) && q.options.length === 5 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'],
        correctAnswer: typeof q.correctAnswer === 'number' && q.correctAnswer >= 0 && q.correctAnswer <= 4 ? q.correctAnswer : 0,
        explanation: q.explanation || 'Explanation not available',
        difficulty,
        timeAllowed: typeof q.timeAllowed === 'number' ? q.timeAllowed : 120,
        category: q.category || 'general',
        verified: true,
        createdAt: new Date(),
      }));
    }
    throw new Error('No valid JSON found in AI response');
  } catch (error) {
    console.error('Failed to parse exam questions:', error);
    throw new Error('Failed to generate exam questions. Please try again.');
  }
}

export async function validateApiKey(): Promise<boolean> {
  if (!GROQ_API_KEY) {
    return false;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}