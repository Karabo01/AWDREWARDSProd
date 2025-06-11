import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  points: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  tenantId: {
    type: String,
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
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
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
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true });
CustomerSchema.index({ tenantId: 1, phone: 1 });
CustomerSchema.index({ tenantId: 1, points: -1 });

const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;