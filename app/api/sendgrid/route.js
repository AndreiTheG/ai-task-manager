// app/api/sendgrid/route.js
import { NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function POST(request) {
  try {
    const { title, description, userEmail } = await request.json();

    const msg = {
      to: process.env.SENDGRID_TO_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `✅ Task finalizat: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #16a34a;">✅ Task finalizat!</h2>
          <p>Felicitări! Ai finalizat următorul task:</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <h3 style="margin: 0 0 8px 0;">${title}</h3>
            ${description ? `<p style="margin: 0; color: #6b7280;">${description}</p>` : ''}
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            Finalizat de: ${userEmail}<br/>
            Data: ${new Date().toLocaleString('ro-RO')}
          </p>
        </div>
      `,
    };

    await sgMail.send(msg);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Eroare la trimiterea emailului!' }, { status: 500 });
  }
}