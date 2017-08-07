const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
	files: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
	}],
	endTime: {
		type: String,
	},
});

mongoose.model('Submission', submissionSchema);