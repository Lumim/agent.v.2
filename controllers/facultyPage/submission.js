const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Submission = require('mongoose').model('Submission');
const Exam = require('mongoose').model('Exam');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const onlyFaculty = require('middlewares/onlyFaculty');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.get('/course/:index/submission', function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'submissions',
			populate:{path: 'files'}}})
	.exec(function(err, user){
		if (err) return next(err);
		return res.render('submission', {user: {name: user.name, username: username, 
			status: user.status, courseNo: index, submissions: user.courses[index].submissions}});
	});
});

router.post('/course/:index/submission', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const milliseconds = req.body.milliseconds;

	User.findOne({
		username,
	})
	.populate({path: 'courses',})
	.exec(function(err, user){
		if (err) return next(err);
		const submission = new Submission({
			endTime: milliseconds,
		});
		submission.save(function(err) {
			if(err) return next(err);
			const course = user.courses[index];
			course.submissions.push(submission._id);
			course.save(function(err) {
				if (err) return next(err);
				return res.send(null);
			});
		});
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}