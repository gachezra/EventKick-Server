const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: String, required: true },
  amount: { type: Number, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  checkoutRequestId: { type: String },
  paymentStatus: { type: String, default: 'Not yet paid' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);