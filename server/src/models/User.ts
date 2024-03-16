import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define the schema for the User model
const userSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Interface for the User document
export interface UserDocument extends Document {
  username: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define methods on the User model
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Pre-save hook to hash the password before saving
userSchema.pre<UserDocument>('save', async function(next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
  } catch (error: any) { // Explicitly define the type of the error parameter
    next(error);
  }
});

// Export the User model
export const User = model<UserDocument>('User', userSchema);
