/**
 * Hàm kiểm tra tính hợp lệ của dữ liệu nộp lên so với Template
 * @param {Object} template - Toàn bộ Schema của Form do Admin định nghĩa
 * @param {Object} submittedAnswers - Object chứa câu trả lời từ Client (key là fieldId)
 */
const validateSubmission = (template, submittedAnswers) => {
    const answers = submittedAnswers && typeof submittedAnswers === 'object' ? submittedAnswers : {};
    const errors = [];
    const processedAnswers = [];

    if (!submittedAnswers || typeof submittedAnswers !== 'object') {
        errors.push('Thiếu dữ liệu answers hoặc sai định dạng.');
    }

    // Duyệt qua từng field trong bản thiết kế (Template)
    template.fields.forEach((field) => {
        // Lấy giá trị người dùng gửi lên dựa theo ID của field
        const userValue = answers[String(field._id)];

        // 1. Kiểm tra trường bắt buộc (Required)
        if (field.required && (userValue === undefined || userValue === null || userValue === '')) {
            errors.push(`Trường "${field.label}" không được để trống.`);
            return;
        }

        // 2. Kiểm tra kiểu dữ liệu cơ bản (Data Type)
       if (userValue !== undefined && userValue !== '') {
            switch (field.type) {
                case 'number':
                    if (isNaN(Number(userValue))) errors.push(`"${field.label}" phải là số.`);
                    break;
                case 'date':
                    if (isNaN(Date.parse(userValue))) errors.push(`"${field.label}" không đúng định dạng ngày.`);
                    break;
                case 'color':
                    const isHexColor = /^#[0-9A-F]{6}$/i.test(userValue);
                    if (!isHexColor) errors.push(`"${field.label}" phải là mã màu Hex hợp lệ.`);
                    break;
                case 'select':
                    if (!field.options.includes(userValue)) {
                        errors.push(`Giá trị "${userValue}" không nằm trong danh sách lựa chọn của "${field.label}".`);
                    }
                    break;
            }
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