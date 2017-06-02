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

const add = function(x, cb){
	for(let j=0; j<x.length; j++)
	{
		
	}
}

router.get('/faculty/:username/course/:index/marksheet/student/add', function(req, res){
	const username = req.params.username;
	const index = req.params.index;

	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return res.send(err);
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			const name = req.body.name;
			const ID = req.body.ID;
			const email = req.body.email;
			//Push that student entry into new marksheet
			Marksheet.update({_id: user.courses[index].marksheet._id}, {$push: {name: name, ID: ID, email: email}}, function(err){
				if (err) return res.send('some error occured');
				async.parallel([

				])
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}