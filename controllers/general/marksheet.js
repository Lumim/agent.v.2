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

router.get('/course/:index/marksheet', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate({path: 'courses',
		populate:{path: 'marksheet',
			populate: {path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user) {
		if (err) return next(err);
		return res.render('marksheet', {user: {name: user.name, username: username,
			status: user.status, courseNo: index, course: user.courses[index]}});
	});
});

router.get('/course/:index/marksheet/edit', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return next(err);
		else{
			return res.render("marksheetEdit", {user: {name: user.name, username: username,
				courseNo: index, marksheet: user.courses[index].marksheet}});
		}
	});
});

const calculationEx = function(xx, studentNo, req, asyncCB ){
	let len, student = new Array(), x = new Array();
	if(xx){
		len = xx.length-1;
		//reverse the object array
		for(let j=len; j>=0; j--){
			x.push(xx[j]);
		}
		for(let j=0; j<studentNo; j++){
			student[j] = new Array();
			//for(let k=0; k<len; k++){
			//	student[j][k] = 0;
			//}
		}
	}

	async.eachOf(x,function(value,index,cb){

		if(index < len){
			let p, temp = [], parcentage = [], fieldName, mark, highestMark = 0, chart = new Array(12);
			for (let i=0; i<12; i++) {
				chart[i] = 0;
			}

        	for(let j=0; j<studentNo; j++){
				fieldName = value.name+'_'+j;
				mark = req.body[fieldName];
				temp.push(mark);

				if(mark=='' || isNaN(mark)){
					parcentage.push('');
					student[j].push(0);
				}
				else{
					p = ((mark/value.totalMark)*100).toFixed(2);
					parcentage.push('('+p+'%)');
					highestMark = Math.max(highestMark, mark);
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
					//student[j][index] = p;
					student[j].push(p);
				}
			}
			Exam.update({_id: value._id}, {$set: { marks: temp, parcentage: parcentage, highestMark: highestMark, pieChart: chart}})
			.exec(cb);
        }
        //Calculating total column of the exam
		else{
			let p, temp = [], highestMark = 0, chart = new Array(12);
			for (let i=0; i<12; i++) {
				chart[i] = 0;
			}

			if(value.best == '' || isNaN(value.best) || value.best > len)
				best = x.length-1;
			else
				best = value.best;
			
			for(let j=0; j<studentNo; j++){
				student[j].sort(function(a, b) { return a > b ? 1 : -1});
				student[j].reverse();
				sum = 0;
				let flag = false;

				for(let k=0; k<best; k++){
					if(student[j][k] != ''){
						sum = sum + (student[j][k]*1);
						flag = true;
					}
				}
				if(flag){
					average = sum/best;
					p = ((average/100)*value.parcentageCount).toFixed(2);
					temp.push(p);
					highestMark = Math.max(highestMark, p);
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
			    else{
			    	temp.push('');
			    }
			}
			Exam.update({_id: value._id}, {$set: { marks: temp, highestMark: highestMark, pieChart: chart}})
			.exec(cb);
		}
	}, asyncCB );
};

const calculationAt = function(x, studentNo, req, asyncCB){
	let fieldName, mark, temp = [];

	for(let j=0; j<studentNo; j++){
		fieldName = 'attendance_'+j;
		mark = req.body[fieldName];
		if(mark=='' || isNaN(mark)){
			temp.push('');
		}
		else{
			temp.push(mark);
		}
	}
	Marksheet.update({_id: x._id}, {$set: {attendance: temp}})
	.exec(function(err){
		return asyncCB(err);
	});
}

const calculationGra = function(x, studentNo, req, asyncCB){
	let fieldName, mark, temp = [];

	for(let j=0; j<studentNo; j++){
		fieldName = 'grade_'+j;
		mark = req.body[fieldName];
		temp.push(mark);
	}
	Marksheet.update({_id: x._id}, {$set: {grade: temp}})
	.exec(function(err){
		return asyncCB(err);
	});
}

router.post('/course/:index/marksheet/edit', onlyFaculty,function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return next(err);
		else{
			const studentNo = user.courses[index].marksheet.name.length;
			async.parallel([
				function(cb){calculationEx(user.courses[index].marksheet.quiz, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.mid, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.assignemnt, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.project, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.presentation, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.fieldWork, studentNo, req, cb)},
				function(cb){calculationEx(user.courses[index].marksheet.final, studentNo, req, cb)},
				function(cb){calculationAt(user.courses[index].marksheet, studentNo, req, cb)},
				function(cb){calculationGra(user.courses[index].marksheet, studentNo, req, cb)}],
				function(err){
					if(err) return next(err);
					let sum, temp = [];
					Marksheet.findOne({
						_id: user.courses[index].marksheet._id
					})
					.populate({path: 'quiz mid assignment project presentation fieldWork final'})
					.exec(function(err, x){
						if(err) return next(err);
						for(let j=0; j<studentNo; j++){
							sum = 0;
							if(x.quiz.length > 0)
								sum += 1*x.quiz[0].marks[j];
							if(x.mid.length > 0)
								sum += 1*x.mid[0].marks[j];
							if(x.assignment.length > 0)
								sum += 1*x.assignment[0].marks[j];
							if(x.project.length > 0)
								sum += 1*x.project[0].marks[j];
							if(x.presentation.length > 0)
								sum += 1*x.presentation[0].marks[j];
							if(x.fieldWork.length > 0)
								sum += 1*x.fieldWork[0].marks[j];
						    if(x.final.length > 0)
								sum += 1*x.final[0].marks[j];
							if(x.attendance[j])
								sum += 1*x.attendance[j];
							sum = sum.toFixed(2);
							temp.push(sum);
						}
						Marksheet.update({_id: x._id}, {$set: {total: temp}})
						.exec(function(err){
							if(err) return next(err)
							return res.redirect('/user/'+username+'/course/'+index+'/marksheet');
						});
					});
				});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}