import React from 'react';
import { motion } from 'framer-motion';
import { UserButton, useUser } from '@civic/auth/react';

interface CivicLoginButtonProps {
  darkMode: boolean;
}

const CivicLoginButton: React.FC<CivicLoginButtonProps> = ({ darkMode }) => {
  const { user, isLoading, authStatus, error } = useUser();

  // Customize UserButton appearance to match header styling
  const buttonStyles = `
    p-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105
    ${darkMode 
      ? 'text-white hover:text-white hover:bg-gray-800/50' 
      : 'text-white hover:text-purple-700 hover:bg-gray-100/50'}
    ${user ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' : ''}
  `;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading ? (
        <div className={buttonStyles}>Loading...</div>
      ) : error ? (
        <div className={`${buttonStyles} text-red-500`}>Error: {error.message}</div>
      ) : (
        <UserButton
          className={buttonStyles}
          loginText="Sign In"
          logoutText={user?.email || user?.id || 'Sign Out'}
          title={user ? 'Sign Out' : 'Sign In with Civic'}
        />
      )}
    </motion.div>
  );
};

export default CivicLoginButton;