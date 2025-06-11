import mongoose, { Document, Schema } from 'mongoose';

export interface IVisit extends Document {
  tenantId: string;
  customerId: Schema.Types.ObjectId;
  visitDate: Date;
  amount: number;
  points: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>({
  tenantId: {
    type: String,
    required: true,
    index: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  visitDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    required: true,
    min: 0,
  },
  notes: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
VisitSchema.index({ tenantId: 1, customerId: 1, visitDate: -1 });
VisitSchema.index({ tenantId: 1, visitDate: -1 });

const Visit = mongoose.models.Visit || mongoose.model<IVisit>('Visit', VisitSchema);

export default Visit;