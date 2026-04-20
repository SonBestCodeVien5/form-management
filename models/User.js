const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employee', 'admin'], // Chỉ dùng 2 role: Nhân viên và Admin
    default: 'employee'          // Mặc định tạo tài khoản là nhân viên
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 2. Tạo Model
const User = mongoose.model('User', userSchema);

// 3. Xuất khẩu
module.exports = User;