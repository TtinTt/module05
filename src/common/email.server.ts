import * as nodemailer from 'nodemailer';

export const sendEmail = (to, subject, text) => {
  const mailOptions = {
    from: 'COZYhandmade2032@outlook.com',
    to: to,
    subject: subject,
    text: text,
  };

  let transporter = nodemailer.createTransport({
    host: 'smtp-mail.outlook.com', // hostname
    secureConnection: false, // TLS requires secureConnection to be false
    port: 587, // port for secure SMTP
    service: 'Outlook365',
    auth: {
      user: 'COZYhandmade2032@outlook.com',
      pass: 'COZY2032handmade',
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
