const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['junior', 'senior', 'UG', 'PG']
    },
    questionsDetails: [{
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true,
            validate: {
                validator: function (v) {
                    return ['a', 'b', 'c', 'd'].includes(v);
                },
                message: props => `Answer must be one of: a, b, c, d`
            }
        },
        choices: {
            type: Map,
            of: String,
            required: true,
            validate: {
                validator: function (v) {
                    return v.size === 4;
                },
                message: props => `Must have exactly 4 choices`
            }
        }
    }]
}, { timestamps: true });

// Convert choices array to Map if needed
questionSchema.pre('save', function (next) {
    this.questionsDetails.forEach(question => {
        if (Array.isArray(question.choices)) {
            const choiceMap = new Map();
            const letters = ['a', 'b', 'c', 'd'];
            
            question.choices.forEach((value, index) => {
                if (index < 4) {
                    choiceMap.set(letters[index], value);
                }
            });

            question.choices = choiceMap;
        }
    });
    next();
});

module.exports = mongoose.model('Question', questionSchema);