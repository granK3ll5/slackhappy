require('dotenv').config();

// Initialize using verification token from environment variables
const WebClient = require('@slack/client').WebClient,
	createSlackEventAdapter = require('@slack/events-api').createSlackEventAdapter,
	slackEvents = createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN, {includeBody: true}),
	bot_token = process.env.SLACK_BOT_TOKEN || '',
	auth_token = process.env.SLACK_AUTH_TOKEN || '',


	web = new WebClient(auth_token),
	bot = new WebClient(bot_token),

	// Initialize an Express application
	express = require('express'),
	bodyParser = require('body-parser'),

	users = {},
	currentDate = new Date();
	app = express();



onboard = require('./onboard');

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));

app.use('/events', slackEvents.expressMiddleware());
//app.use('/slack/actions', slackInteractions.expressMiddleware());



slackEvents.on('member_joined_channel', (event)=> {
	bot.channels.info({channel: event.channel})
	.then((res)=> {
		const spChannel = res.channel.name;
		console.log('Member has joined a channel');

		if(spChannel !== 'announcements-usaa') {
		console.log(`User did not join the specified channel...Will not send message`);
	} else {
		console.log(`Member has joined the specified channel...Proceeding to send messgae...`);

		bot.users.info({user: event.user})
		.then((res)=> {
			const userID = res.user.id,
			userName = res.user.real_name,
			userBot = res.user.is_bot,

			 userEmail = res.user.profile.email,
			 findEmail = userEmail.includes("@gmail.com");
		if (userBot === true || !findEmail) {
			console.log(`${userName} is an invalid user`);
		} else {
			console.log(`New member ${userName} has joined! ${findEmail}`);
			bot.im.open({user: userID})
			.then((res)=> {
				const DMchannel = res.channel.id;
				bot.chat.postMessage({channel: DMchannel, text: onboard.text, attachments: onboard.attachments, as_user: false, username: 'wELcoMeBOT'});
				console.log(`We have a new member! Member is ${userName} joining the ${spChannel} channel\n\n${userName} joined on ${currentDate}`);

							});				  
						}

			});
		}	

});
});


/*slackEvents.on('message.ap_home', event=> {
	console.log(event);
	bot.im.open({user: event.user})
	.then((res)=> {
		const DM = res.channel.id;
		const ID = event.channel;
	
		if(ID !== DM) {
			console.log(`Do nothing`);
		} else {
			console.log(`User has tried contacting the BOT...now responding...`);
			bot.chat.postMessage({channel: DM, text: `I am just an onboarding bot. I do not do anything else...Sorry.`, as_user: false, username: 'wELcoMeBOT'});
		}
	});
});
*/
// Handle errors (see `errorCodes` export)
slackEvents.on('error', console.error);

// Start the express application
app.listen(process.env.PORT, () => {
console.log(`App listening on port ${process.env.PORT}!`);
});