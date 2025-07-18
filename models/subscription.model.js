const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    customerId: String,
    updatedAt: Date,
    plan:''
},{timestamps: true})

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;