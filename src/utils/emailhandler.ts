import * as nodemailer from 'nodemailer';

async function createTransport() {
  try {
    let testAccount = await nodemailer.createTestAccount();

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

export async function sendEmail({
  to,
  subject,
  text,
}): Promise<string | boolean> {
  try {
    const transporter = await createTransport();
    let info = await transporter.sendMail({
      to,
      subject,
      text,
    });
    if (info) return true;
    throw new Error('Unable to send email');
  } catch (err) {
    console.log(err);
    return err.message;
  }
}
