const express = require('express');
const User = require('mongoose').model('User'); // get
const Course = require('mongoose').model('Course');
const router = express.Router();
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');

router.get('/', function(req, res, next) {
	const username = req.session.username;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);
		return res.render('course', {user: {name: user.name, username: username,
			status: user.status, courses: user.courses}});
	});
});

module.exports = {
	addRouter(app) {
	app.use('/user/:username', [requireLogin, matchUsername, flash], router);
}};
