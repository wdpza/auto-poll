const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const schedule = require('node-schedule');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// DB or Config file.
const pollQuestions = require('./questions.json');

// Fetch questions
function fetchPollQuestions() {
    // For now, use the data from questions.json, ask Wayne for DB details.
    return pollQuestions;
}

// Function to get 3 unique random options
function getRandomOptions(options, count = 3) {
    const shuffled = options.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to create a poll
async function createPoll() {
    const questions = fetchPollQuestions();
    const question = questions[Math.floor(Math.random() * questions.length)];
    const selectedOptions = getRandomOptions(question.options);

    try {
        const response = await rest.post(Routes.channelMessages(process.env.POLL_CHANNEL_ID), {
            body: {
                content: "",
                embeds: [],
                allowed_mentions: { parse: [] },
                components: [],
                flags: 0,
                sticker_ids: [],
                poll: {
                    question: { text: question.question },
                    answers: selectedOptions.map(option => ({
                        label: option,
                        emoji: null, // Optional emoji field
                        poll_media: { text: option } // Poll Media Object for answer
                    })),
                    duration_minutes: 60 * 24 
                }
            }
        });

        console.log('Poll created:', response);
    } catch (error) {
        console.error('Error creating poll:', error);
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(process.env.POLL_CHANNEL_ID);

    // Schedule the poll creation every Friday at 13:00
    //schedule.scheduleJob('0 13 * * 5', createPoll);

    // Schedule the poll creation every 10 seconds for testing
    schedule.scheduleJob('*/10 * * * * *', createPoll);
});

client.login(process.env.DISCORD_TOKEN);