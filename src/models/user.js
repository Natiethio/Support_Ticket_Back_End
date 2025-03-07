const mongoose = require("../Configration/dbConfig")

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    sex: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
