const Nomad = require('nomad-stream')
const moment = require('moment')

const nomad = new Nomad()

// subscription node ids
// weather, person, home
const subscriptions = ['QmWYaxscTPj79NHLnFEuUbKpZx3d4zHBK2ZRNgqrnF9s5n', 'QmXUHQ2KBmSxaiEbB5eFVGGmSsPnd5KpnRqGWvtFUjWo5a','QmdhnZLVkkPyEoyxGf238pPPMsKNjPS3cC3sFzSW3cbnQA']

let instance, lastPub, notificationBody

const frequency = 30 * 60 * 1000 // 30 minutes 
const timeThreshold = 4 * 60 * 60 * 1000 // 4 hours

const defaultPublishData = { 
  [subscriptions[0]]: {
    time: '',
    description: 'Weather in Cambridge, Ma' ,
    data: {},
  },
  [subscriptions[1]]: {
    description: 'Information recieved from the devices on and around the elder',    
    time: '',
    data: {},
  },
  [subscriptions[2]]:{
  	description: 'Information recieved from the elder\' home',
  	time: '',
  	gasSensor: {},
  	smappee: {},
  	water: {}
  }
}

// How we manager the data
class DataMaintainer {
  constructor(){
    this.data = defaultPublishData
  }
  setValue(id, value){
    switch(id){
      case subscriptions[0]:{
        this.data[id]["time"] = value.time
        this.data[id]["data"] = value.query.results
        break;
      }
      case subscriptions[1]:{
	    delete value.camera
        this.data[id]["time"] = getTime()
        this.data[id]["data"] = value
        break;
      }
      case subscriptions[2]:{
      	this.data[id]["time"] = value.time
      	this.data[id]["gasSensor"] = value.gasSensor
      	this.data[id]["smappee"] = value.smappee
      	this.data[id]["water"] = value.water
      	break;
      }
      default:{
        throw "unrecognized id"
      }
    }
  }
  cleanKey(key){
    let cleanedKey = key.replace(/\s+/, '\x01').split('\x01')[0]
    cleanedKey = cleanedKey.toLowerCase()
    return cleanedKey
  }
  getAll(){
    return this.data
  }
  isAllFilled(){
    return this.data[subscriptions[0]]['data'] && this.data[subscriptions[1]]['data'] && this.data[subscriptions[2]]['gasSensor'] && this.data[subscriptions[2]]['smappee'] && this.data[subscriptions[2]]['water']
  }
  clear(){
    this.data = defaultPublishData
  }
  toString(){
    return JSON.stringify(this.data)
  }
}

function getTime() {
  return new moment()
}

//init data manager
let dataManager = new DataMaintainer()

nomad.prepareToPublish()
  .then((n) => {
    instance = n
    return instance.publishRoot('Starting up Bernard composite node')
  })
  .then(() => {
    lastPub = getTime()
    nomad.subscribe(subscriptions, function(message) {
      console.log("==========================> Receieved a message for node " + message.id)
      console.log("==========================> Message was " + message.message)
      let messageData = JSON.parse(message.message)

      try{
        dataManager.setValue(message.id, messageData)
      }
      catch(err){
        console.log("DataMaintainer failed with error of " + err)
      }
      console.log(dataManager.toString())
      let currentTime = getTime()
      let timeSince = currentTime - lastPub
      if (timeSince >= frequency){
        console.log('===================================> timeSince >= timeBetween')
        if (dataManager.isAllFilled()) {
          console.log(dataManager.toString())
          instance.publish(dataManager.toString())
            .catch(err => console.log(`Error in publishing timeSince>=timeBetween negative state: ${JSON.stringify(err)}`))
        }
        lastPub = currentTime
      }
      if (timeSince >= timeThreshold){
        // let them know the node is still online
        console.log("===================================>   timeSince >= timeThreshold")
        console.log("***************************************************************************************")
        console.log('Heartbeat, I am alive but have not got data in a long time')
        console.log("***************************************************************************************")
        instance.publish('Heartbeat, I am alive but have not got data in a long time')
          .catch(err => console.log(`Error in publishing timeSince>=timeBetween: ${JSON.stringify(err)}`))
        dataManager.clear()
        lastPub = currentTime
      }
    })
  })
  .catch(err => console.log(`Error in main loop: ${JSON.stringify(err)}`))
