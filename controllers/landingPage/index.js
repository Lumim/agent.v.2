const express = require("express");
const User = require('mongoose').model('User'); //get
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/', function(req, res){
	res.render("index");
});

router.post('/login', function(req, res){
	const username = req.body.username;
	const password = req.body.password;

	User.findOne({
		username
	})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			//req.flash('error', 'Username not found');
			return res.send('Wrong password or username');
		}
		else{
			bcrypt.compare(password, user.password, function(err, result){
				if(err) return res.send('some error occured');
				if(result == true)
				{
					req.session.login = true;
			        req.session.email = user.email;
			        req.session.name = user.name;
                    if(user.status == 'faculty')
			        	return res.redirect('/faculty/'+username);
				}
				else return res.send('Wrong password or username');
			});
		}
	});
})

router.post('/signup', function(req, res ){
	const name = req.body.name;
	const email = req.body.email;
	const username = req.body.username;
	const school = req.body.school;
	const country = req.body.country;
	const password = req.body.password;
	const status = req.body.portal;

    //Autogen salt and hash
	bcrypt.hash(password, require('../../secret.js').round, function(err, hash){
		if (err) return res.send('some error occured');
		else{
			const user = new User({
				name,
				email,
				username,
				school,
				country,
				password: hash,
				status
			});

			user.save(function(err){
				if (err) return res.send('some error occured');
				return res.send('ok');
			});
		}
	});
})

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}