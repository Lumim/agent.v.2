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
    totalQuiz: {
    	type: Number
    },
    mid: [{
    	type: Number
    }],
    totalMid: {
    	type: Number
    },
    assignment: [{
    	type: Number
    }],
    totalAssignment: {
    	type: Number
    },
    project: [{
    	type: Number
    }],
    totalProject: {
    	type: Number
    },
    presentation: [{
    	type: Number
    }],
    totalPresentation: {
    	type: Number
    },
    fieldWork: [{
    	type: Number
    }],
    totalFieldWork: {
    	type: Number
    },
    final: [{
    	type: Number
    }],
    totalFinal: {
    	type: Number
    },
    attendance: {
        type: Number
    },
    total: [{
    	type: Number
    }],
    grade: {
    	type: String
    }
});

mongoose.model('StudentMark', studentMarkSchema);