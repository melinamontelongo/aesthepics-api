const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Users = require("../models/Users");
require("dotenv").config();

exports.getUser = async (req, res) => {
    const userID = req.params.userID;
    const user = await Users.findById(userID).select("_id username profilePic firstName lastName bio friends likedPosts");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user });
}

exports.register = async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username: { $regex: username, $options: "i" } });
    if (user) return res.status(409).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Users({ username, password: hashedPassword })
    await newUser.save();
    res.json({ message: "User registered successfully!" });
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ username });
    if (!user) return res.status(403).json({ message: "That user doesn't exist" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(403).json({ message: "Username or password incorrect" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token, userID: user._id, username, message: "User logged in successfully!" })
};

exports.update = async (req, res) => {
    const { userID, firstName, lastName, bio } = req.body;
    const updatedUser = await Users.findByIdAndUpdate(userID, { firstName, lastName, bio }, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User could not be updated" });
    res.json({ message: "User updated successfully!" });
};

exports.uploadPic = async (req, res) => {
    const userID = req.params.userID;
    const picPath = req.file.path;
    const uploadPic = await Users.findByIdAndUpdate(userID, { profilePic: picPath }, { new: true });
    if (!uploadPic) return res.status(400).json({ message: "Profile picture could not be uploaded" });
    res.json({ message: "Profile picture uploaded successfully!" });
};

exports.deletePic = async (req, res) => {
    const userID = req.params.userID;
    const deletePic = await Users.findByIdAndUpdate(userID, { profilePic: "" }, { new: true });
    if (!deletePic) return res.status(400).json({ message: "Profile picture could not be deleted" });
    res.json({ message: "Profile picture deleted successfully!" });
}

exports.addFriend = async (req, res) => {
    const userID = req.params.userID;
    const friendID = req.body.friendID;
    const user = await Users.findById(userID);
    if (user.friends.filter(f => f.toString() === friendID).length > 0) return res.json({ message: "Friend already added!" });
    user.friends.push(friendID);
    await user.save();
    res.json({ message: "Friend added!" });
};

exports.unfriend = async (req, res) => {
    const userID = req.params.userID;
    const friendID = req.body.friendID;
    const user = await Users.findById(userID);
    //  If requested friend to remove is not on friends list
    if (user.friends.filter(f => f.toString() !== friendID).length > 0) return res.json({ message: "That user is not on your friends list" });
    user.friends = user.friends.filter(f => f.toString() !== friendID);
    await user.save();
    res.json({ message: "Friend deleted" });
};

exports.verifyToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (err) return res.status(403).json({message: "User not authenticated."});
            next();
        });
    } else {
        res.sendStatus(401);
    }
};
