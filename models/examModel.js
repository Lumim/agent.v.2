const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	date:{
		type: String
	},
	totalMark:{
		type: Number
	},
	averageMark:{
		type: Number
	},
	highestMark:{
		type: Number
	},
	totalPresent:{
		type: Number
	},
	parcentageCount:{
		type: Number
	},
	sum:{
	    type: Number
	},
    best:{
    	type: Number
    }
});

mongoose.model('Exam', examSchema);