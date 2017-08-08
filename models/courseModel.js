const mongoose = require("mongoose");
const Marksheet = require("mongoose").model('Marksheet');

const courseSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		maxlength: 100
	},
	code: {
		type: String,
		required: true,
		maxlength: 20
	},
	section: {
		type: String,
		required: true,
	},
	classRoom: {
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
		path: {
			type: String,
		},
		fileName: {
			type: String,
		},
	}],
	post: [{
		date: {
			type: Date,
			default: Date.now,
		},
		title: {
			type: String,
		},
		body: {
			type: String,
		},
		creatorName: {
			type: String,
		},
		creatorEmail: {
			type: String,
		},
		comment: [{
			date: {
				type: Date,
				default: Date.now,
			},
			body: {
				type: String,
			},
			creatorName: {
				type: String,
			},
			creatorEmail: {
				type: String,
			},
		}],
	}],
	groups: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Group',
	}],
});

mongoose.model('Course', courseSchema); //set
