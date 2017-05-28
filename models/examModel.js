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
		type: String
	},
	averageMark:{
		type: String
	},
	highestMark:{
		type: String
	},
	totalPresent:{
		type: String
	},
	parcentageCount:{
		type: String
	},
	sum:{
	    type: String
	},
    best:{
    	type: String
    },
    marks:[{
    	type: String
    }]
});

mongoose.model('Exam', examSchema);