const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
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
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			//console.log(user.courses[index].marksheet);
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
					//Push that student entry into new marksheet
					Marksheet.update({_id: marksheet._id}, {$push: {name: name, ID: ID, email: email}}, function(err){
						if (err) return res.send('some error occured');
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
								// redirect back to the root
	            				res.redirect("/faculty/"+username+"/course/"+index+"/marksheet");
							});
						}
					});
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
	const examType = req.body.exam;
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
			let no = user.courses[index].marksheet[examType].length;
			//During first time along with the exam add totalExam element at 0 index
			if(no == 0)
			{
				//first add the total exam
				const totExam = new Exam({
					name: 'Total '+examName
				});
				totExam.save(function(err){
					if(err) res.send('some error occured');
					const query = {
						_id: user.courses[index].marksheet._id
					}
					const temp = {};
					temp[examType] = totExam._id;
					Marksheet.update(query, {$push: temp}, function(err){
						if(err) res.send('some error occured');
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						for(let i=0; i<studentNo; i++)
							mark[i] = '';
						Exam.update({_id: totExam._id}, {$pushAll: {marks: mark}}, function(err){
							if(err) res.send('some error occured');
							//Now add the exam
							no = no+1;
							const exam = new Exam({
								name: examName+'-'+no
							});
							exam.save(function(err){
								if(err) return res.send('some error occured');
								temp[examType] = exam._id;
								Marksheet.update(query, {$push: temp}, function(err){
									if (err) return res.send('some error occured');
									Exam.update({_id: exam._id}, {$pushAll: {marks: mark}}, function(err){
										if(err) res.send('some error occured');
										res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
									});
								});
							});
						});
					});
				});
			}
			else{
				//Only add the exam
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
					Marksheet.update(query, {$push: temp}, function(err){
						if (err) return res.send('some error occured');
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						for(let i=0; i<studentNo; i++)
							mark[i] = '';
						Exam.update({_id: exam._id}, {$pushAll: {marks: mark}}, function(err){
							if(err) res.send('some error occured');
							res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
						});
					});
				});
			}
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}