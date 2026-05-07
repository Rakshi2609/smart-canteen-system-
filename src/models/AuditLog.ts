import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  id: string;
  time: string;
  action: string;
  role: string;
  details: string;
  type?: "info" | "success" | "warning" | "error";
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    id: { type: String, required: true, unique: true },
    time: { type: String, required: true },
    action: { type: String, required: true },
    role: { type: String, required: true },
    details: { type: String, required: true },
    type: { type: String, enum: ["info", "success", "warning", "error"], default: "info" },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
