const express = require("express");
const mongoose = require("mongoose");
const User = require('mongoose').model('User'); //get
const Course = require('mongoose').model('Course'); //get
const Group = require('mongoose').model('Group');
const router = express.Router();
const requireLoginMW = require("middlewares/requireLogin");
const deleteMarksheet = require('middlewares/deleteMarksheet');
const async = require('async');

router.get('/:username/course/:index/group', function(req, res ){
	const username = req.params.username;
	const index = req.params.index;
	User.findOne({
		username,
	})
	.populate({path: 'courses', 
		populate:{path: 'groups',}})
	.exec(function(err, user) {
		if(err || !user) {
			return res.send('Some error occured');
		}
		else {
			if(user.status.toString() === 'student') {
				const groupList = new Array();
				for (let i=0; i<user.courses[index].groups.length; i++) {
					for (let j=0; j<user.courses[index].groups[i].membersEmail.length; j++) {
						if(user.courses[index].groups[i].membersEmail[j].toString() === user.email) {
							groupList.push(user.courses[index].groups[i]);
							break;
						}
					}
				}
				return res.render("group.pug", {name: user.name, username: username, status: user.status, index: index, groups: groupList});
			}
			else {
				return res.render("group.pug", {name: user.name, username: username, status: user.status, index: index, groups: user.courses[index].groups});
			}
		}
	});
});

function validUser (email, id, callBack) {
	Group.findOne({
		_id: id,
	})
	.exec(function(err, grp) {
		if(err) {
			return callBack('Some error occured :(');
		}
		else if(!grp) {
			return callBack("You don't have access for this group");
		}
		else {
			let flag = false;
			if(grp.facultyEmail.toString() === email.toString()) {
				flag = true;
			}
			else {
				for (let i=0; i<grp.membersEmail.length; i++) {
					if (grp.membersEmail[i].toString() === email.toString()) {
						flag = true;
					}
				}
			}
			if(!flag) {
				return callBack("You don't have access for this group");
			}
			else {
				return callBack(null);
			}
		}
	});
}

router.get('/:username/group/:id/attachment', function(req, res ){
	const username = req.session.username;
	const name = req.session.name;
	const email = req.session.email;
	const id = req.params.id;

	validUser(email, id, function(err) {
		if(err) {
			return res.send(err);
		}
		else {
			Group.findOne({
				_id: id,
			})
			.exec(function(err, grp) {
				if(!grp || err) return res.send('Some error occured');
				else
					return res.render("attachment.pug", {name: name, username: username, attachments: grp.attachments});
			});
		}
	});
});

module.exports = {
	addRouter(app){
		app.use('/', [requireLoginMW], router);
	}
}