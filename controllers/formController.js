const FormTemplate = require('../models/FormTemplate');
const FormSubmission = require('../models/FormSubmission');

const ALLOWED_FIELD_TYPES = ['text', 'number', 'date', 'color', 'select'];
const ALLOWED_SUBMISSION_STATUS = ['approved', 'rejected'];

const isValidHexColor = (value) => {
  if (typeof value !== 'string') return false;
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value);
};

const normalizeAnswerInput = (answers) => {
  if (Array.isArray(answers)) return answers;

  if (answers && typeof answers === 'object') {
    return Object.entries(answers).map(([fieldId, value]) => ({ fieldId, value }));
  }

  return null;
};

const validateValueByType = (field, value) => {
  if (value === undefined || value === null || value === '') {
    return !field.required;
  }

  switch (field.type) {
    case 'text':
      return typeof value === 'string';

    case 'number': {
      const numberValue = Number(value);
      return !Number.isNaN(numberValue);
    }

    case 'date': {
      const dateValue = new Date(value);
      return !Number.isNaN(dateValue.getTime());
    }

    case 'color':
      return isValidHexColor(value);

    case 'select':
      return field.options.includes(value);

    default:
      return false;
  }
};

// 1. [GET] /api/forms - Lấy danh sách form (Không lấy chi tiết fields để load cho nhanh)
exports.getAllForms = async (req, res) => {
  try {
    const forms = await FormTemplate.find().select('-fields').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// 2. [POST] /api/forms - Tạo form mới (Chỉ tạo vỏ ngoài, chưa có fields)
exports.createForm = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Thiếu tiêu đề Form' });
    }

    const newForm = await FormTemplate.create({
      title,
      description,
      status: status || 'draft',
      createdBy: req.session.user.id,
      fields: []
    });

    res.status(201).json({ success: true, data: newForm });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi tạo form' });
  }
};

// 3. [GET] /api/forms/:id - Lấy chi tiết 1 form (Bao gồm cả mảng fields bên trong)
exports.getFormById = async (req, res) => {
  try {
    const form = await FormTemplate.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    res.status(200).json({ success: true, data: form });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi ID hoặc server' });
  }
};

// 4. [PUT] /api/forms/:id - Cập nhật thông tin chung của Form (Không sửa fields ở đây)
exports.updateForm = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const updatedForm = await FormTemplate.findByIdAndUpdate(
      req.params.id,
      { title, description, status },
      { new: true, runValidators: true }
    ).select('-fields');

    if (!updatedForm) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    const successRedirect = `/admin/forms/${req.params.id}/edit?success=${encodeURIComponent('Cập nhật form thành công')}`;
    if ((req.headers.accept || '').includes('text/html')) {
      return res.redirect(successRedirect);
    }
    res.status(200).json({ success: true, data: updatedForm });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật' });
  }
};

// 5. [DELETE] /api/forms/:id - Xóa form
exports.deleteForm = async (req, res) => {
  try {
    const deletedForm = await FormTemplate.findByIdAndDelete(req.params.id);
    if (!deletedForm) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    res.status(200).json({ success: true, message: 'Xóa form thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server khi xóa' });
  }
};

// === QUẢN LÝ FIELDS (3.2) ===

// 1. [POST] /api/forms/:id/fields - Thêm 1 field mới vào Form
exports.addField = async (req, res) => {
  try {
    const { label, type, order, required, options } = req.body;

    if (!label || !type) {
      return res.status(400).json({ success: false, message: 'Thiếu label hoặc type của field' });
    }

    if (!ALLOWED_FIELD_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Field type không hợp lệ' });
    }

    if (type === 'select' && (!Array.isArray(options) || options.length === 0)) {
      return res.status(400).json({ success: false, message: 'Field select cần options không rỗng' });
    }

    const form = await FormTemplate.findById(req.params.id);
    if (!form) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    form.fields.push({
      label,
      type,
      order,
      required,
      options: type === 'select' ? options : []
    });

    await form.save();

    const successRedirect = `/admin/forms/${req.params.id}/edit?success=${encodeURIComponent('Thêm field thành công')}`;
    if ((req.headers.accept || '').includes('text/html')) {
      return res.redirect(successRedirect);
    }

    res.status(201).json({ success: true, data: form.fields });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi thêm field' });
  }
};

