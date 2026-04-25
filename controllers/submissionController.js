const FormTemplate = require('../models/FormTemplate');
const FormSubmission = require('../models/FormSubmission');
const { validateSubmission } = require('../utils/formValidator');

// [POST] /api/forms/:id/submit hoặc /api/submissions/:templateId
exports.submitForm = async (req, res) => {
    try {
        const templateId = req.params.id || req.params.templateId;
        const submittedAnswers = req.body.answers; // Dạng: { "field_id_1": "giá trị", ... }

        if (!templateId) {
            return res.status(400).json({ success: false, message: 'Thiếu ID form.' });
        }

        // Tìm template và kiểm tra xem có đang Active không
        const template = await FormTemplate.findById(templateId);
        if (!template || template.status !== 'active') {
            return res.status(404).json({ success: false, message: 'Form không tồn tại hoặc chưa được kích hoạt.' });
        }

        // Chạy bộ lọc Validation đã viết ở file utils
        const validation = validateSubmission(template, submittedAnswers);

        // Trả về lỗi rõ ràng nếu dữ liệu không hợp lệ
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ.',
                errors: validation.errors
            });
        }

        // Nếu mọi thứ ổn, tạo bản ghi mới
        const newSubmission = await FormSubmission.create({
            templateId: template._id,
            employeeId: req.session.user._id, // Lấy từ Session sau khi login
            answers: validation.processedAnswers // Mảng đã được gán Label (Snapshot)
        });

        res.status(201).json({ 
            success: true, 
            message: 'Nộp biểu mẫu thành công!', 
            data: newSubmission 
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài.', error: error.message });
    }
};

// [GET] /api/submissions - Admin thấy tất cả, employee thấy của mình
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

// [GET] /api/submissions
exports.getMySubmissions = async (req, res) => {
    try {
        const submissions = await FormSubmission.find({ employeeId: req.session.user._id })
                                                .populate('templateId', 'title') // Để biết nộp cho form nào
                                                .sort({ submittedAt: -1 });
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy lịch sử nộp bài.' });
    }
};