#!/usr/bin/env node

// Simple Example, taken from https://github.com/squaremo/amqp.node
var amqp = require('amqplib/callback_api');

var QUEUE_NAME = 'tasks';

function bail(err) {
  console.error(err);
  process.exit(1);
}

// Publisher
function publisher(conn) {
  conn.createChannel(function(err, ch) {
    if (err !== null) {
		return bail(err);
	}

    ch.assertQueue(QUEUE_NAME);

    ch.sendToQueue(QUEUE_NAME, new Buffer('something to do'));
  });
}

// Consumer
function consumer(conn) {
  conn.createChannel(function(err, ch) {
    if (err !== null) {
		return bail(err);
	}

    ch.assertQueue(QUEUE_NAME);

    ch.consume(QUEUE_NAME, function(msg) {
      if (msg !== null) {
        console.log(msg.content.toString());
        ch.ack(msg);
      }
    });
  });
}

amqp.connect('amqp://localhost', function(err, conn) {
  if (err !== null) {
    return bail(err);
  }

  consumer(conn);
  publisher(conn);        
});
