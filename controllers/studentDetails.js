const studentModel = require("../model/studentDetails");
const mongoose = require("mongoose");
const Question = require("../model/questions");
require("dotenv").config();
const nodemailer = require("nodemailer");
const {
  FactorListInstance,
} = require("twilio/lib/rest/verify/v2/service/entity/factor");

require("dns").setDefaultResultOrder("ipv4first");

const otpStorage = {};

// Get all students
const getAllStudents = async (req, res) => {
  try {
    const students = await studentModel
      .find({})
      .populate({
        path: "assignedQuestions.question",
        select: "questionsDetails category",
      })
      .lean();

    res.status(200).json({
      success: true,
      students,
    });
  } catch (err) {
    console.error("Get all students error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students",
      error: err.message,
    });
  }
};

// Send OTP to student's email
const createDetails = async (req, res) => {
  try {
    const { name, phone_number, email, category } = req.body;

    // Validate required fields
    if (!email || !category) {
      return res
        .status(400)
        .json({ message: "Email and category are required" });
    }

    // Check if student already exists
    const existingStudent = await studentModel.findOne({ email });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 120000; // OTP valid for 2 minutes

    // Store OTP and student data temporarily
    otpStorage[email] = {
      otp,
      expiresAt,
      userData: { name, phone_number, category },
      isExistingUser: !!existingStudent,
      existingStudentId: existingStudent?._id,
    };

    //Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "hr.digitaly@gmail.com",
        pass: "vhut udpj tcgw ptgo",
        //pass: "qaoe wdtr takw etge",
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: "SSLv3",
      },
      timeout: 10000, // 10 seconds timeout
      debug: true,
    });

    // Send OTP via Zoho Mail
    // const transporter = nodemailer.createTransport({
    //   host: "smtp.zoho.com",
    //   port: 465, // or 587 for TLS
    //   secure: true, // true for port 465, false for 587
    //   auth: {
    //     user: "info@dialkaraikudi.com", // your Zoho email address
    //     pass: "Lup8 QYwJ iD8M", // App password generated from Zoho
    //   },
    //   tls: {
    //     rejectUnauthorized: false,
    //   },
    //   timeout: 10000, // 10 seconds timeout
    //   debug: true,
    // });

    await transporter.sendMail({
      from: "hr.digitaly@gmail.com",
      to: email,
      subject: "QuizMaster Pro - OTP Verification",
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          body {
              font-family: 'Poppins', sans-serif;
              background-color: #f5f7fa;
              margin: 0;
              padding: 0;
              color: #333;
          }
          
          .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
          }
          
          .card {
              background-color: #ffffff;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
              overflow: hidden;
          }
          
          .header {
              background: linear-gradient(135deg, #6e8efb, #a777e3);
              padding: 30px 20px;
              text-align: center;
              color: white;
          }
          
          .logo {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
          }
          
          .content {
              padding: 30px;
          }
          
          h1 {
              color: #2d3748;
              font-size: 24px;
              margin-top: 0;
              text-align: center;
          }
          
          .otp-container {
              background: #f8f9fa;
              border-radius: 8px;
              padding: 15px;
              text-align: center;
              margin: 25px 0;
          }
          
          .otp-code {
              font-size: 32px;
              letter-spacing: 5px;
              color: #4a5568;
              font-weight: 700;
              padding: 10px 0;
          }
          
          .info-text {
              color: #718096;
              font-size: 14px;
              line-height: 1.6;
              margin-bottom: 20px;
          }
          
          .footer {
              text-align: center;
              padding: 20px;
              color: #718096;
              font-size: 12px;
              border-top: 1px solid #edf2f7;
          }
          
          .highlight {
              color: #4a5568;
              font-weight: 600;
          }
          
          @media only screen and (max-width: 600px) {
              .content {
                  padding: 20px;
              }
              
              h1 {
                  font-size: 20px;
              }
              
              .otp-code {
                  font-size: 28px;
              }
          }
      </style>
      </head>
      <body>
      <div class="container">
          <div class="card">
              <div class="header">
                  <div class="logo">QuizMaster Pro</div>
                  <div>Secure OTP Verification</div>
              </div>
              
              <div class="content">
                  <h1>Your One-Time Password</h1>
                  
                  <p class="info-text">
                      Hello <span class="highlight">${
                        name || "User"
                      }</span>, we received a request to verify your email address for your QuizMaster Pro account.
                  </p>
                  
                  <div class="otp-container">
                      <div>Please use the following OTP to complete your verification:</div>
                      <div class="otp-code">${otp}</div>
                      <div>This OTP is valid for <span class="highlight">2 minutes</span> only.</div>
                  </div>
                  
                  <p class="info-text">
                      If you didn't request this OTP, please ignore this email or contact our support team if you have any concerns.
                  </p>
              </div>
              
              <div class="footer">
                  © ${new Date().getFullYear()} QuizMaster Pro. All rights reserved.<br>
                  Need help? Contact us at support@quizmasterpro.com
              </div>
          </div>
      </div>
      </body>
      </html>`,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to email",
      verificationRequired: true,
      isExistingUser: !!existingStudent,
      data: existingStudent,
    });
  } catch (err) {
    console.error("OTP send error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: err.message,
    });
  }
};

// Verify OTP and handle student creation/verification
const verifyOtpAndCreateStudent = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const storedOtpData = otpStorage[email];

    // Check if OTP exists and validate
    if (!storedOtpData || storedOtpData.expiresAt < Date.now()) {
      delete otpStorage[email];
      return res.status(400).json({
        success: false,
        message: "OTP expired or invalid",
      });
    }

    // Verify OTP
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // Function to get random questions
    const getRandomQuestions = (questions, count) => {
      const shuffled = [...questions].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Handle existing user
    if (storedOtpData.isExistingUser) {
      const student = await studentModel.findById(
        storedOtpData.existingStudentId
      );

      if (student.isComplete === "pending") {
        const questionsDoc = await Question.findOne({
          category: student.category,
        });

        if (!questionsDoc || !questionsDoc.questionsDetails) {
          throw new Error("No questions found for this category");
        }

        // Get 10 random questions from questionsDetails array
        const randomQuestions = getRandomQuestions(
          questionsDoc.questionsDetails,
          10
        );

        // Save the selected questions to the student's assignedQuestions field
        student.assignedQuestions = randomQuestions.map((q) => ({
          questionId: q._id,
          questionText: q.question,
          choices: {
            a: q.choices.get("a"),
            b: q.choices.get("b"),
            c: q.choices.get("c"),
            d: q.choices.get("d"),
          },
          correctAnswer: q.answer,
          selectedAnswer: "",
        }));

        await student.save();
        delete otpStorage[email];

        // Prepare response
        return res.status(200).json({
          success: true,
          questions: randomQuestions.map((q) => ({
            questionId: q._id,
            question: q.question,
            choices: Object.fromEntries(q.choices),
            answer: q.answer,
          })),
          studentId: student._id,
          isComplete: student.isComplete,
        });
      } else {
        // Handle completed test case
        delete otpStorage[email];
        return res.status(200).json({
          success: true,
          message: "Existing user verified successfully",
          isExistingUser: true,
          student: student,
          isComplete: "completed",
        });
      }
    }
    // Handle new user
    else {
      const newStudent = await studentModel.create({
        ...storedOtpData.userData,
        email,
      });

      const questionsDoc = await Question.findOne({
        category: newStudent.category,
      });

      if (!questionsDoc || !questionsDoc.questionsDetails) {
        throw new Error("No questions found for this category");
      }

      // Get 10 random questions from questionsDetails array
      const randomQuestions = getRandomQuestions(
        questionsDoc.questionsDetails,
        10
      );

      // Save the selected questions to the new student's assignedQuestions field
      newStudent.assignedQuestions = randomQuestions.map((q) => ({
        questionId: q._id, // Specific question ID
        questionText: q.question,
        choices: {
          a: q.choices.get("a"),
          b: q.choices.get("b"),
          c: q.choices.get("c"),
          d: q.choices.get("d"),
        },
        correctAnswer: q.answer,
        selectedAnswer: "",
      }));

      await newStudent.save();
      delete otpStorage[email];

      // Prepare response
      return res.status(201).json({
        isComplete: "pending",
        success: true,
        questions: randomQuestions.map((q) => ({
          questionId: q._id,
          question: q.question,
          choices: Object.fromEntries(q.choices),
          answer: q.answer,
        })),
        studentId: newStudent._id,
      });
    }
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: err.message,
    });
  }
};

// Get questions for student
const getQuestions = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await studentModel.findById(studentId);

    if (student.isComplete === "completed") {
      return res.status(400).json({});
    }

    const questions = await Question.findOne({ category: student.category });

    res.status(200).json({
      success: true,
      questions: questions,
      studentId: student._id,
    });
  } catch (err) {
    console.error("Get questions error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to get questions",
      error: err.message,
    });
  }
};

// Update student results
const updateResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    // Validate student ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid student ID" });
    }

    // Find student
    const student = await studentModel.findById(id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    // Process answers
    if (Array.isArray(answers)) {
      answers.forEach((answer) => {
        const question = student.assignedQuestions.find(
          (q) => q.questionId.toString() === answer.questionId
        );

        if (
          question &&
          ["a", "b", "c", "d", ""].includes(answer.selectedAnswer)
        ) {
          question.selectedAnswer = answer.selectedAnswer;

          if (answer.selectedAnswer === "") {
            skipped++;
            question.isCorrect = null;
          } else if (answer.selectedAnswer === question.correctAnswer) {
            correct++;
            question.isCorrect = true;
          } else {
            wrong++;
            question.isCorrect = false;
          }
        }
      });

      student.markModified("assignedQuestions");

      // Score calculation
      const totalQuestions = student.assignedQuestions.length;
      const score =
        totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

      student.correctAnswers = correct;
      student.wrongAnswers = wrong;
      student.skippedAnswers = skipped;
      student.score = score;
      student.isComplete = "completed";

      await student.save();

      res.status(200).json({
        success: true,
        message: "Results updated successfully",
        correctAnswers: student.correctAnswers,
        wrongAnswers: student.wrongAnswers,
        skippedAnswers: student.skippedAnswers,
        score: student.score,
        discount: student.discount,
        updatedAnswers: student.assignedQuestions.map((q) => ({
          questionId: q.questionId,
          selectedAnswer: q.selectedAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect: q.isCorrect,
        })),
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Answers must be an array" });
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update answers",
      error:
        process.env.NODE_ENV === "development" ? err.message : "Server error",
    });
  }
};

module.exports = {
  getAllStudents,
  createDetails,
  verifyOtpAndCreateStudent,
  updateResult,
  getQuestions,
};
