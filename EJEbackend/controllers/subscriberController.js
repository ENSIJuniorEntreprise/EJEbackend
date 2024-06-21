const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const Subscriber = require("../models/Subscriber");

dotenv.config();

const addSubscriber = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Please specify the email." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format." });
        }

        const existingSubscriber = await Subscriber.findOne({ email });
        if (existingSubscriber) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const subscriber = await Subscriber.create({ email });

        res.status(201).json({ subscriber });
    } catch (error) {
        console.error("Error adding subscriber:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const deleteSubscriberById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedSubscriber = await Subscriber.findByIdAndDelete(id);
        if (!deletedSubscriber) {
            return res.status(404).json({ error: "Subscriber not found." });
        }
        res.json({ message: "Subscriber deleted successfully." });
    } catch (error) {
        console.error("Error deleting subscriber by ID:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const sendEmailToSubscribers = async (req, res) => {
    console.log(req.body);
    const { subject, text } = req.body;
    let failedEmails = [];

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        const subscribers = await Subscriber.find();

        for (const subscriber of subscribers) {
            const mailOptions = {
                from: process.env.EMAIL,
                to: subscriber.email,
                subject: subject,
                text: text
            };

            try {
                await transporter.sendMail(mailOptions);
            } catch (error) {
                console.error(`Failed to send email to ${subscriber.email}:`, error);
                failedEmails.push(subscriber.email);
            }
        }

        if (failedEmails.length > 0) {
            res.status(500).json({ error: 'Failed to send emails to some subscribers.', failedEmails });
        } else {
            res.status(200).json({ message: 'Emails sent successfully.' });
        }
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


module.exports = {
    addSubscriber,
    deleteSubscriberById,
    sendEmailToSubscribers
};
