const mongoose = require('mongoose');

const automationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      default:'untitled'
    },
    active: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    trigger: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trigger'
    }],
    listener: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listener'
    },
    posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
    }],
    dms: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dm'
    }],
    keywords: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Keyword'
    }],
  },
  {
    timestamps: true,
  }
);


const triggerSchema = new mongoose.Schema({
  type: String,
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation'
  }
})

const listenerSchema = new mongoose.Schema({
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },
  listener: {
    type: String,
    enum: ['SMARTAI', 'MESSAGE'], // ✅ Proper enum array
    required: true,
  },
  prompt: {
    type: String,
  },
  commentReply: {
    type: String,
  },
  dmCount: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
});

const dms = new mongoose.Schema({
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },
  senderId: String,
  receiver: String,
  message: String
}, { timestamps: true })

const postSchema = new mongoose.Schema({
  postId: String,
  caption: String,
  media: String,
  automationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },
  mediaType: {
    type: String,
    enum: ['IMAGE', 'REEL'],
    deafult: 'IMAGE'
  }
})

const keywordSchema = new mongoose.Schema({
  word: String,
  automationId:
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Automation',
    required: true,
  },

})


const Automation = mongoose.model('Automation', automationSchema);
const Listener = mongoose.model('Listener', listenerSchema);
const Trigger = mongoose.model('Trigger', triggerSchema);
const Dm = mongoose.model('Dm', dms);
const Post = mongoose.model('Post', postSchema);
const Keyword = mongoose.model('Keyword', keywordSchema) 



module.exports = {Automation, Keyword, Trigger, Listener, Post};
