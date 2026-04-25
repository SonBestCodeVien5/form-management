const FormTemplate = require('../models/FormTemplate');

// 1. [GET] /api/forms - Lấy danh sách form (Không lấy chi tiết fields để load cho nhanh)
exports.getAllForms = async (req, res) => {
  try {
    // select('-fields') nghĩa là loại bỏ mảng fields ra khỏi kết quả trả về
    const forms = await FormTemplate.find().select('-fields').sort({ order: 1, createdAt: -1 });
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// 2. [POST] /api/forms - Tạo form mới (Chỉ tạo vỏ ngoài, chưa có fields)
exports.createForm = async (req, res) => {
  try {
    const { title, description, order, status } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Thiếu tiêu đề Form' });
    }

    const newForm = await FormTemplate.create({
      title,
      description,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      status: status || 'draft',
      createdBy: req.session.user._id,
      fields: [] // Khởi tạo mảng rỗng, Admin sẽ add field sau (API 3.2)
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
    const { title, description, order, status } = req.body;
    const updateData = {
      title,
      description,
      status
    };

    if (order !== undefined) {
      updateData.order = Number(order);
    }

    const updatedForm = await FormTemplate.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // new: true để trả về data mới sau khi update
    ).select('-fields');

    if (!updatedForm) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

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
    const form = await FormTemplate.findById(req.params.id);

    if (!form) return res.status(404).json({ success: false, message: 'Không tìm thấy Form' });

    // Đẩy field mới vào mảng fields
    form.fields.push({ label, type, order, required, options });
    await form.save();

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

    // Tìm field con bằng ID của nó (_id trong mảng fields)
    const field = form.fields.id(fid);
    if (!field) return res.status(404).json({ success: false, message: 'Không tìm thấy Field' });

    // Cập nhật các giá trị mới
    field.label = req.body.label || field.label;
    field.type = req.body.type || field.type;
    field.order = req.body.order ?? field.order;
    field.required = req.body.required ?? field.required;
    field.options = req.body.options || field.options;

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

    // Xóa field khỏi mảng
    form.fields.pull({ _id: fid });
    await form.save();

    res.status(200).json({ success: true, message: 'Xóa field thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa field' });
  }
};

// [GET] /api/forms/active
exports.getActiveForms = async (req, res) => {
    try {
        // Chỉ lấy các form có status là active và sắp xếp theo trường 'order' tăng dần
        const activeForms = await FormTemplate.find({ status: 'active' })
                                              .sort({ order: 1 })
                        .select('title description order fields'); // Chỉ lấy các field cần thiết cho nhân viên
        res.status(200).json({ success: true, data: activeForms });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách form.' });
    }
};

