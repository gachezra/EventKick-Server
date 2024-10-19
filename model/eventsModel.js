const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  openedCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'disapproved'],
    default: 'pending'
  },
  averageRating: {
    type: Number,
    default: 0,
  },isPaid: {
    type: Boolean,
    default: false,
  },
  ticketPrice: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  registeredUsers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    ticketScanned: {
      type: Boolean,
      default: false
    }
  }],
  favouritedByUser: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  shares: {
    whatsapp: { type: Number, default: 0 },
    twitter: { type: Number, default: 0 },
    instagram: { type: Number, default: 0 }
  },
  totalShares: { type: Number, default: 0 },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Events", eventSchema);
