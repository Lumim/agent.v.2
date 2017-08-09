const express = require("express");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Marksheet = require('mongoose').model('Marksheet');
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const onlyFaculty = require('middlewares/onlyFaculty');
const deleteMarksheet = require('middlewares/deleteMarksheet');

router.post('/course/add', [onlyFaculty],function(req, res, next){
	const username = req.session.username;
	const marksheet = new Marksheet({});
	marksheet.save(function(err){
		if(err) return next(err);
		const course = new Course({
			status: 'active',
			nickName: req.body.nickName,
        	code: req.body.code,
        	fullName: req.body.fullName,
        	section: req.body.section,
        	classRoom: req.body.classRoom,
        	classTime: req.body.classTime,
        	description: req.body.description,
			marksheet: marksheet._id,
			facultyName: req.session.name,
			facultyEmail: req.session.email,
			facultyUsername: req.session.username,
		});
		course.save(function(err){
			if(err) return next(err);
			User.update({username}, {$addToSet: {courses: course._id}}, function(err){
				if (err) return next(err);
				return res.redirect("/user/"+username);
			});
		});
	});
});

router.post('/course/close', [onlyFaculty],function(req, res, next){
	const username = req.session.username;
	const index = req.body.index;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		let course;
		let cnt = -1, i;
		for (i=0 ; i<user.courses.length; i++) {
			if (user.courses[i].status === 'active') {
				cnt++;
			}
			if (cnt.toString() === index.toString()) {
				course = user.courses[i]; // Copy of the course
				break;
			}
		}
		// Take out the course
		user.courses.splice(i, 1);
		user.save(function(err) {
			if (err) return next(err);
			course.status = 'archive';
			course.save(function(err) {
				if (err) return next(err);
				// Push the course at the end
				User.update({username}, 
					{$push: {courses: course}}, function(err) {
						if (err) return next(err);
						return res.send(null);
					});
			});
		});
	});
});

function getCourse(index, name, courseList) {
	let cnt = -1, i;
	if (name === 'activeCourses') {
		for (i=courseList.length-1; i>=0; i--) {
			if (courseList[i].status === 'active') {
				cnt++;
			}
			if (cnt.toString() === index.toString()) {
				return i;
			}
		}
	}
	else if (name === 'archivedCourses') {
		for (i=courseList.length-1; i>=0; i--) {
			if (courseList[i].status === 'archive') {
				cnt++;
			}
			if (cnt.toString() === index.toString()) {
				return i;
			}
		}
	}
	return -1;
}

router.post('/course/delete', [onlyFaculty],function(req, res, next){
	const username = req.session.username;
	const index = req.body.index;
	const name = req.body.name;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		const i = getCourse(index, name, user.courses);
		if (i === -1)
			return res.send('In get course function some error occured');
		const course = user.courses[i]; // Copy of the course
		// Take out the course
		user.courses.splice(i, 1);
		user.save(function(err) {
			if (err) return next(err);
			let _id = course.marksheet;
			//decleared in middlewares section
			deleteMarksheet(_id, course, function(err){
				if (err) return next(err);
				// Delete course from database
				Course.findOne({
					_id: course._id,
				})
				.remove(function(err) {
					if (err) return next(err);
					return res.send(null);
				});
			});
		});
	});
});

router.post('/course/index',function(req, res, next){
	const username = req.session.username;
	const index = req.body.index;
	const name = req.body.name;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		const i = getCourse(index, name, user.courses);
		if (i === -1)
			return res.send('In get course function some error occured');
		const data = {};
		data.index = i;
		res.send(data);
	});
});


router.get('/course/:index/view', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		return res.render('courseView', {user: {name: user.name, username: username,
			status: user.status, courseNo: index, course: user.courses[index]}});
	});
});

router.post('/course/:index/view', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		const course = user.courses[index];
		course.nickName = req.body.nickName;
        course.code = req.body.code;
        course.fullName = req.body.fullName;
        course.section = req.body.section;
        course.classRoom = req.body.classRoom;
        //console.log(req.body.classTimeDelete);
        //console.log(req.body.classTimeAdd);
  		for(let i=0; i<req.body.classTimeDelete.length; i++) {
  			for(let j=0; j<course.classTime.length; j++) {
  				if (course.classTime[j] === req.body.classTimeDelete[i]) {
  					course.classTime.splice(j, 1);
  					break;
  				}
  			}
  		}
  		for(let i=0; i<req.body.classTimeAdd.length; i++) {
  			course.classTime.push(req.body.classTimeAdd[i]);
  		}
        course.description = req.body.description;
        course.save(function(err) {
        	if (err) return next(err);
        	return res.send(null);
        });
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}