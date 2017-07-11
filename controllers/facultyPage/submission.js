const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Submission = require('mongoose').model('Submission');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.get('/faculty/:username/course/:index/submission', function(req, res){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.exec(function(err, faculty){
		if(err || !faculty) return res.send('some error occured');
		else{
			Submission.find({course: faculty.courses[index]})
			.populate('submittedBy')
			.exec(function(err, files) {
				if (err) return res.send(err);
				else return res.render('submission', {name: faculty.name, username: faculty.username, status: faculty.status, index: index, files: files});
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}