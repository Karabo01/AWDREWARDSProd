import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  tenantId: string;
  businessName: string;
  pointsPerDollar: number;
  minimumPurchase: number;
  welcomeBonus: number;
  email: string;
  phone: string;
  address: string;
  logo?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  tenantId: {
    type: String,
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  pointsPerDollar: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  minimumPurchase: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  welcomeBonus: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
  },
  theme: {
    primaryColor: {
      type: String,
      default: '#2563eb',
    },
    secondaryColor: {
      type: String,
      default: '#f59e0b',
    },
  },
}, {
  timestamps: true,
});

const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;