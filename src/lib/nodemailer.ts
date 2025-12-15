import mailer, { Transporter } from "nodemailer"
import Mail from "nodemailer/lib/mailer/index.js"

export default class Mailer {
    transport: Transporter

    /**
     * Constructor initializes a mail transport instance for sending emails.
     */
    constructor() {
        this.transport = mailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        })
    }

    /**
     * @param mailOptions - Mail options including recipient, subject, and body.
     *  from: process.env.EMAIL_USER,
     * to: recipientEmail,
     * subject: emailSubject,
     * html: emailBody -> Always html body
     */


    async sendMail(mailOptions: Mail.Options): Promise<void> {
        this.transport.sendMail(mailOptions, function (err: any, info: any) {
            if (err) console.error("Failed to send email ", err)
            console.info(`${new Date().toTimeString()} mail delivery report: ${JSON.stringify(info)}`)
        })
    }
}