const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const File = require('mongoose').model('File');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const multer = require('multer');
const fs = require('fs');

router.get('/profile', function(req, res, next) {
	const username = req.session.username;
	User.findOne({
		username,
	})
	.populate('image')
	.exec(function(err, user) {
		if (err) return next(err);
		return res.render('profileViewEdit', {user: user})
	})
});

const imageFilter = function (req, file, cb) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

router.post('/profile/image', 
	multer({dest: 'public/image', fileFilter: imageFilter}).single('file'),
	function(req, res, next) {
	const username = req.session.username;
	const targetPath = req.file.path;

	User.findOne({
		username: username,
	})
	.populate('image')
	.exec(function(err, user) {
		File.findOne({
			_id: user.image._id,
		})
		.remove(function(err) {
			if (err) return next(err);
			const file = new File({
	    		path: targetPath,
	    		name: req.file.originalname,
	    		username: username,
	    	});
	    	file.save(function(err) {
	    		if(err) return next(err);
	    		User.update({username: username},
	    			{$set: {image: file._id}}, function(err) {
	    				if(err) return next(err);
	    				const data = {};
	    				data.path = targetPath;
	    				data.name = req.file.originalname;
	    				return res.send(data);
	    			});
	    	});
		});
	});
});

router.post('/profile/name', function(req, res, next) {
	const username = req.session.username;
	const name = req.body.name;

	User.update({username: username}, 
		{$set: {name: name}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/ID', function(req, res, next) {
	const username = req.session.username;
	const ID = req.body.ID;

	User.update({username: username}, 
		{$set: {ID: ID}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/education', function(req, res, next) {
	const username = req.session.username;
	const fromYear = req.body.fromYear;
	const toYear = req.body.toYear;
	let timePeriod = '';
	if(fromYear != '' && toYear != '')
		timePeriod = fromYear + ' - ' + toYear;

	User.update({username: username}, 
		{$push: {education: {
			school: req.body.school,
			degree: req.body.degree,
			grade: req.body.grade,
			timePeriod: timePeriod,
		}}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/delete', function(req, res, next) {
	const username = req.session.username;
	const type = req.body.type;
	const index = req.body.index;

	User.findOne({
		username,
	})
	.exec(function(err, user) {
		if (err) return next(err);
		user[type].splice(index, 1);
		user.save(function(err) {
			if (err) return next(err);
			return res.send(null);
		});
	});
});

/*
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
*/

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername], router);
	}
}