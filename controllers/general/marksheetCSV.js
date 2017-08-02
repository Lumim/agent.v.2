const express = require('express');
const router = express.Router();
const path = require('path');
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const flash = require('middlewares/flash');
const onlyFaculty = require('middlewares/onlyFaculty');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.post('/course/:index/csv', multer({dest: 'uploads/csv/'}).single('file'), onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const data = {};

	if (path.extname(req.file.originalname) != '.csv') {
		data.fileEx = false;
		return res.send(data);
	}

	User.findOne({
		username,
	})
	.populate('courses')
	.exec(function(err, user){
		if(err) return next(err);
		else{
			//Delete the current marksheet completely
			let _id = user.courses[index].marksheet;
			//decleared in middlewares section
			deleteMarksheet(_id, user.courses[index], function(err){
				if(err) return next(err);
				//Create instance of a new marksheet
				const marksheet = new Marksheet({});
				const to = new Array();
				const data = [];
				marksheet.save(function(err){
					if(err) return next(err);
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
						data.push({name: name, ID: ID, email: email});
					})
					// when the end of the CSV document is reached
		       		.on("end", function() {
		       			//Delete the local file in uploads/ folder.
		       			fs.readdir('uploads/csv/', function(err, items) {
		       				if (err) return next(err);
		   					items.forEach(function(file) {
		   						if (file === req.file.filename) {
		   							fs.unlink('./uploads/csv/' + file, function(err){
			        					if(err) return next(err);
			        				});
		   						}
		   			 		});
		   				});
		   				Course.findOne({
		   					_id: user.courses[index]._id,
		   				})
		   				.exec(function(err, course){
		   					if(err) return next(err);
		   					course.marksheet = marksheet._id;
							course.save(function(err){
								if(err) return next(err);
								async.eachOf(data, function(value, i, callBack){
				   					Marksheet.update({_id: marksheet._id}, {$push: {name: value.name, ID: value.ID, email: value.email, courseStatus: 'pending'}}, function(err){
										if (err) return callBack(err);
										User.findOne({
											email: value.email,
										})
										.exec(function(err, student){
											if(err) return callBack(err);
											if(!student){
												to.push(value.email); // Student might not have account
												return callBack(null);
											}
											else{
												// Faculty can not add a facuulty as a student
												if(student.status.toString() != 'student') {
													Marksheet.update({_id: marksheet._id}, {$pull: {name: value.name, ID: value.ID, email: value.email, courseStatus: 'pending'}}, function(err){
														if(err) return callBack(err);
														else return callBack(null); //Send an alert that eamil is a faculty email
													});
												}
												else {
													User.update({_id: student._id}, {$push: {courses: user.courses[index]}}, function(err){
														if(err) return callBack(err);
														//Have to sent request mail
														to.push(value.email);
														return callBack(null);
													});
												}
											}
										});
									});
				   				}, function(err){
				   					if(err) return next(err);
				   					const from = 'no-reply@agent-v2.com';
					   				const subject = 'New Course Request';
								    const text = 'Please login to your Agent account and response to the course request';
								    const html = '';
								    return sendEmail({ to, from, subject, text, html }, function(err) {
									    if (err) {
									      return next(err);
									    }
										data.fileEx = true;
			            				return res.send(data);
			            			});
				   				});

							});
		   				});
		       		 })
		        	// if any errors occur
		       		.on("error", function(err) {
		            	return next(err);
					});
				});

			}); 
		}
	});
})

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}