const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const StudentMark = require('mongoose').model('StudentMark');
const Exam = require('mongoose').model('Exam');
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
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz totalQuiz mid totalMid assignment totalAssignment project totalProject presentation totalPresentation fieldWork totalFieldWork final totalFinal attendance totalAttendance studentMarks'}}})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			console.log(user.courses[index].marksheet);
			return res.render("marksheet", {name: user.name, username: username, index: index, marksheet: user.courses[index].marksheet});
		}
	});
});

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

router.get('/faculty/:username/course/:index/marksheet/edit', function(req, res){
	console.log("I am here");
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz totalQuiz studentMarks'}}})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.send("200 OK");
			//return res.render("marksheet", {name: user.name, username: username, index: index, marksheet: user.courses[index].marksheet});
		}
	});
});

router.post('/faculty/:username/course/:index/marksheet/add', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	let examType = req.body.exam;
	const examName = examType.charAt(0).toUpperCase() + examType.slice(1);

	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet'}})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			const no = user.courses[index].marksheet[examType].length + 1;
			const exam = new Exam({
				name: examName+'-'+no
			});
			exam.save(function(err){
				if(err) return res.send('some error occured');
				const query = {
					_id: user.courses[index].marksheet._id
				}
				const temp = {};
				temp[examType] = exam._id;
				Marksheet.update(query, {$addToSet: temp}, function(err){
					if (err) return res.send('some error occured');
					if(no == 1){
						const totExam = new Exam({
							name: 'Total '+examName
						});
						totExam.save(function(err){
							if(err) return res.send('some error occured');
							examType = 'total'+examName;
							Marksheet.findOne({
								_id: user.courses[index].marksheet._id
							})
							.exec(function(err, marksheet){
								marksheet[examType] = totExam._id;
								marksheet.save(function(err){
									if(err) res.send(err);
									res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
								})
							});
						});
					}
					else{
						res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
					}
				})
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}