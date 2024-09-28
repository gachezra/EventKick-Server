const User = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const formData = require('form-data');
const dotenv = require('dotenv');
dotenv.config();
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: process.env.MAILGUN_USERNAME,
  key: process.env.MAILGUN_API,
  url: process.env.MAILGUN_URL
});

module.exports.sendMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body

    const mailOptions = {
      from: `${name} <${email}>`,
      to: 'ezragach@eventkick.ke',
      subject: `${subject}`,
      html: `
        <h1>Message</h1>
        <p>${message}</p>
      `
    };

    await mg.messages.create('eventkick.ke', mailOptions);

    return res.json({ status: true, msg: "Message sent successfuly, check for a response after a while." });
  } catch(e) {
    next(e)
  }
}

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck) {
      return res.json({ msg: "Username already used.", status: false });
    }
    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.json({ msg: "Email already used.", status: false });
    }
    const emailVerificationToken = crypto.randomBytes(64).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Send verification email    
    const mailOptions = {
      from: 'EventKick Team <noreply@eventkick.ke>',
      to: email,
      subject: 'Email Verification',
      html: `
        <h1>Email Verification</h1>
        <p>Hello ${username},</p>
        <p>Please verify youremail by clicking the following link:</p>
        <a href="${process.env.DOMAIN}/verify/${emailVerificationToken}">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await mg.messages.create('eventkick.ke', mailOptions);

    // save user only after mail is sent
    await User.create({
      email,
      username,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });
    return res.json({ status: true, msg: "User registered successfully. Check your email for verification." });
  } catch (error) {
    next(error);
  }
};

module.exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    console.log('Verifying token: ', token)
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.log('Found')
      return res.json({ msg: "Invalid or expired verification token.", status: false });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return res.json({ status: true, msg: "Email verified successfully. You can now log in." });
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        msg: "Incorrect username or password.",
        status: false,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        msg: "Incorrect username or password.",
        status: false,
      });
    }
    if (!user.isEmailVerified) {
      return res.json({
        msg: "Please verify your email before logging in.",
        status: false,
      });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '168h', // Token expires in 1 week
    });
    return res.json({ status: true, token, user: { username: user.username, email: user.email, avatarImage: user.avatarImage, _id: user._id } });
  } catch (error) {
    next(error);
  }
};

module.exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "No account with that email address exists.", status: false });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 900000; // 15 mins
    await user.save();

    const resetUrl = `http://${process.env.DOMAIN}/reset-password/${resetToken}`;
    
    // Send verification email    
    const mailOptions = {
      from:  'EventKick Team <noreply@eventkick.ke>',
      to: user.email,
      subject: 'Password Reset',
      html: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
             Please click on the following link, or paste this into your browser to complete the process:
             <a href="${resetUrl}">Reset Password</a>
             If you did not request this, please ignore this email and your password will remain unchanged.
             Your password reset link will expire in 15Mins`,
    };

    await mg.messages.create('eventkick.ke', mailOptions);

    res.json({ status: true, msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
  } catch (error) {
    next(error);
  }
};

module.exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ msg: "Password reset token is invalid or has expired.", status: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    const mailOptions = {
      from: 'EventKick Team <noreply@eventkick.ke>',
      to: user.email,
      subject: 'Your password has been changed',
      text: 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.'
    };

    await mg.messages.create('eventkick.ke', mailOptions);

    res.json({ status: true, msg: 'Success! Your password has been changed.' });
  } catch (error) {
    next(error);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );
    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email",
      "username",
      "avatarImage",
      "_id",
    ]);
    return res.json(users);
  } catch (error) {
    next(error);
  }
};
module.exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select([
      "email",
      "username",
      "avatarImage",
      "role"
    ]);
    if (!user) {
      return res.json({ msg: "User not found.", status: false });
    }
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    console.log('Updating user');
    const userId = req.params.id;
    const { username, email} = req.body;
    // Check if username or email is already used by another user
    const usernameCheck = await User.findOne({ username, _id: { $ne: userId } });
    if (usernameCheck) {
      return res.json({ msg: "Username already used.", status: false });
    }
    const emailCheck = await User.findOne({ email, _id: { $ne: userId } });
    if (emailCheck) {
      return res.json({ msg: "Email already used.", status: false });
    }

    // Update user data
    const updatedUser = { username, email };
    const userData = await User.findByIdAndUpdate(
      userId,
      updatedUser,
      { new: true }
    );

    return res.json({ status: true, user: userData });
  } catch (error) {
    next(error);
  }
};
