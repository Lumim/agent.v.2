const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Group = require('mongoose').model('Group');
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");
const deleteMarksheet = require('middlewares/deleteMarksheet');
const async = require('async');

router.get('/faculty/:username/course/:index/group', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, faculty) {
		if(err || !faculty) {
			return res.send('Some error occured');
		}
		else {
			return res.render("group.pug", {name: faculty.name, username: username, index: index, groups: faculty.courses[index].groups});
		}
	});
});

router.get('/faculty/:username/course/:index/group/new', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet groups',}})
	.exec(function(err, faculty) {
		if(err || !faculty) {
			return res.send('Some error occured');
		}
		else {
			const map = {};
			const nominies = new Array();
			for (let i=0; i<faculty.courses[index].groups.length; i++) {
				for (let j=0; j<faculty.courses[index].groups[i].membersEmail.length; j++) {
					map[faculty.courses[index].groups[i].membersEmail[j]] = 1;
				}
			}
			for (let i=0; i<faculty.courses[index].marksheet.email.length; i++) {
				if (map[faculty.courses[index].marksheet.email[i]] != 1) {
					nominies.push({name: faculty.courses[index].marksheet.name[i], email: faculty.courses[index].marksheet.email[i]});
				}
			}
			return res.render("groupNew.pug", {name: faculty.name, username: username, index: index, nominies: nominies});
		}
	});
});

router.post('/faculty/:username/course/:index/group/new/save', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	const group = new Group({
	});
	group.groupName = req.body.groupName;
	group.taskTitle = req.body.taskTitle;
	const members = req.body.member;

	if(members[0] === '{') { //For single member, req arrive as a string
		var temp = JSON.parse(members);
		group.membersName.push(temp.name);
		group.membersEmail.push(temp.email);
	}
	else { //For multiple members, req arrive as an object
		for (let i=0; i<members.length; i++) {
			var temp = JSON.parse(members[i]);
			group.membersName.push(temp.name);
			group.membersEmail.push(temp.email);
		}
	}

	group.save(function(err) {
		if (err) return res.send(err);
		User.findOne({
				username
			})
			.populate('courses')
			.exec(function(err, faculty){
				if(err || !faculty) return res.send('some error occured');
				else{
					Course.update({_id: faculty.courses[index]._id}, {$addToSet: {groups: group._id}}, function(err){
						if (err) return res.send('some error occured');
						return res.redirect("/faculty/"+username+"/course/"+index+"/group/new");
					});
				}
			});
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}