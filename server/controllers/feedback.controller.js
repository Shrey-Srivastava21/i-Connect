const Feedback = require("../models/Feedback")
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const { getUserById } = require("../controllers/user.controller")

exports.getFeedbackById = (req, res, next, Id) => {
  Feedback.findById(Id).exec((err, feedback) => {
    if (err) {
      return res.status(400).json({
        errorMsg: "An error occured",
      })
    }
    if (!feedback) {
      return res.status(400).json({
        errorMsg: "Feedback not found",
      })
    }
    req.feedback = feedback
    next()
  })
}

fs.mkdir("uploads", (err) => {
  if (err) {
  }
  fs.mkdir("uploads/feedbacks", (err) => {
    if (err) {
    }
  })
})

const storage = multer.memoryStorage();
exports.upload = multer({ storage }).single('picture');
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
//exports.upload = multer({ storage: storage, fileFilter: fileFilter })

// create feedback
exports.createFeedback = async (req, res) => {
  const user = req.profile
  const { feedback } = req.body
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
    const newFeedback = Feedback({ user, feedback, picture: result.secure_url })
    newFeedback.save((err, feedback) => {
      if (err) {
        return res.status(400).json({
          errorMsg: "An error occured",
        })
      }
      res.status(200).json(feedback)
    })
  } catch (error) {
    console.log(error);
  }


}

//get all feedbacks
exports.allFeedbacks = (req, res) => {
  Feedback.find().exec((err, feedbacks) => {
    if (err) {
      res.status(400).json({
        errorMsg: "An error occured",
      })
    }

    return res.json(feedbacks)
  })
}

//Read a particular feedback
exports.getFeedback = (req, res) => {
  Feedback.find({ _id: req.feedback._id }).exec((err, feedback) => {
    if (err) {
      res.status(400).json({
        errorMsg: "An error occured",
      })
    }
    return res.json(feedback)
  })
}
