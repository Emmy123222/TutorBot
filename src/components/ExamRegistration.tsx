import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, MapPin, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { ExamRegistration as ExamRegistrationType, ProfessionalExamType, USState } from '../types';
import { PROFESSIONAL_EXAMS, US_STATES } from '../data/examTypes';

interface ExamRegistrationProps {
  onRegistrationComplete: (registration: ExamRegistrationType) => void;
}

const ExamRegistration: React.FC<ExamRegistrationProps> = ({ onRegistrationComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedExam, setSelectedExam] = useState<ProfessionalExamType | null>(null);
  const [selectedState, setSelectedState] = useState<USState | null>(null);
  const [examDate, setExamDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleExamSelect = (exam: ProfessionalExamType) => {
    setSelectedExam(exam);
    setStep(2);
  };

  const handleStateSelect = (state: USState) => {
    setSelectedState(state);
    setStep(3);
  };

  const handleDateSelect = () => {
    if (examDate) {
      setStep(4);
    }
  };

  const handlePayment = async () => {
    if (!selectedExam || !selectedState || !examDate) return;

    setLoading(true);
    
    try {
      // Create registration
      const registration: ExamRegistrationType = {
        id: Date.now().toString(),
        userId: 'current-user', // This would come from auth
        examType: selectedExam,
        state: selectedState,
        examDate: new Date(examDate),
        paymentStatus: 'pending',
        isActive: false, // Will be activated after payment
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      registration.paymentStatus = 'completed';
      registration.isActive = true;
      registration.stripePaymentId = 'pi_' + Math.random().toString(36).substr(2, 9);

      onRegistrationComplete(registration);
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupedExams = PROFESSIONAL_EXAMS.reduce((acc, exam) => {
    if (!acc[exam.category]) {
      acc[exam.category] = [];
    }
    acc[exam.category].push(exam);
    return acc;
  }, {} as Record<string, ProfessionalExamType[]>);

  const categoryNames = {
    medical: 'Medical & Healthcare',
    legal: 'Legal',
    engineering: 'Engineering',
    accounting: 'Accounting & Finance',
    'real-estate': 'Real Estate',
    nursing: 'Nursing',
    pharmacy: 'Pharmacy',
    architecture: 'Architecture',
    education: 'Education',
    finance: 'Financial Services',
    other: 'Other',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Professional Exam Registration
        </h2>
        <p className="text-gray-500 text-lg">
          Register for your professional licensing examination
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  step >= stepNum
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-400'
                }`}
              >
                {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
              </div>
              {stepNum < 4 && (
                <ArrowRight className={`w-5 h-5 mx-2 ${
                  step > stepNum ? 'text-purple-400' : 'text-gray-600'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        {/* Step 1: Select Exam Type */}
        {step === 1 && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <GraduationCap className="w-6 h-6 mr-3 text-purple-400" />
              Select Your Professional Exam
            </h3>
            
            <div className="space-y-6">
              {Object.entries(groupedExams).map(([category, exams]) => (
                <div key={category}>
                  <h4 className="text-lg font-semibold text-gray-300 mb-3">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {exams.map((exam) => (
                      <button
                        key={exam.id}
                        onClick={() => handleExamSelect(exam)}
                        className="p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left"
                      >
                        <h5 className="font-medium text-white mb-1">{exam.name}</h5>
                        <p className="text-sm text-gray-400 mb-2">{exam.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{exam.questionCount} questions</span>
                          <span>{Math.floor(exam.timeLimit / 60)}h {exam.timeLimit % 60}m</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select State */}
        {step === 2 && selectedExam && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3 text-purple-400" />
              Select Your State
            </h3>
            
            <div className="mb-4 p-4 bg-purple-600/20 border border-purple-600 rounded-lg">
              <p className="text-purple-300">
                Selected Exam: <strong>{selectedExam.name}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-96 overflow-y-auto">
              {US_STATES.map((state) => (
                <button
                  key={state.code}
                  onClick={() => handleStateSelect(state)}
                  className="p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-center"
                >
                  <div className="font-medium text-white text-sm">{state.code}</div>
                  <div className="text-xs text-gray-400">{state.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Exam Date */}
        {step === 3 && selectedExam && selectedState && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Calendar className="w-6 h-6 mr-3 text-purple-400" />
              Select Your Exam Date
            </h3>
            
            <div className="mb-6 space-y-2">
              <div className="p-4 bg-purple-600/20 border border-purple-600 rounded-lg">
                <p className="text-purple-300">
                  <strong>{selectedExam.name}</strong> in <strong>{selectedState.name}</strong>
                </p>
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <label className="block text-gray-300 mb-2">Exam Date</label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              
              <div className="mt-4 p-4 bg-yellow-600/20 border border-yellow-600 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  <strong>Important:</strong> Your study features will be deactivated after your exam date. 
                  You can reactivate them by reporting your exam results.
                </p>
              </div>

              <button
                onClick={handleDateSelect}
                disabled={!examDate}
                className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && selectedExam && selectedState && examDate && (
          <div>
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-3 text-purple-400" />
              Complete Payment
            </h3>
            
            <div className="max-w-md mx-auto">
              <div className="mb-6 p-6 bg-gray-700/50 rounded-lg border border-gray-600">
                <h4 className="font-semibold text-white mb-4">Registration Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Exam:</span>
                    <span className="text-white">{selectedExam.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">State:</span>
                    <span className="text-white">{selectedState.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date:</span>
                    <span className="text-white">{new Date(examDate).toLocaleDateString()}</span>
                  </div>
                  <hr className="border-gray-600 my-3" />
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-300">Total:</span>
                    <span className="text-white text-lg">$150.00</span>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-600/20 border border-blue-600 rounded-lg">
                <p className="text-blue-300 text-sm">
                  This fee includes access to AI-powered study materials, practice exams, 
                  and personalized learning strategies until your exam date.
                </p>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Pay $150.00 with Stripe</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Secure payment processing powered by Stripe
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ExamRegistration;