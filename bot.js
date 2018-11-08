// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// bot.js is your bot's main entry point to handle incoming activities.

const { ActivityTypes } = require('botbuilder');

// Turn counter property
const TURN_COUNTER_PROPERTY = 'turnCounterProperty';

class EchoBot {
    /**
     *
     * @param {ConversationState} conversation state object
     */
    constructor(conversationState) {
        // Creates a new state accessor property.
        // See https://aka.ms/about-bot-state-accessors to learn more about the bot state and state accessors
        this.countProperty = conversationState.createProperty(TURN_COUNTER_PROPERTY);
        this.conversationState = conversationState;
    }
    /**
     *
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} on turn context object.
     */
    async onTurn(turnContext) {
        // Handle message activity type. User's responses via text or speech or card interactions flow back to the bot as Message activity.
        // Message activities may contain text, speech, interactive cards, and binary or unknown attachments.
        // see https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        if (turnContext.activity.type === ActivityTypes.Message) {
            // read from state.
            let count = await this.countProperty.get(turnContext);
            count = count === undefined ? 1 : ++count;
            if (turnContext.activity.text === "this is Chuck") {
              await turnContext.sendActivity(`${ count }: Hello Chuck`);
            } else {

              var rp = require("request-promise");
              //var reply = "getting...";


              var options = { method: 'POST',
                url: 'https://prod-68.westus.logic.azure.com:443/workflows/a52e1e8499364c8698f63a3f6f064dd2/triggers/manual/paths/invoke',
                qs:
                 { 'api-version': '2016-06-01',
                   sp: '/triggers/manual/run',
                   sv: '1.0',
                   sig: '9DlhgST9G6bfT9MxEwbnYiaRK_vu7CdGVesEBZT0e4o' },
                headers:
                 { 'Content-Type': 'application/json' },
                body: { command: turnContext.activity.text },
                json: true ,
                simple: false};

              await rp(options)
                .then(function (body) {
                  console.log(body);
                  turnContext.sendActivity(body);
                })
                .catch(function (err) {
                  console.log(err);
                });
                //await turnContext.sendActivity(reply);

            }
            // increment and set turn counter.
            await this.countProperty.set(turnContext, count);
        } else {
            // Generic handler for all other activity types.
            await turnContext.sendActivity(`[${ turnContext.activity.type } event detected]`);
        }
        // Save state changes
        await this.conversationState.saveChanges(turnContext);
    }
}

exports.EchoBot = EchoBot;
