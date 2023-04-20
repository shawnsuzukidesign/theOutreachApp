// user.js

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'volunteer', 'superadmin'],
    default: 'volunteer',
  },
});

// Hash the password before saving the user
userSchema.pre('save', async function() {
  const salt = await bcrypt.genSalt();
  this.passwordHash = await bcrypt.hash(this.password, salt);
});

// Check if a given password matches the user's password hash
userSchema.methods.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
