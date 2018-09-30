'use strict'

const client = require('coffea')(require('./config.json'))
const request = require('request')
const fs = require('fs')
const moment = require('moment')
const cheerio = require('cheerio')

const handler = require('./birbHandler')

try {
  fs.accessSync('./config.json', fs.constants.F_OK)
  var config = require('./config.json')
} catch (err) {
  console.log(
    'Config.json not found. Please copy config.sample.json, adjust it and rename it.\n', 'Exiting.'
  )
  process.exit(1)
}

checkLogDir(config.logdir, function (error) {
  if (error) {
    console.log('Logging directory cannot be created', error)
  }
})

client.on('join', event => {
  writeLog(logPlace(event), event.user.getNick() + ' joined.')
})

client.on('part', event => {
  writeLog(logPlace(event), event.user.getNick() + ' left.')
})

client.on('topic', event => {
  if (event.changed) {
    writeLog(
      logPlace(event),
      'Topic changed to' + event.topic + 'by' + event.user.getNick()
    )
  } else {
    writeLog(
      logPlace(event),
      'Topic was set to' +
      event.topic +
      'by' +
      event.user.nick +
      'on' +
      moment(event.time).format('YYYY-MM-DD HH:mm:ss') +
      '.'
    )
  }
})

client.on('nick', event => {
  writeLog(
    logPlace(event),
    event.oldNick + ' changed its nick to' + event.user.getNick()
  )
})

client.on('kick', event => {
  if (event.reason) {
    writeLog(logPlace(event), event.user.getNick(), 'was kicked by', event.by, 'for', event.reason, '.')
  } else {
    writeLog(logPlace(event), event.user.getNick(), 'was kicked by', event.by, '.')
  }
})

client.on('message', function (event) {
  writeLog(logPlace(event), event.user.nick + ': ' + event.message)
  expandURL(event)
})

function expandURL (event) {
  let words = event.message.split(' ')
  for (let i = 0; i < words.length; i++) {
    let newURL = findURL(words[i])
    if (newURL) {
      request(newURL, function (error, response, body) {
        if (!response) {
          return event.reply(
            'Error! No response when fetching ' + newURL + '.'
          )
        } else if (error || response.statusCode !== 200) {
          return event.reply(
            'Error ' + response.statusCode + ' when fetching ' + newURL + '.'
          )
        } else {
          let $ = cheerio.load(body)
          if ($('head > title').text().length) {
            return event.reply(
              $('head > title')
                .text()
                .trim()
              // Trim seems not to take out newlines from the middle of the string.
              // Fix:
                .replace(/\s+/g, ' ')
            )
          } else {
            return event.reply('The webpage does not contain a title element.')
          }
        }
      })
    }
  }
}
function checkLogDir (directory) {
  fs.access(directory, fs.constants.F_OK, err => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(directory, handler.createDirErr)
    } else {
      handler.createDirErr(err)
    }
  })
}

function writeLog (where, what) {
  fs.appendFile(
    where,
    moment().format('HH:mm:ss') + ' ' + what + '\n',
    handler.logWriteError
  )
}

function logPlace (event) {
  return (
    config.logdir +
    '/' +
    event.channel.name.slice(1) +
    '_' +
    moment().format('YYYY-MM-DD') +
    '.log'
  )
}

function findURL (data) {
  data = data.replace(/^[<[]/, '')
  data = data.replace(/[>\]!.,?]$/, '')

  // via https://gist.github.com/dperini/729294 from Diego Perini.
  let expr = new RegExp(
    '^' +
    // protocol identifier (optional)
    // short syntax // still required
    '(?:(?:(?:https?|ftp):)?\\/\\/)' +
    // user:pass BasicAuth (optional)
    '(?:\\S+(?::\\S*)?@)?' +
    '(?:' +
    // IP address exclusion
    // private & local networks
    '(?!(?:10|127)(?:\\.\\d{1,3}){3})' +
    '(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})' +
    '(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})' +
    // IP address dotted notation octets
    // excludes loopback network 0.0.0.0
    // excludes reserved space >= 224.0.0.0
    // excludes network & broacast addresses
    // (first & last IP address of each class)
    '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
    '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
    '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
    '|' +
    // host & domain names, may end with dot
    // can be replaced by a shortest alternative
    // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
    '(?:' +
    '(?:' +
    '[a-z0-9\\u00a1-\\uffff]' +
    '[a-z0-9\\u00a1-\\uffff_-]{0,62}' +
    ')?' +
    '[a-z0-9\\u00a1-\\uffff]\\.' +
    ')+' +
    // TLD identifier name, may end with dot
    '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)' +
    ')' +
    // port number (optional)
    '(?::\\d{2,5})?' +
    // resource path (optional)
    '(?:[/?#]\\S*)?' +
    '$',
    'i'
  )
  if (expr.test(data)) {
    return data
  }
}
