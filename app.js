const express = require('express'); // khởi tạo express từ package đã cài
const app = express(); // khởi tạo app từ express
const session = require('express-session'); // import thư viện quản lí session 

require('dotenv').config(); // Đọc file .env
const connectDB = require('./config/database'); // Gọi file cấu hình DB

const authRoutes = require('./routes/authRoutes'); // Gọi các route liên quan đến xác thực
const formRoutes = require('./routes/formRoutes'); // Gọi các route liên quan đến form
const submissionRoutes = require('./routes/submissionRoutes'); // Gọi các route liên quan đến nộp bài
const { isAuthenticated, isAdmin } = require('./middleware/authMiddleware');
const FormTemplate = require('./models/FormTemplate');
const FormSubmission = require('./models/FormSubmission');

connectDB(); // Thực hiện kết nối ngay lập tức tới DB

const port = process.env.PORT || 3000; // nếu không có PORT trong .env thì dùng 3000

// --- 2. MIDDLEWARE CƠ BẢN ---
// bóc tách dữ liệu từ request gửi lên
app.use(express.urlencoded({ extended: true })); // xử lý dữ liệu form gửi lên
app.use(express.json()); // xử lý dữ liệu json gửi lên
app.use(express.static('public')); // serve static files (css, js, images)

// method override đơn giản qua query string: ?_method=PUT | DELETE
app.use((req, res, next) => {
  if (req.method === 'POST' && req.query && req.query._method) {
    req.method = req.query._method.toUpperCase();
  }
  next();
});

// Thiết lập EJS làm view engine
app.set('view engine', 'ejs'); // sử dụng ejs làm view engine lấy từ package đã cài
app.set('views', './views'); // thư mục chứa file ejs

//Thiết lập cấu hình session (đặt trước Routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'default_secret_key', // khóa bí mật dùng để mã hóa session
  resave: false, // không lưu lại session nếu không có thay đổi
  saveUninitialized: true, // lưu session mới chưa có thay đổi hay session rỗng 
  cookie: {
    maxAge: 60 * 60 * 1000, // thời gian sống của cookie (ms)
    httpOnly: true // chỉ cho phép truy cập cookie qua HTTP, không cho truy cập bằng JavaScript
    // secure: false ------- // mặc định là false để chạy được localhost 
  }
}));

// --- 3. ROUTES ---
app.get('/', (req, res) => { // get phải giống hệt là '/'
  res.render('home'); // Tìm file views/home.ejs
});

app.use('/', authRoutes); // Sử dụng các route liên quan đến xác thực (đăng nhập, đăng ký, đăng xuất)
app.use('/api/forms', formRoutes); // Sử dụng các route liên quan đến form
app.use('/api/submissions', submissionRoutes); // Sử dụng các route liên quan đến nộp bài
                          
// --- 3.1 FRONTEND ROUTES (EJS) ---
app.get('/forms', isAuthenticated, async (req, res) => {
  try {
    const forms = await FormTemplate.find({ status: 'active' }).lean();
    res.render('forms-list', { user: req.session.user, forms });
  } catch (error) {
    res.status(500).send('Lỗi khi tải danh sách form');
  }
});

app.get('/forms/:id', isAuthenticated, async (req, res) => {
  try {
    const form = await FormTemplate.findById(req.params.id).lean();
    if (!form) return res.redirect('/forms');

    res.render('form', { form, user: req.session.user });
  } catch (error) {
    res.status(500).send('Lỗi khi tải chi tiết form');
  }
});

app.get('/admin/forms', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const forms = await FormTemplate.find().sort({ createdAt: -1 }).lean();
    res.render('admin-forms', { user: req.session.user, forms });
  } catch (error) {
    res.status(500).send('Lỗi khi tải trang quản lý form');
  }
});

app.get('/admin/forms/:id/edit', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const form = await FormTemplate.findById(req.params.id).lean();
    if (!form) return res.redirect('/admin/forms');

    res.render('admin-form-edit', {
      form,
      user: req.session.user,
      successMessage: req.query.success || ''
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải trang chỉnh sửa form');
  }
});

app.post('/admin/forms/create', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).send('Thiếu tiêu đề form');
    }

    await FormTemplate.create({
      title: title.trim(),
      description: description || '',
      status: status === 'active' ? 'active' : 'draft',
      createdBy: req.session.user.id,
      fields: []
    });

    return res.redirect('/admin/forms');
  } catch (error) {
    return res.status(500).send('Lỗi khi tạo form mới');
  }
});

app.get('/submissions', isAuthenticated, async (req, res) => {
  try {
    const query = req.session.user.role === 'admin'
      ? {}
      : { employeeId: req.session.user.id };

    const submissions = await FormSubmission.find(query)
      .populate('templateId', 'title')
      .populate('employeeId', 'username email')
      .sort({ submittedAt: -1 })
      .lean();

    res.render('submissions-list', {
      user: req.session.user,
      submissions,
      successMessage: req.query.success || ''
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải danh sách submissions');
  }
});

app.get('/submissions/:id', isAuthenticated, async (req, res) => {
  try {
    const submission = await FormSubmission.findById(req.params.id)
      .populate('templateId', 'title')
      .populate('employeeId', 'username email')
      .lean();

    if (!submission) return res.redirect('/submissions');

    const isOwner = String(submission.employeeId?._id) === String(req.session.user.id);
    if (req.session.user.role !== 'admin' && !isOwner) {
      return res.status(403).send('Bạn không có quyền xem submission này');
    }

    res.render('submission-detail', {
      user: req.session.user,
      submission,
      successMessage: req.query.success || ''
    });
  } catch (error) {
    res.status(500).send('Lỗi khi tải chi tiết submission');
  }
});

// --- 4. KHỞI ĐỘNG SERVER ---
app.listen(port, () => {
  console.log(`Server đang chạy tại: http://localhost:${port}`);
  console.log('Nhấn Ctrl+C để tắt server');
});