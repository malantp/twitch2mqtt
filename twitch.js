const tmi = require('tmi.js')
const mqtt = require('mqtt')

// User Configuration
const mqtt_host = 'MQTT_BROKER_IP'
const mqtt_port = 'MQTT_BROKER_PORT' //default is 1883
const mqtt_username = 'MQTT_USERNAME'
const mqtt_password = 'MQTT_PASSWORD'
const mqtt_topic = '/twitch/' //root of the MQTT topic where messages are published
const twitch_channel = 'TWITCH_CHANNEL'
const twitch_password = 'TWITCH_KEY' //starting with "oauth:"
const twitch_botname = 'TWITCH_BOTNAME'

// MQTT Connection
const connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const clientMqtt = mqtt.connect(connectUrl, {
	clientId,
	clean: true,
	connectTimeout: 4000,
	username: mqtt_username,
	password: mqtt_password,
	reconnectPeriod: 1000,
})

// Twitch chat connection
const opts = {
	identity: {
		username: twitch_botname,
		password: twitch_password
	},
	channels: [
		twitch_channel
	]
}

// Create a client with our options
const clientTwitch = new tmi.client(opts)

// Register our event handlers (defined below)
clientTwitch.on('message', onMessageHandler)
clientTwitch.on('connected', onConnectedHandler)
clientMqtt.on('connect', onPublish)

// Connect to Twitch:
clientTwitch.connect()

// ↑ Don't touch ↑


// RegExp
const hexColour = new RegExp("^#[a-fA-F0-9]{6}$")

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) 
{
	if (self) { return } // Ignore messages from the bot


	// Exemple of an MQTT message that change the colour of 3 different LEDs by typing "!led[number] [colour]" in the chat
	
	const commandName = msg.trim().toLowerCase()
	const topicName = mqtt_topic + commandName.substring(1, 5)
	let commandBaseTab = commandName.split(" ")
	let commandBase = commandName.split(" ")[0].substring(1)
 
	
	switch(commandBase)
	{
	case "led12":
		if (commandBaseTab.length == 3)
		{
			let colour1 = selectColour(commandBaseTab[1])
			let colour2 = selectColour(commandBaseTab[2])
			if(colour1 && colour2)
			{
				onPublish(mqtt_topic + "led1",colour1)
				onPublish(mqtt_topic + "led2",colour2)
			}
		}
		break
	case "led13":
		if (commandBaseTab.length == 3)
		{
			let colour1 = selectColour(commandBaseTab[1])
			let colour3 = selectColour(commandBaseTab[2])
			if(colour1 && colour3)
			{
				onPublish(mqtt_topic + "led1",colour1)
				onPublish(mqtt_topic + "led3",colour3)
			}
		}
		break
	case "led23":
		if (commandBaseTab.length == 3)
		{
			let colour2 = selectColour(commandBaseTab[1])
			let colour3 = selectColour(commandBaseTab[2])
			if(colour2 && colour3)
			{
				onPublish(mqtt_topic + "led2",colour2)
				onPublish(mqtt_topic + "led3",colour3)
			}
		}
		break
	case "led123":
		if (commandBaseTab.length == 4)
		{
			let colour1 = selectColour(commandBaseTab[1])
			let colour2 = selectColour(commandBaseTab[2])
			let colour3 = selectColour(commandBaseTab[3])
			if(colour1 && colour2 && colour3)
			{
				onPublish(mqtt_topic + "led1",colour1)
				onPublish(mqtt_topic + "led2",colour2)
				onPublish(mqtt_topic + "led3",colour3)
			}
		}
		break
	case "led1":
	case "led2":
	case "led3":
		const colour = selectColour(commandName.substring(6))
		if(colour)
		{
			onPublish(topicName,colour)
			console.log(`* Executed ${commandName} command`)
		}
		break
	case "leds":
		let preColour = commandName.substring(6)
		switch (preColour.toLowerCase())
		{
		case "blouge":
			if(Math.floor(Math.random()*2))
			{
				onPublish(mqtt_topic + "led1",selectColour("bleu"))
				onPublish(mqtt_topic + "led3",selectColour("rouge"))
			}
			else
			{
				onPublish(mqtt_topic + "led1",selectColour("rouge"))
				onPublish(mqtt_topic + "led3",selectColour("bleu"))
			}
			onPublish(mqtt_topic + "led2",selectColour("magenta"))
			break
		case "RGB":
			onPublish(mqtt_topic + "led1",selectColour("rouge"))
			onPublish(mqtt_topic + "led2",selectColour("vert"))
			onPublish(mqtt_topic + "led3",selectColour("bleu"))
			break
		case "CMY":
		case "primaires":
			onPublish(mqtt_topic + "led1",selectColour("cyan"))
			onPublish(mqtt_topic + "led2",selectColour("magenta"))
			onPublish(mqtt_topic + "led3",selectColour("jaune"))
			break
		case "france":
		case "rance":
		case "fra":
		case "fr":
			onPublish(mqtt_topic + "led1",selectColour("bleu"))
			onPublish(mqtt_topic + "led2",selectColour("blanc"))
			onPublish(mqtt_topic + "led3",selectColour("rouge"))
			break
      
		default:
			const colour = selectColour(commandName.substring(6))
			if(colour)
			{
				onPublish(mqtt_topic + "led1",colour)
				onPublish(mqtt_topic + "led2",colour)
				onPublish(mqtt_topic + "led3",colour)
			}
		}//switch "2"
		console.log(`* Executed ${commandName} command`)
		break
	case "ledsr":		
			onPublish(mqtt_topic + "led1",randColour())
			onPublish(mqtt_topic + "led2",randColour())
			onPublish(mqtt_topic + "led3",randColour())
			console.log(`* Executed ${commandName} command`)
		break
	}//switch
}

// MQTT publish
function onPublish (tpc, msg) {
	clientMqtt.publish(tpc, msg)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	console.log(`* Connected to ${addr}:${port}`)
}
	
function selectColour(colour)
{
	switch (colour.toLowerCase()) 
	{
		case 'rouge':
		case 'red':
			return'#FF0000'
		case 'vert':
		case 'green':
			return'#00FF00'
		case 'bleu':
		case 'blue':
			return'#0000FF'
		case 'cyan':
			return'#00FFFF'
		case 'magenta':
		case 'fushia':
			return'#FF00FF'
		case 'jaune':
		case 'yellow':
			return'#FFDD00'
		case 'orange':
			return'#FF6600'
		case 'turquoise':
		case 'teal':
			return'#00FF88'
		case 'rose':
		case 'pink':
			return'#FF44FF'
		case 'violet':
			return'#8000FF'
		case 'blanc':
		case 'white':
			return'#FFFFFF'
		case 'noir':
		case 'black':
		case 'off':
			return'#000000'
		case "random":
		case "rand":
			return randColour()
		default:
			if (hexColour.test(colour) === true) {return colour}
			else{ return false}
	}
}
function randColour()
{
	return "#"+Math.floor(Math.random()*16777215).toString(16)
}
