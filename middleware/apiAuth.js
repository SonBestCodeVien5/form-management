// middleware/apiAuth.js
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    // lấy token từ header gửi lên 
    // client gửi dạng: "Authorization: Bearer <chuoi token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // lấy phần sau của Bearer

    // nếu không có token => đuổi về 
    if(!token) {
        return res.status(401).json({message: 'Không có quyền truy cập (Thiếu Token)'});
    }

    try{
        // kiểm tra token và giải mã bí mật 
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // nếu là thật => gắn thông tin giải mã vào req để các middleware sau dùng
        req.user = decoded;
        next();

    } catch(error) {
        // token không hợp lệ 
        return res.status(403).json({message: 'Token không hợp lệ hoặc đã hết hạn'});
    }
}