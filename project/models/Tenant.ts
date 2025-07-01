import mongoose, { Document, Schema } from 'mongoose';

export interface ITenant extends Document {
  name: string;
  businessType: 'restaurant' | 'car_wash' | 'retail' | 'other';
  address: string;
  phone: string;
  email: string;
  settings: {
    pointsPerVisit: number;
    pointsPerDollar: number;
    rewardThreshold: number;
    currency: string;
    timezone: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan: 'basic' | 'premium' | 'custom';
  paymentStatus: 'pending' | 'paid' | 'overdue';
  lastPaymentDate: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  businessType: {
    type: String,
    enum: ['restaurant', 'car_wash', 'retail', 'other'],
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  settings: {
    pointsPerVisit: {
      type: Number,
      default: 10,
    },
    pointsPerDollar: {
      type: Number,
      default: 1,
    },
    rewardThreshold: {
      type: Number,
      default: 100,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    timezone: {
      type: String,
      default: 'America/New_York',
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'custom'],
    default: 'basic',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  lastPaymentDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema);