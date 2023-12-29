const Post = require("../models/Post")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const getData = require('./DataUri');
const cloudinary = require('../cloudinary');
const { getUserById } = require("../controllers/user.controller");
const { post } = require("../routes/auth.route");

exports.getPostById = (req, res, next, Id) => {
  Post.findById(Id)
    .populate("user likes.user comments.user")
    .exec((err, post) => {
      if (err) {
        return res.status(400).json({
          errorMsg: "An error occured",
        })
      }
      if (!post) {
        return res.status(400).json({
          errorMsg: "Post not found",
        })
      }
      post.user.salt = undefined
      post.user.encryptedpassword = undefined

      req.post = post
      next()
    })
}

fs.mkdir("uploads", (err) => {
  if (err) {
  }
  fs.mkdir("uploads/posts", (err) => {
    if (err) {
    }
  })
})

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype == "image/jpeg" ||
    file.mimetype == "image/png" ||
    file.mimetype == "image/gif" ||
    file.mimetype == "image/svg+xml" ||
    file.mimetype == "video/mp4"
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}
exports.upload = multer({ storage }).single('picture');

exports.createPost = async (req, res) => {
  const { user, content } = req.body
  const file = req.file;
  console.log(file);
  const fileuri = getData(file);
  //console.log(fileuri);
  try {
    const result = await cloudinary.uploader.upload(fileuri.content, {
      folder: 'posts'
    });
    //console.log(result);
    console.log(result.secure_url);
    console.log(result.public_id);
    const newPost = Post({
      user,
      content,
      picture:
        //result.public_id,
        result.secure_url

    })
    console.log(newPost);
    newPost.save((err, post) => {
      if (err) {
        res.status(400).json({
          errorMsg: "An error occured",
        })
      }
      return res.status(200).json(post)
    })
  } catch (error) {
    console.log(error);
  }

  //console.log(result);



}

exports.allposts = (req, res) => {
  Post.find()
    .populate("user likes.user comments.user")
    .sort({ createdAt: -1 })
    .exec((err, posts) => {
      if (err) {
        res.status(400).json({
          errorMsg: "An error occured",
        })
      }
      // posts.map((post) => {
      //   post.user.salt = undefined
      //   post.user.encryptedpassword = undefined
      // })
      return res.json(posts)
    })
}

//Read a particular post
exports.getPost = (req, res) => {
  // Post.find({ _id: req.post._id }).exec((err, post) => {
  //   if (err) {
  //     res.status(400).json("error")
  //   }
  //   return res.json(post)
  // })
  return res.json(req.post)
}

// update post
exports.updatePost = async (req, res) => {
  Post.findById({ _id: req.post._id }).exec((err, post) => {
    for (let picture of post.picture) {
      let path = picture

      fs.readdir(path, (err, files) => {
        if (path) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
        }
      })
    }
  })
  const { user, content } = req.body
  const files = req.file;
  const fileuri = getData(files);
  //console.log(fileuri);
  try {
    const result = await cloudinary.uploader.upload(fileuri.content, {
      folder: 'posts'
    });
    //console.log(result);
    console.log(result.secure_url);
    console.log(result.public_id);
    const updateObj = { user, content, picture: result.secure_url };

    Post.findByIdAndUpdate(
      { _id: req.post._id },
      { $set: updateObj },
      { useFindAndModify: false, new: true },
      (err, post) => {
        if (err || !post) {
          return res.status(400).json({
            errorMsg: "An error occured,  try again later",
          })
        }
      }

    )

  } catch (error) {
    console.log(error);
  }




}

// delete post
exports.deletePost = (req, res) => {
  Post.findById({ _id: req.post._id }).exec((err, post) => {
    for (let picture of post.picture) {
      let path = picture

      fs.readdir(path, (err, files) => {
        if (path) {
          fs.unlink(path, (err) => {
            if (err) {
              console.error(err)
              return
            }
          })
        }
      })
    }
  })
  Post.findByIdAndRemove(
    { _id: req.post._id },
    { useFindAndModify: false, new: true },
    (err, post) => {
      if (err || !post) {
        return res.status(400).json({
          errorMsg: "An error occured,  try again later",
        })
      }
      return res.status(200).json({ message: "Post has been deleted" })
    }
  )
}

// Like post
exports.likePost = (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.post._id },
    {
      $push: { likes: req.profile._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  )
    .populate("user likes.user")
    .exec((err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ errorMsg: "An error occured, try again later" })
      }
      result.user.salt = undefined
      result.user.encryptedpassword = undefined
      res.status(200).json(result)
    })
}

// Unlike post
exports.unlikePost = (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.post._id },
    {
      $pull: { likes: req.profile._id },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  )
    .populate("user likes.user")
    .exec((err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ errorMsg: "An error occured, try again later" })
      }
      result.user.salt = undefined
      result.user.encryptedpassword = undefined

      res.status(200).json(result)
    })
}

// comment on a post
exports.commentPost = (req, res) => {
  Post.findByIdAndUpdate(
    { _id: req.post._id },
    {
      $push: {
        comments: { user: req.profile._id, text: req.body.text },
      },
    },
    {
      new: true,
      useFindAndModify: false,
    }
  )
    .populate("user comments.user")
    .exec((err, result) => {
      if (err) {
        return res
          .status(400)
          .json({ errorMsg: "An error occured, try again later" })
      }
      result.user.salt = undefined
      result.user.encryptedpassword = undefined

      res.status(200).json(result)
    })
}

exports.getAllPostByUser = (req, res) => {
  Post.find({ user: req.profile._id })
    .populate("user likes.user comments.user")
    .sort({ createdAt: -1 })
    .exec((err, posts) => {
      if (err) {
        return res
          .json(400)
          .json({ errorMsg: "An error occured, try again later" })
      }
      res.status(200).json(posts)
    })
}
