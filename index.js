require('dotenv').config();
var express = require('express');
var logger = require('morgan');
var Queue = require('bull');
var app = express();
var convertidor = require('./convertidor');
const { Consumer } = require('sqs-consumer');
var aws = require('aws-sdk');

aws.config.loadFromPath('config.json');

// Logger Aplicación
app.use(logger('dev'));

/*var audioQueue = new Queue('audio_converter', {redis: {port: process.env.REDIS_PORT, host: `${process.env.REDIS_HOST}`, password:''}});

audioQueue.process( function(job){
    convertidor.process(job)
});*/

const audioQueue = Consumer.create({
    queueUrl: `${process.env.SQS_QUEUE_URL}`,
    messageAttributeNames: ['audio', 'voz', 'email', 'usuario', 'concurso', 'url_minio'],
    handleMessage: async (message) => {
        var result = await convertidor.process(message);
        console.log(result)
    }
});

audioQueue.on('error', (err) => {
    console.error(err.message);
});

audioQueue.on('processing_error', (err) => {
    console.error(err.message);
});

audioQueue.on('message_received', () => {
    console.log('Message Received.');
});

audioQueue.on('message_processed', () => {
    console.log('Message Processed.');
});

audioQueue.start();

module.exports = app;
