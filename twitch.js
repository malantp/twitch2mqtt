const tmi = require('tmi.js');
const mqtt = require('mqtt');

// User Configuration
const mqtt_host = 'MQTT_BROKER_IP';
const mqtt_port = 'MQTT_BROKER_PORT'; //default is 1883
const mqtt_username = 'MQTT_USERNAME';
const mqtt_password = 'MQTT_PASSWORD';
const mqtt_topic = '/twitch/'; //root of the MQTT topic where messages are published
const twitch_channel = 'TWITCH_CHANNEL';
const twitch_password = 'TWITCH_KEY'; //starting with "oauth:"
const twitch_botname = 'TWITCH_BOTNAME';

// MQTT Connection
const connectUrl = `mqtt://${mqtt_host}:${mqtt_port}`;
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const clientMqtt = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: mqtt_username,
  password: mqtt_password,
  reconnectPeriod: 1000,
});

// Twitch chat connection
const opts = {
  identity: {
    username: twitch_botname,
    password: twitch_password
  },
  channels: [
    twitch_channel
  ]
};

// Create a client with our options
const clientTwitch = new tmi.client(opts);

// RegExp
const hexColor = new RegExp("^#[a-fA-F0-9]{6}$");

// Register our event handlers (defined below)
clientTwitch.on('message', onMessageHandler);
clientTwitch.on('connected', onConnectedHandler);
clientMqtt.on('connect', onPublish);

// Connect to Twitch:
clientTwitch.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message and ignore case
  const commandName = msg.trim().toLowerCase();

  // Exemple of an MQTT message that change the color of 3 different LEDs by typing "!led[number] [color]" in the chat
  if (commandName.substring(1, 5) === 'led1' || commandName.substring(1, 5) === 'led2' || commandName.substring(1, 5) === 'led3') {
    const topicName = mqtt_topic + commandName.substring(1, 5);
    switch (commandName.substring(6)) {
      case 'rouge':
      case 'red':
        onPublish(topicName,'#FF0000');
      break;
      case 'vert':
      case 'green':
        onPublish(topicName,'#00FF00');
      break;
      case 'bleu':
      case 'blue':
        onPublish(topicName,'#0000FF');
      break;
      case 'cyan':
        onPublish(topicName,'#00FFFF');
      break;
      case 'magenta':
      case 'fushia':
        onPublish(topicName,'#FF00FF');
      break;
      case 'jaune':
      case 'yellow':
        onPublish(topicName,'#FFDD00');
      break;
      case 'orange':
        onPublish(topicName,'#FF6600');
      break;
      case 'turquoise':
      case 'teal':
        onPublish(topicName,'#00FF88');
      break;
      case 'rose':
      case 'pink':
        onPublish(topicName,'#FF44FF');
      break;
      case 'violet':
        onPublish(topicName,'#8000FF');
      break;
      case 'blanc':
      case 'white':
        onPublish(topicName,'#FFFFFF');
      break;
      case 'noir':
      case 'black':
      case 'off':
        onPublish(topicName,'#000000');
      break;
    }
    if (hexColor.test(commandName.substring(6)) === true) {onPublish(topicName,commandName.substring(6));}
    console.log(`* Executed ${commandName} command`);
  }
}

// MQTT publish
function onPublish (tpc, msg) {
  clientMqtt.publish(tpc, msg);
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}