# Victor IA Website - API Validation & Rate Limiting

## Overview

The API endpoint `/api/contact` includes:
- **Input validation** for contact and service inquiry forms
- **Rate limiting** (3 requests per 10 minutes per IP)
- **XSS prevention** and CSRF token validation (frontend)
- **Response headers** showing rate limit status
- **Comprehensive error details** for debugging

## API Endpoint

**URL**: `/api/contact`  
**Method**: `POST`  
**Rate Limit**: 3 requests per 10 minutes per IP  
**Content-Type**: `application/json`

## Test Cases

### 1. Valid Contact Form

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Pablo García",
    "email": "pablo@victor-ia.com",
    "phone": "+55 (21) 98765-4321",
    "company": "Tech Startup Inc",
    "subject": "Service Inquiry",
    "message": "We are interested in learning more about your design services."
  }'
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Thank you for your message. We'll be in touch shortly.",
  "submittedAt": "2026-06-13T15:45:32.123Z"
}
```

**Response Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2026-06-13T15:55:32.123Z
```

---

### 2. Valid Service Inquiry

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "type": "service",
    "name": "María López",
    "email": "maria@empresa.com.mx",
    "phone": "+52 (55) 5678-9012",
    "company": "Empresa México",
    "service": "design",
    "message": "Necesitamos rediseñar nuestro sitio web"
  }'
```

---

### 3. Minimal Contact (Phone Optional)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "message": "I would like to know more about your services."
  }'
```

---

### 4. Invalid Email Address

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "not-a-valid-email",
    "message": "Test message"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

---

### 5. Invalid Phone Format

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "123",
    "message": "Test message"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "phone",
      "message": "Phone must be a valid format (10+ digits)"
    }
  ]
}
```

---

### 6. XSS Prevention - Script Injection

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John<script>alert(1)</script>Smith",
    "email": "john@example.com",
    "message": "Test"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be 2-100 characters, letters only"
    }
  ]
}
```

---

### 7. XSS Prevention - Event Handler

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "message": "Visit <img src=x onerror=\"alert(1)\">"
  }'
```

**Expected Response (422):** Message contains dangerous content

---

### 8. Message Too Long

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "message": "'$(printf 'A%.0s' {1..5001})''"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "message",
      "message": "Message is invalid or too long (max 5000 chars)"
    }
  ]
}
```

---

### 9. Rate Limiting - 1st Request

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

**Response Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 2
X-RateLimit-Reset: 2026-06-13T15:55:32.123Z
```

---

### 10. Rate Limiting - Exceeded (4th Request)

After 3 successful requests within 10 minutes from same IP:

```bash
curl -i -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}'
```

**Expected Response (429):**
```json
{
  "error": "Too many requests",
  "retryAfter": 547,
  "resetTime": "2026-06-13T15:55:32.123Z"
}
```

**Response Headers:**
```
X-RateLimit-Limit: 3
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2026-06-13T15:55:32.123Z
Retry-After: 547
```

---

### 11. Invalid Service Type

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "type": "service",
    "name": "John Smith",
    "email": "john@example.com",
    "company": "Test Corp",
    "service": "invalid-service",
    "message": "Test"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "service",
      "message": "Please select a valid service"
    }
  ]
}
```

**Valid Services:**
- `consulting`
- `design`
- `development`
- `marketing`
- `training`
- `automation`
- `other`

---

### 12. Missing Required Field (Name)

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "message": "Test message"
  }'
```

**Expected Response (422):**
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be 2-100 characters, letters only"
    }
  ]
}
```

---

## Validation Rules

### Contact Form
| Field | Rules | Example |
|-------|-------|---------|
| name | 2-100 chars, letters only | "John Smith" |
| email | Valid format, max 254 chars | "john@example.com" |
| phone | 10+ digits (optional) | "+1 (619) 555-1234" |
| company | 2-150 chars (optional) | "Tech Corp" |
| subject | 5-200 chars (optional) | "Service Inquiry" |
| message | 0-5000 chars (optional) | "I have a question..." |

### Service Inquiry (type: "service")
All contact form rules + :

| Field | Rules | Options |
|-------|-------|---------|
| company | 2-150 chars (required) | "Company Name" |
| service | Must be valid type | consulting, design, development, marketing, training, automation, other |

### XSS & Injection Prevention
- No `<script>` tags
- No `<iframe>` tags
- No `javascript:` protocol
- No event handlers (`onclick`, `onerror`, `onload`, etc)
- No `<img>` or `<svg>` tags with event handlers
- Maximum field lengths enforced

