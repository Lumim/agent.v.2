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
});

mongoose.model('Course', courseSchema); //set