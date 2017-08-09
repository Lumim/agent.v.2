const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Submission = require('mongoose').model('Submission');
const File = require('mongoose').model('File');
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
		populate:{path: 'submissions',}})
	.exec(function(err, user){
		if (err) return next(err);
		const submissions = user.courses[index].submissions;
		submissions.reverse();
		const currentTime = new Date();
		return res.render('submission', {user: {name: user.name, username: username, 
			status: user.status, courseNo: index, submissions: submissions, 
			currentTime: currentTime}});
	});
});

router.post('/course/:index/submission', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username,
	})
	.populate({path: 'courses',})
	.exec(function(err, user){
		if (err) return next(err);
		const submission = new Submission({
			title: req.body.title,
			endTime: req.body.endTime,
			milliseconds: req.body.milliseconds,
			owner: username,
		});
		submission.save(function(err) {
			if(err) return next(err);
			const course = user.courses[index];
			course.submissions.push(submission._id);
			course.save(function(err) {
				if (err) return next(err);
				const data = {};
				data.submission = submission;
				return res.send(data);
			});
		});
	});
});

router.post('/course/:index/submission/change', onlyFaculty, function(req, res, next){
	const username= req.session.username;
	const ID = req.body.submissionID;
	Submission.findOne({
		_id: ID,
	})
	.exec(function(err, submission) {
		if(err) return next(err);
		if(!submission || submission.owner != username) {
			req.flash('error', 'Wrong User');
			req.session.destroy();
        	return res.redirect('/');
		}
		submission.endTime = req.body.endTime;
		submission.milliseconds = req.body.milliseconds;
		submission.save(function(err) {
			if (err) return next(err);
			return res.send(null);
		});
	});
});

router.post('/course/:index/submission/delete', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const ID = req.body.submissionID;
	Submission.findOne({
		_id: ID,
	})
	.exec(function(err, submission) {
		if(err) return next(err);
		if(!submission || submission.owner != username) {
			req.flash('error', 'Wrong User');
			req.session.destroy();
        	return res.redirect('/');
		}
		User.findOne({
			username,
		})
		.populate('courses')
		.exec(function(err, user) {
			if (err) return next(err);
			const course = user.courses[index];
			let i;
			for(i=0; i<course.submissions.length;i++) {
				if(course.submissions[i].toString() === ID.toString()) {
					break;
				}
			}
			course.submissions.splice(i, 1);
			course.save(function(err) {
				if(err) return next(err);
				Submission.findOne({
					_id: ID,
				})
				.remove(function(err) {
					if(err) return next(err);
					return res.send(null);
				});
			});
		});
	});
});

router.get('/submission/:ID', function(req, res, next) {
	const username= req.session.username;
	const ID = req.params.ID;
	Submission.findOne({
		_id: ID,
	})
	.populate('files')
	.exec(function(err, submission) {
		if(err) return next(err);
		if(!submission) {
			req.flash('error', 'Wrong User');
			req.session.destroy();
        	return res.redirect('/');
		}
		if(req.session.status === 'student') {
			const files = new Array();
			for(let i=0; i<submission.files.length; i++) {
				if(submission.files[i].username === username) {
					files.push(submission.files[i]);
				}
			}

			return res.render('submissionWindow', {user: {name: req.session.name, username: username, 
			status: 'student', submissionID: ID, files: files, endTime: submission.milliseconds}})
		}
		else {
			const files = submission.files;
			return res.render('submissionWindow', {user: {name: req.session.name, username: username, 
			status: 'faculty', submissionID: ID, files: files, endTime: submission.milliseconds}})
		}
	});
});

router.post('/submission/:ID', multer({dest: 'uploads/submission/', keepExtensions: true}).single('file'), function(req, res, next) {
	const username = req.session.username;
	const submissionID = req.params.ID;
	const tempPath = req.file.path;
	const targetPath = tempPath+'_'+req.file.originalname;

	fs.rename(tempPath, targetPath, function(err) {
		if(err) return next(err);
		const file = new File({
			path: targetPath,
			name: req.file.originalname,
			username: username,
			posterName: req.session.name,
		});
		file.save(function(err) {
			if(err) return next(err);
			Submission.findOne({
				_id: submissionID,
			})
			.exec(function(err, submission) {
				if(err) return next(err);
				submission.files.push(file._id);
				submission.save(function(err) {
					if(err) return next(err);
					return res.send(null);
				});
			});
		});
		
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}