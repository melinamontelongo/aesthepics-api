const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const UsersController = require("../controllers/usersController");
const cloudinaryController = require("../config/cloudinary");
const PostsController = require("../controllers/postsController");

//  Get all posts
router.get("/", PostsController.all);

//  Get one post
router.get("/post/:postId", PostsController.getPost);

//  Get queried posts
router.get("/search/", PostsController.searchPosts);

//  Get all posts from specific user
router.get("/:userID", PostsController.userPosts);

//  Create a new post
router.post("/:userID", UsersController.verifyToken, cloudinaryController.parser.single("image"), PostsController.create);

//  Like a post
router.put("/like/:postId", UsersController.verifyToken, PostsController.like);

//  Comment on a post
router.put("/comment/:postId", UsersController.verifyToken, PostsController.comment);

//  Delete a comment from a post
router.put("/comment/delete/:commentId", UsersController.verifyToken, PostsController.deleteComment);

router.delete("/:postId/:publicID", UsersController.verifyToken, cloudinaryController.deleteDbPic, PostsController.deletePost);
module.exports = router;