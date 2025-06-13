import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  start: { type: String, required: true },
  end:   { type: String, required: true },
  status:{ type: String, enum: ["available", "booked"], default: "available" }
}, { _id: false });

const courtSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  location:     { type: String, required: true },
  images:       [{ type: String, required: true }],
  pricePerHour: { type: Number, required: true },

  // ✅ Approval logic
  isApproved:   { type: Boolean, default: false },

  // ✅ Court Owner reference
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // ✅ Contact info
  contact: {
    phone:   { type: String, required: true },
    mapLink: { type: String, required: true }
  },

  // ✅ Available time slots per date
  availableTimes: {
    type: Map,
    of: [timeSlotSchema],
    default: {}
  }

}, { timestamps: true });

export default mongoose.model("Court", courtSchema);
