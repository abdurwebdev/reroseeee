const mongoose =  require('mongoose');

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    message: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);
