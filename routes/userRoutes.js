const express = require('express');
const { handleSignup, handleSignin, findUser } = require('../controller/userController');
const verifyToken = require('../middelware/verifyToken');

const userRouter = express.Router();

userRouter.get('/',verifyToken, findUser)
userRouter.post('/signup', handleSignup)
userRouter.post('/signin', handleSignin)

module.exports = userRouter;