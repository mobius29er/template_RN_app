import { NextResponse } from 'next/server';

/**
 * Waitlist API Route
 * 
 * POST /api/waitlist
 * Adds an email to the waitlist
 * 
 * TODO: Connect to your database (Supabase) to store emails
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // TODO: Store in Supabase
    // Example:
    // const { data, error } = await supabase
    //   .from('waitlist')
    //   .insert([{ email, created_at: new Date().toISOString() }]);
    //
    // if (error) throw error;

    console.log('Waitlist signup:', email);

    // TODO: Send confirmation email (optional)
    // Example: Use Resend, SendGrid, or another email service

    return NextResponse.json(
      { success: true, message: 'Successfully joined waitlist' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist error:', error);
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
