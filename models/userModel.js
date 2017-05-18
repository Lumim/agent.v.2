const mongoose = require("mongoose");
const Course = require("mongoose").model('Course');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 100
	}, 
	email: {
		type: String,
		required: true,
		unique: true,
		maxlength: 100
	},
	username: {
		type: String,
		required: true,
		maxlength: 100
	},
	school: {
		type: String,
		required: true,
		maxlength: 100
	},
	country: {
		type: String,
		required: true,
		maxlength: 100
	},
	password: {
		type: String,
		required: true
	},
	status: {
		type: String,
		required: true,
		enum: ['faculty', 'student']
	},
	initial: {
		type: String
	},
    department: {
		type: String
	},
	officeRoom: {
		type: String
	},
	officeHours: [{
		type: String
	}],
	courses: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Course'
	}]
});

mongoose.model('User', userSchema); //set