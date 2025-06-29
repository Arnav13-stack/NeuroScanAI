const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
      required: true,
    },
    department: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    bio: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    image: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
    age: {
      type: Number,
      min: 25,
      max: 80,
      required: function () {
        return this.role === "doctor";
      },
    },
    experience: {
      type: String,
      required: function () {
        return this.role === "doctor";
      },
    },
  },
  {
    timestamps: true,
  }
);

// Add index for better query performance
userSchema.index({ email: 1, role: 1 });

module.exports = mongoose.model("User", userSchema);
