const birb = require('../index.js')
const assert = require('assert')

const event = {
  user: {
    getNick: function () { return 'Nickname' },
    getChannels: function() {return {'Testchannel': ''}}
  },
  channel: {
    name: '#roomname'
  }
}

const nickEvent = { oldNick: 'Nick', ...event }
const topicChangeEvent = { ...event, changed: true, topic: 'Test' }
const topicEvent = { ...topicChangeEvent, changed: false }
const kickEvent = { ...event, by: 'Nick' }
const kickReasonEvent = { ...kickEvent, reason: 'nothing' }
const messageEvent = { ...event, message: 'Message' }
const commandOtrEvent = { cmd: 'otr' }
const commandStatusEvent = { cmd: 'status' }

const log = []

const fs = {
  appendFile: function (file, data, cb) {
    log.push(data)
    cb()
  }
}

const config = {
  channels: ['Testchannel', 'non-existent'],
  logdir: '',
  defaultLogging: true
}

describe('Join event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onJoin(event)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nickname joined.\n') !== -1)
  })
})

describe('Part event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onPart(event)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nickname left.\n') !== -1)
  })
})

describe('Topic change event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onTopic(topicChangeEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Topic changed to Test by ') !== -1)
  })
})

describe('Topic event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onTopic(topicEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Topic was set to Test by ') !== -1)
  })
})

describe('Nick change event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onNick(nickEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nick changed its nick to Nickname') !== -1)
  })
})

describe('Kick event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onKick(kickEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nickname was kicked by Nick') !== -1)
  })
})

describe('Kick with reason event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onKick(kickReasonEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nickname was kicked by Nick for nothing') !== -1)
  })
})

describe('Message event', function () {
  it('is logged to file', function () {
    const foo = birb.wrapper(config, fs)
    foo.onMessage(messageEvent)
    console.log(log)
    assert.strictEqual(log.length, 1)
    assert.ok(log.pop().search('Nickname: Message') !== -1)
  })
})
