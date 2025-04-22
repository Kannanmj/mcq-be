const Question = require("../model/questions");

async function createQuestion(req, res) {
  try {
    const { category, questionsDetails } = req.body;

    // Validate required fields
    if (!category || !questionsDetails || !Array.isArray(questionsDetails)) {
      return res.status(400).json({
        success: false,
        message: "Category and an array of questionsDetails are required.",
      });
    }

    // Validate each question in the array
    const validatedQuestions = [];
    const letters = ["a", "b", "c", "d"];

    for (const questionDetail of questionsDetails) {
      // Validate individual question fields
      if (
        !questionDetail.question ||
        !questionDetail.answer ||
        !questionDetail.choices
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Each question must have question, answer, and choices fields.",
        });
      }

      // Check if choices is an array
      if (!Array.isArray(questionDetail.choices)) {
        return res.status(400).json({
          success: false,
          message: "Choices must be provided as an array for each question.",
        });
      }

      if (questionDetail.choices.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Exactly 4 choices are required for each question.",
        });
      }

      // Transform choices array into mapped object
      const mappedChoices = {};
      questionDetail.choices.forEach((choice, index) => {
        mappedChoices[letters[index]] = choice;
      });

      // Validate that answer is one of the choice keys
      if (!letters.includes(questionDetail.answer)) {
        return res.status(400).json({
          success: false,
          message: "Answer must be one of: a, b, c, d for each question.",
        });
      }

      validatedQuestions.push({
        question: questionDetail.question,
        answer: questionDetail.answer,
        choices: mappedChoices,
      });
    }

    // Delete existing category if it exists
    await Question.deleteMany({ category });

    // Create new category with the questions
    const newQuestion = await Question.create({
      category,
      questionsDetails: validatedQuestions,
    });

    return res.status(201).json({
      success: true,
      message: "Category questions cleared and new questions created.",
      data: newQuestion,
    });
  } catch (err) {
    // Handle validation errors (e.g., invalid category)
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add questions.",
      error: err.message,
    });
  }
}

async function getQuestions(req, res) {
  try {
    const data = await Question.find();
    res.status(200).json({ data });
  } catch (err) {
    res.status(500).json({ message: "Some internal error occurred" });
  }
}

module.exports = { createQuestion, getQuestions };
