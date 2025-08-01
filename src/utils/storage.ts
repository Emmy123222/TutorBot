// Secure local storage utilities with encryption-like obfuscation

const STORAGE_PREFIX = 'tutorbot_';
const ENCRYPTION_KEY = 'tb_secure_2024';

// Simple obfuscation for sensitive data (not real encryption, but better than plain text)
function obfuscate(data: string): string {
  return btoa(data.split('').map((char, i) => 
    String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
  ).join(''));
}

function deobfuscate(data: string): string {
  try {
    const decoded = atob(data);
    return decoded.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
    ).join('');
  } catch {
    return '';
  }
}

export function secureSetItem(key: string, value: any): void {
  try {
    const serialized = JSON.stringify(value);
    const obfuscated = obfuscate(serialized);
    localStorage.setItem(STORAGE_PREFIX + key, obfuscated);
  } catch (error) {
    console.error('Failed to save to secure storage:', error);
  }
}

export function secureGetItem<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + key);
    if (!stored) return defaultValue;
    
    const deobfuscated = deobfuscate(stored);
    if (!deobfuscated) return defaultValue;
    
    return JSON.parse(deobfuscated);
  } catch (error) {
    console.error('Failed to read from secure storage:', error);
    return defaultValue;
  }
}

export function secureRemoveItem(key: string): void {
  try {
    localStorage.removeItem(STORAGE_PREFIX + key);
  } catch (error) {
    console.error('Failed to remove from secure storage:', error);
  }
}

export function clearSecureStorage(): void {
  try {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear secure storage:', error);
  }
}

// Session management
export function saveUserSession(sessionData: any): void {
  secureSetItem('user_session', {
    ...sessionData,
    timestamp: new Date().toISOString(),
    version: '1.0'
  });
}

export function getUserSession(): any {
  return secureGetItem('user_session', null);
}

export function clearUserSession(): void {
  secureRemoveItem('user_session');
}

// Study progress tracking
export function saveStudyProgress(examType: string, state: string, progress: any): void {
  const key = `progress_${examType}_${state}`;
  secureSetItem(key, {
    ...progress,
    lastUpdated: new Date().toISOString(),
  });
}

export function getStudyProgress(examType: string, state: string): any {
  const key = `progress_${examType}_${state}`;
  return secureGetItem(key, null);
}

// Analytics and performance tracking
export function trackUserAction(action: string, data?: any): void {
  const analytics = secureGetItem('analytics', []);
  analytics.push({
    action,
    data,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
  
  // Keep only last 100 actions to prevent storage bloat
  if (analytics.length > 100) {
    analytics.splice(0, analytics.length - 100);
  }
  
  secureSetItem('analytics', analytics);
}

export function getAnalytics(): any[] {
  return secureGetItem('analytics', []);
}