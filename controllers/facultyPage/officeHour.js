const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');

router.post('/faculty/:username/office-hour/add', function(req, res){
	const username = req.params.username;
	const day = req.body.day;
	const time = req.body.time;
	const newTime = day+" "+time;

	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			User.update({_id: user._id}, {$addToSet: {officeHours: newTime}}, function(err){
				if (err) return res.send('some error occured');
				return res.redirect("/faculty/"+username);
			});
		}
	});
});

router.post('/faculty/:username/office-hour/:index/delete', function(req, res){
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
			user.officeHours.splice(index, 1);
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