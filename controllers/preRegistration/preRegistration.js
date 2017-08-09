const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const PreRegistration = mongoose.model('PreRegistration');
const User = mongoose.model('User');
const Course = mongoose.model('Course');
const CHAIRMAN_INITIAL = 'imr';

router.get('/preregistrations', (req, res) => {
	username = req.session.username;
	if (!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}
  PreRegistration.find({})
  .populate('preregistrations')
  .exec((err, courses) => {
    if(err || courses === null) return res.send("404 NOT FOUND");
    else{
      return res.render("preRegistration", {courses: courses, user:{name:username}});
    }
  })
})

router.get('/preregistrations/chair', (req, res) => {
	if(!(req.session && req.session.login)) {
		return res.send("404 NOT FOUND");
	}

	const username = req.session.username;
	if(username !== CHAIRMAN_INITIAL){
		User.findOne({
			username,
		})
		.exec((err, user) => {
			user.isChair = false;
			user.save(function(err){
				if (err) return res.send('some error occured');
			});
			return res.send("404 NOT FOUND");
		});
	}

	User.findOne({
		username: username,
		isChair : true
	})
	.populate('image')
	.exec((err, user) => {
		const username = user.username;
		PreRegistration.find({})
		.exec((err, courses) => {
			if(err) return res.send("404 NOT FOUND");
			else {

				return res.render('preRegistrationChair', {
					courses: courses,
					user: {
						name: req.session.name,
						username: username,
						image: user.image
					}
				});
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
	let Grades = [
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
					if(grades[j] === 'A') {
						Grades[0].Count = Grades[0].Count + 1;
					} else if(grades[j] === 'A-') {
						Grades[1].Count = Grades[1].Count + 1;
					} else if(grades[j] === 'B+') {
						Grades[2].Count = Grades[2].Count + 1;
					} else if(grades[j] === 'B') {
						Grades[3].Count = Grades[3].Count + 1;
					} else if(grades[j] === 'B-') {
						Grades[4].Count = Grades[4].Count + 1;
					} else if(grades[j] === 'C+') {
						Grades[5].Count = Grades[5].Count + 1;
					} else if(grades[j] === 'C') {
						Grades[6].Count = Grades[6].Count + 1;
					} else if(grades[j] === 'C-') {
						Grades[7].Count = Grades[7].Count + 1;
					} else if(grades[j] === 'D') {
						Grades[8].Count = Grades[8].Count + 1;
					} else if(grades[j] === 'F') {
						Grades[9].Count = Grades[9].Count + 1;
					}
				}
			}
			return res.render('courseDetails', {
				user: { name: username},
				gradeA: Grades[0].Count,
				gradeAm: Grades[1].Count,
				gradeBp: Grades[2].Count,
				gradeB: Grades[3].Count,
				gradeBm: Grades[4].Count,
				gradeCp: Grades[5].Count,
				gradeC: Grades[6].Count,
				gradeCm: Grades[7].Count,
				gradeD: Grades[8].Count,
				gradeF: Grades[9].Count
			});
		});
	});

});

module.exports = {
  addRouter(app) {
    app.use('/', router);
  }
}
