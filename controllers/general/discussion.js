const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Message = require('mongoose').model('Message');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const async = require('async');

router.get('/course/:index/group/:groupNo/discussion', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;
	const groupNo = req.params.groupNo;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',
			populate:{path: 'discussions',
				populate:{path: 'posterImage comments',
					populate:{path: 'posterImage'}}}}})
	.exec(function(err, user) {
		if (err) return next(err);
		const discussions = user.courses[courseNo].groups[groupNo].discussions;
		discussions.reverse();
		return res.render('discussion', {user: {name: user.name, username: username, 
			courseNo: courseNo, groupNo: groupNo, discussions: discussions}});
	});
});

router.post('/course/:index/group/:groupNo/discussion', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;
	const groupNo = req.params.groupNo;
	const text = req.body.text;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if(err) return next(err);
		const message = new Message({
			text,
			username,
			posterName: user.name,
			posterImage: user.image,
		});
		message.save(function(err) {
			if(err) return next(err);
			const group = user.courses[courseNo].groups[groupNo];
			group.discussions.push(message._id);
			group.save(function(err) {
				if(err) return next(err);
				Message.populate(message, {path: 'posterImage'},
					function(err, message) {
						const data = {};
						data.message = message;
						return res.send(data);
					});
			});
		});
	});
});

router.post('/course/:index/group/:groupNo/discussion/comment', function(req, res, next){
	const username = req.session.username;
	const text = req.body.text;
	const postID = req.body.postID;

	User.findOne({
		username,
	})
	.exec(function(err, user) {
		if(err) return next(err);
		const message = new Message({
			text,
			username,
			posterName: user.name,
			posterImage: user.image,
		});
		message.save(function(err) {
			if(err) return next(err);
			Message.update({_id: postID},
				{$push: {comments: message._id}}, function(err) {
					if (err) return next(err);
					Message.populate(message, {path: 'posterImage'},
					function(err, message) {
						const data = {};
						data.message = message;
						return res.send(data);
					});
				});
		});
	});
});

router.post('/course/:index/group/:groupNo/discussion/edit', function(req, res, next){
	const username = req.session.username;
	const text = req.body.text;
	const postID = req.body.postID;

	Message.update({_id: postID},
		{$set: {text: text}}, function(err) {
			if (err) return next(err);
			return res.send(null);
		});
});

router.post('/course/:index/group/:groupNo/discussion/delete', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;
	const groupNo = req.params.groupNo;
	const text = req.body.text;
	const postID = req.body.postID;

    User.findOne({
    	username,
    })
    .populate({path: 'courses', 
		populate:{path: 'groups',
			populate:{path: 'discussions',}}})
    .exec(function(err, user) {
    	if (err) return next(err);
    	const group = user.courses[courseNo].groups[groupNo];
    	for(let i=0; i<group.discussions.length; i++) {
    		if (group.discussions[i]._id.toString() === postID.toString()) {
    			async.each(group.discussions[i].comments, function(commentID, cb) {
    				Message.findOne({
    					_id: commentID,
    				})
    				.remove(function(err) {
    					if (err) cb(err);
    					return cb(null);
    				});
    			}, function(err) {
    				if (err) return next(err);
    				group.discussions.splice(i, 1);
	    			group.save(function(err) {
	    				if (err) return next(err);
	    				Message.findOne({
	    					_id: postID,
	    				})
	    				.remove(function(err) {
	    					if (err) return next(err);
	    					const data = {};
	    					data.type = 1;
	    					return res.send(data);
	    				});
	    			});
    			});
    			break;
    		}
    		for(let j=0; j<group.discussions[i].comments.length; j++) {
    			if(group.discussions[i].comments[j].toString() === postID.toString()) {
    				group.discussions[i].comments.splice(j, 1);
    				group.discussions[i].save(function(err) {
    					if (err) return next(err);
	    				Message.findOne({
	    					_id: postID,
	    				})
	    				.remove(function(err) {
	    					if (err) return next(err);
	    					const data = {};
	    					data.type = 2;
	    					return res.send(data);
	    				});
    				});
    			}
    		}
    	}
    });
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}