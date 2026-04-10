require('dotenv').config();
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'InvoiceFlow <onboarding@resend.dev>',
      to: 'avishka@example.com', // Dummy email, Resend allows 'onboarding@resend.dev' or we might need the actual email from the account if not verified.
      subject: 'Test Email from InvoiceFlow ✅',
      html: '<p>The API key is working perfectly.</p>'
    });

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Success Payload:', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

test();
