// cotrollers/twoFactorController.js
const User = require('../models/User');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

// Hàm tạo Secret và mã QR cho 2FA
exports.setup2FA = async (req, res) => {
    try {
        // Lấy thông tin user hiện tại
        // userId được lấy từ session hoặc token
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({message: 'User không tồn tại'});
        }

        // Tạo secret cho 2FA
        const secret = speakeasy.generateSecret({
            name: `Project_1 (${user.email})`
        });

        // tạo mã QR từ secret
        const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

        // Lưu secret vào database (chỉ lưu secret.base32)
        user.twoFactorSecret = secret.base32;
        await user.save();

        // Trả về mã QR và secret (thường chỉ trả về mã QR cho user quét)
        res.json({
            message: 'Quét mã này bằng Google Authenticator',
            secret: secret.base32,
            qrcode: qrCodeUrl
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Lỗi server: ' + error.message});
    }
};

// Hàm xác thực mã 2FA
exports.verify2FA = async (req, res) => {
    try{
        const {totp} = req.body; // totp là mã 6 số từ app Google Authenticator
        const userId = req.user.userId; // lấy userId từ session hoặc token
 
        const user = await User.findById(userId);
        if(!user) {
            return res.status(404).json({message: 'User không tồn tại'});
        }

        const verified = speakeasy.totp.verify({ // kiểm tra mã 2FA
            secret: user.twoFactorSecret, // lấy từ database
            encoding: 'base32', // định dạng của secret
            token: totp // mã 6 số từ user nhập vào
        });

        if(verified){
            // nếu đúng thì bật 2FA cho user
            user.twoFactorEnabled = true;
            await user.save();
            res.json({message: 'Bật 2FA thành công'});
        } else {
            res.status(400).json({message: 'Mã 2FA không đúng'});
        }
    } 
    catch(error){
        console.error(error);
        res.status(500).json({message: 'Lỗi server: ' + error.message});
    }
}