const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");

router.post('/faculty/:username/course/add', function(req, res ){
	const username = req.params.username;
	const name = req.body.name;
	const code = req.body.code;
	const section = req.body.section;
	const classRoom = req.body.classRoom;

	const course = new Course({
		name,
		code,
		section,
		classRoom
	});
	course.save(function(err){
		if(err) return res.send('some error occured');
		User.findOne({
			username
		})
		.exec(function(err, user){
			if(err) return res.send('some error occured');
			if(!user) {
				return res.send('Wrong user');
			}
			else{
				User.update({_id: user._id}, {$addToSet: {courses: course._id}}, function(err){
					if (err) return res.send('some error occured');
					return res.redirect("/faculty/"+username);
				});
			}
		});
	});
})

router.get('/faculty/:username/course/:index', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("courseShow", {name: user.name, course: user.courses[index]});
		}
	});
})

router.get('/faculty/:username/course/:index/edit', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("courseEdit", {name: user.name, username: user.username, course: user.courses[index], index: index});
		}
	});
})

router.post('/faculty/:username/course/:index/edit/save', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			const _id = user.courses[index];
			Course.findOne({
				_id
			})
			.exec(function(err, course){
				if(err) return res.send('some error occured');
				if(!course) {
					return res.send('Wrong course');
				}
				else{
					course.name = req.body.name;
					course.code = req.body.code;
					course.section = req.body.section;
					course.classRoom = req.body.classRoom;

					course.save(function(err){
						if (err) return res.send('some error occured');
						return res.redirect("/faculty/"+username);
					});

				}
			});
		}
	});
});

router.post('/faculty/:username/course/:index/delete', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			const _id = user.courses[index];
			Course.findOne({
				_id
			})
			.remove(function(err){
				if (err) return res.send('some error occured');
			});

			user.courses.splice(index, 1);
			user.save(function(err){
				if (err) return res.send('some error occured');
				return res.redirect("/faculty/"+username);
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}