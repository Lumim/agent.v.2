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

router.post('/course/:index/marksheet/assessment', onlyFaculty, function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const examType = req.body.assessment;
	const examName = examType.charAt(0).toUpperCase() + examType.slice(1);

	User.findOne({
		username
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet'}})
	.exec(function(err, user){
		if(err) return next(err);
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
					if(err) next(err);
					const query = {
						_id: user.courses[index].marksheet._id
					}
					const temp = {};
					temp[examType] = totExam._id;
					Marksheet.update(query, {$push: temp}, function(err){
						if(err) next(err);
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i]= '';
						}
						Exam.update({_id: totExam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
							if(err) next(err);
							//Now add the exam
							no = no+1;
							const exam = new Exam({
								name: examName+'-'+no,
								url: examType+'-'+no
							});
							exam.save(function(err){
								if(err) return next(err);
								temp[examType] = exam._id;
								Marksheet.update(query, {$push: temp}, function(err){
									if (err) return next(err);
									Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
										if(err) next(err);
										return res.send(null);
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
					if(err) return next(err);
					const query = {
						_id: user.courses[index].marksheet._id
					}
					const temp = {};
					temp[examType] = exam._id;
					Marksheet.update(query, {$push: temp}, function(err){
						if (err) return next(err);
						//For each exam make a new entry for student
						const studentNo = user.courses[index].marksheet.name.length;
						const mark = new Array(studentNo);
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i] = '';
						}
						Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
							if(err) next(err);
							return res.send(null);
						});
					});
				});
			}
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
			for(let i=0; i<12; i++) {
				chart[i] = 0;
			}

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
			for(let i=0; i<12; i++) {
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

router.post('/course/:index/marksheet/assessment/edit', onlyFaculty,function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	const url = req.body.url.split('-');
	const exam = url[0];
	const no = url[1];

	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet', 
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return next(err);
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
					if(err) return next(err);
					user.courses[index].marksheet[exam][0] = newExam;
					const studentNo = user.courses[index].marksheet.name.length;

					async.parallel([
						function(cb){calculationEx(user.courses[index].marksheet[exam], studentNo, req, cb)},
					],
					function(err){
						if(err) return next(err);
						Marksheet.findOne({
							_id: user.courses[index].marksheet._id
						})
						.populate({path: 'quiz mid assignment project presentation fieldWork final'})
						.exec(function(err, x){
							if(err) return next(err);
							totalCalculation(studentNo, x, function(err){
								if(err) return next(err);
								return res.send(null);
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
					if(err) return next(err);
					user.courses[index].marksheet[exam][no] = newExam;
					const studentNo = user.courses[index].marksheet.name.length;

					async.parallel([
						function(cb){calculationEx(user.courses[index].marksheet[exam], studentNo, req, cb)},
					],
					function(err){
						if(err) return next(err);
						Marksheet.findOne({
							_id: user.courses[index].marksheet._id
						})
						.populate({path: 'quiz mid assignment project presentation fieldWork final'})
						.exec(function(err, x){
							if(err) return next(err);
							totalCalculation(studentNo, x, function(err){
								if(err) return next(err);
								return res.send(null);
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
		app.use('/user/:username', [requireLoginMW, matchUsername, flash], router);
	}
}