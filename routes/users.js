const express = require("express");
const router = express.Router();

const UsersController = require("../controllers/usersController");
const cloudinaryController = require("../config/cloudinary");

//  Get user based on ID
router.get("/:userID", UsersController.getUser);

//  Sign in user (Create new account)
router.post("/register", UsersController.register);

//  Log in user (Existing account)
router.post("/login", UsersController.login);

//  Update user profile
router.put("/update", UsersController.verifyToken, UsersController.update);

//  Update user profile picture
router.put("/update/picture/:userID", UsersController.verifyToken, cloudinaryController.parser.single("image"), UsersController.uploadPic);

//  Delete user profile picture
router.delete("/delete/picture/:userID/:publicID", UsersController.verifyToken, cloudinaryController.deleteDbPic, UsersController.deletePic);

//  Add friend
router.put("/friend/:userID", UsersController.verifyToken, UsersController.addFriend);

//  Remove friend
router.put("/unfriend/:userID", UsersController.verifyToken, UsersController.unfriend);

module.exports = router;