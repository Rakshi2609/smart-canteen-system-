import nextEnv from "@next/env";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const { Schema } = mongoose;
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const admin = {
  name: process.env.ADMIN_NAME ?? "System Admin",
  email: process.env.ADMIN_EMAIL ?? "admin@smartcanteen.local",
  password: process.env.ADMIN_PASSWORD ?? "Admin@12345",
  role: "Admin",
  status: process.env.ADMIN_STATUS ?? "Verified",
  totalImpact: Number(process.env.ADMIN_TOTAL_IMPACT ?? 0),
};

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Donor", "NGO"], default: "Donor" },
  status: { type: String, enum: ["Pending Approval", "Verified", "Rejected", "Suspended"], default: "Pending Approval" },
  totalImpact: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(uri, { bufferCommands: false });

  const passwordHash = await bcrypt.hash(admin.password, 10);
  const existing = await User.findOne({ email: admin.email });

  if (existing) {
    existing.name = admin.name;
    existing.passwordHash = passwordHash;
    existing.role = admin.role;
    existing.status = admin.status;
    existing.totalImpact = admin.totalImpact;
    await existing.save();
    console.log(`Admin user updated: ${admin.email}`);
  } else {
    await User.create({
      name: admin.name,
      email: admin.email,
      passwordHash,
      role: admin.role,
      status: admin.status,
      totalImpact: admin.totalImpact,
    });
    console.log(`Admin user created: ${admin.email}`);
  }

  await mongoose.disconnect();
  console.log("Admin credential ready.");
}

main().catch((error) => {
  console.error("Seed admin failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});