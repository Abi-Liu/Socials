const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");

module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", {
        posts: posts,
        user: req.user,
        loggedUser: true,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getUserProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.params.id });
      const user = await User.findById(req.params.id);
      let loggedUser = false;
      if (user.id == req.user.id) {
        loggedUser = true;
      }
      console.log(req.params.id);
      res.render("profile.ejs", {
        posts: posts,
        user: user,
        loggedUser: loggedUser,
      });
    } catch (err) {
      console.error(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      const users = await User.find();
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", {
        posts: posts,
        users: users,
        loggedUser: req.user.id,
      });
    } catch (err) {
      console.log(err);
    }
  },
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const postUser = await User.findById(post.user);
      const comments = await Comment.find({ post: post.id }).sort({
        createdAt: "desc",
      });
      const users = await User.find();
      res.render("post.ejs", {
        post: post,
        user: req.user,
        comments: comments,
        allUsers: users,
        postUser: postUser,
      });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        title: req.body.title,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        likesArr: [],
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      let post = await Post.findById(req.params.id);
      let arr = post.likesArr;
      if (arr.includes(req.user.id)) {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { likesArr: req.user.id },
          }
        );
        console.log("Likes -1");
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { likesArr: req.user.id },
          }
        );
        console.log("Likes +1");
      }
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
  likeFeedPost: async (req, res) => {
    try {
      let post = await Post.findById(req.params.id);
      let arr = post.likesArr;
      if (arr.includes(req.user.id)) {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: -1 },
            $pull: { likesArr: req.user.id },
          }
        );
        console.log("Likes -1");
      } else {
        await Post.findOneAndUpdate(
          { _id: req.params.id },
          {
            $inc: { likes: 1 },
            $push: { likesArr: req.user.id },
          }
        );
        console.log("Likes +1");
      }
      res.redirect(`/feed`);
    } catch (err) {
      console.error(err);
    }
  },
  changeProfilePicture: async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        transformation: [
          { gravity: "face", height: 1000, width: 1000, crop: "crop" },
          { radius: "max" },
          { width: 150, crop: "fill" },
        ],
      });

      await User.findOneAndUpdate(
        { _id: req.user.id },
        {
          $set: { profilePicture: result.secure_url },
        }
      );
      console.log("changed profile picture");
      res.redirect("/profile");
    } catch (err) {
      console.error(err);
    }
  },
};
