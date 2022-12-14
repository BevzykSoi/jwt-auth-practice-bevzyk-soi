const bcrypt = require("bcrypt");

const jwt = require("../utils/jwt");
const { User } = require("../models");

exports.register = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      res.status(422).send("Username already in use!");
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      password: hashedPassword,
    });

    const payload = {
      _id: user.id,
    };

    const token = jwt.generateJwt(payload);

    user.token = token;
    await user.save();

    res.json({
      "message": `You have been succesfully registered!`,
      "user": {
        "username": user.username,
        "password": user.password,
      },
      "token": user.token,
    });

  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username,
    });

    if (!user) {
      res.status(400).send("Username or password is wrong!");
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(400).send("Username or password is wrong!");
      return;
    }

    const payload = {
      _id: user.id,
    };

    const token = jwt.generateJwt(payload);

    user.token = token;
    await user.save();

    res.json({
      "message": "You've been logged in!",
      "user": {
        "username": user.username,
        "password": user.password,
      },
      "token": user.token
    });
  } catch (error) {
    next(error);
  }
};

exports.profile = async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).send("Not authorized!");
      return;
    }

    res.json({
        "message": "You are in your profile!",
        "user": {
          "username": req.user.username,
          "password": req.user.password,
        }
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
    try {
       req.user.token = null;
       await req.user.save();

       res.json({
        "message": "You've been logged out!",
        "user": {
          "username": req.user.username,
          "password": req.user.password,
        }
       });
    } catch (error) {
       next(error);
    }
}