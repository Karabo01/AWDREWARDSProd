import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  tenantId: string;
  role: 'admin' | 'business_owner' | 'employee';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  employeeId?: string;
  position?: string;
  department?: string;
  reportTo?: string;
}

const UserSchema = new Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  role: {
    type: String,
    enum: ['admin', 'business_owner', 'employee'],
    default: 'employee',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  employeeId: {
    type: String,
    sparse: true,
  },
  position: {
    type: String,
  },
  department: {
    type: String,
  },
  reportTo: {
    type: String,
  },
}, {
  timestamps: true,
});

// Compound index for tenant-based queries
UserSchema.index({ tenantId: 1, username: 1 });
UserSchema.index({ tenantId: 1, email: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);