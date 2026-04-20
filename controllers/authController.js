
const User = require('../models/User'); 
const bcrypt = require('bcrypt');

// các hàm xử lí đăng kí
exports.register = async(req, res) => {
    try {
        const { username, email, password } = req.body; 

        const existingUser = await User.findOne({email: email});
        if(existingUser){
            return res.send('Lỗi: Email này đã được đăng ký!');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await User.create({
            username: username,
            email: email,
            password: hashedPassword, 
        });

        console.log('Đã tạo user thành công: ' + username);
        res.redirect('/login'); 

    } catch (error){
        console.error(error);
        res.send('Có lỗi xảy ra: ' + error.message);
    }
};

exports.login = async(req, res) => {
    try {
        const {email, password} = req.body; 

        const user = await User.findOne({email: email});

        if(!user){
            return res.send("Lỗi: Email chưa được đăng ký!");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.send("Lỗi: Mật khẩu không đúng!");
        }

        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        console.log("Đăng nhập thành công:", user.username);

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

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if(err){
            console.log("Lỗi khi đăng xuất: ", err);
            return res.send("Lỗi khi đăng xuất!");
        } 
        console.log("Đăng xuất thành công");
        res.redirect('/login'); 
    });
};

exports.getRegisterPage = (req, res) => {
    res.render('register'); 
}

// hàm hiển thị trang đăng nhập
exports.getLoginPage = (req, res) => {
    res.render('login'); 
};

exports.getDashboard = (req, res) => {
        res.render('dashboard', {user: req.session.user}); 
};

exports.getAdminPage = async (req, res) => {
    try{
        const allUser = await User.find();
        res.render('admin', {
            user: req.session.user,
            users: allUser
        });
    } catch(error){
        console.error(error);
        res.send('Lỗi lấy danh sách User: ' + error.message);
    };
    
};

exports.getVerify2FAPage = (req, res) => {
    if (!req.session.tempUserId) {
        return res.redirect('/login');
    }
    res.render('verify-2fa', { error: null });
};

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
            req.session.user = {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            };
            delete req.session.tempUserId;

            console.log("Xác thực 2FA thành công cho user:", user.username);

            if (user.role === 'admin') {
                res.redirect('/admin');
            } else {
                res.redirect('/dashboard');
            }
        } else {
            res.render('verify-2fa', { error: 'Mã 2FA không chính xác, vui lòng thử lại.' });
        }
    } catch (error) {
        console.error(error);
        res.send("Lỗi hệ thống: " + error.message);
    }
};