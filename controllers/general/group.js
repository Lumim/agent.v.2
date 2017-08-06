const express = require('express');
const User = require('mongoose').model('User'); // get
const Group = require('mongoose').model('Group');
const router = express.Router();
const requireLogin = require("middlewares/requireLogin");
const matchUsername = require("middlewares/matchUsername");
const onlyFaculty = require("middlewares/onlyFaculty");
const flash = require("middlewares/flash");
const async = require('async');
const multer = require('multer');
const fs = require('fs');

router.get('/course/:index/group', function(req, res, next){
	const username = req.session.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'marksheet groups',}})
	.exec(function(err, user) {
		if(err) {
			return next(err);
		}
		else {
			// Select the groups in which the student is enrolled
			if(user.status.toString() === 'student') {
				const groupList = new Array();
				for (let i=0; i<user.courses[index].groups.length; i++) {
					for (let j=0; j<user.courses[index].groups[i].members.length; j++) {
						if(user.courses[index].groups[i].members[j].email === user.email) {
							groupList.push(user.courses[index].groups[i]);
							break;
						}
					}
				}
				return res.render("group.pug", {user: {name: user.name, username: username, 
				status: user.status, courseNo: index, groups: groupList}});
			}
			else {
				const nominies = new Array();
				for(let i=0; i<user.courses[index].marksheet.email.length; i++) {
					let flag = true;
					for(let j=0; j<user.courses[index].groups.length && flag; j++) {
						for(let k=0; k<user.courses[index].groups[j].members.length; k++) {
							if(user.courses[index].groups[j].members[k].email === user.courses[index].marksheet.email[i]) {
								flag = false;
								break;
							}
						}
					}
					if (flag) {
						nominies.push({name: user.courses[index].marksheet.name[i], email: user.courses[index].marksheet.email[i]});
					}
				}
				return res.render("group.pug", {user: {name: user.name, username: username,
				status: user.status, courseNo: index, groups: user.courses[index].groups,
				nominies: nominies}});
			}
		}
	});
});

router.post('/course/:index/group', onlyFaculty, function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
    const group = new Group({
    	facultyUsername: username,
    	groupName: req.body.groupName,
    	taskTitle: req.body.taskTitle,
    	members: req.body.members,
    });
    group.save(function(err) {
    	if (err) next(err);
    	User.findOne({
    		username,
    	})
    	.populate('courses')
    	.exec(function(err, user) {
    		if (err) return next(err);
    		const course = user.courses[index];
    		course.groups.push(group._id);
    		course.save(function(err) {
    			if (err) return next(err);
    			return res.send(null);
    		});
    	});
    });
});

router.post('/course/:index/group/delete', onlyFaculty, function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	const groupNo = req.body.groupNo;
	const data = {};
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if (err) next(err);
		const course = user.courses[index];
		data.members = user.courses[index].groups[groupNo].members;
		const groupID = user.courses[index].groups[groupNo]._id;
		course.groups.splice(groupNo, 1);
		course.save(function(err) {
    			if (err) return next(err);
    			Group.findOne({
    				_id: groupID,
    			})
    			.remove(function(err) {
    				if (err) return next(err);
    				return res.send(data);
    			});
    	});
	});
});

router.post('/course/:index/group/remove', onlyFaculty, function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	const groupNo = req.body.groupNo;
	const memberNo = req.body.memberNo;
	const data = {};
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if (err) next(err);
		const group = user.courses[index].groups[groupNo];
		data.name = user.courses[index].groups[groupNo].members[memberNo].name;
		data.email = user.courses[index].groups[groupNo].members[memberNo].email;
		group.members.splice(memberNo, 1);
		group.save(function(err) {
    			if (err) return next(err);
    			return res.send(data);
    	});
	});
});

router.post('/course/:index/group/add', onlyFaculty, function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	const groupNo = req.body.groupNo;
	const members = req.body.members;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if (err) next(err);
		const group = user.courses[index].groups[groupNo];
		for(let i=0; i<members.length; i++) {
			group.members.push(members[i]);
		}
		group.save(function(err) {
    			if (err) return next(err);
    			return res.send(null);
    	});
	});
});

router.post('/course/:index/group/name', function(req, res, next) {
	const username = req.session.username;
	const index = req.params.index;
	const type = req.body.type;
	const groupNo = req.body.groupNo;
	const txt = req.body.txt;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if (err) next(err);
		const group = user.courses[index].groups[groupNo];
		if (type === 'groupNameEdit')
			group.groupName = txt;
		else
			group.taskTitle = txt;
		group.save(function(err) {
    			if (err) return next(err);
    			return res.send(null);
    	});
	});
});

module.exports = {
	addRouter(app){
		app.use('/user/:username', [requireLogin, matchUsername, flash], router);
	}
}