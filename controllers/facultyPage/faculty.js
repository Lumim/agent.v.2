const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const requireLoginMW = require('middlewares/requireLogin');

router.get('/faculty/:username', [requireLoginMW], function(req, res){
	const username = req.params.username;
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
			//console.log(user);
			return res.render("faculty", user);
		}
	});
});

router.get('/faculty/:username/logout', [requireLoginMW], function(req, res){
	req.session.destroy();
	return res.redirect('/');
});

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}