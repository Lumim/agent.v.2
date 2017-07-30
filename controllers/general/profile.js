const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const File = require('mongoose').model('File');
const requireLogin = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const multer = require('multer');
const bcrypt = require('bcryptjs');
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
	req.session.name = name;

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

router.post('/profile/experience', function(req, res, next) {
	const username = req.session.username;
	const fromYear = req.body.fromYear;
	const toYear = req.body.toYear;
	let timePeriod = '';
	if(fromYear != '' && toYear != '')
		timePeriod = fromYear + ' - ' + toYear;

	User.update({username: username}, 
		{$push: {experience: {
			title: req.body.title,
			company: req.body.company,
			timePeriod: timePeriod,
		}}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/aap', function(req, res, next) {
	const username = req.session.username;

	User.update({username: username}, 
		{$push: {awardsAccomplishmentsAndPapers: {
			title: req.body.title,
			description: req.body.description,
			year: req.body.year,
		}}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/office', function(req, res, next) {
	const username = req.session.username;

	User.update({username: username}, 
		{$push: {office: {
			room: req.body.room,
			timePeriod: req.body.timePeriod,
		}}}, function(err) {
			if (err) next(err);
			return res.send(null); 
		});
});

router.post('/profile/delete', function(req, res, next) {
	const username = req.session.username;
	const type = req.body.type;
	const index = req.body.index;

	if(type!='education' && type!='experience' && type!='awardsAccomplishmentsAndPapers' && 
		type!='office') {
		return next();
	}

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

router.get('/profile/password', function(req, res, next) {
	const name = req.session.name;
	const username = req.session.username;
	return res.render('password', {user: {name: name, username: username}});
});

router.post('/profile/password', function(req, res, next) {
	const username = req.session.username;
	const cpassword = req.body.cpassword;
	const npassword = req.body.npassword;
	const rpassword = req.body.rpassword;
  	const data = {};

  	User.findOne({
  		username,
  	})
  	.exec(function(err, user) {
  		if (err) return next (err);
  		bcrypt.compare(cpassword, user.password, function(err, result) {
        	if (err) {
        		return next(err);
        	}
        	data.cpassword = result;
        	data.npassword = (!(npassword.length < 6 || npassword.lenghth > 30));
        	data.rpassword = (npassword === rpassword);

        	if(data.cpassword && data.npassword && data.rpassword) {
        		bcrypt.hash(npassword, require('../../secret.js').round, function(err, hash) {
        			if (err) return next(err);
        			user.password = hash;
        			user.save(function(err) {
        				if (err) return next(err);
        				// Flash is not working here
        				req.flash('success', 'Password successfully changed.');
        				req.session.destroy();
        				return res.send(data);
        			})
        		});
        	}
        	else {
        		return res.send(data);
        	}
        });
  	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}