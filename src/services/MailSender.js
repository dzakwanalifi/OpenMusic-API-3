const nodemailer = require('nodemailer');
const config = require('../utils/config');

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      auth: {
        user: config.mail.user,
        pass: config.mail.password,
      },
    });
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: 'OpenMusic API',
      to: targetEmail,
      subject: 'Ekspor Playlist',
      text: 'Terlampir hasil ekspor playlist',
      attachments: [
        {
          filename: 'playlist.json',
          content: JSON.stringify(content),
        },
      ],
    };

    return this._transporter.sendMail(message);
  }
}

module.exports = MailSender;
