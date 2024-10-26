import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import config from "../config/config";
export default class MailService {
  transporter;
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: config.EMAIL,
        pass: config.EMAIL_PASSWORD,
      },
    });
  }

  sendMessage(mailOptions: Mail.Options) {
    this.transporter.sendMail(mailOptions, (err: any, info: any) => {
      console.log(err, info);
    });
  }
  sendConfirmationEmail(mailOptions: Mail.Options) {
    this.transporter.sendMail(mailOptions, (err: any, info: any) => {
      console.log(err, info);
    });
  }
}
export const Mailer = new MailService();
