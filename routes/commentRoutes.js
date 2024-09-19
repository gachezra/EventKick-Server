const router = require("express").Router();
const verifyToken = require("../middleware/authMiddleware");
const { addComment, getEventComments, deleteComment } = require("../controllers/commentController");

router.post("/add", addComment);
router.get("/event/:eventId", getEventComments);
router.delete("/:commentId/:userId", verifyToken, deleteComment);

module.exports = router;