const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
	facultyUsername: {
		type: String,
		required: true,
	},
	groupName: {
		type: String,
	},
	taskTitle: {
		type: String,
	},
	members: [{
		name: {type: String,},
		email: {type: String,},
	}],
	documents: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
	}],
	discussion: [{
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