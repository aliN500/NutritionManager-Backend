import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";
import config from "../config/config";
import confirmationTemplate from "../utils/EmailTemplates";
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

  sendConfirmationEmail(email: string, YOUR_VERIFICATION_LINK: string) {
    const mailOptions: Mail.Options = {
      from: config.APPNAME,
      to: email,
      html: confirmationTemplate(YOUR_VERIFICATION_LINK, config.YOUR_COMPANY_LOGO_URL),
      subject: "Confirmation email",
    };
    this.transporter.sendMail(mailOptions, (err: any, info: any) => {
      console.log(err, info);
    });
  }
}
export const Mailer = new MailService();
