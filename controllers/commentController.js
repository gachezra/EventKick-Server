const Comment = require("../model/commentModel");
const Event = require("../model/eventsModel");

module.exports.addComment = async (req, res, next) => {
  try {
    const { content, eventId, userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.json({ msg: "Event not found.", status: false });
    }

    const newComment = await Comment.create({
      content,
      user: userId,
      event: eventId,
    });

    await newComment.populate('user', 'username avatarImage');

    return res.json({ status: true, comment: newComment });
  } catch (error) {
    next(error);
  }
};

module.exports.getEventComments = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const comments = await Comment.find({ event: eventId })
      .populate('user', 'username avatarImage')
      .sort({ createdAt: -1 });

    return res.json({ status: true, comments });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId, userId } = req.params;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.json({ msg: "Comment not found.", status: false });
    }

    if (comment.user.toString() !== userId) {
      return res.json({ msg: "Unauthorized to delete this comment.", status: false });
    }

    await Comment.findByIdAndDelete(commentId);

    return res.json({ status: true, msg: "Comment deleted successfully." });
  } catch (error) {
    next(error);
  }
};