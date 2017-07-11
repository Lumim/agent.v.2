const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const requireLoginMW = require('middlewares/requireLogin');

router.get('/student/:username/profile/edit', function(req, res){
	const username = req.params.username;
	User.findOne({
		username
	})
	.exec(function(err, student){
		if(err) return res.send('some error occured');
		if(!student) {
			return res.send('Wrong user');
		}
		else{
			return res.render("studentProfileEdit", student);
		}
	});
});

router.post('/student/:username/profile/edit/save', function(req, res){
	const username = req.params.username;
	User.findOne({
		username
	})
	.exec(function(err, student){
		if(err) return res.send('some error occured');
		if(!student) {
			return res.send('Wrong user');
		}
		else{
			student.name = req.body.name;
			student.school = req.body.school;
			student.country = req.body.country;
			student.ID = req.body.ID;

			student.save(function(err){
				if (err) return res.send('some error occured');
				return res.redirect("/student/"+username);
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}