const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Marksheet = require('mongoose').model('Marksheet');
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");
const deleteMarksheet = require('middlewares/deleteMarksheet');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const onlyFaculty = require('middlewares/onlyFaculty');
const fs = require('fs');
const async = require('async');

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
		for (i=0; i<courseList.length; i++) {
			if (courseList[i].status === 'active') {
				cnt++;
			}
			if (cnt.toString() === index.toString()) {
				return i;
			}
		}
	}
	else if (name === 'archivedCourses') {
		for (i=0; i<courseList.length; i++) {
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

router.get('/faculty/:username/course/:index', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("courseShow", {name: user.name, course: user.courses[index]});
		}
	});
})

router.get('/faculty/:username/course/:index/edit', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("courseEdit", {name: user.name, username: user.username, course: user.courses[index], index: index});
		}
	});
})

router.post('/faculty/:username/course/:index/edit/save', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			const _id = user.courses[index];
			Course.findOne({
				_id
			})
			.exec(function(err, course){
				if(err) return res.send('some error occured');
				if(!course) {
					return res.send('Wrong course');
				}
				else{
					course.name = req.body.name;
					course.code = req.body.code;
					course.section = req.body.section;
					course.classRoom = req.body.classRoom;

					course.save(function(err){
						if (err) return res.send('some error occured');
						return res.redirect("/faculty/"+username);
					});

				}
			});
		}
	});
});

router.post('/faculty/:username/course/:index/delete', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			//Delete the marksheet and subdocuments
			deleteMarksheet(user.courses[index].marksheet, user.courses[index], function(err){
				if(err) return res.send(err);
				//Delete resource
				async.eachOf(user.courses[index].resources,function(value,i,callBack) {
					fs.unlink(value.path, function(err) {
						if(err) return callBack(err);
						else return callBack(null);
					});
				}, function(err) {
					if(err) return res.send(err);
					//Delete course 
					const _id = user.courses[index];
					Course.findOne({
						_id
					})
					.remove(function(err){
						if (err) return res.send('some error occured');
						user.courses.splice(index, 1);
						user.save(function(err){
							if (err) return res.send('some error occured');
							return res.redirect("/faculty/"+username);
						});
					});
				});
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}