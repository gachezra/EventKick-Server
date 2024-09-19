const mongoose = require("mongoose");

const forumPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  thread: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumThread",
    required: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
    default: null,
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumPost",
  }],
  upvotes: {
    type: Number,
    default: 0,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  }],
  downvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  }],
}, { timestamps: true });

module.exports = mongoose.model("ForumPost", forumPostSchema);
