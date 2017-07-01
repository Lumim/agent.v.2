const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Group = require('mongoose').model('Group');
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");
const deleteMarksheet = require('middlewares/deleteMarksheet');
const async = require('async');
const multer = require('multer');
const fs = require('fs');

router.post('/:username/group/:id/attachment/upload', multer({dest: 'uploads/attachment/', keepExtensions: true}).single('file'), function(req, res) {
	const username = req.session.username;
	const id = req.params.id;
	const tempPath = req.file.path;
	const targetPath = tempPath+'_'+req.file.originalname;

	fs.rename(tempPath, targetPath, function(err) {
		if(err) return res.send(err);
		Group.update({_id: id},
			{$push: {attachments: {path: targetPath, fileName: req.file.originalname}}},
			function(err) {
				if(err) {
					return res.send(err);
				} else {
					return res.redirect('/'+username+'/group/'+id+'/attachment');
				}
		});
	});
});

router.post('/:username/group/:id/attachment/uploads/attachment/:path/delete', function(req, res) {
	const username = req.session.username
	const id = req.params.id;
	const path = 'uploads/attachment/'+req.params.path;

	Group.update({_id: id},
		{$pull: {attachments: {path: path}}},
		function(err) {
			if (err) {
				return res.send(err);
			} else {
				fs.unlink(path, function(err) {
					if (err) {
						return res.send(err);
					} else {
						return res.redirect('/'+username+'/group/'+id+'/attachment');
					}
				});
			}
		});
});

router.get('/download/uploads/attachment/:path', function(req, res){
	const path = 'uploads/attachment/'+req.params.path;
	return res.download(path);
});


module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}