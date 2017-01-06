const Nomad = require('nomad-stream')
const nomad = new Nomad()
const fetch = require('node-fetch')

let instance = null  // the nomad instance
const pollFrequency =  30 * 1000  // 60 seconds
const url = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22Cambridge%2C%20Massachusetts%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys'

console.log(url)

function getMessage() {
  return fetch(url)
    .then(res => res.json())
    .then(json => JSON.stringify(json))
    .catch(err => {
      console.log('getMessage error: ', err)
      return err
    })
}

function startPoll(frequency) {
  setInterval(() => {
    getMessage()
      .then((m) => {
        console.log('fetched:', m)
        return instance.publish(m)
      })
      .catch(console.log)
  }, frequency)
}

nomad.prepareToPublish()
  .then((node) => {
    instance = node
    return instance.publishRoot('hello')
  })
  .then(() => startPoll(pollFrequency))
  .catch(console.log)