const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: String,
    time: String,
    appointmentType: {
      type: String,
      enum: ["online", "offline"],
      default: "offline",
    },
    patientName: String,
    patientAge: String,
    department: String,
    doctorName: String,
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"], // ✅ ADDED "rejected"
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
