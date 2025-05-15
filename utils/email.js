const nodeMailer = require('nodemailer');

const sendEmail = async options => {
    
    const transporter = nodeMailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    
      const mailOptions = {
        from: 'Simon Asegd <SimonBeast@simon.io>',
        to:options.email,
        subject:options.subject,
        text:options.message,
       
      }
     await transporter.sendMail(mailOptions);
     console.log("Mail sent");
    
}
module.exports = sendEmail;