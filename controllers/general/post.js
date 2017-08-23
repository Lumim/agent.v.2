const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Message = require('mongoose').model('Message');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const async = require('async');

router.get('/course/:index/post', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'posts',
			populate:{path: 'poster comments',
					populate:{path: 'image',},
					populate:{path: 'poster',
						populate:{path: 'image'}}}}})
	.exec(function(err, user) {
		if (err) return next(err);
		const posts = user.courses[courseNo].posts;
		posts.reverse();
		return res.render('post', {user: {name: user.name, username: username, 
			courseNo: courseNo, posts: posts}});
	});
});

router.post('/course/:index/post', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;
	const text = req.body.text;

	User.findOne({
		username,
	})
	.populate({path: 'courses',})
	.exec(function(err, user) {
		if(err) return next(err);
		const message = new Message({
			text,
			poster: user._id,
		});
		message.save(function(err) {
			if(err) return next(err);
			const course = user.courses[courseNo];
			course.posts.push(message._id);
			course.save(function(err) {
				if(err) return next(err);
				Message.populate(message, {path: 'poster', populate:{path: 'image'}},
					function(err, message) {
						const data = {};
						data.message = message;
						return res.send(data);
					});
			});
		});
	});
});

router.post('/course/:index/post/comment', function(req, res, next){
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
			poster: user._id,
		});
		message.save(function(err) {
			if(err) return next(err);
			Message.update({_id: postID},
				{$push: {comments: message._id}}, function(err) {
					if (err) return next(err);
					Message.populate(message, {path: 'poster', populate:{path: 'image'}},
					function(err, message) {
						const data = {};
						data.message = message;
						return res.send(data);
					});
				});
		});
	});
});

router.post('/course/:index/post/edit', function(req, res, next){
	const username = req.session.username;
	const text = req.body.text;
	const postID = req.body.postID;

	Message.update({_id: postID},
		{$set: {text: text}}, function(err) {
			if (err) return next(err);
			return res.send(null);
		});
});

router.post('/course/:index/post/delete', function(req, res, next){
	const username = req.session.username;
	const courseNo = req.params.index;
	const text = req.body.text;
	const postID = req.body.postID;

    User.findOne({
    	username,
    })
    .populate({path: 'courses', 
		populate:{path: 'posts',}})
    .exec(function(err, user) {
    	if (err) return next(err);
    	const course = user.courses[courseNo];
    	for(let i=0; i<course.posts.length; i++) {
    		if (course.posts[i]._id.toString() === postID.toString()) {
    			async.each(course.posts[i].comments, function(commentID, cb) {
    				Message.findOne({
    					_id: commentID,
    				})
    				.remove(function(err) {
    					if (err) cb(err);
    					return cb(null);
    				});
    			}, function(err) {
    				if (err) return next(err);
    				course.posts.splice(i, 1);
	    			course.save(function(err) {
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
    		for(let j=0; j<course.posts[i].comments.length; j++) {
    			if(course.posts[i].comments[j].toString() === postID.toString()) {
    				course.posts[i].comments.splice(j, 1);
    				course.posts[i].save(function(err) {
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