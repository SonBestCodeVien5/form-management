
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
