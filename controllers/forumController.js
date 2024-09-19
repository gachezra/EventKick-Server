const ForumThread = require("../model/forumThreadModel");
const ForumPost = require("../model/forumPostModel");
const Event = require("../model/eventsModel");
const User = require("../model/userModel");

module.exports.addForumThread = async (req, res, next) => {
  try {
    const { eventId, userId, title } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.json({ msg: "Event not found.", status: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ msg: "User not found.", status: false });
    }

    const isRegistered = user.registeredEvents.includes(eventId);
    if (!isRegistered) {
      return res.json({ msg: "You must be registered for the event to start a thread.", status: false });
    }

    const newThread = await ForumThread.create({
      title: title,
      event: eventId,
      user: userId,
    });

    await newThread.populate('user', 'username avatarImage');

    return res.json({ status: true, thread: newThread });
  } catch (error) {
    next(error);
  }
};

module.exports.getForumThreads = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const threads = await ForumThread.find({ event: eventId })
      .populate('user', 'username avatarImage')
      .populate('event', 'name')
      .sort({ createdAt: -1 });
    return res.json({ status: true, thread: threads });
  } catch (error) {
    console.error('Error in getForumThreads:', error);
    next(error);
  }
};

module.exports.deleteForumThread = async (req, res, next) => {
  try {
    const { threadId, userId } = req.params;

    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.json({ msg: "Thread not found.", status: false });
    }

    if (thread.user.toString() !== userId) {
      return res.json({ msg: "Unauthorized to delete this thread.", status: false });
    }

    await ForumThread.findByIdAndDelete(threadId);

    return res.json({ status: true, msg: "Thread deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports.addForumPost = async (req, res, next) => {
  try {
    const { content, threadId, userId, parentId } = req.body;

    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.json({ msg: "Thread not found.", status: false });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ msg: "User not found.", status: false });
    }

    const newPost = await ForumPost.create({
      content,
      user: userId,
      thread: threadId,
      parent: parentId || null,
    });

    if (parentId) {
      await ForumPost.findByIdAndUpdate(parentId, { $push: { replies: newPost._id } });
    } else {
      thread.posts.push(newPost._id);
      await thread.save();
    }

    await newPost.populate('user', 'username avatarImage');

    return res.json({ status: true, post: newPost });
  } catch (error) {
    next(error);
  }
};

module.exports.getForumPosts = async (req, res, next) => {
  try {
    const { threadId } = req.params;

    const thread = await ForumThread.findById(threadId);
    if (!thread) {
      return res.json({ msg: "Thread not found.", status: false });
    }

    const posts = await ForumPost.find({ thread: threadId, parent: null })
      .populate('user', 'username avatarImage')
      .populate({
        path: 'replies',
        populate: [
          { path: 'user', select: 'username avatarImage' },
          { path: 'replies' }
        ]
      })
      .sort({ createdAt: -1 });

    return res.json({ status: true, thread: { ...thread.toObject(), posts } });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteForumPost = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.json({ msg: "Post not found.", status: false });
    }

    if (post.user.toString() !== userId) {
      return res.json({ msg: "Unauthorized to delete this post.", status: false });
    }

    await ForumPost.findByIdAndDelete(postId);
    await ForumThread.updateOne({ posts: postId }, { $pull: { posts: postId } });

    return res.json({ status: true, msg: "Post deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports.upvotePost = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) return res.json({ status: false, msg: "Post not found." });

    if (post.upvotedBy.includes(userId)) {
      return res.json({ status: false, msg: "You have already upvoted this post." });
    }

    if (post.downvotedBy.includes(userId)) {
      post.downvotedBy.pull(userId);
      post.upvotes += 1;
    }

    post.upvotedBy.push(userId);
    post.upvotes += 1;
    await post.save();

    return res.json({ status: true, upvotes: post.upvotes });
  } catch (error) {
    next(error);
  }
};

module.exports.downvotePost = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;

    const post = await ForumPost.findById(postId);
    if (!post) return res.json({ status: false, msg: "Post not found." });

    if (post.downvotedBy.includes(userId)) {
      return res.json({ status: false, msg: "You have already downvoted this post." });
    }

    if (post.upvotedBy.includes(userId)) {
      post.upvotedBy.pull(userId);
      post.upvotes -= 1;
    }

    post.downvotedBy.push(userId);
    post.upvotes -= 1;
    await post.save();

    return res.json({ status: true, upvotes: post.upvotes });
  } catch (error) {
    next(error);
  }
};