'use strict'

const Twitter = require('twitter')
const events = require('events')
const tokens = require('../tokens.json')

let streamModule = {}

streamModule.events = new events.EventEmitter()

let client = new Twitter({
  consumer_key: tokens.C_KEY,
  consumer_secret: tokens.C_SECRET,
  access_token_key: tokens.A_TOKEN,
  access_token_secret: tokens.A_TOKEN_SECRET
})

streamModule.getTweets = (filter) => {
  if (!filter) {
    throw new Error('NoFilter')
  }

  console.log(`getTweets called. filter: ${filter}`)

  client.stream('statuses/filter', { follow: filter, track: 'buff.ly', tweet_mode: 'extended' }, (stream) => {
    stream.on('data', (event) => {
      console.log('collected tweet')
      if (event.user.id === filter) {
        if (event.text.includes('Dir') && event.text.includes('(') && event.text.includes(')')) {
          console.log('potential still')
          stillCheck(event.id_str, (error, url) => {
            if (error) {
              console.log('no url found in tweet')
              console.log(error)
            } else {
              console.log('url found')
              let msgContent = `**${event.text.split('\n')[0]}**\n${url}`
              streamModule.events.emit('still', msgContent)
            }
          })
        }
      }
    })

    stream.on('error', (error) => {
      if (error.toString().includes('420')) {
        console.log('On cooldown, waiting and retrying...')
        setTimeout(() => {
          streamModule.getTweets(filter)
        }, 15000)
      }
    })
  })
}

let stillCheck = (tweetId, callback) => {
  client.get(`statuses/show/${tweetId}`, async (err, res) => {
    if (err) {
      callback(err)
    } else {
      let url = await res.entities
      if (url.media == null) {
        url = await res.extended_entities
      }

      if (url.media == null) {
        let error = {
          message: 'NoImgFound'
        }
        callback(error)
      } else {
        callback(null, url.media[0].media_url)
      }
    }
  })
}

module.exports = streamModule
