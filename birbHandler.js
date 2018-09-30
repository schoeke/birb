module.exports = {
  createDirErr,
  logWriteError
}

function createDirErr (err) {
  if (err) {
    console.log('Cannot create directory. Error: ', err.code, 'Exiting.')
    process.exit(1)
  } else {
    console.log.apply('Successfully created logging directory.')
  }
}

function logWriteError (err) {
  if (err) {
    console.log('Error writing log! ' + err.code)
  }
}
