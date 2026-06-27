/**
 * Input Validators for Victor IA Website
 * TypeScript version for Next.js / Express
 * Returns: { isValid, errors: ValidationError[] }
 */

interface ValidationError {
  field: string;
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation (RFC 5322 simplified)
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  email = email.trim();
  if (email.length > 254) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Phone validation (international: +1-234-567-8900, 2345678900, etc)
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  phone = phone.trim();
  // Acepta: +1 (XXX) XXX-XXXX, +1234567890, (XXX)XXX-XXXX, etc
  const regex = /^[\d\s\-\+\(\)]{10,20}$/;
  if (!regex.test(phone)) return false;
  // Must have at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

// Text validation: no scripts, reasonable length
export function validateText(
  text: string,
  minLength: number = 1,
  maxLength: number = 500
): boolean {
  if (!text || typeof text !== 'string') return false;
  text = text.trim();
  if (text.length < minLength || text.length > maxLength) return false;
  if (containsScript(text)) return false;
  return true;
}

// XSS prevention: detect dangerous patterns
export function containsScript(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  const dangerous = /<script|<iframe|javascript:|on\w+\s*=|<img\s+|<svg\s+/gi;
  return dangerous.test(str);
}

// URL validation: ensure valid format and safe domain
export function validateURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    return true;
  } catch {
    return false;
  }
}

// Name validation: 2-100 chars, no script
export function validateName(name: string): boolean {
  if (!name || typeof name !== 'string') return false;
  name = name.trim();
  if (name.length < 2 || name.length > 100) return false;
  if (containsScript(name)) return false;
  // Allow letters, spaces, hyphens, apostrophes
  const regex = /^[a-zA-Z\s\-']+$/;
  return regex.test(name);
}

// Company name validation: 2-150 chars
export function validateCompanyName(company: string): boolean {
  if (!company || typeof company !== 'string') return false;
  company = company.trim();
  if (company.length < 2 || company.length > 150) return false;
  if (containsScript(company)) return false;
  return true;
}

// Message validation: 0-5000 chars (optional field)
export function validateMessage(message: string): boolean {
  if (!message) return true; // optional
  if (typeof message !== 'string') return false;
  if (message.length > 5000) return false;
  if (containsScript(message)) return false;
  return true;
}

// Subject validation: 5-200 chars
export function validateSubject(subject: string): boolean {
  if (!subject || typeof subject !== 'string') return false;
  subject = subject.trim();
  if (subject.length < 5 || subject.length > 200) return false;
  if (containsScript(subject)) return false;
  return true;
}

// Service selection validation
const VALID_SERVICES = [
  'consulting',
  'design',
  'development',
  'marketing',
  'training',
  'automation',
  'other'
];

export function validateService(service: string): boolean {
  if (!service || typeof service !== 'string') return false;
  return VALID_SERVICES.includes(service.toLowerCase());
}

// Contact Form Validator
export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message: string;
}

export function validateContactForm(data: ContactFormData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateName(data.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be 2-100 characters, letters only'
    });
  }

  if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone must be a valid format (10+ digits)'
    });
  }

  if (data.company && !validateCompanyName(data.company)) {
    errors.push({
      field: 'company',
      message: 'Company name must be 2-150 characters'
    });
  }

  if (data.subject && !validateSubject(data.subject)) {
    errors.push({
      field: 'subject',
      message: 'Subject must be 5-200 characters'
    });
  }

  if (!validateMessage(data.message)) {
    errors.push({
      field: 'message',
      message: 'Message is invalid or too long (max 5000 chars)'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Service Inquiry Form Validator
export interface ServiceInquiryData {
  name: string;
  email: string;
  phone?: string;
  company: string;
  service: string;
  message: string;
}

export function validateServiceInquiry(data: ServiceInquiryData): ValidationResult {
  const errors: ValidationError[] = [];

  if (!validateName(data.name)) {
    errors.push({
      field: 'name',
      message: 'Name must be 2-100 characters, letters only'
    });
  }

  if (!validateEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'Please provide a valid email address'
    });
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push({
      field: 'phone',
      message: 'Phone must be a valid format (10+ digits)'
    });
  }

  if (!validateCompanyName(data.company)) {
    errors.push({
      field: 'company',
      message: 'Company name must be 2-150 characters'
    });
  }

  if (!validateService(data.service)) {
    errors.push({
      field: 'service',
      message: 'Please select a valid service'
    });
  }

  if (!validateMessage(data.message)) {
    errors.push({
      field: 'message',
      message: 'Message is invalid or too long (max 5000 chars)'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export const VALID_SERVICES_LIST = VALID_SERVICES;
