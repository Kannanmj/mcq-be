const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone_number: {
        type: String,
        required: true,
        unique: true,
    },
    email: { 
        type: String,
    },
    category: {
        type: String,
        required: true,
        enum: ['junior', 'senior', 'UG', 'PG'],
    },
    correctAnswers: {
        type: Number,
        default: 0,
    },
    wrongAnswers: {
        type: Number,
        default: 0,
    },
    skippedAnswers: {
        type: Number,
        default: 0,
    },
    score: {
        type: Number,
        min: 0,
        max: 100
    },
    discount: {
        type: Number,
        default: 0
    },
    isComplete: {
        type: String,
        enum: ["pending", "completed"],
        default: "pending"
    },
    assignedQuestions: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        questionId: {},
        questionText: {
            type: String,
            required: true
        },
        isCorrect:{},
        choices: {
            a: { type: String, required: true },
            b: { type: String, required: true },
            c: { type: String, required: true },
            d: { type: String, required: true }
        },
        correctAnswer: {
            type: String,
            required: true,
            enum: ['a', 'b', 'c', 'd']
        },
        selectedAnswer: {
            type: String,
            default: "",
            enum: ['', 'a', 'b', 'c', 'd'] 
        }
    }]
}, {
    timestamps: true
});

studentSchema.pre('save', function (next) {
    if (this.score !== undefined && this.score !== null) {
        if (this.score >= 80) {
            this.discount = 30;
        } else if (this.score >= 40) {
            this.discount = 20;
        } else {
            this.discount = 10;
        }
    }
    next();
});

module.exports = mongoose.model('Student', studentSchema);