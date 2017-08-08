const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');

router.get('/user/:username/profile', function(req, res, next) {
	const username = req.params.username;
	User.findOne({
		username,
	})
	.populate('image')
	.exec(function(err, user) {
		if (err) return next(err);
		if (req.session && req.session.username === username)
			return res.render('profileViewEdit', {user: user});
		else
			return res.render('profileView', {user: user});
	})
});

module.exports = {
	addRouter(app){
		app.use(router);
	}
}