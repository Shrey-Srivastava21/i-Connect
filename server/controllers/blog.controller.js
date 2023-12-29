const Blog = require("../models/Blogs");
const multer = require("multer");
const path = require("path");
const getData = require('./DataUri');
const fs = require("fs");
const { getUserById } = require("../controllers/user.controller");
const cloudinary = require('../cloudinary');
exports.getBlogById = (req, res, next, Id) => {
  Blog.findById(Id)
    .populate("user upvotes.user comments.user")
    .exec((err, blog) => {
      if (err) {
        return res.status(400).json({
          errorMsg: "An error occured",
        });
      }
      if (!blog) {
        return res.status(400).json({
          errorMsg: "Blog not found",
        });
      }
      blog.user.salt = undefined;
      blog.user.encryptedpassword = undefined;
      req.blogs = blog;
      next();
    });
};

fs.mkdir("uploads", (err) => {
  if (err) {
  }
  fs.mkdir("uploads/blogs", (err) => {
    if (err) {
    }
  });
});

const storage = multer.memoryStorage();
exports.upload = multer({ storage }).single('picture');

//create blog
exports.createBlog = async (req, res) => {
  const { user, title, content } = req.body;
  const file = req.file;
  console.log(file);
  const fileuri = getData(file);
  //console.log(fileuri);
  try {
    const result = await cloudinary.uploader.upload(fileuri.content, {
      folder: 'blog'
    });
    //console.log(result);
    console.log(result.secure_url);
    console.log(result.public_id);
    const newBlog = Blog({ user, title, content, picture: result.secure_url });
    newBlog.save((err, blog) => {
      if (err) {
        res.status(400).json({
          errorMsg: "An error occured",
        });
      }
      return res.status(200).json(blog);
    });
  } catch (error) {
    console.log(error);
  }

};

// read all blogs
exports.allblogs = (req, res) => {
  Blog.find()
    .populate("user upvotes.user comments.user")
    .sort({ createdAt: -1 })
    .exec((err, blogs) => {
      if (err) {
        res.status(400).json({
          errorMsg: "An error occured",
        });
      }

      blogs.map((blog) => {
        blog.user.salt = undefined;
        blog.user.encryptedpassword = undefined;
      });
      return res.json(blogs);
    });
};

//Read a particular blog
exports.getBlog = (req, res) => {
  Blog.find({ _id: req.blogs._id }).exec((err, blog) => {
    if (err) {
      res.status(400).json({
        errorMsg: "An error occured",
      });
    }
    return res.json(blog);
  });
};

// update blog
exports.updateBlog = async (req, res) => {
  Blog.findById({ _id: req.blogs._id }).exec((err, blog) => {
    if (blog.picture) {
      let path = blog.picture;
      fs.readdir(path, (err, files) => {
        if (path) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    }
  });
  const { user, title, content } = req.body;
  //const { user, content } = req.body
  const files = req.file;
  const fileuri = getData(files);

  try {
    const result = await cloudinary.uploader.upload(fileuri.content, {
      folder: 'blog'
    });
    const updateObj = { user, title, content, picture: result.secure_url };

    Blog.findByIdAndUpdate(
      { _id: req.blogs._id },
      { $set: updateObj },
      { useFindAndModify: false, new: true },
      (err, blog) => {
        if (err || !blog) {
          return res.status(400).json({
            error: "An error occured,  try again later",
          });
        }
        return res.status(200).json(blog);
      }
    );

  } catch (error) {
    console.log(error);
  }
  //const updateObj = { user, title, content, picture };


};

// delete blog
exports.deleteBlog = (req, res) => {
  Blog.findById({ _id: req.blogs._id }).exec((err, blog) => {
    if (blog.picture) {
      let path = blog.picture;
      fs.readdir(path, (err, files) => {
        if (path) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
      });
    }
  });
  Blog.findByIdAndRemove(
    { _id: req.blogs._id },
    { useFindAndModify: false, new: true },
    (err, blog) => {
      if (err || !blog) {
        return res.status(400).json({
          error: "An error occured,  try again later",
        });
      }
      return res.status(200).json({ message: "Blog has been deleted" });
    }
  );
};

// Upvote a blog
exports.upvoteBlog = (req, res) => {
  Blog.findByIdAndUpdate(
    { _id: req.blogs._id },
    {
      $push: { upvotes: req.profile._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  ).exec((err, result) => {
    if (err) {
      return res
        .status(400)
        .json({ errorMsg: "An error occured, try again later" });
    } else {
      res.status(200).json(result);
    }
  });
};

// Downvote a blog
exports.downvoteBlog = (req, res) => {
  Blog.findByIdAndUpdate(
    { _id: req.blogs._id },
    {
      $pull: { upvotes: req.profile._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  ).exec((err, result) => {
    if (err) {
      return res
        .status(400)
        .json({ errorMsg: "An error occured, try again later" });
    } else {
      res.status(200).json(result);
    }
  });
};

// comment on a blog
exports.commentBlog = (req, res) => {
  Blog.findByIdAndUpdate(
    { _id: req.blogs._id },
    {
      $push: {
        comments: { user: req.profile._id, text: req.body.text },
      },
    },
    {
      new: true,
    }
  ).exec((err, result) => {
    if (err) {
      return res
        .status(400)
        .json({ errorMsg: "An error occured, try again later" });
    } else {
      res.status(200).json(result);
    }
  });
};

exports.countShareBlog = (req, res) => {
  Blog.findById({ _id: req.blogs._id }).exec((err, blog) => {
    if (err) {
      return res
        .status(400)
        .json({ errorMsg: "An error occured, try again later" });
    }

    blog.shareCount++;
    blog.save();
    res.json(blog);
  });
};

exports.getAllBlogByUser = (req, res) => {
  Blog.find({ user: req.profile._id })
    .populate("user upvotes.user comments.user")
    .sort({ createdAt: -1 })
    .exec((err, blogs) => {
      if (err) {
        return res
          .json(400)
          .json({ errorMsg: "An error occured, try again later" });
      }
      res.status(200).json(blogs);
    });
};
