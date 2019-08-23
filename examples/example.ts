import {
  ActivityTypes,
  TurnContext,
}                 from 'botbuilder'

import { WechatyAdapter } from '../src/wechaty-adapter'

export class EchoBot {

  public async onTurn (
    turnContext: TurnContext,
  ): Promise<void> {
    console.info('EchoBot', 'onTurn() %s', turnContext)
    if (turnContext.activity.type === ActivityTypes.Message) {
      const text = turnContext.activity.text
      console.info('RECV:', text)
      switch (text.toLowerCase()) {
        case 'quit':
          console.info('Quiting...')
          process.exit(0)
          break

        case 'ding':
          console.info('Replying `dong`...')
          await turnContext.sendActivity('dong')
          console.info('Replied.')
          break

        default:
          console.info('EchoBot', 'onTurn() skip message "%s"', text)
      }
    }
  }

}

const echoBot = new EchoBot()
const adapter = new WechatyAdapter()
adapter.listen(async (turnContext: TurnContext) => {
  await echoBot.onTurn(turnContext)
}).catch(console.error)

console.info('> Wechaty EchoBot is online. I will reply `dong` if you send me `ding`!')
console.info('> Say "quit" to end.\n')
