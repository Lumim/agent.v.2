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
	discussions: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
	}],
});
mongoose.model('Group', groupSchema); //set