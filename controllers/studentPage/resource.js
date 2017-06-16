const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.get('/student/:username/course/:index/resource', function(req, res){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, student){
		if(err || !student) return res.send('some error occured');
		else{
			return res.render('resource', {name: student.name, username: student.username, course: student.courses[index], status: student.status, index: index});
		}
	});
});

router.get('/download/uploads/resource/:path', function(req, res){
	const path = 'uploads/resource/'+req.params.path
	return res.download(path);
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}