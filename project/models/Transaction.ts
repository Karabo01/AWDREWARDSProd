import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    tenantId: string; // Changed from string[] to string
    customerId: string;
    type: string;
    points: number;
    rewardId?: string;
    description: string;
    balance: number;
    createdAt?: Date;
    updatedAt?: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
    {
        tenantId: { type: String, required: true }, // Changed from [String] to String
        customerId: { type: String, required: true },
        type: { type: String, required: true },
        points: { type: Number, required: true },
        rewardId: { type: String, required: false },
        description: { type: String, required: true },
        balance: { type: Number, required: true }
    },
    { timestamps: true }
);

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;