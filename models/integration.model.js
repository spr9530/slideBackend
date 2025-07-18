const mongoose = require('mongoose');

const IntegrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default: 'INSTAGRAM'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    instagramId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Integration = mongoose.model('Integration', IntegrationSchema);

module.exports = Integration;
