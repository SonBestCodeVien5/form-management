// middleware/authMiddleware.js
// đây là file middleware để kiểm tra xác thực người dùng
 
exports.isAuthenticated = (req, res, next) => {
    // kiểm tra có thẻ session hợp lệ không
    if(req.session && req.session.user){
        // đã đăng nhập, cho phép tiếp tục
        // next() để chuyển sang middleware hoặc route handler tiếp theo
        return next();
    } else{
        // chưa có thẻ, chuyển hướng về trang đăng nhập
        return res.redirect('/login');
    }
};

// hàm kiểm tra vai trò 
exports.isAdmin = (req, res, next) => {
    // kiểm tra user đã đăng nhập chưa 
    if (req.session && req.session.user){
        // kiểm tra role 
        if(req.session.user.role === 'admin'){
            return next();
        } 
        else {
            return res.send('⛔ Bạn không có quyền truy cập trang này!');
        }
    }
    else {
        res.redirect('/login');
    }
};