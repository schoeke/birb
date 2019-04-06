const birb = require('../index.js')
const assert = require('assert')

const event = {
    user: {
        getNick: function() {return 'Nickname'}
    },
    channel: {
        name: "#roomname"
    }
}

const log = []

const fs = {
    appendFile: function(file, data, cb){
        log.push(data)
        cb()
    }
}

const config = {
    logdir: ""
}

describe('Join event', function() {
    it('is logged to file', function(){
        const foo = birb.wrapper(config ,fs)
        foo.onJoin(event)
        console.log(log)
        assert.equal(log.length, 1)
        assert.ok(log.pop().search('Nickname joined.\n') != -1)
    })
})

describe('Part event', function() {
    it('is logged to file', function(){
        const foo = birb.wrapper(config ,fs)
        foo.onPart(event)
        console.log(log)
        assert.equal(log.length, 1)
        assert.ok(log.pop().search('Nickname left.\n')!= -1)
    })
})