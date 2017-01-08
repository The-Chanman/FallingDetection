const Nomad = require('nomad-stream')
const nomad = new Nomad()
const moment = require('moment')

let instance = null
const frequency = 30 * 60 * 1000

function getTime() {
  return new moment()
}

// parse into url object 
// const stocks = '("AAPL", "YHOO", "GOOGL")'
// let url = `https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quotes%20where%20symbol%20in%20${encodeURI(stocks)}&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=`

electricScenarios = {
	1: [
		{name: "Bathroom Light", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Bathroom Fan", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Hair Dryer", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
	],
	2: [
		{name: "Fridge Light", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Stove", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Microwave", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Toaster Oven", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Coffee Maker", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Kitchen Lights", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
	],
	3: [
		{name: "TV", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Stero System", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Fire Place", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Living Room Lights", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
	],
	4: [
		{name: "TV", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Night Stand Light", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Living Room Lights", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Air Purifier", type: "ON", watt: "", time: "", consumption: "", averageOnTime: ""},		
	],
}

waterScenarios = {
	1:[	
		{name: "Bathroom Sink", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Bathroom Shower", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Bathroom Toilet", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
	],
	2:[
		{name: "Kitchen Sink", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Dish Washer", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
		{name: "Fridge Water Usage", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
	],
	3:[
		{name: "Water Heater", type: "ON", flowRate: "", time: "", consumption: "", averageOnTime: ""},
	]
}

const messageTemplate = {
	time: "",
	gasSensor: {
		O3: "",
		CO: "",
		CO2: "",
		NO: "",
		NO2: "",
		CH4: "",
		H: "",
	},
	smappee: {
		main: {
			totalEnergy: "",
			alwaysOn: "",
			solarPower: "",
		},
		usage: {
			solar: {
				wattHours: "",
				price: "",
			},
			electricity: {
				wattHours: "",
				price: "",
			},
			alwaysOn: {
				wattHours: "",
				price: "",
			},
			appliances: [
				{name: "", wattHours: "", price: ""}
			],
		},
		events: [
			{name: "", type: "", watt: "", time: "", consumption: "", averageOnTime: ""},
		],
	},
	water: {
		main: "",
		units: "",
		appliances: [
			{name: "", flowVolume: "", price: ""},
		],
		events: [
			{name: "", type: "", flowRate: "", time: "", consumption: "", averageOnTime: ""},
		],
	},
}

function randomIntBtwNumbers(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomFloatBtwNumbers(min, max, dec) {
	return (Math.random() * (max - min) + min).toFixed(dec)
}

function makeMessage() {
  let results = messageTemplate
  results.time = getTime()

  results.gasSensor = {
		O3: randomIntBtwNumbers(0,2),
		CO: randomIntBtwNumbers(20,2000),
		CO2: randomIntBtwNumbers(0,1000),
		NO: randomIntBtwNumbers(0,200),
		NO2: randomIntBtwNumbers(0,10),
		CH4: randomIntBtwNumbers(300,10000),
		H2: randomIntBtwNumbers(0,2000),
	}
  results.smappee.main = {
  	totalEnergy: randomIntBtwNumbers(1500,3000),
  	alwaysOn: randomIntBtwNumbers(120,350),
  	solarPower: 0,
  }
  results.smappee.usage = {
	solar: {
		wattHours: 0,
		price: 0,
	},
	electricity: {
		wattHours: randomIntBtwNumbers(34000, 70000),
		price: randomFloatBtwNumbers(4.00, 7.15, 3),
	},
	alwaysOn: {
		wattHours: randomIntBtwNumbers(3000, 7000),
		price: randomFloatBtwNumbers(0.47, 0.8, 3),
	},
	appliances: [
		{name: "Microwave", wattHours: randomIntBtwNumbers(30, 70), price: 0.01},
		{name: "Bathroom Light", wattHours: randomIntBtwNumbers(320, 500), price: 0.05},
		{name: "Stove", wattHours: randomIntBtwNumbers(300, 700), price: 0.05},
		{name: "TV", wattHours: randomIntBtwNumbers(500, 900), price: 0.07},
		{name: "Fridge Light", wattHours: randomIntBtwNumbers(80, 210), price: 0.02},
		{name: "Air Purifier", wattHours: randomIntBtwNumbers(300, 600), price: 0.05}
	],
  }
  results.smappee.events = electricScenarios[randomIntBtwNumbers(0,3)]
  results.water.main = randomIntBtwNumbers(80, 120)
  results.water.units = "gallons"
  results.water.appliances = [
 	 {name: "Washer", flowVolume: 27, price: 0.027},
 	 {name: "Dishwasher", flowVolume: 14, price: 0.014},
 	 {name: "Kitchen sink", flowVolume: randomIntBtwNumbers(25,50), price: randomFloatBtwNumbers(0.025, 0.050, 5)},
  ]
  results.water.events = waterScenarios[randomIntBtwNumbers(0,2)]

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
    return instance.publishRoot('hello, get data from the elder\'s home!')
  })
  .then(() => startPoll(frequency))
  .catch(console.log)