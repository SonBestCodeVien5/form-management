// controllers/authController.js
// đây là file controller xử lí các yêu cầu liên quan đến xác thực
// gọi các mô đun cần thiết
const User = require('../models/User'); // mô hình người dùng
const bcrypt = require('bcrypt'); // để băm mật khẩu => chuỗi hash 

// các hàm xử lí đăng kí
exports.register = async(req, res) => {
    try {
        // bước A: nhận dữ liệu từ người dùng 
            // req.body chứa dữ liệu nhập trong form tại trang register
        const { username, email, password } = req.body; // destructure để lấy 3 trường cần thiết
                                                        // 3 trường từ form phải đúng tên như này

        // console.log("Dữ liệu nhận được từ form đăng kí:", req.body); 
        // ------------------------------ bật khi debug -----------------------------

        // bước B: kiểm tra email đã dùng chưa
        const existingUser = await User.findOne({email: email});
        if(existingUser){
            return res.send('Lỗi: Email này đã được đăng ký!');
        }

        // bước C: băm mật khẩu
            // tạo chuỗi ngẫu nhiên (salt) độ dài 10 ký tự
        const salt = await bcrypt.genSalt(10);
            // băm mật khẩu với salt
        const hashedPassword = await bcrypt.hash(password, salt);

        // bước D: tạo người dùng mới trong CSDL
        await User.create({
            username: username,
            email: email,
            password: hashedPassword, // lưu mật khẩu đã băm, TUYẾT ĐỐI KHÔNG LƯU MẬT KHẨU THÔ
            role: 'user'        
        });

        // bước E: phản hồi về client
        console.log('✅ Đã tạo user thành công: ' + username);
        res.redirect('/login'); // chuyển hướng về trang đăng nhập

    } catch (error){
        console.error(error);
        res.send('Có lỗi xảy ra: ' + error.message);
    }
};

// hàm xử lí đăng nhập
exports.login = async(req, res) => {
    try {
        // bước A: nhận dữ liệu từ người dùng
        const {email, password} = req.body; // truòng email và password từ form phải chính xác

        // 2. Tìm xem email này có trong kho không?
        const user = await User.findOne({email: email});

        // Nếu không tìm thấy user -> Báo lỗi
        if(!user){
            return res.send("Lỗi: Email chưa được đăng ký!");
        }

        // 3. So sánh mật khẩu nhập vào với mật khẩu đã mã hóa trong CSDL
        // bcrypt.compare(pass_nhập_vào, pass_đã_mã_hóa_trong_DB)
        const isMatch = await bcrypt.compare(password, user.password);

        // Nếu không khớp -> Báo lỗi
        if(!isMatch){
            return res.send("Lỗi: Mật khẩu không đúng!");
        }

        // 4. Kiểm tra 2FA có bật không
        if (user.twoFactorEnabled) {
            // Nếu bật 2FA, lưu tạm ID user vào session và chuyển hướng sang trang xác thực 2FA
            req.session.tempUserId = user._id;
            console.log("🔒 Yêu cầu xác thực 2FA cho user:", user.username);
            return res.redirect('/2fa/verify');
        }

        // 5. Cấp quyền đăng nhập (Nếu không bật 2FA)
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        console.log("✅ Đăng nhập thành công:", user.username);

        if(user.role === 'admin'){
            res.redirect('/admin');
        } else {
            res.redirect('/dashboard');
        }
    } catch (error) {
        console.error(error);
        res.send("Lỗi hệ thống: " + error.message);
    }
};

// hàm đăng xuất 
exports.logout = (req, res) => {
    // gọi lệnh hủy session (xé thẻ)
    req.session.destroy((err) => {
        if(err){
            console.log("Lỗi khi đăng xuất: ", err);
            return res.send("Lỗi khi đăng xuất!");
        } 
        // sau khi đăng xuất thành công
        console.log("✅ Đăng xuất thành công");
        // chuyển hướng về trang đăng nhập
        res.redirect('/login'); 
    });
};

// hàm hiển thị trang đăng kí
exports.getRegisterPage = (req, res) => {
    res.render('register'); // hiển thị trang register.ejs
}

// hàm hiển thị trang đăng nhập
exports.getLoginPage = (req, res) => {
    res.render('login'); // hiển thị trang login.ejs
};

// hàm hiển thị trang dashboard (dành cho user đã đăng nhập)
exports.getDashboard = (req, res) => {
    // // kiểm tra kho session xem có user không
    // if(req.session.user){
    //     // có thẻ: cho phép hiển thị dashboard
        res.render('dashboard', {user: req.session.user}); // do đã có middleware kiểm tra xác thực
    // } else {
    //     // không thẻ: chuyển hướng về trang đăng nhập
    //     res.redirect('/login');
    // }
};

// hàm hiển thị trang admin (role admin only)
exports.getAdminPage = async (req, res) => {
    try{
        // lấy tất cả user từ database
        // User.find() không truyền tham số => lấy tất
        const allUser = await User.find();

        // render trang admin và gửi danh sách user 
        res.render('admin', {
            user: req.session.user,
            users: allUser
        });
    } catch(error){
        console.error(error);
        res.send('Lỗi lấy danh sách User: ' + error.message);
    };
    
};

// Hàm hiển thị trang xác thực 2FA
exports.getVerify2FAPage = (req, res) => {
    // Kiểm tra xem có tempUserId không (tức là đã qua bước login 1)
    if (!req.session.tempUserId) {
        return res.redirect('/login');
    }
    res.render('verify-2fa', { error: null });
};

// Hàm xử lý xác thực mã 2FA sau khi login
exports.verify2FA = async (req, res) => {
    try {
        const { totp } = req.body;
        const tempUserId = req.session.tempUserId;

        if (!tempUserId) {
            return res.redirect('/login');
        }

        const user = await User.findById(tempUserId);
        if (!user) {
            return res.redirect('/login');
        }

        const speakeasy = require('speakeasy');
        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: totp
        });

        if (verified) {
            // Xác thực thành công -> Tạo session chính thức
            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            // Xóa tempUserId
            delete req.session.tempUserId;

            console.log("✅ Xác thực 2FA thành công cho user:", user.username);

            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/dashboard');
            }
        } else {
            // Sai mã -> Render lại trang với thông báo lỗi
            res.render('verify-2fa', { error: 'Mã 2FA không chính xác, vui lòng thử lại.' });
        }
    } catch (error) {
        console.error(error);
        res.send("Lỗi hệ thống: " + error.message);
    }
};