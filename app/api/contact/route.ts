/**
 * API Route: Contact Form Handler
 * Path: /api/contact
 * Methods: POST
 * Rate Limited: 3 requests per 10 minutes per IP
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  validateContactForm,
  validateServiceInquiry,
  type ContactFormData,
  type ServiceInquiryData
} from '@/lib/validation/input-validators';
import { createRateLimitMiddleware, getClientIP } from '@/lib/middleware/rate-limit';

export const runtime = 'nodejs';
export const revalidate = 0;

const limiter = createRateLimitMiddleware({
  max: 3,
  windowMs: 600000 // 10 minutes
});

/**
 * POST /api/contact
 * Body: { name, email, phone?, company?, subject?, message, type?: 'contact' | 'service' }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting check
    const rateLimitCheck = limiter.check(request);
    const { allowed, headers, response } = rateLimitCheck;

    if (!response || !allowed) {
      return response || new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers }
      );
    }

    // 2. Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers }
      );
    }

    const { name, email, phone, company, subject, message, type } = body;

    // 3. Validate inputs based on form type
    let validation;

    if (type === 'service' || company) {
      // Service inquiry form
      validation = validateServiceInquiry({
        name,
        email,
        phone,
        company: company || '',
        service: body.service || 'other',
        message
      });
    } else {
      // Standard contact form
      validation = validateContactForm({
        name,
        email,
        phone,
        company,
        subject,
        message
      });
    }

    // Return validation errors if any
    if (!validation.isValid) {
      return new NextResponse(
        JSON.stringify({
          error: 'Validation failed',
          details: validation.errors
        }),
        { status: 422, headers }
      );
    }

    // 4. Send email (integrate with your email service)
    // For now, we'll just log and return success
    console.log('[victor-ia-api] Contact submission:', {
      type: type || 'contact',
      name,
      email,
      company,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement email sending
    // Example with Nodemailer, SendGrid, Resend, etc:
    // await sendEmail({
    //   to: 'hello@victor-ia.com',
    //   subject: `New ${type === 'service' ? 'Service Inquiry' : 'Contact'} from ${name}`,
    //   html: generateEmailHTML(body)
    // });

    // 5. Return success response
    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Thank you for your message. We\'ll be in touch shortly.',
        submittedAt: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('[victor-ia-api] Error:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process your request. Please try again later.'
      }),
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Returns: Method not allowed
 */
export async function GET() {
  return new NextResponse(
    JSON.stringify({ error: 'Method not allowed' }),
    { status: 405 }
  );
}

/**
 * OPTIONS /api/contact
 * CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
