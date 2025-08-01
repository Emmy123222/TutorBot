import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { validateApiKey } from '../utils/api';

interface ApiKeyValidatorProps {
  onValidationComplete: (isValid: boolean) => void;
}

const ApiKeyValidator: React.FC<ApiKeyValidatorProps> = ({ onValidationComplete }) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    validateKey();
  }, []);

  const validateKey = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const valid = await validateApiKey();
      setIsValid(valid);
      onValidationComplete(valid);
      
      if (!valid) {
        setError('Groq API key is not configured or invalid. Please check your environment variables.');
      }
    } catch (err) {
      setIsValid(false);
      setError('Failed to validate API key. Please check your internet connection.');
      onValidationComplete(false);
    } finally {
      setIsValidating(false);
    }
  };

  if (isValidating) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen"
      >
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-spin" />
          <p className="text-lg text-gray-300">Validating API configuration...</p>
        </div>
      </motion.div>
    );
  }

  if (isValid === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center min-h-screen p-4"
      >
        <div className="max-w-md w-full bg-red-900/50 border border-red-500 rounded-xl p-8 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-6 text-red-400" />
          <h2 className="text-2xl font-bold text-red-300 mb-4">Configuration Error</h2>
          <p className="text-red-200 mb-6">{error}</p>
          
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">To fix this:</h3>
            <ol className="text-sm text-gray-400 space-y-1">
              <li>1. Get your Groq API key from groq.com</li>
              <li>2. Add it to your .env file as VITE_GROQ_API_KEY</li>
              <li>3. Restart the development server</li>
            </ol>
          </div>
          
          <button
            onClick={validateKey}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2 mx-auto"
          >
            <Key className="w-5 h-5" />
            <span>Retry Validation</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center min-h-screen"
    >
      <div className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
        <p className="text-lg text-green-300">API configuration validated successfully!</p>
      </div>
    </motion.div>
  );
};

export default ApiKeyValidator;