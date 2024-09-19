const Review = require("../model/reviewModel");
const Event = require("../model/eventsModel");

module.exports.addReview = async (req, res, next) => {
  try {
    const { content, rating, eventId, userId } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.json({ msg: "Event not found.", status: false });
    }

    // Check if the event has already taken place
    if (new Date(event.date) > new Date()) {
      return res.json({ msg: "Cannot review an event that hasn't taken place yet.", status: false });
    }

    const newReview = await Review.create({
      content,
      rating,
      user: userId,
      event: eventId,
    });

    await newReview.populate('user', 'username avatarImage');

    // Update event's average rating
    const eventReviews = await Review.find({ event: eventId });
    const avgRating = eventReviews.reduce((acc, review) => acc + review.rating, 0) / eventReviews.length;
    await Event.findByIdAndUpdate(eventId, { averageRating: avgRating });

    return res.json({ status: true, review: newReview });
  } catch (error) {
    next(error);
  }
};

module.exports.getEventReviews = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const reviews = await Review.find({ event: eventId })
      .populate('user', 'username avatarImage')
      .sort({ createdAt: -1 });

    return res.json({ status: true, reviews });
  } catch (error) {
    next(error);
  }
};

module.exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.json({ msg: "Review not found.", status: false });
    }

    await Review.findByIdAndDelete(reviewId);

    // Update event's average rating
    const eventReviews = await Review.find({ event: review.event });
    const avgRating = eventReviews.length > 0 
      ? eventReviews.reduce((acc, review) => acc + review.rating, 0) / eventReviews.length
      : 0;
    await Event.findByIdAndUpdate(review.event, { averageRating: avgRating });

    return res.json({ status: true, msg: "Review deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId} = req.params;
    const { content, rating, userId  } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.json({ msg: "Review not found.", status: false });
    }

    if (review.user.toString() !== userId) {
      return res.json({ msg: "Unauthorized to update this review.", status: false });
    }

    await Review.findByIdAndUpdate(reviewId, { content, rating });

    // Update event's average rating
    const eventReviews = await Review.find({ event: review.event });
    const avgRating = eventReviews.length > 0 
      ? eventReviews.reduce((acc, review) => acc + review.rating, 0) / eventReviews.length
      : 0;
    await Event.findByIdAndUpdate(review.event, { averageRating: avgRating });

    // Fetch the updated review
    const updatedReview = await Review.findById(reviewId).populate('user', 'username avatarImage');

    return res.json({ status: true, msg: "Review updated successfully.", review: updatedReview });
  } catch (error) {
    next(error);
  }
};