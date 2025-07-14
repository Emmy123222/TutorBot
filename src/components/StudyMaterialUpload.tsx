import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Type, Loader2 } from 'lucide-react';
import { StudySession } from '../types';
import { generateAISummary } from '../utils/api';

interface StudyMaterialUploadProps {
  onSessionCreate: (session: StudySession) => void;
}

const StudyMaterialUpload: React.FC<StudyMaterialUploadProps> = ({ onSessionCreate }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text' | 'topic'>('file');
  const [textContent, setTextContent] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setLoading(true);
        setError(null);
        
        try {
          const text = await file.text();
          await createSession(file.name, text);
        } catch (err) {
          setError('Failed to read file. Please try again.');
        } finally {
          setLoading(false);
        }
      }
    },
  });

  const createSession = async (title: string, content: string) => {
    try {
      const summary = await generateAISummary(content);
      
      const session: StudySession = {
        id: Date.now().toString(),
        title,
        content,
        summary,
        createdAt: new Date(),
        lastAccessed: new Date(),
        progress: {
          flashcardsCompleted: 0,
          quizScore: 0,
          studyDaysCompleted: 0,
        },
      };
      
      onSessionCreate(session);
    } catch (err) {
      setError('Failed to process content. Please try again.');
    }
  };

  const handleTextSubmit = async () => {
    if (!textContent.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await createSession('Text Input', textContent);
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSubmit = async () => {
    if (!topicTitle.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // For topic input, we'll create a basic prompt for the AI
      const prompt = `Please provide a comprehensive study guide for the topic: "${topicTitle}". Include key concepts, important details, and explanations that would be helpful for a student learning this subject.`;
      await createSession(topicTitle, prompt);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Start Your Study Session
        </h2>
        <p className="text-gray-500 text-lg">
          Upload your study material or enter a topic to get personalized AI assistance
        </p>
      </div>

      {/* Upload Method Tabs */}
      <div className="flex justify-center mb-8">
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
          {[
            { id: 'file', label: 'Upload File', icon: Upload },
            { id: 'text', label: 'Paste Text', icon: FileText },
            { id: 'topic', label: 'Enter Topic', icon: Type },
          ].map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setUploadMethod(method.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  uploadMethod === method.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{method.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}

      {/* Upload Content */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        {uploadMethod === 'file' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-gray-600 hover:border-purple-500 hover:bg-purple-500/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop your file here' : 'Drag & drop your study material'}
            </p>
            <p className="text-gray-500">
              Supports PDF and text files • Max 1 file
            </p>
          </div>
        )}

        {uploadMethod === 'text' && (
          <div>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Paste your study material here..."
              className="w-full h-64 p-4 bg-gray-900/50 border border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleTextSubmit}
                disabled={!textContent.trim() || loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Process Text</span>
              </button>
            </div>
          </div>
        )}

        {uploadMethod === 'topic' && (
          <div>
            <input
              type="text"
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder="Enter a study topic (e.g., 'Photosynthesis', 'World War II', 'Algebra')"
              className="w-full p-4 bg-gray-900/50 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleTopicSubmit}
                disabled={!topicTitle.trim() || loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Type className="w-4 h-4" />}
                <span>Generate Study Guide</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing your study material...</span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StudyMaterialUpload;