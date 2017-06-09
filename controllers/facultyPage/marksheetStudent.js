const express = require('express');
const router = express.Router();
const User = require('mongoose').model('User');
const Course = require('mongoose').model('Course');
const Marksheet = require('mongoose').model('Marksheet');
const Exam = require('mongoose').model('Exam');
const requireLoginMW = require('middlewares/requireLogin');
const deleteMarksheet = require('middlewares/deleteMarksheet');
const async = require('async');
const sendEmail = require('mailer').sendEmail;


router.get('/faculty/:username/course/:index/marksheet/student/add', function(req, res){
	const username = req.params.username;
	const index = req.params.index;

	return res.render('studentAdd', {username, index});
});

router.post('/faculty/:username/course/:index/marksheet/student/add/save', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	const name = req.body.name;
	const ID = req.body.ID;
	const email = req.body.email;
 
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet'}})
	.exec(function(err, faculty){
		if(err) return res.send(err);
		else{
			Marksheet.update({_id: faculty.courses[index].marksheet._id}, {$push: {name: name, ID: ID, email: email, courseStatus: 'pending'}})
			.exec(function(err){
				if(err) return res.send(err);
				User.findOne({
					email: email,
					status: 'student',
				})
				.exec(function(err, student) {
					if(err) return res.send(err);
					if(!student) {
						return res.send('Not implemented yet');
					}
					else {
						User.update({_id: student._id},
							{$push: {courses: faculty.courses[index]._id}}, function(err) {
								if (err) return res.send(err);
                                const to = [email];
								const from = 'no-reply@agent-v2.com';
				   				const subject = 'New Course Request';
							    const text = 'Please login to your Agent account and response to the request';
							    const html = '';
							    return sendEmail({ to, from, subject, text, html }, function(err) {
								   if (err) {
								     return res.send(err);
								   } else return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
		            			});
							});
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

router.post('/faculty/:username/course/:index/marksheet/student/:no/delete', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	const studentNo = req.params.no;
 
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, faculty){
		if(err) return res.send(err);
		else{
			User.update({email: faculty.courses[index].marksheet.email[studentNo]},
				{$pull: {courses: faculty.courses[index]._id}}, function(err) {
					if (err) return res.send(err);
					const marksheet = faculty.courses[index].marksheet;
					marksheet.name.splice(studentNo, 1);
					marksheet.ID.splice(studentNo, 1);
					marksheet.courseStatus.splice(studentNo, 1);
					marksheet.email.splice(studentNo, 1);
					marksheet.attendance.splice(studentNo, 1);
					marksheet.total.splice(studentNo, 1);
					marksheet.grade.splice(studentNo, 1);
					marksheet.save(function(err){
						if(err) return res.send(err);
						async.parallel([
						function(cb){deleteExam(faculty.courses[index].marksheet.quiz, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.mid, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.assignment, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.project, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.presentation, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.fieldWork, studentNo, cb)},
						function(cb){deleteExam(faculty.courses[index].marksheet.final, studentNo, cb)},],
						function(err){
							console.log('After all delete');
							if(err) return res.send(err);
							else return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
						});
					});
				});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}