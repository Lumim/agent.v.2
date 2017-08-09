const express = require('express');
const User = require('mongoose').model('User'); // get
const Course = require('mongoose').model('Course');
const router = express.Router();
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const CHAIRMAN_INITIAL = 'imr';

router.get('/', function(req, res, next) {
	const username = req.session.username;
	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user) {
		if (err) return next(err);

		if(user.username !== CHAIRMAN_INITIAL && user.isChair) {
			user.isChair = false;
			user.save(function(err){
				if (err) return res.send('some error occured');
			});
		} else if(user.username === CHAIRMAN_INITIAL && !user.isChair) {
			user.isChair = true;
			user.save(function(err){
				if (err) return res.send('some error occured');
			});
		}
		return res.render('course', {
			user: {
				name: user.name,
				username: username,
				status: user.status,
				courses: user.courses,
				isChair: user.isChair
			}
		});
	});
});

module.exports = {
	addRouter(app) {
	app.use('/user/:username', [requireLogin, matchUsername, flash], router);
}};
