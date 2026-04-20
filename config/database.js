const mongoose = require('mongoose'); 

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB đã kết nối thành công: ${conn.connection.host}`);
    } catch(error){
        console.log(`❌ Lỗi kết nối MongoDB: ${error.message}`)
    }
}; 

module.exports = connectDB;