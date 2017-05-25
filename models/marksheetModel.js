const mongoose = require('mongoose');
const Exam = require("mongoose").model('Exam');
const StudentMark = require("mongoose").model('StudentMark');

const marksheetSchema = new mongoose.Schema({
    quiz: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalQuiz: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    mid: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalMid: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    assignment: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalAssignment: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    project: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalProject: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    presentation: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalPresentation: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    fieldWork: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalFieldWork: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    final: [{
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    }],
    totalFinal: {
    	type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam'
    },
    studentMarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentMark'
    }]
});

mongoose.model('Marksheet', marksheetSchema);