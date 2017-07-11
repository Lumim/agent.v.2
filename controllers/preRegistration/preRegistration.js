const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PreRegistration = mongoose.model("PreRegistration");

router.get('/preregistrations', (req, res) => {
	if (!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
  PreRegistration.find({})
  .populate('preregistrations')
  .exec((err, courses) => {
    if(err || courses === null) return res.send("404 NOT FOUND");
    else{
      return res.render("preRegistration", {courses: courses});
    }
  })
})

router.post('/preregistrations/:id', (req, res) => {
	if (!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
	const ID = req.params.id
	PreRegistration.findOneAndUpdate({"courseID": ID}, {$inc: {"seats": 1}})
	.exec((err, course) => {
		if(err || course === null) return res.send('some error occured');
		else{
			res.redirect("/preregistrations")
		}
	});
});

module.exports = {
  addRouter(app) {
    app.use('/', router);
  }
}
