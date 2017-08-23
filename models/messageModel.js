const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	text: {
			type: String,
	},
	date: {
			type: Date,
			default: Date.now,
	},
	poster: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
	},
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
	}],
});

mongoose.model('Message', messageSchema);