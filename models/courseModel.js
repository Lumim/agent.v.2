const mongoose = require("mongoose");
const Marksheet = require("mongoose").model('Marksheet');

const courseSchema = new mongoose.Schema({
	status: {
		type: String,
		required: true,
		enum: ['active', 'archive'],
	},
	nickName: {
		type: String,
	},
	code: {
		type: String,
	},
	fullName: {
		type: String,
	},
	section: {
		type: String,
	},
	classRoom: {
		type: String,
	},
	classTime: [{
		type: String,
	}],
	description: {
		type: String,
	},
	marksheet: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Marksheet'
	},
	facultyName: {
		type: String,
	},
	facultyEmail: {
		type: String,
	},
	facultyUsername: {
		type: String,
	},
	resources: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
	}],
	posts: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
	}],
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group',
	}],
	submissions: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
	}],
});

mongoose.model('Course', courseSchema); //set