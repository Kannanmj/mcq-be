const express = require("express");
const {
  createDetails,
  verifyOtpAndCreateStudent,
  updateResult,
  getAllStudents,
} = require("../controllers/studentDetails");
const { getQuestions } = require("../controllers/questions");
const router = express.Router();

router.get("/", getAllStudents);
router.post("/createDetails", createDetails);
router.post("/verification", verifyOtpAndCreateStudent);
router.patch("/update-student/:id", updateResult);
router.get("/questions/:studentId", getQuestions);

module.exports = router;
