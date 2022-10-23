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
/*
                              |
                              |
                              |
                              |
                              |
                              |
                              |
                          _ ----- _
                     .-~             ~-.
                   /                     \
        .-- -- -- |                       | -- -- --.
    .-~ / ~~ ~~ ~~ \        O   O        / ~~ ~~ ~~ \ ~-.
.-~   /        _ - ~ ~-.             .-~ ~ - _        \   ~-.
    /      /~          /  ~ ----- ~  \          ~\      \
  /       /           /               \           \       \
         /           /                 \           \
        /           /                   \           \
       /           |                     |           \
                   |                     |
                   |                     |
                   |                     |
                   |                     |
						 I am a friendly spider, here to eat bugs
*/

// RegExp
const hexColour = new RegExp("^#[a-fA-F0-9]{6}$"),
ledCommand = new RegExp("^led(?=[1-3]{1,3})([1-3])(?!\\1)([1-3])?(?!\\1)(?!\\2)([1-3])?$"),
ledCommandPatch = new RegExp("^led[1-3]$");
let commandName;

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) 
{
	if (self) { return } // Ignore messages from the bot

	// Exemple of an MQTT message that change the colour of 3 different LEDs by typing "!led[number] [colour]" in the chat
	
	commandName = msg.trim().toLowerCase()
	let commandBaseTab = commandName.split(" ")
	// TODO : Modifier la regex pour qu'elle accepte les commandes led1, led2 et led3 et retirer le patch
	// Si la commande cible des leds en particulier
    if( (ledCommand.test(commandBaseTab[0].substring(1)) || ledCommandPatch.test(commandBaseTab[0].substring(1))) && commandBaseTab.length >1)
    {
		// On récupère les numéros des leds
        let cmd = {}, leds = commandBaseTab[0].substring(4), colorRequest
		// Pour chaque leds
        for(let l of leds)
        {
			// si la couleur correspondante existe, on l'ajoute à la liste de commande.
			colorRequest = commandBaseTab[leds.indexOf(l)+1]? commandBaseTab[leds.indexOf(l)+1] : colorRequest
            let c = selectColour(colorRequest)
            if(!c)return;
            cmd[l] = c;
        }
        multiPublish(cmd);
		console.log(`* Executed ${commandName} command`)
        return;
    }
	switch(commandBaseTab[0].substring(1))
    {
    case "leds":
        let preColour = commandName.substring(6)
        switch (preColour.toLowerCase())
        {
        case "blouge":
            let c1 = Math.floor(Math.random()*2) ? "bleu" : "rouge"
            let c2 = c1 == "rouge"? "bleu" : "rouge"
            multiPublish({1:c1, 2:"magenta", 3:c2})
            break
        case "RGB":
            multiPublish({1:"rouge", 2:"vert", 3:"bleu"})
            break
        case "CMY":
        case "primaires":
            multiPublish({1:"cyan", 2:"magenta", 3:"jaune"})
            break
        case "france":
        case "rance":
        case "fra":
        case "fr":
            multiPublish({1:"bleu", 2:"blanc", 3:"rouge"})
            break
        case "sonic":
                multiPublish({1:(Math.floor(Math.random()*7) ? "bleu" : "jaune"), 2:"blanc", 3:"rouge"})
            break
        case "tails":
            multiPublish({1:"orange", 2:"blanc", 3:"rouge"})
            break
        case "knuckles":
            multiPublish({1:"rouge", 2:"blanc", 3:"vert"})
            break
        case "STK":
        case "teamhero":
            multiPublish({1:"bleu", 2:"orange", 3:"rouge"})
            break
        case "nights":
            multiPublish({1:"violet", 2:"magenta", 3:"blanc"})
            break
        default:
            const colour = selectColour(commandName.substring(6))
            if(colour)
            {
                multiPublish({1:colour, 2:colour, 3:colour})
            }
        }//switch "2"
        break
    case "ledsr":        
            multiPublish({1:randColour(), 2:randColour(), 3:randColour()})
        break
    }//switch
}
function multiPublish(commands)
{
    for(let i in commands)
    {
        onPublish(mqtt_topic + `led${i}`,selectColour(commands[i]))
    }
    console.log(`* Executed ${commandName} command`)
}
// MQTT publish
function onPublish (tpc, msg) 
{
	clientMqtt.publish(tpc, msg)
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) 
{
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
		case 'marron':
		case 'brown':
			return'#B97A57'
		case 'blanc':
		case 'white':
			return'#FFFFFF'
    case 'infrarouge':
    case 'infra-rouge':
    case 'infrared':
    case 'infra-red':
    case 'ultraviolet':
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
