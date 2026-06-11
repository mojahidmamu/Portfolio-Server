require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require('mongoose');
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
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

// Contact Form Submit: 
app.post("/contact", async (req, res) => {
    try {
        const {
        name,
        email,
        subject,
        message,
        } = req.body;

    // Save MongoDB
    const newMessage =
        await Message.create({
            name,
            email,
            subject,
            message,
    });

    // Send Email
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: process.env.EMAIL,
        subject: `Portfolio Contact - ${subject}`,
        html: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong> ${message}</p>
        `,
        });

    res.status(201).send({
        success: true,
        message: "Message Sent Successfully",
        data: newMessage,
    });
  } catch (error) {
    console.log(error);

    res.status(500).send({
        success: false,
        message: "Something went wrong",
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