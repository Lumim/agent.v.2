const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const csv = require('csv');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.post('/faculty/:username/course/:index/marksheet/csv/upload', multer({dest: 'uploads/'}).single('csvdata'), function(req, res){
	const username = req.params.username;
	const index = req.params.index;

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
			//decleared in middlewares section
			deleteMarksheet(_id, user.courses[index], function(err){
				if(err) return res.send(err);
				//Create instance of a new marksheet
				const marksheet = new Marksheet({});
				const to = new Array();
				const data = [];
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
						data.push({name: name, ID: ID, email: email});
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
		   				Course.findOne({
		   					_id: user.courses[index]._id,
		   				})
		   				.exec(function(err, course){
		   					if(err) return res.send(err);
		   					course.marksheet = marksheet._id;
							course.save(function(err){
								if(err) return res.send(err);

								async.eachOf(data, function(value, i, callBack){
				   					Marksheet.update({_id: marksheet._id}, {$push: {name: value.name, ID: value.ID, email: value.email, courseStatus: 'pending'}}, function(err){
										if (err) return callBack(err);
										User.findOne({
											email: value.email,
										})
										.exec(function(err, student){
											if(err) return callBack(err);
											if(!student){
												console.log('Not implemented yet');
											}
											else{
												User.update({_id: student._id}, {$push: {courses: user.courses[index]}}, function(err){
													if(err) return callBack(err);
													//Have to sent request mail
													to.push(value.email);
													return callBack(null);
												});
											}
										});
									});
				   				}, function(err){
				   					if(err) return res.send(err);
				   					const from = 'no-reply@agent-v2.com';
					   				const subject = 'New Course Request';
								    const text = 'Please login to your Agent account and response to the request';
								    const html = '';
								    console.log("I ma here 2");
								    return sendEmail({ to, from, subject, text, html }, function(err) {
									   if (err) {
									     console.log(err);
									     return res.send(err);
									   }
										// redirect back to the root
										console.log("I am here");
			            				res.redirect("/faculty/"+username+"/course/"+index+"/marksheet");
			            			});
				   				});

							});
		   				});
		       		 })
		        	// if any errors occur
		       		.on("error", function(error) {
		            	console.log(error.message);
					});
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