const mongoose = require('mongoose');

// Định nghĩa schema cho câu trả lời của từng trường trong form
const answerSchema = new mongoose.Schema({
    // lưu label thay vì _id để tránh thay đổi label (snapshot)
    fieldLabel: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed } // Chấp nhận cả String, Number, Date...
});

// Định nghĩa schema cho bản ghi nộp form
const formSubmissionSchema = new mongoose.Schema({
    templateId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FormTemplate', 
        required: true 
    },
    employeeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    answers: [answerSchema],
    status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
    },
    adminNote: { type: String, default: '' },
    submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormSubmission', formSubmissionSchema);