---

## Frontend Integration

### 1. Import Validation (TypeScript)

```typescript
import {
  validateContactForm,
  validateServiceInquiry,
  type ContactFormData,
  type ServiceInquiryData
} from '@/lib/validation/input-validators';
```

### 2. Validate Before Submission

```typescript
const data: ContactFormData = {
  name: formData.get('name'),
  email: formData.get('email'),
  phone: formData.get('phone'),
  message: formData.get('message')
};

const validation = validateContactForm(data);

if (!validation.isValid) {
  validation.errors.forEach(err => {
    console.error(`${err.field}: ${err.message}`);
  });
  return;
}
```

### 3. Submit to API

```typescript
async function submitForm(data: ContactFormData) {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  // Check rate limiting
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
  }

  // Handle errors
  if (!response.ok) {
    const error = await response.json();
    if (error.details) {
      displayValidationErrors(error.details);
    }
    return;
  }

  // Success
  const result = await response.json();
  console.log('Form submitted:', result.message);
}
```

### 4. Handle Validation Errors in UI

```typescript
const userFriendlyMessages: Record<string, string> = {
  name: "Please enter a valid name (letters only, 2-100 characters)",
  email: "Please enter a valid email address",
  phone: "Phone must have at least 10 digits",
  company: "Company name must be 2-150 characters",
  service: "Please select a service",
  message: "Message must be 1-5000 characters",
  subject: "Subject must be 5-200 characters"
};

function displayErrors(errors: Array<{ field: string; message: string }>) {
  errors.forEach(({ field, message }) => {
    const element = document.getElementById(`error-${field}`);
    if (element) {
      element.textContent = userFriendlyMessages[field] || message;
      element.style.display = 'block';
    }
  });
}
```

---

## Rate Limiting Details

- **Limit**: 3 requests per 10 minutes per IP address
- **Tracking**: By IP + endpoint (`/api/contact`)
- **Window**: 10 minutes (600,000 ms)
- **Reset**: Automatic, window-based

### Response Headers
Every response includes:
- `X-RateLimit-Limit`: Maximum requests in window (3)
- `X-RateLimit-Remaining`: Requests left in current window
- `X-RateLimit-Reset`: ISO 8601 timestamp of window reset
- `Retry-After`: Seconds to wait (only when rate limited)

---

## Configuration

### Customize Rate Limit

**File**: `lib/middleware/rate-limit.ts` (line 130-131)

```typescript
const limiter = createRateLimitMiddleware({
  max: 5,              // Change to 5 requests
  windowMs: 900000     // Change to 15 minutes
});
```

### Add More Endpoints

Create new API routes and apply rate limiting:

```typescript
import { createRateLimitMiddleware } from '@/lib/middleware/rate-limit';

const limiter = createRateLimitMiddleware({ max: 10, windowMs: 600000 });

export async function POST(request: NextRequest) {
  const check = limiter.check(request);
  if (!check.allowed) {
    return check.response;
  }
  // Handle request...
}
```

---

## Security Best Practices

1. **Always use HTTPS** in production
2. **Validate server-side** (never trust client validation alone)
3. **Escape output** when displaying user data
4. **Use CSRF tokens** in forms (implement in UI component)
5. **Log suspicious activity** (failed validations, rate limit hits)
6. **Monitor rate limit hits** for potential attacks
7. **Add CORS headers** if needed (currently allowing all origins for preflight)
8. **Implement honeypot fields** (optional, for bot detection)

---

## Debugging

### Check Rate Limit Status

```typescript
const limiter = getGlobalLimiter();
const status = limiter.status('192.168.1.1', '/api/contact');
console.log(status);
```

### Enable Detailed Logging

```typescript
console.log('[victor-ia-api] Contact submission:', {
  type: type || 'contact',
  name,
  email,
  timestamp: new Date().toISOString()
});
```

### Test Validation Locally

```typescript
import { validateContactForm } from '@/lib/validation/input-validators';

const result = validateContactForm({
  name: 'Test<script>',
  email: 'test@example.com',
  message: 'Test'
});

console.log(result);
// { isValid: false, errors: [...] }
```

---

## Error Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success | Form submitted |
| 400 | Bad Request | Invalid JSON |
| 405 | Method Not Allowed | GET request to POST-only endpoint |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

---

## Files Modified

- `lib/validation/input-validators.ts` - Validation functions
- `lib/middleware/rate-limit.ts` - Rate limiting middleware
- `app/api/contact/route.ts` - Contact API endpoint

