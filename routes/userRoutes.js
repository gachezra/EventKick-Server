const {
  register,
  login,
  setAvatar,
  getAllUsers,
  getUser,
  updateUser,
  verifyEmail,
  forgotPassword,
  resetPassword,  
} = require("../controllers/usersControllers");
const verifyToken = require("../middleware/authMiddleware");
const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Apply authentication to the routes that require it
router.post("/setAvatar/:id", verifyToken, setAvatar);
router.get("/allUsers/:id", verifyToken, getAllUsers);
router.get('/user/:id', verifyToken, getUser);
router.put('/user/:id', verifyToken, updateUser);

module.exports = router;
