require('dotenv').config();
var express = require('express');
const createError = require('http-errors');
var logger = require('morgan');
var app = express();
var convertidor = require('./convertidor');
const { Consumer } = require('sqs-consumer');
const producer = require('sqs-producer');
var aws = require('aws-sdk');
const indexRouter = require('./routes/index');

aws.config.region = `${process.env.AWS_SECRET_REGION}`;

// Logger Aplicación
app.use(logger('dev'));

const audioQueuePing = producer.create({
    queueUrl: `${process.env.SQS_QUEUE_URL}`,
    region: `${process.env.AWS_SQS_REGION}`
});

app.set('audioQueue', audioQueuePing);

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

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

module.exports = app;
