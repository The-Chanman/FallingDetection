const Nomad = require('nomad-stream')
const nomad = new Nomad()


let instance = null
const frequency = 30 * 60 * 1000

// parse into url object 
// const stocks = '("AAPL", "YHOO", "GOOGL")'
// let url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20${encodeURI(stocks)}&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=`

const messageTemplate = {
  heartRate: "",
  lightSensor: "",
  gps: {
    lat: "",
    long: "",
  },
  accelerometer:{
    xAccel: "",
    yAccel: "",
    zAccel: "",
  },
  camera: "",
}

let message = {
  heartRate: randomIntBtwNumbers(60, 100),
  lightSensor: randomIntBtwNumbers(633, 3411),
  gps: {
    lat: 42.3672122,
    long: -71.1026223,
  },
  accelerometer:{
    xAccel: randomIntBtwNumbers(1892,2022),
    yAccel: randomIntBtwNumbers(372, 444),
    zAccel: randomIntBtwNumbers(15396, 17102),
  },
  camera: pictures[randomIntBtwNumbers(1,2)],
}

function randomIntBtwNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function makeMessage() {
  let results = messageTemplate
  results.heartRate = randomIntBtwNumbers(60, 100)
  results.lightSensor = randomIntBtwNumbers(633, 3411)
  results.gps.lat = 42.3672122
  results.gps.long = -71.1026223
  results.accelerometer.xAccel = randomIntBtwNumbers(1892,2022)
  results.accelerometer.yAccel = randomIntBtwNumbers(372, 444)
  results.accelerometer.zAccel = randomIntBtwNumbers(15396, 17102)
  results.camera = pictures[randomIntBtwNumbers(1, 2)]
  return results
}


function startPoll(frequency) {
  setInterval(() => {
    return instance.publish(JSON.stringify(makeMessage()))
  }, frequency)
}

nomad.prepareToPublish()
  .then((node) => {
    instance = node
    return instance.publishRoot('hello, get data from a device in an elder\'s home!')
  })
  .then(() => startPoll(frequency))
  .catch(console.log)