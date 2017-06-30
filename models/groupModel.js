const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
	facultyEmail: {
		type: String,
		required: true,
	},
	groupName: {
		type: String,
		required: true,
	},
	taskTitle: {
		type: String,
	},
	membersName: [{
		type: String,
	}],
	membersEmail: [{
		type: String,
	}],
	attachments: [{
		path: {
			type: String,
		},
		fileName: {
			type: String,
		},
	}],
	duscussion: [{
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
});
mongoose.model('Group', groupSchema); //set