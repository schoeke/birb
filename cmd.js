const Birb = require('./index.js')
const fs = require('fs')
const handler = require('./birbHandler')

const client = require('coffea')(require('./config.json'))

function checkLogDir (directory) {
    fs.access(directory, fs.constants.F_OK, err => {
      if (err && err.code === 'ENOENT') {
        fs.mkdir(directory, handler.createDirErr)
      } else {
        handler.createDirErr(err)
      }
    })
  }

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


const birb = Birb.wrapper(config, fs)

client.on('join', birb.onJoin)

client.on('part', birb.onPart)

client.on('topic', birb.onTopic)

client.on('nick', birb.onNick)

client.on('kick', birb.onKick)

client.on('message', birb.onMessage)

client.on('command', birb.onCommand)
