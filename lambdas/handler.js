'use strict';

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


