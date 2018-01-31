'use strict';
const AWS = require('aws-sdk')
const Stream = require('stream')
const Speaker = require('speaker')

// Create an Polly client
const Polly = new AWS.Polly({
    signatureVersion: 'v4',
    region: 'us-west-2'
})

// Create the Speaker instance
const Player = new Speaker({
  channels: 1,
  bitDepth: 16,
  sampleRate: 16000
})

let params = {
    'Text': 'Hi, my name is @anaptfox.',
    'OutputFormat': 'pcm',
    'VoiceId': 'Kimberly'
}

Polly.synthesizeSpeech(params, (err, data) => {
    if (err) {
        console.log(err.code)
    } else if (data) {
        if (data.AudioStream instanceof Buffer) {
            // Initiate the source
            var bufferStream = new Stream.PassThrough()
            // convert AudioStream into a readable stream
            bufferStream.end(data.AudioStream)
            // Pipe into Player
            bufferStream.pipe(Player)
        }
    }
})

module.exports.hello = (event, context, callback) => {
  const AWS = require('aws-sdk')
  const Fs = require('fs')

  // Create an Polly client
  const Polly = new AWS.Polly({
      signatureVersion: 'v4',
      region: 'us-east-1'
  })

  let params = {
      'Text': 'Hi, my name is @anaptfox.',
      'OutputFormat': 'mp3',
      'VoiceId': 'Kimberly'
  }

  Polly.synthesizeSpeech(params, (err, data) => {
      if (err) {
          console.log(err.code)
      } else if (data) {
          if (data.AudioStream instanceof Buffer) {
              Fs.writeFile("./speech.mp3", data.AudioStream, function(err) {
                  if (err) {
                      return console.log(err)
                  }
                  console.log("The file was saved!")
              })
          }
      }
  })
};


