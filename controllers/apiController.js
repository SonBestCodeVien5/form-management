// controllers/apiController.js
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');

exports.login = async (req, res) => {
    try{
        // Lấy dữ liệu từ req.body
        const {email, password, totp} = req.body;

        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message: 'Email không tồn tại'});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Sai mật khẩu'});
        }

        // logic kiểm tra 2fa
        if(user.twoFactorEnabled){
            // nếu đã bật 2FA thì kiểm tra mã TOTP
            if(!totp){
                return res.status(400).json({
                    message: 'Vui lòng nhập mã xác thực 2 lớp (2FA)',
                    require2FA: true // báo cho client biết là cần mã 2FA
                });
            }

            // Kiểm tra mã TOTP nếu 2FA được bật
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: totp
            });

            if(!verified){
                return res.status(400).json({
                    message: 'Mã xác thực 2 lớp (2FA) không hợp lệ'
                });
            }

        }

        
        // tạo token(jwt) 
        // payload: thông tin gói bên trong token
        const payload = {
            userId: user._id,
            role: user.role
        }

        // kí tên đóng dấu bằng JWT_SECRET
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h' // token hết hạn trong 1 giờ
        });

        // trả về kết quả JSON
        res.json({
            message: 'Đăng nhập thành công',
            token: token, // client cần trả về cái này 
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
                twoFactorEnabled: user.twoFactorEnabled
            }
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Lỗi server: ' + error.message});
    }
};

// ... (Code login cũ ở trên giữ nguyên)

// Hàm mới: Lấy thông tin cá nhân (Chỉ dành cho ai có Token)
exports.getProfile = async (req, res) => {
    // Lúc này req.user đã có dữ liệu do Middleware gán vào
    res.json({
        message: 'Chào mừng bạn đến với khu vực VIP!',
        yourData: req.user, // Dữ liệu lấy từ trong Token ra
        secretInfo: 'Đây là dữ liệu mật chỉ admin/user đăng nhập mới thấy'
    });
};