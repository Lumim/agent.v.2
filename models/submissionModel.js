const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
	file: {
		path: {
			type: String,
		},
		fileName: {
			type: String,
		},
	},
	submittedBy: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
	},
	course: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
	},
	date: {
			type: Date,
			default: Date.now,
	},
});

mongoose.model('Submission', submissionSchema);