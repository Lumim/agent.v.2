const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const requireLoginMW = require('middlewares/requireLogin');

router.post('/faculty/:username/office-hour/add', function(req, res){
	const username = req.params.username;
	const day = req.body.day;
	const startHour = req.body.startHour;
	const startMin = req.body.startMin;
	const amOrPm1 = req.body.amOrPm1;
	const endHour = req.body.endHour;
	const endMin = req.body.endMin;
	const amOrPm2 = req.body.amOrPm2;
	const newTime = day+" "+startHour+":"+startMin+amOrPm1+"-"+endHour+":"+endMin+amOrPm2;

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
		app.use('/', [requireLoginMW], router);
	}
}