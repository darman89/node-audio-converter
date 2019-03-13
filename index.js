require('dotenv').config();
var express = require('express');
var logger = require('morgan');
var Queue = require('bull');
var app = express();
var convertidor = require('./convertidor');

// Logger Aplicación
app.use(logger('dev'));

var audioQueue = new Queue('audio_converter', {redis: {port: process.env.REDIS_PORT, host: `${process.env.REDIS_HOST}`, password:''}});

audioQueue.process( function(job){
    convertidor.process(job)
});

module.exports = app;