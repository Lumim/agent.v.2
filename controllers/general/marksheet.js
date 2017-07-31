const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');

router.get('/course/:index/marksheet', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user) {
		if (err) return next(err);
		return res.render('marksheet', {user: {name: user.name, username: username,
			status: user.status, course: user.courses[index]}});
	});
}); 

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}