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