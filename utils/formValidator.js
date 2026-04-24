/**
 * Hàm kiểm tra tính hợp lệ của dữ liệu nộp lên so với Template
 * @param {Object} template - Toàn bộ Schema của Form do Admin định nghĩa
 * @param {Object} submittedAnswers - Object chứa câu trả lời từ Client (key là fieldId)
 */
const validateSubmission = (template, submittedAnswers) => {
    const errors = [];
    const processedAnswers = [];

    // Duyệt qua từng field trong bản thiết kế (Template)
    template.fields.forEach((field) => {
        // Lấy giá trị người dùng gửi lên dựa theo ID của field
        const userValue = submittedAnswers[field._id];

        // 1. Kiểm tra trường bắt buộc (Required)
        if (field.required && (userValue === undefined || userValue === null || userValue === '')) {
            errors.push(`Trường "${field.label}" không được để trống.`);
            return;
        }

        // 2. Kiểm tra kiểu dữ liệu cơ bản (Data Type)
        if (userValue !== undefined && userValue !== '') {
            if (field.type === 'number' && isNaN(Number(userValue))) {
                errors.push(`Trường "${field.label}" phải là một con số.`);
            }
            // Có thể mở rộng kiểm tra định dạng Date hoặc Options của Select ở đây
        }

        // 3. Nếu mọi thứ ổn, "đóng gói" câu trả lời kèm Label (Snapshot)
        // Bước này cực quan trọng để lưu vào fieldLabel trong Model FormSubmission của bạn
        processedAnswers.push({
            fieldLabel: field.label, 
            value: userValue
        });
    });

    return {
        isValid: errors.length === 0,
        errors,
        processedAnswers
    };
};

module.exports = { validateSubmission };