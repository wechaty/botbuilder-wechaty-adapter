// tslint:disable:no-console

import * as builder from 'botbuilder'

import { WechatyConnector } from '../src/wechaty-connector'

// Create wechaty connector
const wechatyConnector = new WechatyConnector()

const bot = new builder.UniversalBot(wechatyConnector)

// Bot dialogs
bot.dialog('/', [
  (session) => {
    if (session.userData && session.userData.name) {
        /*
        if (session.message.attachments &&
          session.message.attachments.length > 0) {
          var atm = session.message.attachments[0];
          if (atm.contentType == connector.WechatAttachmentType.Image) {
            var msg = new builder.Message(session).attachments([atm]);
            session.send(msg);
          }
        }
        */
      session.send('How are you, ' + session.userData.name)
    } else {
      builder.Prompts.text(session, 'Whats your name?')
    }
  },
  (session, results) => {
    session.userData.name = results.response
    session.send('OK, ' + session.userData.name)
    builder.Prompts.text(session, 'Whats your age?')
  },
  (session, results) => {
    session.userData.age = results.response
    session.send('All right, ' + results.response)
  },
])

// Listen for messages from wechat personal account
wechatyConnector.listen()
.catch(console.error)
