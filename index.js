const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const schedule = require('node-schedule');
require('dotenv').config();
const connection = require('./db/db_connection');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
const config = require('./config.json');

// Fetch poll question and answers by ID
function fetchPollQuestionById(id, callback) {
    // Query to fetch the question by ID
    const questionQuery = 'SELECT * FROM questions WHERE id = ?';

    connection.query(questionQuery, [id], (err, questionResults) => {
        if (err) {
            console.error('Error fetching question:', err);
            return callback(err);
        }

        if (questionResults.length === 0) {
            console.log('No question found with the specified ID.');
            return callback(null, null);
        }

        const question = questionResults[0];

        // Query to fetch options for the selected question
        const optionsQuery = 'SELECT * FROM options WHERE question_id = ?';

        connection.query(optionsQuery, [question.id], (err, optionResults) => {
            if (err) {
                console.error('Error fetching options:', err);
                return callback(err);
            }

            // Combine the question and options
            const pollData = {
                question: question.question_text,
                options: optionResults.map(option => option.option_text)
            };

            console.log(pollData);

            callback(null, pollData);
        });
    });
}

// Get 3 unique random options
function getRandomOptions(options, count = 3) {
    const shuffled = options.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Ceate a poll
async function createPoll() {
    fetchPollQuestionById(config.poll_id, async (err, pollData) => {
        if (err) {
            console.error('Error fetching poll question:', err);
            return;
        }

        if (!pollData) {
            console.log('No poll data found.');
            return;
        }

        const selectedOptions = getRandomOptions(pollData.options);

        try {
            const response = await rest.post(Routes.channelMessages(process.env.POLL_CHANNEL_ID), {
                body: {
                    content: '',
                    embeds: [],
                    allowed_mentions: { parse: [] },
                    components: [],
                    flags: 0,
                    sticker_ids: [],
                    poll: {
                        question: { text: pollData.question },
                        answers: selectedOptions.map(option => ({
                            label: option,
                            emoji: null, // Optional emoji field
                            poll_media: { text: option } // Poll Media Object for answer
                        })),
                        duration_minutes: config.poll_duration // Poll duration in minutes
                    }
                }
            });

            console.log('Poll created:', response);
        } catch (error) {
            console.error('Error creating poll:', error);
        }
    });
}

// Execute when the client is ready
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(process.env.POLL_CHANNEL_ID);

    // Schedule the poll
    schedule.scheduleJob(config.poll_schedule, createPoll);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = fetchPollQuestionById;