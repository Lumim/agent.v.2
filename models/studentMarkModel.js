const mongoose = require('mongoose');

const studentMarkSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true,
		maxlengthL: 100
	},
	ID: {
		type: String,
		maxlength: 100
	},
	email: {
		type: String,
		required: true,
		maxlength: 100
	},
    quiz: [{
    	type: Number
    }],
    mid: [{
    	type: Number
    }],
    assignment: [{
    	type: Number
    }],
    project: [{
    	type: Number
    }],
    presentation: [{
    	type: Number
    }],
    fieldWork: [{
    	type: Number
    }],
    final: [{
    	type: Number
    }],
    attendance: {
        type: Number
    },
    total: {
    	type: Number
    },
    grade: {
    	type: String
    }
});

mongoose.model('StudentMark', studentMarkSchema);