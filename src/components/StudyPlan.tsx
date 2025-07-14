import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { StudySession, StudyPlanDay } from '../types';
import { generateStudyPlan } from '../utils/api';

interface StudyPlanProps {
  session: StudySession;
  onUpdate: (session: StudySession) => void;
}

const StudyPlan: React.FC<StudyPlanProps> = ({ session, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlanDay[]>(session.studyPlan || []);
  const [planDays, setPlanDays] = useState(7);

  useEffect(() => {
    if (!session.studyPlan || session.studyPlan.length === 0) {
      generatePlan();
    }
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const plan = await generateStudyPlan(session.content, planDays);
      setStudyPlan(plan);
      
      const updatedSession = {
        ...session,
        studyPlan: plan,
        lastAccessed: new Date(),
      };
      onUpdate(updatedSession);
    } catch (error) {
      console.error('Failed to generate study plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDayCompletion = (dayIndex: number) => {
    const updatedPlan = [...studyPlan];
    updatedPlan[dayIndex].completed = !updatedPlan[dayIndex].completed;
    setStudyPlan(updatedPlan);
    
    const completedDays = updatedPlan.filter(day => day.completed).length;
    const updatedSession = {
      ...session,
      studyPlan: updatedPlan,
      progress: {
        ...session.progress,
        studyDaysCompleted: completedDays,
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
          <p className="text-lg text-gray-300">Generating your personalized study plan...</p>
        </div>
      </motion.div>
    );
  }

  const completedDays = studyPlan.filter(day => day.completed).length;
  const totalDuration = studyPlan.reduce((total, day) => total + day.duration, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Study Plan
        </h2>
        <p className="text-gray-500 text-lg">
          Your personalized AI-generated study schedule
        </p>
      </div>

      {/* Plan Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <label className="text-gray-300">Study Duration:</label>
            <select
              value={planDays}
              onChange={(e) => setPlanDays(Number(e.target.value))}
              className="bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={21}>21 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <button
            onClick={generatePlan}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Regenerate Plan'}
          </button>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-400">{completedDays}</p>
            <p className="text-sm text-gray-400">Days Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-400">{studyPlan.length}</p>
            <p className="text-sm text-gray-400">Total Days</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-400">{totalDuration}</p>
            <p className="text-sm text-gray-400">Total Minutes</p>
          </div>
        </div>
      </div>

      {/* Study Plan Days */}
      <div className="space-y-4">
        {studyPlan.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border transition-all ${
              day.completed 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleDayCompletion(index)}
                  className={`p-2 rounded-full transition-colors ${
                    day.completed 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {day.completed ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Day {day.day}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(day.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{day.duration} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                day.completed 
                  ? 'bg-green-600/20 text-green-400' 
                  : 'bg-gray-600/20 text-gray-400'
              }`}>
                {day.completed ? 'Completed' : 'Pending'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Topics to Cover:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  {day.topics.map((topic, topicIndex) => (
                    <li key={topicIndex}>{topic}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-300 mb-2">Activities:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-400">
                  {day.activities.map((activity, activityIndex) => (
                    <li key={activityIndex}>{activity}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {studyPlan.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No study plan generated yet</p>
          <button
            onClick={generatePlan}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Study Plan
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default StudyPlan;