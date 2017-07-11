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

router.get('/faculty/:username/course/:index/resource', function(req, res){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, faculty){
		if(err || !faculty) return res.send('some error occured');
		else{
			return res.render('resource', {name: faculty.name, username: faculty.username, course: faculty.courses[index], status: faculty.status, index: index});
		}
	});
});

router.post('/faculty/:username/course/:index/resource/upload', multer({dest: 'uploads/resource/', keepExtensions: true}).single('file'), function(req, res) {
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
		.exec(function(err, faculty) {
			Course.update({_id: faculty.courses[index]._id},
				{$push: {resources: {path: targetPath, fileName: req.file.originalname}}},
				function(err) {
					if(err)
						return res.send(err);
					else return res.redirect('/faculty/'+username+'/course/'+index+'/resource');
			});
		});
    });
});

router.post('/faculty/:username/course/:index/resource/uploads/resource/:path/delete', function(req, res) {
	const username = req.session.username;
	const index = req.params.index;
	const path = 'uploads/resource/'+req.params.path;

	User.findOne({
			username,
		})
		.populate('courses')
		.exec(function(err, faculty) {
			Course.update({_id: faculty.courses[index]._id},
				{$pull: {resources: {path: path}}},
				function(err) {
					if(err)
						return res.send(err);
					fs.unlink(path, function(err){
						if(err) return res.send('some error occured');
						else return res.redirect('/faculty/'+username+'/course/'+index+'/resource');
					});
			});
		});
});

router.get('/download/uploads/resource/:path', function(req, res){
	const path = 'uploads/resource/'+req.params.path;
	return res.download(path);
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}