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

router.get('/student/:username/course/:index/submission', function(req, res){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.exec(function(err, student){
		if(err || !student) return res.send('some error occured');
		else{
			Submission.find({submittedBy:student._id, course: student.courses[index]})
			.populate('submittedBy')
			.exec(function(err, files) {
				if (err) return res.send(err);
				else return res.render('submission', {name: student.name, username: student.username, status: student.status, index: index, files: files});
			});
		}
	});
});

router.post('/student/:username/course/:index/submission/upload', multer({dest: 'uploads/submission/', keepExtensions: true}).single('file'), function(req, res) {
	const username = req.session.username;
	const index = req.params.index;
	const tempPath = req.file.path;
	const targetPath = tempPath+'_'+req.file.originalname;

    fs.rename(tempPath, targetPath, function(err) {
    	if(err) return res.send(err);
		User.findOne({
			username,
		})
		.populate('courses')
		.exec(function(err, student) {
			if(err) return res.send (err);
			const submission = new Submission({
				file: {path: targetPath, fileName: req.file.originalname},
				submittedBy: student._id,
				course: student.courses[index]._id,
			});
			submission.save(function(err) {
				if (err) return res.sebd(err);
				else return res.redirect('/student/'+username+'/course/'+index+'/submission');
			});
		});
    });
});

router.get('/download/uploads/submission/:path', function(req, res){
	const path = 'uploads/submission/'+req.params.path
	return res.download(path);
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}