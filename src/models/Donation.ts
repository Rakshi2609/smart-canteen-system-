import mongoose, { Schema, Document } from "mongoose";

export interface ILocationPoint {
  lat: number;
  lng: number;
  address: string;
}

export interface IDonation extends Document {
  id: string; // The UI generates string IDs like "R-101", we can keep this or map _id
  orderType: string;
  foodName: string;
  foodType: string;
  quantity: number;
  cookedTime: string;
  expiryTime: number;
  distance: string;
  status: string;
  volunteerName?: string;
  donorLocation?: ILocationPoint;
  ngoLocation?: ILocationPoint;
}

const LocationPointSchema = new Schema<ILocationPoint>({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: { type: String, required: true },
}, { _id: false });

const DonationSchema = new Schema<IDonation>({
  id: { type: String, required: true, unique: true },
  orderType: { type: String, default: "Donation" },
  foodName: { type: String, required: true },
  foodType: { type: String, required: true },
  quantity: { type: Number, required: true },
  cookedTime: { type: String, required: true },
  expiryTime: { type: Number, required: true },
  distance: { type: String, default: "0.0 km" },
  status: { type: String, default: "Waiting" },
  volunteerName: { type: String },
  donorLocation: { type: LocationPointSchema },
  ngoLocation: { type: LocationPointSchema },
}, { timestamps: true });

// Avoid recompiling model in Next.js edge/serverless environments
export default mongoose.models.Donation || mongoose.model<IDonation>("Donation", DonationSchema);
