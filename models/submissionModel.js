const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
	title: {
		type: String,
	},
	files: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
	}],
	endTime: {
		type: String,
	},
	milliseconds: {
		type: String,
	},
	owner: {
		type: String,
	},
});

mongoose.model('Submission', submissionSchema);