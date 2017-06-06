const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PreRegistration = mongoose.model("PreRegistration");

router.get('/preregistrations', (req, res) => {
  PreRegistration.find({})
  .populate('preregistrations')
  .exec((err, courses) => {
    if(err || courses === null) return res.send("404 NOT FOUND");
    else{
      return res.render("preRegistration", {courses: courses});
    }
  })
})

module.exports = {
  addRouter(app) {
    app.use('/', router)
  }
}
