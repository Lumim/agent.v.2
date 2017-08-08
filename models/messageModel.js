const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	text: {
			type: String,
	},
	date: {
			type: Date,
			default: Date.now,
	},
	username: {
		type: String,
	},
	posterName: {
		type: String,
	},
	posterImage: {
		type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
	},
	comments: [{
		type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
	}],
});

mongoose.model('Message', messageSchema);