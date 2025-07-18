const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
    },
    lastname: {
      type: String,
    },
    email: {
      type: String,
      unique: true,      
      required: true,  
    },
    password:String,
    subscription:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subscription',
    },
    automations:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Automation'
    }],
    integrations:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Integration'
    }]
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', UserSchema);

module.exports = User;