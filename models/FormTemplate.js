const mongoose = require('mongoose');

// Định nghĩa schema cho từng trường trong form
const fieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'date', 'color', 'select'], 
    required: true 
  },
  order: { type: Number, default: 0 },
  required: { type: Boolean, default: false },
  options: [String] // Chỉ dùng khi type là 'select'
});

// Định nghĩa schema cho mẫu form
const formTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String },
  order: { type: Number, default: 0 },
  fields: [fieldSchema], // Mảng chứa cấu trúc các ô nhập liệu
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'draft'], default: 'draft' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FormTemplate', formTemplateSchema);