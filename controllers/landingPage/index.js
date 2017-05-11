const express = require("express");
const User = require('mongoose').model('User'); //get

const router = express.Router();

router.get('/', function(req, res){
	res.render("index");
});

router.post('/login', function(req, res){
	const username = req.body.username;
	console.log(username);
})

router.post('/signup', function(req, res ){
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const school = req.body.school;
	const country = req.body.country;
	const password = req.body.password;
	const status = req.body.portal;
	
	const user = new User({
		name,
		email,
		username,
		school,
		country,
		password,
		status
	});

	console.log(user);

	user.save(function(err){
		if (err) return res.send('some error occured');
		return res.send('ok');
	});
})

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}