const express = require('express');
const { createQuestion, getQuestions } = require('../controllers/questions');
const router = express.Router();

router.post('/createQuestion', createQuestion);
router.get('/getQuestion', getQuestions);

module.exports = router;