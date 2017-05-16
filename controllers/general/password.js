const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const bcrypt = require('bcryptjs');

router.get('/faculty/:username/password/change', function(req, res){
	const username = req.params.username;
	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("passwordChange", user);
		}
	});
});

router.post('/faculty/:username/password/change/save', function(req, res){
	const email = req.session.email;
	const currentPassword = req.body.currentPassword;
	const newPassword = req.body.newPassword;
	User.findOne({
		email
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			bcrypt.compare(currentPassword, user.password, function(err, result){
				if(err) return res.send('some error occured');
				if(result == true)
				{
					if(currentPassword == newPassword)
						return res.send('Same password');
					else{
						bcrypt.hash(newPassword, require('../../secret.js').round, function(err, hash){
							if (err) return res.send('some error occured');
							else{
								user.password = hash;
								user.save(function(err){
									if (err) return res.send('some error occured');
									return res.redirect("/");
								});
							}
						});
					}
				}
				else return res.send('Wrong password or username');
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}