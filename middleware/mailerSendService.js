const { MailerSend, EmailParams, Sender, Recipient } = require('mailersend');
require('dotenv').config();

const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_API_KEY, // Store your API key in environment variables
});

const sentFrom = new Sender("noreply@pexmon.one", "EventKick");

const sendVerificationCode = async (email, username, emailVerificationToken) => {
    const sentTo = new Recipient(`${email}`, `${username}`)
    const emailParams = new EmailParams()
        .setFrom(sentFrom) // Sender email
        .setTo(sentTo)
        .setSubject('Your Verification Code')   
        .setText(`Your verification code is: ${emailVerificationToken}`);

    try {
        await mailerSend.email.send(emailParams);
        console.log('Verification email sent successfully.');
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

module.exports = { 
  sendVerificationCode,
};
