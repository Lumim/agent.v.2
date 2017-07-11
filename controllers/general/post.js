const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');


router.get('/:username/course/:index/post', function(req, res){
	const username = req.session.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err || !user) return res.send('some error occured');
		else{
			return res.render('post', {name: user.name, username: user.username, email: user.email, post: user.courses[index].post, index: index});
		}
	});
});

router.post('/:username/course/:index/post/add', function(req, res){
	const username = req.session.username;
	const index = req.params.index;
	const title = req.body.title;
	const body = req.body.body;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err || !user) return res.send('some error occured');
		else{
			Course.update({_id: user.courses[index]._id},
				{$push: {post: {
					title: title,
					body: body,
					creatorName: user.name,
					creatorEmail: user.email,
				}}}, function(err) {
					if(err) return res.send(err);
					else return res.redirect('/'+username+'/course/'+index+'/post');
				});
		}
	});
});

router.post('/:username/course/:index/post/:no/delete', function(req, res){
	const username = req.session.username;
	const index = req.params.index;
	const no = req.params.no;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err || !user) return res.send('some error occured');
		else{
			Course.findOne({
				_id: user.courses[index]._id,
			})
			.exec(function(err, course) {
				if (err) return res.send(err);
				course.post.splice(no, 1);
				course.save(function(err) {
					if (err) return res.send(err);
					else return res.redirect('/'+username+'/course/'+index+'/post');
				});
			});
		}
	});
});

router.post('/:username/course/:index/post/:no/comment/add', function(req, res){
	const username = req.session.username;
	const index = req.params.index;
	const no = req.params.no;
	const body = req.body.body;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err || !user) return res.send('some error occured');
		else{
			Course.findOne({
				_id: user.courses[index]._id,
			})
			.exec(function(err, course) {
				if (err) return res.send(err);
				course.post[no].comment.push({
					body: body,
					creatorName: user.name,
					creatorEmail: user.email,
				});
				course.save(function(err) {
					if (err) return res.send(err);
					else return res.redirect('/'+username+'/course/'+index+'/post');
				});
			});
		}
	});
});

router.post('/:username/course/:index/post/:no/comment/:no2/delete', function(req, res){
	const username = req.session.username;
	const index = req.params.index;
	const no = req.params.no;
	const no2 = req.params.no2;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err || !user) return res.send('some error occured');
		else{
			Course.findOne({
				_id: user.courses[index]._id,
			})
			.exec(function(err, course) {
				if (err) return res.send(err);
				course.post[no].comment.splice(no2, 1);
				course.save(function(err) {
					if (err) return res.send(err);
					else return res.redirect('/'+username+'/course/'+index+'/post');
				});
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}