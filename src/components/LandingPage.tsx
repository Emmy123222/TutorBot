import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Brain, 
  Trophy, 
  Users, 
  Star,
  Play,
  Globe,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Russian', 'Hindi'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Master Your
              </span>
              <br />
              <span className="text-white">Professional Exam</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered study platform designed specifically for professional licensing exams. 
              Get personalized practice questions from students who passed in your state.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-lg font-semibold hover:scale-105 transition-all shadow-lg"
              >
                Start Your Journey - $150
              </button>
              
              <button className="flex items-center space-x-2 px-6 py-4 border border-gray-600 text-gray-300 rounded-lg hover:border-purple-500 hover:text-white transition-all">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Video Placeholder */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="relative bg-gray-800/50 rounded-xl border border-gray-700 aspect-video flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">Platform Demo Video</h3>
                  <p className="text-gray-400">See how our AI-powered study system works</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built specifically for professional licensing exams with real questions from successful candidates
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Learning',
                description: 'Personalized study strategies that adapt to your learning style and progress'
              },
              {
                icon: Users,
                title: 'Real Exam Questions',
                description: 'Questions contributed by students who passed their exams in your specific state'
              },
              {
                icon: Trophy,
                title: 'Proven Results',
                description: 'Higher pass rates with our targeted practice and feedback system'
              },
              {
                icon: GraduationCap,
                title: 'Professional Focus',
                description: 'Specialized for medical, legal, engineering, and other professional licensing exams'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center"
              >
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Strategies Section */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 text-white">
              Three Powerful Study Methods
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Choose the learning approach that works best for your exam preparation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Flashcards',
                description: 'Quick 5-second question reveals followed by 5-second answer displays',
                features: ['Timed memory reinforcement', 'Spaced repetition', 'Progress tracking']
              },
              {
                title: 'Multiple Choice',
                description: 'Realistic exam-style questions with instant feedback and explanations',
                features: ['5 answer options', 'Immediate results', 'Performance analytics']
              },
              {
                title: 'Typed Answers',
                description: 'Write detailed responses under actual exam time constraints',
                features: ['Real exam timing', 'Deep understanding', 'Comprehensive feedback']
              }
            ].map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{method.title}</h3>
                <p className="text-gray-400 mb-4">{method.description}</p>
                <ul className="space-y-2">
                  {method.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-300">
                      <Star className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Success Stories
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of professionals who passed their exams with our platform
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Johnson',
                exam: 'USMLE Step 1',
                state: 'California',
                quote: 'The AI-powered questions were incredibly similar to my actual exam. Passed on my first try!'
              },
              {
                name: 'Michael Chen',
                exam: 'Bar Examination',
                state: 'New York',
                quote: 'Having access to questions from other successful candidates made all the difference.'
              },
              {
                name: 'Jennifer Rodriguez',
                exam: 'CPA Exam',
                state: 'Texas',
                quote: 'The timed practice sessions perfectly prepared me for the real exam pressure.'
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.exam} • {testimonial.state}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Social Media */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="p-2 bg-gray-800 rounded-lg hover:bg-purple-600 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-gray-300" />
                  </a>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                Language
              </h3>
              <select className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                {languages.map((lang, index) => (
                  <option key={index} value={lang.toLowerCase()}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
              <p className="text-gray-400 text-sm">
                Questions about our platform?<br />
                Email: support@examprep.ai<br />
                Phone: 1-800-EXAM-PREP
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Professional Exam Prep Platform. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Secure payments powered by Stripe • Revenue sharing: 50/50 after operational costs
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;