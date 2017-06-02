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

router.get('/faculty/:username/course/:index/marksheet/:exam-:no/edit', function(req, res){
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
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			if(no == 'total')
				return res.render("examEdit", {name: user.name, username: username, index: index, type: 'total', exam: user.courses[index].marksheet[exam][0]});
			else
				return res.render("examEdit", {name: user.name, username: username, index: index, type: 'single', exam: user.courses[index].marksheet[exam][no]});
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
		}
	}

	async.eachOf(x,function(value,index,cb){

		if(index < len){
			let p,  parcentage = [], mark, highestMark = 0, chart = new Array(12);

        	for(let j=0; j<studentNo; j++){
				mark = value.marks[j];

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
					student[j].push(p);
				}
			}
			Exam.update({_id: value._id}, {$set: { parcentage: parcentage, highestMark: highestMark, pieChart: chart}})
			.exec(cb);
        }
        //Calculating total column of the exam
		else{
			let p, temp = [], highestMark = 0, chart = new Array(12);

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

router.post('/faculty/:username/course/:index/marksheet/:exam-:no/edit/save', function(req, res){
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
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			if(no == 'total'){
				const best = req.body.best;
				const parcentageCount = req.body.parcentageCount;
				//Update only the total exam column
				Exam.findByIdAndUpdate(
					user.courses[index].marksheet[exam][0]._id, 
					{$set: { 
						best: best, 
						parcentageCount: parcentageCount
					}},{
						new: true
					})
				.exec(function(err, newExam){
					if(err) return res.send(err);
					user.courses[index].marksheet[exam][0] = newExam;
					const studentNo = user.courses[index].marksheet.name.length;

					async.parallel([
						function(cb){calculationEx(user.courses[index].marksheet[exam], studentNo, req, cb)},
					],
					function(err){
						if(err) return res.send('some error occured');
						Marksheet.findOne({
							_id: user.courses[index].marksheet._id
						})
						.populate({path: 'quiz mid assignment project presentation fieldWork final'})
						.exec(function(err, x){
							if(err) return res.send(err);
							totalCalculation(studentNo, x, function(err){
								if(err) return res.send(err);
								return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet/'+exam+'-'+no);
							})
						});				
					});
				});
			}
			else{
				const totalMark = req.body.totalMark;
				const date = req.body.date;
				//Update no'th exam
				Exam.findByIdAndUpdate(
					user.courses[index].marksheet[exam][no]._id, 
					{$set: { 
						totalMark: totalMark, 
						date: date
					}},{
						new: true //return the updated object
					})
				.exec(function(err, newExam){
					if(err) return res.send(err);
					user.courses[index].marksheet[exam][no] = newExam;
					const studentNo = user.courses[index].marksheet.name.length;

					async.parallel([
						function(cb){calculationEx(user.courses[index].marksheet[exam], studentNo, req, cb)},
					],
					function(err){
						if(err) return res.send('some error occured');
						Marksheet.findOne({
							_id: user.courses[index].marksheet._id
						})
						.populate({path: 'quiz mid assignment project presentation fieldWork final'})
						.exec(function(err, x){
							if(err) return res.send(err);
							totalCalculation(studentNo, x, function(err){
								if(err) return res.send(err);
								return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet/'+exam+'-'+no);
							})
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


function totalCalculation( studentNo, x, callback ){
	let sum;
	const  temp = [];
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
		if(err) return callback(err);
		return callback(null);
	});
}