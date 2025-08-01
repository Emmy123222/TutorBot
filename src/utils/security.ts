// Security utilities for the application

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Validate file uploads
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['text/plain', 'application/pdf'];
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only PDF and text files are allowed' };
  }
  
  return { valid: true };
}

// Rate limiting for API calls
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number = 10, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }

  getTimeUntilNextRequest(): number {
    if (this.requests.length < this.maxRequests) {
      return 0;
    }
    
    const oldestRequest = Math.min(...this.requests);
    return this.timeWindow - (Date.now() - oldestRequest);
  }
}

export const apiRateLimiter = new RateLimiter(20, 60000); // 20 requests per minute

// Content Security Policy helpers
export function validateExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const allowedDomains = [
      'api.groq.com',
      'checkout.stripe.com',
      'js.stripe.com',
      'images.pexels.com',
    ];
    
    return allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
  } catch {
    return false;
  }
}

// Secure random ID generation
export function generateSecureId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Data validation
export function validateExamRegistration(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.examType || typeof data.examType !== 'object') {
    errors.push('Valid exam type is required');
  }
  
  if (!data.state || typeof data.state !== 'object') {
    errors.push('Valid state is required');
  }
  
  if (!data.examDate || isNaN(new Date(data.examDate).getTime())) {
    errors.push('Valid exam date is required');
  }
  
  if (new Date(data.examDate) <= new Date()) {
    errors.push('Exam date must be in the future');
  }
  
  return { valid: errors.length === 0, errors };
}

// Session security
export function validateSession(sessionData: any): boolean {
  if (!sessionData || typeof sessionData !== 'object') {
    return false;
  }
  
  // Check if session is not too old (24 hours)
  const sessionAge = Date.now() - new Date(sessionData.timestamp || 0).getTime();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  
  return sessionAge < maxAge;
}

// Error logging (without exposing sensitive data)
export function logSecureError(error: Error, context?: string): void {
  const errorLog = {
    message: error.message,
    context: context || 'unknown',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  console.error('Secure Error Log:', errorLog);
  
  // In production, this would send to a secure logging service
  // For now, we'll store locally for debugging
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push(errorLog);
    
    // Keep only last 50 errors
    if (logs.length > 50) {
      logs.splice(0, logs.length - 50);
    }
    
    localStorage.setItem('error_logs', JSON.stringify(logs));
  } catch {
    // Fail silently if localStorage is not available
  }
}