const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    bio: { type: String },
    profilePic: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    ownPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
    likedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "posts" }],
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;