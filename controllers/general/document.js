const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Group = require('mongoose').model('Group');
const File = require('mongoose').model('File');
const router = express.Router();
const requireLogin = require("middlewares/requireLogin");
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const async = require('async');
const multer = require('multer');
const fs = require('fs');

router.get('/course/:index/group/:groupNo/document', function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const groupNo = req.params.groupNo;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',
			populate:{path: 'documents'}}})
	.exec(function(err, user) {
		if (err) return next(err);
		const documents = user.courses[index].groups[groupNo].documents;
		documents.reverse();
		return res.render('document', {user: {name: user.name, username: username, 
			courseNo: index, groupNo: groupNo, documents: documents}});
	});
});


router.post('/course/:index/group/:groupNo/document/upload', multer({dest: 'uploads/document/', keepExtensions: true}).single('file'), function(req, res, next) {
	const username = req.session.username;
	const courseNo = req.params.index;
	const groupNo = req.params.groupNo;
	const tempPath = req.file.path;
	const targetPath = tempPath+'_'+req.file.originalname;

	fs.rename(tempPath, targetPath, function(err) {
		if(err) return next(err);
		User.findOne({
			username,
		})
		.populate({path: 'courses', 
			populate:{path: 'groups',}})
		.exec(function(err, user) {
			if (err) return next(err);
			const groupID = user.courses[courseNo].groups[groupNo]._id;
			const file = new File({
				path: targetPath,
				name: req.file.originalname,
				username: username,
				posterName: user.name,
			});
			file.save(function(err){
				if (err) return next(err);
				Group.update({_id: groupID},
					{$push: {documents: file._id}}, function(err) {
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

router.post('/course/:index/group/:groupNo/document/delete', function(req, res, next) {
	const username = req.session.username
	const courseNo = req.params.index;
	const groupNo = req.params.groupNo;
	const path = req.body.path;

	User.findOne({
			username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if (err) return next(err);
		const groupID = user.courses[courseNo].groups[groupNo]._id;
		fs.unlink(path, function(err){
			if (err) return next(err);
			File.findOne({
				path,
			})
			.exec(function(err, file) {
				if (err) return next(err);
				const fileID = file.id;
				Group.update({_id: groupID},
					{$pull: {documents: {_id: fileID}}}, function(err) {
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