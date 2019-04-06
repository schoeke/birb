const birb = require('./index.js')

const client = require('coffea')(require('./config.json'))

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



client.on('join', onJoin(config))

client.on('part', onPart)

client.on('topic', onTopic)

client.on('nick', onNick)

client.on('kick', onKick)

client.on('message', onMessage)

client.on('command', onCommand)
