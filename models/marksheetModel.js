const mongoose = require('mongoose');
// const Exam = require("mongoose").model('Exam');

const marksheetSchema = new mongoose.Schema({
    name: [{
        type: String,
        //required: true,
        maxlengthL: 100,
    }],
    ID: [{
        type: String,
        maxlength: 100,
    }],
    email: [{
        type: String,
        //required: true,
        maxlength: 100,
    }],
    courseStatus: [{
        type: String,
    }],
    quiz: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    mid: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    assignment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    project: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    presentation: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    fieldWork: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    final: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    attendance: [{
        type: String,
    }],
    total: [{
        type: String,
    }],
    grade: [{
        type: String,
    }],
});

mongoose.model('Marksheet', marksheetSchema);
