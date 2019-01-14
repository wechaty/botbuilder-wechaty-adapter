import {
  Activity,
  ActivityTypes,
  BotAdapter,
  ConversationReference,
  ResourceResponse,
  TurnContext,
}                             from 'botbuilder'
import * as QrcodeTerminal  from 'qrcode-terminal'

// tslint:disable:no-console

// tslint:disable-next-line:no-var-requires
// const VERSION: string = require('../package.json').version

import {
  log,
  Message,
  Wechaty,
}                   from 'wechaty'

import { VERSION } from './version'

/**
 * @module botbuilder-wechaty-adapter
 */

export class WechatyAdapter extends BotAdapter {
  private readonly wechaty: Wechaty

  constructor () {
    super()
    this.wechaty = new Wechaty({
      profile: 'botbuilder-wechaty-adapter',
    })

    this.wechaty
    .on('logout'	, user => log.verbose('WechatyAdapter', `${user.name()} logouted`))
    .on('login'	  , user => {
      log.verbose('WechatyAdapter', `${user.name()} login`)
      user.say('Wechaty login').catch(console.error)
    })
    .on('scan', (qrcode, status) => {
      if (!/201|200/.test(String(status))) {
        QrcodeTerminal.generate(qrcode, { small: true })
        log.info(`${qrcode}\n[${status}] Scan QR Code above url to log in: `)
      }
    })

  }

  public version (): string {
    return VERSION
  }

  public async listen (
    logic: (context: TurnContext) => Promise<void>,
  ): Promise<() => Promise<void>> {
    log.verbose('WechatyAdapter', 'listen()')

    await this.wechaty.start()

    this.wechaty.on('message', async msg => {
      log.verbose('WechatyAdapter', 'listen() wechaty.on(message) %s', msg)

      const activity = await this.buildActivity(msg)
      if (!activity) {
        // should skip this message
        log.verbose('WechatyAdapter', 'listen() wechaty.on(message) no activity')
        return
      }

      try {
        await this.runMiddleware(
          new TurnContext(this, activity),
          logic,
        )
      } catch (err) {
        throw err
      }
    })

    return async () => {
      this.wechaty.removeAllListeners('message')
      await this.wechaty.stop()
    }
  }

  private async buildActivity (
    msg: Message,
  ): Promise<null | Partial<Activity>> {
    log.verbose('WechatyAdapter', 'buildActivity(%s)', msg)

    const from = msg.from()

    if (!from ) {
      throw new Error('WechatyAdapter processMessage() discard message without a from contact: ' + msg)
    }

    if (  msg.self()
        || msg.room()
        || (from && from.type() !== this.wechaty.Contact.Type.Personal)
        || (msg.type() !== this.wechaty.Message.Type.Text)
    ) {
      log.verbose('WechatyAdapter', 'buildActivity(%s) message from self or room or not text, return null', msg)
      return null
    }

    const botUser = this.wechaty.userSelf()
    const room = msg.room()

    const reference = {
      bot: {
        id   : botUser.id,
        name : botUser.name()
      },
      channelId: 'wechaty',
      conversation:  {
        id      : room && room.id || 'conversation',
        isGroup : !!room,
        name    : room && await room.topic() || 'Conversation',
      },
      serviceUrl: '',
      user: {
        id   : from.id,
        name : from.name(),
      },
    } as ConversationReference

    const activity: Partial<Activity> = TurnContext.applyConversationReference(
      {
        id        : msg.id,
        text      : msg.text(),
        timestamp : new Date(),
        type      : ActivityTypes.Message,
      },
      reference,
      true,
    )

    return activity
  }

  public async continueConversation (
    ref: ConversationReference,
    callback: (context: TurnContext) => Promise<void>,
  ): Promise<void> {
    const activity: Partial<Activity> = TurnContext.applyConversationReference({}, ref, true)

    try {
      await this.runMiddleware(
        new TurnContext(this, activity),
        callback,
      )
    } catch (err) {
      // TODO: add some code to deal with err...
      throw err
    }
  }

  public async sendActivities (
    context: TurnContext,
    activities: Array<Partial<Activity>>,
  ): Promise<ResourceResponse[]> {
    const responses: ResourceResponse[] = []
    for (const activity of activities) {
      // const activity: Partial<Activity> = activities[i]
      responses.push({} as ResourceResponse)
      switch (activity.type) {
        case ActivityTypes.Message:
          /*
           * The Bot Framework Adapter uses a ClientConnector object to reply/send conversation.
           * Since the Console Bot does not connect to an endpoint or REST API, we can't use that (code below).
           * Not sure if there is a better way to return this Promise that isn't an empty object array.
          if (activity.replyToId) {
            responses.push(await client.conversations.replyToActivity(
              activity.conversation.id,
              activity.replyToId,
              activity as Activity
            ))
          } else {
            responses.push(await client.conversations.sendToConversation(
              activity.conversation.id,
              activity as Activity
            ))
          }
          */
          const recipientId = activity.recipient && activity.recipient.id
          const text = activity.text

          // console.log('Bot Id: ', this.wechaty.userSelf().id)
          // console.log(activity)

          if (!recipientId) {
            throw new Error('no recipient id')
          }
          if (!text) {
            throw new Error('no text')
          }

          const user = this.wechaty.Contact.load(recipientId)
          await user.say(text)
          // console.log((activity.text != null) ? activity.text : '')
          break
        default:
          log.error(`The [${activity.type}] is not supported by the Wechaty Adapter(yet).`)
          break
      }
    }
    return responses
  }

  public async updateActivity (
    context  : TurnContext,
    activity : Partial<Activity>,
  ): Promise<void> {
    throw new Error('The method [updateActivity] is not supported by the Wechaty Adapter(yet).')
  }

  public async deleteActivity (
    context   : TurnContext,
    reference : Partial<ConversationReference>,
  ): Promise<void> {
    throw new Error('The method [deleteActivity] is not supported by the Wechaty Adapter(yet).')
  }

}
