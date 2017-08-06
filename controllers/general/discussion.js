const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Group = require('mongoose').model('Group');
const Exam = require('mongoose').model('Exam');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');

router.get('/course/:index/group/:groupNo/discussion', function(req, res ){
	const username = req.session.username;
	const index = req.params.index;
	const groupNo = req.params.groupNo;

	validUser(email, id, function(err) {
		if(err) {
			return res.send(err);
		}
		else {
			Group.findOne({
				_id: id,
			})
			.exec(function(err, grp) {
				if(!grp || err) return res.send('Some error occured');
				else
					return res.render("discussion.pug", {name: name, username: username, email: email, id: id, discussion: grp.discussion});
			});
		}
	});
});

router.post('/:username/group/:id/discussion/add', function(req, res){
	const id = req.params.id;
	const title = req.body.title;
	const body = req.body.body;
	const username = req.session.username;
	const name = req.session.name;
	const email = req.session.email;

	Group.update({_id: id},
		{$push: {discussion: {
			title: title,
			body: body,
			creatorName: name,
			creatorEmail: email,
		}}}, function(err) {
			if(err) return res.send(err);
			else return res.redirect('/'+username+'/group/'+id+'/discussion');
	});
});

router.post('/:username/group/:id/discussion/:no/delete', function(req, res){
	const username = req.session.username;
	const id = req.params.id;
	const no = req.params.no;

	Group.findOne({
		_id: id,
	})
	.exec(function(err, grp) {
		if (err) return res.send(err);
		grp.discussion.splice(no, 1);
		grp.save(function(err) {
			if (err) return res.send(err);
			else return res.redirect('/'+username+'/group/'+id+'/discussion');
		});
	});
});

router.post('/:username/group/:id/discussion/:no/comment/add', function(req, res){
	const username = req.session.username;
	const name = req.session.name;
	const email = req.session.email;
	const id = req.params.id;
	const no = req.params.no;
	const body = req.body.body;

	Group.findOne({
		_id: id,
	})
	.exec(function(err, grp) {
		if (err) return res.send(err);
		grp.discussion[no].comment.push({
			body: body,
			creatorName: name,
			creatorEmail: email,
		});
		grp.save(function(err) {
			if (err) return res.send(err);
			else return res.redirect('/'+username+'/group/'+id+'/discussion');
		});
	});
});

router.post('/:username/group/:id/discussion/:no/comment/:no2/delete', function(req, res){
	const username = req.session.username;
	const id = req.params.id;
	const no = req.params.no;
	const no2 = req.params.no2;

	Group.findOne({
		_id: id,
	})
	.exec(function(err, grp) {
		if (err) return res.send(err);
		grp.discussion[no].comment.splice(no2, 1);
		grp.save(function(err) {
			if (err) return res.send(err);
			else return res.redirect('/'+username+'/group/'+id+'/discussion');
		});
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}