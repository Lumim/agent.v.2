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
			populate:{path: 'quiz mid assignment project presentation fieldWork final'}}})
	.exec(function(err, user){
		if(err) return res.send('some error occured');
		if(!user) {
			return res.send('Wrong user');
		}
		else{
			return res.render("marksheetEdit", {name: user.name, username: username, index: index, marksheet: user.courses[index].marksheet});
		}
	});
});

const calculation = function(type, x, studentNo, req, asyncCB ){
	if(type == 'ex'){
		let len, student = new Array();

		if(x){
			x.reverse();
			len = x.length-1;
			for(let j=0; j<studentNo; j++){
				student[j] = new Array();
				for(let k=0; k<len; k++){
					student[j][k] = '';
				}
			}
		}

		async.eachOf(x,function(value,index,cb){

			if(index < len){
				let p, temp = [], parcentage = [], fieldName, mark, highestMark = 0, chart = new Array(12);

	        	for(let j=0; j<studentNo; j++){
					fieldName = value.name+'_'+j;
					mark = req.body[fieldName];
					temp.push(mark);

					if(mark=='' || isNaN(mark)){
						parcentage.push('');
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
						student[j][index] = p;
					}
				}
				Exam.update({_id: value._id}, {$set: { marks: temp, parcentage: parcentage, highestMark: highestMark, pieChart: chart}})
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
					student[j].sort();
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
						p = (average/100)*value.parcentageCount;
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
	}
	else if(type == 'at'){
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
		.exec(asyncCB);
	}
	else if(type == 'tot'){
		let sum, temp = [];
		for(let j=0; j<studentNo; j++){
			sum = 0;
			if(x.quiz.length > 0)
				sum += 1*x.quiz[0].marks[j];
			console.log(x.quiz[0].marks[j], sum);
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
			sum += 1*x.attendance[j];
			console.log(sum);
			temp.push(sum);
		}
		Marksheet.update({_id: x._id}, {$set: {total: temp}})
		.exec(asyncCB);
	}
	else if(type == 'gra'){
		let fieldName, mark, temp = [];

		for(let j=0; j<studentNo; j++){
			fieldName = 'grade_'+j;
			mark = req.body[fieldName];
			temp.push(mark);
		}
		Marksheet.update({_id: x._id}, {$set: {grade: temp}})
		.exec(asyncCB);
	}
};

router.post('/faculty/:username/course/:index/marksheet/edit/save', function(req, res){
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
			const studentNo = user.courses[index].marksheet.name.length;
			async.parallel([function(cb){calculation(user.courses[index].marksheet.quiz, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.mid, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.assignemnt, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.project, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.presentation, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.fieldWork, studentNo, req, cb)},
				function(cb){calculation('ex', user.courses[index].marksheet.final, studentNo, req, cb)},
				function(cb){calculation('at', user.courses[index].marksheet, studentNo, req, cb)},
				function(cb){calculation('tot', user.courses[index].marksheet, studentNo, req, cb)},
				function(cb){calculation('gra', user.courses[index].marksheet, studentNo, req, cb)}],
				function(err){
					if(err) return res.send('some error occured');
					return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet');
				});
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
					name: 'Total '+examName,
					url: examType+'-total'
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
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i]= '';
						}
						Exam.update({_id: totExam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
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
									Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
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
					name: examName+'-'+no,
					url: examType+'-'+no
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
						const parcentage = new Array(studentNo);
						for(let i=0; i<studentNo; i++){
							mark[i] = '';
							parcentage[i] = '';
						}
						Exam.update({_id: exam._id}, {$set: {marks: mark, parcentage: parcentage}}, function(err){
							if(err) res.send('some error occured');
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
		if(err) return res.send('some error occured');
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

router.post('/faculty/:username/course/:index/marksheet/:exam-:no/edit/save', function(req, res){
	const username = req.params.username;
	const index = req.params.index;
	const exam = req.params.exam;
	const no = req.params.no;
	console.log(exam, no);

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
				Exam.update({_id: user.courses[index].marksheet[exam][0]._id}, {$set: { best: best, parcentageCount: parcentageCount}})
				.exec(function(err){
					if(err) return res.send('some error occured');
					return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet/'+exam+'-'+no);
				});
			}
			else{
				const totalMark = req.body.totalMark;
				const date = req.body.date;
				console.log(totalMark, date);
				Exam.update({_id: user.courses[index].marksheet[exam][no]._id}, {$set: { date: date, totalMark: totalMark}})
				.exec(function(err){
					if(err) return res.send('some error occured');
					return res.redirect('/faculty/'+username+'/course/'+index+'/marksheet/'+exam+'-'+no);
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