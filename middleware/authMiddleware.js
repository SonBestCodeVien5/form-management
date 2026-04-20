exports.isAuthenticated = (req, res, next) => {
    if(req.session && req.session.user){
        return next();
    } else{
        return res.redirect('/login');
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user){
        if(req.session.user.role === 'admin'){
            return next();
        } 
        else {
            return res.send('Bạn không có quyền truy cập trang này!');
        }
    }
    else {
        res.redirect('/login');
    }
};