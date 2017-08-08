const mongoose = require("mongoose");

const preRegistrationSchema = new mongoose.Schema({
  courseID: {
    type: String,
    required: true,
    maxlength: 50
  },
  courseName: {
    type: String,
    required: true,
    maxlength: 50
  },
  seats: {
    type: Number,
    minimum: 0,
    maximum: 1000
  }
});


mongoose.model('PreRegistration', preRegistrationSchema);
