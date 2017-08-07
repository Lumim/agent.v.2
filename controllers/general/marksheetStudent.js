const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const matchUsername = require('middlewares/matchUsername');
const onlyFaculty = require('middlewares/onlyFaculty');
const flash = require('middlewares/flash');
const async = require('async');
const sendEmail = require('mailer').sendEmail;

router.post('/course/:index/marksheet/student', onlyFaculty, function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	const name = req.body.name;
	const ID = req.body.ID;
	const email = req.body.email;
	const data = {};

	if (name === '') {
		data.name = false;
	} else {
		data.name = true;
	}
	if (email === '') {
		data.email = false;
		data.emailType = 1;
	} else {
		data.email = true;
	}
	if (name === '' || email === '') {
		return res.send(data);
	}
 
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet'}})
	.exec(function(err, faculty){
		if(err) return next(err);
		else{
			Marksheet.update({_id: faculty.courses[index].marksheet._id}, {$push: {name: name, ID: ID, email: email, courseStatus: 'pending'}})
			.exec(function(err){
				if(err) return next(err);
				User.findOne({
					email: email,
				})
				.exec(function(err, student) {
					if(err) return next(err);
					if(!student) {
						const to = [email];
						const from = 'no-reply@agent-v2.com';
		   				const subject = 'New Course';
						const text = 'You are enrolled in a new course by your respected faculty member. Please login to your Agent account for more details';
						const html = '';
					    return sendEmail({ to, from, subject, text, html }, function(err) {
						   if (err) {
						     return next(err);
						   } else return res.send(data);
            			});
					}
					else {
						if (student.status.toString() != 'student') {
							Marksheet.update({_id: faculty.courses[index].marksheet._id}, {$pull: {name: name, ID: ID, email: email, courseStatus: 'pending'}})
							.exec(function(err) {
								if(err) return next(err);
								data.email = false;
								data.emailType = 2;
								return res.send(data);
							});
						}
						else {
							User.update({_id: student._id},
							{$push: {courses: faculty.courses[index]._id}}, function(err) {
								if (err) return next(err);
                                const to = [email];
								const from = 'no-reply@agent-v2.com';
				   				const subject = 'New Course Request';
							    const text = 'Please login to your Agent account and response to the request';
							    const html = '';
							    return sendEmail({ to, from, subject, text, html }, function(err) {
								   if (err) {
								     return next(err);
								   } else return res.send(data);
		            			});
							});
						}
					}
				});
			});
		}
	});
});

const deleteExam = function(exam, index, cb){
	async.eachOf(exam, function(value, index2, callBack){
		value.marks.splice(index, 1);
		value.parcentage.splice(index, 1);
		value.save(callBack);
	}, cb);
};

const calculationEx = function(xx, studentNo, req, asyncCB ){
	async.eachOf(xx,function(value,index,cb){
		let highestMark = 0, chart = new Array(12), p;
		for (let j=0; j<12; j++) {
			chart[j] = 0;
		}
		for(let j=0; j<studentNo; j++) {
			if(!(value.marks[j]=='' || isNaN(value.marks[j]))) {
				highestMark = Math.max(highestMark, value.marks[j]);
				p = ((value.marks[j]/value.totalMark)*100).toFixed(2);
				if(p <= 10) chart[0]++;
				else if(p <= 20) chart[1]++;
				else if(p <= 30) chart[2]++;
				else if(p <= 40) chart[3]++;
				else if(p <= 50) chart[4]++;
				else if(p <= 60) chart[5]++;
				else if(p <= 70) chart[6]++;
				else if(p <= 80) chart[7]++;
				else if(p <= 90) chart[8]++;
				else if(p <= 100) chart[9]++;
			}
		}
		Exam.update({_id: value._id}, {$set: {highestMark: highestMark, pieChart: chart}})
		.exec(cb);
	}, asyncCB );
};


router.post('/course/:index/marksheet/student/delete', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const studentNo = req.body.no;
 
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return next(err);
		else{
			// Pull out the course from student list
			User.update({email: user.courses[index].marksheet.email[studentNo]},
				{$pull: {courses: user.courses[index]._id}}, function(err) {
					if (err) return next(err);
					const marksheet = user.courses[index].marksheet;
					marksheet.name.splice(studentNo, 1);
					marksheet.ID.splice(studentNo, 1);
					marksheet.courseStatus.splice(studentNo, 1);
					marksheet.email.splice(studentNo, 1);
					marksheet.attendance.splice(studentNo, 1);
					marksheet.total.splice(studentNo, 1);
					marksheet.grade.splice(studentNo, 1);
					marksheet.save(function(err){
						if(err) return next(err);
						async.parallel([
						function(cb){deleteExam(user.courses[index].marksheet.quiz, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.mid, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.assignment, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.project, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.presentation, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.fieldWork, studentNo, cb)},
						function(cb){deleteExam(user.courses[index].marksheet.final, studentNo, cb)},],
						function(err){
							if(err) return next(err);
							// Calculate total columns 
							const studentNo = user.courses[index].marksheet.name.length;
							async.parallel([
								function(cb){calculationEx(user.courses[index].marksheet.quiz, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.mid, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.assignemnt, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.project, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.presentation, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.fieldWork, studentNo, req, cb)},
								function(cb){calculationEx(user.courses[index].marksheet.final, studentNo, req, cb)}],
								function(err){
									if(err) return next(err);
									return res.send(null);
								});
						});
					});
				});
		}
	});
});

router.post('/course/:index/marksheet/student/view', function(req, res, next){
	const email = req.body.email;
	const data = {};
	User.findOne({
		email,
	})
	.exec(function(err, user){
		if(err) return next(err);
		if (!user) {
			data.url = false;
		} else {
			data.url = 'http://localhost:3000/user/'+user.username+'/profile';
		}
		return res.send(data);
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}