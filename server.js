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


// Verify Admin: 

// Get All Messages: 

// Delete Message: 


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server Running on ${PORT}`);
});