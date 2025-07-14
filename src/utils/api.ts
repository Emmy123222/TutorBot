import { Flashcard, QuizQuestion, StudyPlanDay, ChatMessage } from '../types';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

async function callGroqAPI(prompt: string): Promise<string> {
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
            content: 'You are TutorBot, an AI study coach designed to help students learn effectively. Provide clear, educational responses that help students understand their study material better.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: GroqResponse = await response.json();
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to get AI response');
  }
}

export async function generateAISummary(content: string): Promise<string> {
  const prompt = `
    Summarize the following study material for a student. Make it:
    - Clear and easy to understand
    - Well-organized with bullet points
    - Include key concepts and important details
    - Add a TL;DR section at the end
    - Focus on what's most important to remember

    Study Material:
    ${content}
  `;

  return await callGroqAPI(prompt);
}

export async function generateFlashcards(content: string): Promise<Flashcard[]> {
  const prompt = `
    Generate 10 flashcards from the following study material. Return them in this exact JSON format:
    [
      {
        "id": "1",
        "question": "Question here",
        "answer": "Answer here",
        "difficulty": "easy|medium|hard",
        "mastered": false,
        "reviewCount": 0
      }
    ]

    Make sure questions are:
    - Clear and specific
    - Vary in difficulty
    - Cover important concepts
    - Have complete, accurate answers

    Study Material:
    ${content}
  `;

  try {
    const response = await callGroqAPI(prompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const flashcards = JSON.parse(jsonMatch[0]);
      return flashcards.map((card: any, index: number) => ({
        ...card,
        id: `card_${index + 1}`,
        mastered: false,
        reviewCount: 0,
      }));
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse flashcards:', error);
    // Return fallback flashcards
    return [
      {
        id: '1',
        question: 'What is the main topic of this study material?',
        answer: 'Based on the provided content, this covers the key concepts and important information.',
        difficulty: 'medium' as const,
        mastered: false,
        reviewCount: 0,
      }
    ];
  }
}

export async function generateQuiz(content: string): Promise<QuizQuestion[]> {
  const prompt = `
    Generate 8 quiz questions from the following study material. Return them in this exact JSON format:
    [
      {
        "id": "1",
        "question": "Question here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "type": "multiple-choice",
        "difficulty": "easy|medium|hard"
      }
    ]

    Make sure:
    - Questions are clear and specific
    - Options are plausible but only one is correct
    - Mix of easy, medium, and hard difficulty
    - correctAnswer is the index (0-3) of the correct option
    - Cover different aspects of the material

    Study Material:
    ${content}
  `;

  try {
    const response = await callGroqAPI(prompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const questions = JSON.parse(jsonMatch[0]);
      return questions.map((q: any, index: number) => ({
        ...q,
        id: `quiz_${index + 1}`,
        answered: false,
      }));
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse quiz questions:', error);
    // Return fallback questions
    return [
      {
        id: '1',
        question: 'What is the main concept covered in this study material?',
        options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
        correctAnswer: 0,
        type: 'multiple-choice' as const,
        difficulty: 'medium' as const,
        answered: false,
      }
    ];
  }
}

export async function generateStudyPlan(content: string, days: number): Promise<StudyPlanDay[]> {
  const prompt = `
    Create a ${days}-day study plan for the following material. Return it in this exact JSON format:
    [
      {
        "day": 1,
        "date": "2024-01-15",
        "topics": ["Topic 1", "Topic 2"],
        "duration": 60,
        "completed": false,
        "activities": ["Read chapter 1", "Create notes", "Practice questions"]
      }
    ]

    Make sure:
    - Each day has 30-90 minutes of study time
    - Topics are broken down logically
    - Activities are specific and actionable
    - Plan progresses from basic to advanced concepts
    - Include review sessions

    Study Material:
    ${content}
  `;

  try {
    const response = await callGroqAPI(prompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const plan = JSON.parse(jsonMatch[0]);
      return plan.map((day: any, index: number) => ({
        ...day,
        day: index + 1,
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000),
        completed: false,
      }));
    }
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Failed to parse study plan:', error);
    // Return fallback plan
    return Array.from({ length: days }, (_, i) => ({
      day: i + 1,
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
      topics: [`Day ${i + 1} Topics`],
      duration: 60,
      completed: false,
      activities: ['Review material', 'Take notes', 'Practice questions'],
    }));
  }
}

export async function generateChatResponse(
  studyContent: string,
  userMessage: string,
  chatHistory: ChatMessage[]
): Promise<string> {
  const historyContext = chatHistory
    .slice(-6)
    .map(msg => `${msg.type}: ${msg.content}`)
    .join('\n');

  const prompt = `
    You are TutorBot, an AI study coach. The student is studying: "${studyContent.substring(0, 500)}..."

    Chat History:
    ${historyContext}

    Student's message: ${userMessage}

    Respond as a helpful tutor who:
    - Answers questions about the study material
    - Provides explanations and examples
    - Asks follow-up questions to test understanding
    - Offers encouragement and study tips
    - Identifies areas that need more practice
    - Keeps responses conversational and supportive

    Keep your response focused, helpful, and encouraging.
  `;

  return await callGroqAPI(prompt);
}