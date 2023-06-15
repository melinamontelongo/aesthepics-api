const mongoose = require("mongoose");
const Posts = require("../models/Posts");
const Users = require("../models/Users");

exports.all = async (req, res) => {
    const page = parseInt(req.query.page || "0");
    const pageSize = 2;
    const totalPosts = await Posts.countDocuments({});
    const posts = await Posts.find({}).limit(pageSize).skip(pageSize * page);
    if (!posts) res.status(404).json({ message: "Posts were not found!" })
    res.json({
        total: Math.ceil(totalPosts / pageSize),
        posts: posts
    });
};

exports.getPost = async (req, res) => {
    const postId = req.params.postId;
    const post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found!" });
    res.json({ post });
};

exports.searchPosts = async (req, res) => {
    const query = req.query.q;
    const queryPosts = await Posts.find({ description: { $regex: ".*" + query + ".*", $options: "i" } });
    if (!queryPosts || queryPosts.length <= 0) return res.status(404).json({ message: "No matching posts were found!" });
    return res.json({ posts: queryPosts });
};

exports.userPosts = async (req, res) => {
    const userID = req.params.userID;
    const userPosts = await Posts.find({ userOwner: userID });
    if (!userPosts) res.status(404).json({ message: "This user's posts were not found!" });
    res.json({ posts: userPosts });
};

exports.create = async (req, res) => {
    const userID = req.params.userID;
    const description = req.body.description
    const picture = req.file.path;
    const user = await Users.findById(userID).select("_id ownPosts");
    if (!user) res.status(404).json({ message: "User not found." });
    const newPost = new Posts({
        picture,
        description,
        userOwner: user._id,
    });
    await newPost.save();
    user.ownPosts.push(newPost._id);
    await user.save();
    res.json({ message: "New post created successfully!" });
};

exports.like = async (req, res) => {
    const postId = req.params.postId;
    const userId = req.body.userId;
    const post = await Posts.findById(postId);
    const user = await Users.findById(userId).select("_id likedPosts");
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (!user) return res.status(404).json({ message: "User not found." });
    const findLikedPost = user.likedPosts.filter((post) => post.toString() === postId);
    //  If post was already liked, dislike it
    if (findLikedPost.length > 0) {
        user.likedPosts = user.likedPosts.filter((post) => post.toString() !== postId);
        await user.save();
        post.likeCount -= 1;
        post.whoLiked = post.whoLiked.filter((u) => u.toString() !== userId);
        await post.save();
        return res.json({ message: "Post disliked.", likeCount: post.likeCount });
    } else {
        user.likedPosts.push(post._id);
        await user.save();
        post.likeCount += 1;
        post.whoLiked.push(user._id);
        await post.save();
        return res.json({ message: "Post liked!", likeCount: post.likeCount });
    }
};

exports.comment = async (req, res) => {
    const { userOwner, text, ownerUsername, ownerProfilePic } = req.body;
    const commentId = new mongoose.Types.ObjectId();
    const postId = req.params.postId;
    const post = await Posts.findById(postId);
    if (!post) res.status(404).json({ message: "Post not found!" });
    post.comments.push({ commentId, userOwner, text, ownerUsername, ownerProfilePic });
    await post.save();
    res.json({ message: "You commented on this post!" });
};

exports.deleteComment = async (req, res) => {
    const commentId = req.params.commentId
    const { postId } = req.body;
    const post = await Posts.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found!" });
    post.comments = post.comments.filter(comment => comment.commentId.toString() !== commentId);
    await post.save();
    res.json({ message: "Comment deleted." });
};

exports.deletePost = async(req, res) => {
    const postId = req.params.postId;
    const deleted = await Posts.findByIdAndDelete(postId);
    if(!deleted) return res.status(404).json({message: "There was an error trying to delete the post."});
    const deleteFromUser = await Users.findById(deleted.userOwner);
    deleteFromUser.ownPosts = deleteFromUser.ownPosts.filter(post =>  post.toString() !== postId);
    await deleteFromUser.save();
    res.json({message: "Post deleted successfully."});
};