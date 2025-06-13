import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Step 1: Schema definition
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true }, // 📞 Phone number field added
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['player', 'court_owner', 'admin'], default: 'player' }
}, {
  timestamps: true
});

// ✅ Step 2: Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (!this.password) {
    return next(new Error('Password is required to hash'));
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Step 3: Add methods (e.g., password match)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ✅ Step 4: Export model
const User = mongoose.model('User', userSchema);
export default User;
