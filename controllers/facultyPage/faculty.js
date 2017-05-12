const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');

router.get('/faculty/:username', function(req, res){
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
			return res.render("faculty", user);
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', router);
	}
}