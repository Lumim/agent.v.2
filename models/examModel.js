const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true
	},
	url:{
		type: String,
		required: true
	},
	date:{
		type: String
	},
	totalMark:{
		type: String,
		default: '100'
	},
	highestMark:{
		type: String,
		default: '0'
	},
	parcentageCount:{
		type: String,
		default: '100'
	},
    best:{
    	type: String
    },
    pieChart:[{
    	type: String
    }],
    marks:[{
    	type: String
    }],
    parcentage:[{
    	type:String
    }]
});

mongoose.model('Exam', examSchema);