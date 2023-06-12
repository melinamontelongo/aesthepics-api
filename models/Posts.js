const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    picture: { type: String, required: true },
    description: { type: String },
    likeCount: { type: Number, default: 0 },
    whoLiked: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    comments: { type: [Object] },
    createdAt: { type: Date, default: new Date() },
    userOwner: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
});

const PostModel = mongoose.model("posts", PostSchema);

module.exports = PostModel;