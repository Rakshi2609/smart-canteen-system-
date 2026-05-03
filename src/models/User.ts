import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "Admin" | "Donor" | "NGO";
  status: "Pending Approval" | "Verified" | "Rejected";
  totalImpact: number;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Donor", "NGO"], default: "Donor" },
  status: { type: String, enum: ["Pending Approval", "Verified", "Rejected"], default: "Pending Approval" },
  totalImpact: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
