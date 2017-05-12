const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');

router.get('/faculty/:username/profile/edit', function(req, res){
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
			return res.render("profileEdit", user);
		}
	});
});

router.post('/faculty/:username/profile/edit/save', function(req, res){
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
			user.name = req.body.name;
			user.school = req.body.school;
			user.country = req.body.country;
			user.initial = req.body.initial;
			user.department = req.body.department;
			user.officeRoom = req.body.officeRoom;

			user.save(function(err){
				if (err) return res.send('some error occured');
				return res.redirect("/faculty/"+username);
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}