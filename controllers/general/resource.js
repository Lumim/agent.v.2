const express = require('express');
const User = require('mongoose').model('User'); // get
const Course = require('mongoose').model('Course');
const File = require('mongoose').model('File');
const router = express.Router();
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const multer = require('multer');
const fs = require('fs');

router.get('/course/:index/resource', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'resources',}})
	.exec(function(err, user) {
		if (err) return next(err);
		const resources = user.courses[index].resources;
		resources.reverse();
		return res.render('resource', {user: {name: user.name, username: username, 
			status: user.status, courseNo: index, resources: resources}});
	});
});


router.post('/course/:index/resource/upload', multer({dest: 'uploads/resource/', keepExtensions: true}).single('file'), function(req, res, next) {
	const username = req.session.username;
	const courseNo = req.params.index;
	const tempPath = req.file.path;
	const targetPath = tempPath+'_'+req.file.originalname;

	fs.rename(tempPath, targetPath, function(err) {
		if(err) return next(err);
		User.findOne({
			username,
		})
		.populate({path: 'courses',})
		.exec(function(err, user) {
			if (err) return next(err);
			const courseID = user.courses[courseNo]._id;
			const file = new File({
				path: targetPath,
				name: req.file.originalname,
				username: username,
				posterName: user.name,
			});
			file.save(function(err){
				if (err) return next(err);
				Course.update({_id: courseID},
					{$push: {resources: file._id}}, function(err) {
						if(err) {
							return next(err);
						} else {
							const data = {};
							data.file = file;
							return res.send(data);
						}
				});
			});
		});
	});
});

router.post('/course/:index/resource/delete', function(req, res, next) {
	const username = req.session.username
	const courseNo = req.params.index;
	const path = req.body.path;

	User.findOne({
			username,
	})
	.populate({path: 'courses',})
	.exec(function(err, user) {
		if (err) return next(err);
		const courseID = user.courses[courseNo]._id;
		fs.unlink(path, function(err){
			if (err) return next(err);
			File.findOne({
				path,
			})
			.exec(function(err, file) {
				if (err) return next(err);
				const fileID = file.id;
				Course.update({_id: courseID},
					{$pull: {resources: {_id: fileID}}}, function(err) {
						if(err) return next(err);
						File.findOne({
							_id: fileID,
						})
						.remove(function(err) {
							if (err) return next(err);
							return res.send(null);
						});
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