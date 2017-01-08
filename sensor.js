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
		{name: "Bathroom Light", type: "ON", averageOnTime: 30},
		{name: "Bathroom Fan", type: "ON",  averageOnTime: 10},
		{name: "Hair Dryer", type: "ON",  averageOnTime: 3},
	],
	2: [
		{name: "Fridge Light", type: "ON", averageOnTime: .2},
		{name: "Stove", type: "ON", averageOnTime: 50},
		{name: "Microwave", type: "ON", averageOnTime: 5},
		{name: "Toaster Oven", type: "ON", averageOnTime: 20},
		{name: "Coffee Maker", type: "ON", averageOnTime: 10},
		{name: "Kitchen Lights", type: "ON", averageOnTime: 90},
	],
	3: [
		{name: "TV", type: "ON", averageOnTime: 120},
		{name: "Stero System", type: "ON", averageOnTime: 40},
		{name: "Fire Place", type: "ON", averageOnTime: 120},
		{name: "Living Room Lights", type: "ON", averageOnTime: 150},
	],
	4: [
		{name: "TV", type: "ON", averageOnTime: 30},
		{name: "Night Stand Light", averageOnTime: 30},
		{name: "Living Room Lights", averageOnTime: 150},
		{name: "Air Purifier", type: "ON", averageOnTime: 360},		
	],
}

waterScenarios = {
	1:[	
		{name: "Bathroom Sink", type: "ON", averageOnTime: 5},
		{name: "Bathroom Shower", type: "ON", averageOnTime: 40},
		{name: "Bathroom Toilet", type: "ON", averageOnTime: 2},
	],
	2:[
		{name: "Kitchen Sink", type: "ON", averageOnTime: 10},
		{name: "Dish Washer", type: "ON", averageOnTime: 60},
		{name: "Fridge Water Usage", type: "ON", averageOnTime: 1},
	],
	3:[
		{name: "Water Heater", type: "ON", averageOnTime: 1200},
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
			{name: "", type: "", averageOnTime: ""},
		],
	},
	water: {
		main: "",
		units: "",
		appliances: [
			{name: "", flowVolume: "", price: ""},
		],
		events: [
			{name: "", type: "", averageOnTime: ""},
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
  console.log(JSON.stringify(results))
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