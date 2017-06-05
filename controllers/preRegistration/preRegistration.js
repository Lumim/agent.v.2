const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PreRegistration = mongoose.model("PreRegistration");

router.get('/preregistrations', (req, res) => {
  PreRegistration.find({})
  // , 'preregistrations', (err, courses) => {
  //   if(err || courses.length === 0) return res.send("404 NOT FOUND");
  //   else{
  //     console.log(courses);
  //     return res.render("preRegistration", {courses: courses});
  //   }
  // })
  .populate('preregistrations')
  .exec((err, courses) => {
    if(err || courses === null) return res.send("404 NOT FOUND");
    else{
      console.log(courses);
      return res.render("preRegistration", {courses: courses});
    }
  })
})

module.exports = {
  addRouter(app) {
    app.use('/', router)
  }
}
