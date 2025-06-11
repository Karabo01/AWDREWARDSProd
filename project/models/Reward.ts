import mongoose, { Document, Schema } from 'mongoose';

export interface IReward extends Document {
  tenantId: string;
  name: string;
  description: string;
  pointsRequired: number;
  status: 'active' | 'inactive';
  redemptionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RewardSchema = new Schema<IReward>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  pointsRequired: {
    type: Number,
    required: true,
    min: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  redemptionCount: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

RewardSchema.index({ tenantId: 1, name: 1 });

const Reward = mongoose.models.Reward || mongoose.model<IReward>('Reward', RewardSchema);

export default Reward;