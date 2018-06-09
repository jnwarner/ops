'use strict'

const Discord = require('discord.js')
const client = new Discord.Client()
const stream = require('./src/stream.js')
const tokens = require('./tokens.json')

client.on('ready', () => {
  client.user.setActivity('for Stills', { type: 'WATCHING' })
  console.log('Bot ready')
  stream.getTweets(tokens.FILTER)
})

stream.events.on('still', (msgContent) => {
  let currentdate = new Date()
  let datetime = 'Still: ' + currentdate.getDay() + '/' + (currentdate.getMonth() + 1) + '/' + currentdate.getFullYear() + ' @ ' + currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds()
  console.log(datetime + msgContent)
  client.channels.get(tokens.CHANNEL_ID).send(msgContent)
})

client.login(tokens.DISCORD_TOKEN)
