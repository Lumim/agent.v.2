const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const StudentMark = require('mongoose').model('StudentMark');
const mongoose = require("mongoose");
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');

router.get('/faculty/:username/course/:index/marksheet', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate('courses')
	.populate('marksheet')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("marksheet", {name: user.name, username: username, index: index, marksheet: user.courses[index].marksheet});
		}
	});
});

router.post('/faculty/:username/course/:index/marksheet/csv/upload', multer({dest: 'uploads/'}).single('csvdata'), function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	const data = req.body.file;

	User.findOne({
		username
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			//Delete the current marksheet completely
			let _id = user.courses[index].marksheet;
			deleteMarksheet(_id);  //decleared in middlewares section
            
			//Create instance of a new marksheet
			const marksheet = new Marksheet({});
			marksheet.save(function(err){
				if(err) return res.send('some error occured');

				//Parse CSV file and put it in the new marksheet
				csv().from.path(req.file.path, {
	               delimiter: ",",
	               escape: '"'
				})
				// when a record is found in the CSV file (a row)
				.on("record", function(row, index){
					const name = row[0].trim();
					const ID = row[1].trim();
					const email = row[2].trim();
					//Create a new student entry
					const studentMark = new StudentMark({
						name,
						ID,
						email
					});
					//Push that student entry into new marksheet
					studentMark.save(function(err){
						if(err) return res.send('some error occured');
						Marksheet.update({_id: marksheet._id}, {$addToSet: {studentMarks: studentMark._id}}, function(err){
							if (err) return res.send('some error occured');
						});
					});
				})
				// when the end of the CSV document is reached
	       		.on("end", function() {
	       			//Delete the local file in uploads/ folder.
	       			fs.readdir('uploads/', function(err, items) {
	   					items.forEach(function(file) {
	        				fs.unlink('./uploads/' + file, function(err){
	        					if(err) return res.send('some error occured');
	        				});
	   			 		});
	   				});
	   				//Put the new marksheet id in the index course
	   				_id = user.courses[index]._id;
					Course.findOne({
						_id
					})
					.exec(function(err, course){
						if(err) return res.send('some error occured');
						if(!course){
							return res.send('Wrong course');
						}
						else{
							course.marksheet = marksheet._id;
							course.save(function(err){
								if (err) return res.send('some error occured');
							});
						}
					});
	            	// redirect back to the root
	            	res.redirect("/faculty/"+username+"/course/"+index+"/marksheet");
	       		 })
	        	// if any errors occur
	       		.on("error", function(error) {
	            	console.log(error.message);
				});
			});
		}
	});
})

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}