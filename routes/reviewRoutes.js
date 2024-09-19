const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const { addReview, getEventReviews, deleteReview, updateReview } = require("../controllers/reviewController");

router.post("/add", verifyToken, addReview);
router.get("/event/:eventId", getEventReviews);
router.delete("/:reviewId", verifyToken, deleteReview);
router.put("/:reviewId", verifyToken, updateReview)

module.exports = router