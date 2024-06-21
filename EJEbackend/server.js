const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectToDB = require("./config/connect");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");
const articleRouter = require('./routes/articlesRouter');
const eventRouter = require('./routes/eventsRouter');
const subscriberRouter = require('./routes/subscribersRouter');
const authRouter = require('./routes/authRouter');
const refreshRouter = require('./routes/refreshRouter');
const { sendEmailToSubscribers } = require('./controllers/subscriberController');


const app = express();
dotenv.config();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

connectToDB();

app.use('/article', articleRouter);
app.use('/event', eventRouter);
app.use('/subscriber', subscriberRouter);
app.use('/auth', authRouter);
app.use('/refresh', refreshRouter);

app.post('/send-emails', sendEmailToSubscribers);

const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

app.use(bodyParser.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Define a POST endpoint to send the email
app.post('/send-email', async (req, res) => {
  try {
    const { FullName, Email, Subject, Service, Message } = req.body;

    // Ensure all required fields are provided
    if (!FullName || !Email || !Subject || !Service || !Message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Example email sending logic using nodemailer
    const mailOptions = {
      from: `"${FullName}" <${Email}>`, // sender address (dynamic)
      to: process.env.EMAIL_USER, // receiver address (fixed)
      subject: Subject,
      html: `
        <h1>${Service}</h1>
        <p>${Message}</p>
        <p>Sent by: ${FullName} (${Email})</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'An error occurred while sending the email' });
  }
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}....`);
});
