const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/genrateToken.js');
const refreshIGToken = require('../utils/refreshIGToken.js');
const { handleIntegrationUpdate, updateIntegrationToken } = require('./integrationController.js');
const Integration = require('../models/integration.model.js');

const handleSignup = async (req, res) => {
  try {
    console.log(req.body)
    const { firstname, lastname, email, password } = req.body;

    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "All fields required", type: "error" });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: "Email already registered", type: "error" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hash
    });

    const token = generateToken(user._id); // assumed defined

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({
      message: 'User created successfully',
      type: "success",
      user: {
        id: user._id,
        ...userData,
        token
      }
    })

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error: User Signup', type: "error" });
  }
};

const handleSignin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password)

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required", type: "error" });
    }

    const user = await User.findOne({ email })
    if (user && user.integrations?.length > 0) {
      user = await user.populate({
        path: 'integrations',
        select: '_id name expiresAt token',
      });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found", type: "error" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password", type: "error" });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",
      type: "success",
      user: {
        id: user._id,
        user: user,
        token,
      }
    });

  } catch (error) {
    console.error("Signin Error:", error);
    return res.status(500).json({ message: "Internal server error: Signin", type: "error" });
  }
};

const findUser = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await User.findById(userId)
      .select('-password')

    if (!user) {
      return res.status(404).json({ message: "User not found", type: 'error' });
    }

    if (user && user.integrations?.length > 0) {
      user = await user.populate({
        path: 'integrations',
        select: '_id name expiresAt token',
      });
    }

    if (user.integrations.length > 0) {
      const integration = user.integrations[0];

      if (integration.expiresAt) {
        const today = new Date();
        const timeLeft = new Date(integration.expiresAt).getTime() - today.getTime();
        const daysLeft = Math.round(timeLeft / (1000 * 3600 * 24));

        if (daysLeft < 5) {
          console.log("Refreshing token...");

          const newToken = await refreshIGToken(integration.token);

          const newExpiration = new Date();
          newExpiration.setDate(newExpiration.getDate() + 60);

          await Integration.findByIdAndUpdate(integration._id, {
            $set: {
              token: newToken,
              expiresAt: newExpiration
            }
          });
        }
      }
    }

    return res.status(200).json({
      message: "User found",
      type: "success",
      user: {
        id: user._id,
        user,
        token: req.token
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", type: "error" });
  }
};




module.exports = {
  handleSignup,
  handleSignin,
  findUser
}
