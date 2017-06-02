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
		if(err) return res.send(err);
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
					name: 'Total '+examName,
					url: examType+'-total'
				});
				totExam.save(function(err){
					if(err) res.send(err);
					const query = {
						_id: user.courses[index].marksheet._id
					}
					const temp = {};
					temp[examType] = totExam._id;
					Marksheet.update(query, {$push: temp}, function(err){
						if(err) res.send(err);
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i]= '';
						}
						Exam.update({_id: totExam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
							if(err) res.send(err);
							//Now add the exam
							no = no+1;
							const exam = new Exam({
								name: examName+'-'+no,
								url: examType+'-'+no
							});
							exam.save(function(err){
								if(err) return res.send(err);
								temp[examType] = exam._id;
								Marksheet.update(query, {$push: temp}, function(err){
									if (err) return res.send(err);
									Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
										if(err) res.send(err);
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
					name: examName+'-'+no,
					url: examType+'-'+no
				});
				exam.save(function(err){
					if(err) return res.send(err);
					const query = {
						_id: user.courses[index].marksheet._id
					}
					const temp = {};
					temp[examType] = exam._id;
					Marksheet.update(query, {$push: temp}, function(err){
						if (err) return res.send(err);
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i] = '';
						}
						Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
							if(err) res.send(err);
							res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
						});
					});
				});
			}
		}
	});
});

router.get('/faculty/:username/course/:index/marksheet/:exam-:no', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	const exam = req.params.exam;
	const no = req.params.no;

	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return res.send(err);
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			if(no == 'total')
				return res.render("exam", {name: user.name, username: username, index: index, type: 'total', exam: user.courses[index].marksheet[exam][0]});
			else
				return res.render("exam", {name: user.name, username: username, index: index, type: 'single', exam: user.courses[index].marksheet[exam][no]});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}