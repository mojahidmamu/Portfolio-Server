require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

const app = express();

app.use(cors( {
  origin: ["https://portfolio-website-roan-kappa-72.vercel.app", "http://localhost:5173"],
  credentials: true,
}));
app.use(express.json());

const uri = process.env.MONGODB_URI;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.error("MongoDB Error:", err);
});

//  Message Schema: 
const messageSchema = new mongoose.Schema(
{
    name: String,
    email: String,
    subject: String,
    message: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

const Message = mongoose.model(
  "Message",
  messageSchema
);

// Nodemailer Transporter
const transporter =
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
});


// Home route: 
app.get("/", (req, res) => {
  res.send("Portfolio Server Running ...");
});


app.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Save to MongoDB
    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    // Send Email to Your Gmail
    await transporter.sendMail({
      from: `"Portfolio Contact Form" <${process.env.EMAIL}>`,
      to: process.env.EMAIL,
      replyTo: email,
      subject: `📩 New Portfolio Message - ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px">

        <h2 style="color:#7c3aed;">
        🚀 New Portfolio Contact Message
        </h2>

        <table style="width:100%;border-collapse:collapse;">
        <tr>
        <td style="padding:10px;font-weight:bold;">Name</td>
        <td>${name}</td>
        </tr>

        <tr>
        <td style="padding:10px;font-weight:bold;">Email</td>
        <td>${email}</td>
        </tr>

        <tr>
        <td style="padding:10px;font-weight:bold;">Subject</td>
        <td>${subject}</td>
        </tr>
        </table>

        <div
        style="
        margin-top:20px;
        padding:15px;
        background:#f5f5f5;
        border-radius:10px;
        "
        >
        ${message}
        </div>

        <p style="margin-top:20px;color:#888;">
        Sent from Portfolio Contact Form
        </p>

        </div>
        `,
    });

    res.status(201).send({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error(error);

    res.status(500).send({
      success: false,
      message: "Failed to send message",
    });
  }
});


// Verify Admin: 
app.post("/verify-admin", (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        res.send({ success: true, message: "Admin Verified" });
    } else {
        res.send({ success: false, message: "Invalid Password" });
    }
});

// Get All Messages: 
app.get("/messages", async (req, res) => {
    try {
        const adminKey =
        req.headers.adminkey;

        if (
            adminKey !==
            process.env.ADMIN_PASSWORD
        ) {
            return res
            .status(403)
            .send({
                success: false,
                message:
                "Access Denied",
            });
        }

        const messages =
            await Message.find().sort({
            createdAt: -1,
        });

        res.send(messages);
    } catch (error) {
        console.log(error);

        res.status(500).send({
            success: false,
        });
    }
});

// Delete Message: 
app.delete("/messages/:id", async (req, res) => {
    try {
      const adminKey =
        req.headers.adminkey;

      if (
        adminKey !==
        process.env.ADMIN_PASSWORD
      ) {
        return res
          .status(403)
          .send({
            success: false,
          });
      }

      const result =
        await Message.findByIdAndDelete(
          req.params.id
        );

      res.send({
        success: true,
        result,
      });
    } catch (error) {
      console.log(error);

      res.status(500).send({
        success: false,
      });
    }
  }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server Running on ${PORT}`);
});