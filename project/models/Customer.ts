import mongoose, { Document, Schema } from 'mongoose';
import { hashPassword } from '@/lib/auth';

export interface ICustomer extends Document {
  tenantId: string[]; // Changed from string to string[]
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneConfirmed: boolean;
  password: string;
  passwordChanged: boolean;
  address?: string;
  points: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  tenantId: {
    type: [String], // Changed from String to [String]
    required: true,
    index: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    // unique: true, // DO NOT add unique here! Uniqueness is enforced per tenant via compound index below.
  },
  phone: {
    type: String,
    required: true, // Changed to required
    trim: true,
  },
  phoneConfirmed: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
  },
  passwordChanged: {
    type: Boolean,
    default: false,
  },
  address: {
    type: String,
    trim: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true }); // This index will need to be updated in your DB, see note below
CustomerSchema.index({ tenantId: 1, phone: 1 });
CustomerSchema.index({ tenantId: 1, points: -1 });

// Add pre-save middleware to hash password if modified
CustomerSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;