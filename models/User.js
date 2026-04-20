// models/User.js
const mongoose = require('mongoose');

// 1. Tạo Schema (Bản vẽ quy định cấu trúc dữ liệu)
const userSchema = new mongoose.Schema({
  username: {
    type: String,       // Kiểu chữ
    required: true,     // Bắt buộc phải có
    unique: true,       // Không được trùng nhau
    trim: true,         // Tự động cắt khoảng trắng thừa
    minlength: 3        // Tối thiểu 3 ký tự
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true     // Tự động chuyển thành chữ thường
  },
  password: {
    type: String,
    required: true,
    minlength: 6        // Mật khẩu ít nhất 6 ký tự
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Chỉ chấp nhận 1 trong 2 giá trị này
    default: 'user'          // Mặc định là user thường
  },
  twoFactorSecret: { // Lưu trữ mã bí mật cho xác thực 2 lớp
    type: String,
    default: null
  },
  twoFactorEnabled: { // Trạng thái bật/tắt xác thực 2 lớp
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now   // Tự động lấy thời gian hiện tại
  }
});

// 2. Tạo Model từ Schema trên
// 'User' là tên Collection (Bảng) sẽ xuất hiện trong MongoDB
const User = mongoose.model('User', userSchema);

// 3. Xuất khẩu Model để dùng ở file khác (xuất khẩu toàn bộ, khác so với exports.function)
module.exports = User;