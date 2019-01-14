// tslint:disable:no-console

import {
  ActivityTypes,
  TurnContext,
}                 from 'botbuilder'
import { log }    from 'wechaty'

import { WechatyAdapter } from '../src/wechaty-adapter'

export class EchoBot {
  public async onTurn (
    turnContext: TurnContext,
  ): Promise<void> {
    log.verbose('EchoBot', 'onTurn() %s', turnContext)
    if (turnContext.activity.type === ActivityTypes.Message) {
      const text = turnContext.activity.text
      console.log('RECV:', text)
      switch (text.toLowerCase()) {
        case 'quit':
          console.log('Quiting...')
          process.exit(0)
          break

        case 'ding':
          console.log('Replying `dong`...')
          await turnContext.sendActivity('dong')
          console.log('Replied.')
          break

        default:
          log.info('EchoBot', 'onTurn() skip message "%s"', text)
      }
    }
  }
}

const echoBot = new EchoBot()
const adapter = new WechatyAdapter()
adapter.listen(async (turnContext: TurnContext) => {
  await echoBot.onTurn(turnContext)
}).catch(console.error)

console.log('> Wechaty EchoBot is online. I will reply `dong` if you send me `ding`!')
console.log('> Say "quit" to end.\n')
