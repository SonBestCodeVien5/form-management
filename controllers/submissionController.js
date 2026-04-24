const FormTemplate = require('../models/FormTemplate');
const FormSubmission = require('../models/FormSubmission');
const { validateSubmission } = require('../utils/formValidator');

// 1. [POST] /api/submissions/:templateId - Nhân viên nộp bài
exports.submitForm = async (req, res) => {
    try {
        const { templateId } = req.params;
        const submittedAnswers = req.body.answers; // Dạng: { "field_id_1": "giá trị", ... }

        // Tìm template và kiểm tra xem có đang Active không
        const template = await FormTemplate.findById(templateId);
        if (!template || template.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Biểu mẫu không tồn tại hoặc đã đóng.' });
        }

        // Chạy bộ lọc Validation đã viết ở file utils
        const validation = validateSubmission(template, submittedAnswers);

        if (!validation.isValid) {
            return res.status(400).json({ success: false, errors: validation.errors });
        }

        // Nếu mọi thứ ổn, tạo bản ghi mới
        const newSubmission = new FormSubmission({
            templateId: template._id,
            employeeId: req.session.user._id, // Lấy từ Session sau khi login
            answers: validation.processedAnswers // Mảng đã được gán Label (Snapshot)
        });

        await newSubmission.save();

        res.status(201).json({ 
            success: true, 
            message: 'Nộp biểu mẫu thành công!', 
            data: newSubmission 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài.', error: error.message });
    }
};

// 2. [GET] /api/submissions - Xem lịch sử nộp bài
exports.getSubmissions = async (req, res) => {
    try {
        let query = {};
        
        // Nếu là Employee, chỉ cho xem bài của chính họ
        if (req.session.user.role !== 'admin') {
            query.employeeId = req.session.user._id;
        }

        const submissions = await FormSubmission.find(query)
            .populate('templateId', 'title') // Lấy thêm tên Form để hiển thị
            .populate('employeeId', 'username email') // Lấy thông tin người nộp
            .sort({ submittedAt: -1 });

        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Không thể lấy dữ liệu nộp bài.' });
    }
};