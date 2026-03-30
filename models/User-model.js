const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    totalKarma: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
