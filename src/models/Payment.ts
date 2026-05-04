import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  paymentId: string;
  amount: number;
  recipient: string;
  status: "Pending" | "Completed" | "Failed";
  method: string;
  payload?: any;
}

const PaymentSchema = new Schema<IPayment>({
  paymentId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  recipient: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  method: { type: String, default: "UPI" },
  payload: { type: Schema.Types.Mixed },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
