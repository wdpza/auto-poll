const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds]});
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// DB or Config file.
const pollQuestions = require('./questions.json');

// Fetch questions
function fetchPollQuestions() {
    // For now, use the data from questions.json, ask Wayne for DB details.
    return pollQuestions;
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(process.env.POLL_CHANNEL_ID);

    // Fetch and schedule polls
    setInterval(async () => {
        const questions = fetchPollQuestions();
        const question = questions[Math.floor(Math.random() * questions.length)];

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
                        answers: question.options.map((option, i) => ({ 
                            label: option, 
                            emoji: null, // Optional emoji field
                            poll_media: { text: option }  // Poll Media Object for answer
                        })),
                        duration_minutes: 60 * 24 
                    }
                }
            });

            console.log('Poll created:', response);
        } catch(error) {
            console.error('Error creating poll:', error);
        }
    }, 5000);
});

client.login(process.env.DISCORD_TOKEN);