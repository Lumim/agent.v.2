const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PreRegistration = mongoose.model('PreRegistration');
const User = mongoose.model('User');
const Course = mongoose.model('Course');

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

router.get('/preregistrations/chair', (req, res) => {
	if(!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
	User.findOne({
		isChair : true
	})
	.exec((err, user) => {
		PreRegistration.find({})
		.exec((err, courses) => {
			if(err) return res.send("404 NOT FOUND");
			else {
				return res.render('preRegistrationChair', {courses: courses});
			}
	  })
	});
})

router.post('/preregistrations/add', (req, res) => {
	// console.log("Hit");
	if (!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
	const name = req.body.name;
	const code = req.body.code;
	const preregistrations = new PreRegistration({
		courseName: name,
		courseID: code,
		seats: 0
	});

	PreRegistration.create(preregistrations, (err, doc) =>  {
		if(err) {
			console.log(err);
			return res.send('some error occured');
		}
		return res.redirect('/preregistrations/chair');
	});

});

router.post('/preregistrations/:id', (req, res) => {
	const username = req.params.username;
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

router.post('/preregistrations/details/:code', (req, res) => {
	const code = req.params.code;
	const username = req.session.username;
	var Grades = [
		{
			Grade: 'A',
			Count: 0
		},
		{
			Grade: 'A-',
			Count: 0
		},
		{
			Grade: 'B+',
			Count: 0
		},
		{
			Grade: 'B',
			Count: 0
		},
		{
			Grade: 'B-',
			Count: 0
		},

		{
			Grade: 'C+',
			Count: 0
		},

		{
			Grade: 'C',
			Count: 0
		},

		{
			Grade: 'C-',
			Count: 0
		},

		{
			Grade: 'D',
			Count: 0
		},

		{
			Grade: 'F',
			Count: 0
		}
	];

	if (!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
	User.findOne({
		username
	})
	.exec((err, user) => {
		if(!user.isChair){
			return res.send("404 NOT FOUND");
		}
		Course.find({
			code
		})
		.populate('marksheet')
		.exec((err, courses) => {
			for(var i = 0; i < courses.length; i++) {
				const grades = courses[i].marksheet.grade;
				for(var j = 0; j < grades.length; j++) {
					
				}
			}
		});
	});

});

module.exports = {
  addRouter(app) {
    app.use('/', router);
  }
}
