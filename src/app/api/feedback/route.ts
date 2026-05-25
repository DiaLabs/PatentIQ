import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with an environment variable
// We will assume they have RESEND_API_KEY set up in their environment
const resend = new Resend(process.env.RESEND_API_KEY || 're_test_dummy');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { feedback, userEmail, userName } = body;

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback content is required' },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: 'PatentIQ Feedback <feedback@dialabs.tech>',
      to: 'mail.dialabs@gmail.com',
      subject: `New Feedback from ${userName || 'User'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px;">
          <h2>New PatentIQ Feedback</h2>
          <p><strong>User:</strong> ${userName || 'Unknown'} (${userEmail || 'No email provided'})</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
          <p><strong>Feedback:</strong></p>
          <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; color: #333;">
            ${feedback}
          </div>
        </div>
      `,
    });

    if (data.error) {
      console.error("Resend API Error:", data.error);
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback email' },
      { status: 500 }
    );
  }
}