// 2. [PUT] /api/forms/:id/fields/:fid - Cập nhật 1 field cụ thể
exports.updateField = async (req, res) => {
  try {
    const { id, fid } = req.params;
    const form = await FormTemplate.findById(id);
    if (!form) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    const field = form.fields.id(fid);
    if (!field) return res.status(404).json({ success: false, message: 'Không tìm thấy Field' });

    if (req.body.type && !ALLOWED_FIELD_TYPES.includes(req.body.type)) {
      return res.status(400).json({ success: false, message: 'Field type không hợp lệ' });
    }

    field.label = req.body.label || field.label;
    field.type = req.body.type || field.type;
    field.order = req.body.order ?? field.order;
    field.required = req.body.required ?? field.required;

    if (field.type === 'select') {
      if (req.body.options && (!Array.isArray(req.body.options) || req.body.options.length === 0)) {
        return res.status(400).json({ success: false, message: 'Field select cần options không rỗng' });
      }
      field.options = req.body.options || field.options;
    } else {
      field.options = [];
    }

    await form.save();
    res.status(200).json({ success: true, data: field });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật field' });
  }
};

// 3. [DELETE] /api/forms/:id/fields/:fid - Xóa 1 field
exports.deleteField = async (req, res) => {
  try {
    const { id, fid } = req.params;
    const form = await FormTemplate.findById(id);
    if (!form) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    form.fields.pull({ _id: fid });
    await form.save();

    res.status(200).json({ success: true, message: 'Xóa field thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa field' });
  }
};

// === SUBMISSION FLOW (3.3) ===

// 1. [GET] /api/forms/active - Employee lấy danh sách form đang active
exports.getActiveForms = async (req, res) => {
  try {
    const forms = await FormTemplate.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .lean();

    const normalized = forms.map((form) => ({
      ...form,
      fields: [...form.fields].sort((a, b) => (a.order || 0) - (b.order || 0))
    }));

    res.status(200).json({ success: true, data: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy form active' });
  }
};

// 2. [POST] /api/forms/:id/submit - Employee nộp form
exports.submitForm = async (req, res) => {
  try {
    const form = await FormTemplate.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });
    }

    if (form.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Chỉ được nộp form đang active' });
    }

    const rawAnswers = normalizeAnswerInput(req.body.answers);
    if (!rawAnswers) {
      return res.status(400).json({ success: false, message: 'answers phải là object hoặc array' });
    }

    const fieldMap = new Map(form.fields.map((field) => [String(field._id), field]));
    const answerMap = new Map();

    for (const item of rawAnswers) {
      if (!item || !item.fieldId) continue;
      answerMap.set(String(item.fieldId), item.value);
    }

    const answersToSave = [];

    for (const field of form.fields) {
      const fieldId = String(field._id);
      const value = answerMap.get(fieldId);

      if (!validateValueByType(field, value)) {
        return res.status(400).json({
          success: false,
          message: `Dữ liệu không hợp lệ cho field: ${field.label}`
        });
      }

      if (value !== undefined && value !== null && value !== '') {
        answersToSave.push({
          fieldLabel: field.label,
          value
        });
      }
    }

    for (const [submittedFieldId] of answerMap.entries()) {
      if (!fieldMap.has(submittedFieldId)) {
        return res.status(400).json({
          success: false,
          message: `Field không tồn tại trong template: ${submittedFieldId}`
        });
      }
    }

    const submission = await FormSubmission.create({
      templateId: form._id,
      employeeId: req.session.user.id,
      answers: answersToSave,
      status: 'pending'
    });

    if ((req.headers.accept || '').includes('text/html')) {
      return res.redirect('/submissions?success=' + encodeURIComponent('Nộp form thành công'));
    }

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi nộp form' });
  }
};

// 3. [GET] /api/forms/submissions - Lấy lịch sử nộp form
exports.getSubmissions = async (req, res) => {
  try {
    const query = req.session.user.role === 'admin'
      ? {}
      : { employeeId: req.session.user.id };

    const submissions = await FormSubmission.find(query)
      .populate('templateId', 'title status')
      .populate('employeeId', 'username email')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách submissions' });
  }
};

// 4. [PUT] /api/forms/submissions/:id/status - Admin duyệt/từ chối
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    if (!ALLOWED_SUBMISSION_STATUS.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status chỉ chấp nhận approved hoặc rejected'
      });
    }

    const updated = await FormSubmission.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || ''
      },
      { new: true, runValidators: true }
    )
      .populate('templateId', 'title')
      .populate('employeeId', 'username email');

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy submission' });
    }

    if ((req.headers.accept || '').includes('text/html')) {
      return res.redirect('/submissions/' + req.params.id + '?success=' + encodeURIComponent('Cập nhật trạng thái thành công'));
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái submission' });
  }
};
