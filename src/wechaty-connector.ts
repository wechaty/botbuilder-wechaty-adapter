import * as builder         from 'botbuilder'
import * as QrcodeTerminal  from 'qrcode-terminal'

const VERSION: string = require('../package.json').version

import {
  Contact,
  Message,
  MsgType,
  Wechaty,
}                   from 'wechaty'

export enum AttachmentType {
    Image      = 'wechat/image',
    Voice      = 'wechat/voice',
    Video      = 'wechat/video',
    ShortVideo = 'wechat/shortvideo',
    Link       = 'wechat/link',
    Location   = 'wechat/location',
    Music      = 'wechat/music',
    News       = 'wechat/news',
    MpNews     = 'wechat/mpnews',
    Card       = 'wechat/card',
}

export interface WechatyConnectorOptions {
  enableRelay?:  boolean,
}

export class WechatyConnector implements builder.IConnector {

  private wechaty:  Wechaty

  private onEventHandler: (
    events: builder.IEvent[],
    cb?: (err: Error) => void,
  ) => void

  protected onInvokeHandler: (
    event: builder.IEvent,
    cb?: (err: Error, body: any, status?: number) => void,
  ) => void

  constructor(
    public options: WechatyConnectorOptions = {},
  ) {
    this.wechaty = Wechaty.instance({
      profile: 'botbuilder-wechaty-connector',
    })
  }

  public version(): string {
    return VERSION
  }

  public async listen(): Promise <void> {
    this.wechaty

      .on('logout'	, user => console.log('Bot', `${user.name()} logouted`))

      .on('login'	  , user => {
        console.log('Bot', `${user.name()} login`)
        user.say('Wechaty login').catch(console.error)
      })

      .on('scan', (url, code) => {
        if (!/201|200/.test(String(code))) {
          const loginUrl = url.replace(/\/qrcode\//, '/l/')
          QrcodeTerminal.generate(loginUrl)
        }
        console.log(`${url}\n[${code}] Scan QR Code above url to log in: `)
      })

      .on('message', msg => {
        if (  msg.self()
            || msg.room()
            || !msg.from().personal()
            || msg.type() !== MsgType.TEXT
        ) {
          return
        }

        this.processMessage(msg)
      })

    await this.wechaty.start()
  }

  public processMessage(wechatyMessage: Message): this {
    const atts: builder.AttachmentType[] = []

    /*
      To Be Implemented

      if (msgType == MsgType.IMAGE) {
        atts.push({
            contentType: AttachmentType.Image,
            content: {
                url: wechatyMessage.PicUrl,
                mediaId: wechatyMessage.MediaId
            }
        });
    }

    if (msgType == 'voice') {
        atts.push({
            contentType: AttachmentType.Voice,
            content: {
                format: wechatyMessage.Format,
                mediaId: wechatyMessage.MediaId,
                recognition: wechatyMessage.Recognition
            }
        });
    }

    if (msgType == 'video') {
        atts.push({
            contentType: AttachmentType.Video,
            content: {
                mediaId: wechatyMessage.MediaId,
                thumbMediaId: wechatyMessage.ThumbMediaId
            }
        });
    }

    if (msgType = 'shortvideo') {
        atts.push({
            contentType: AttachmentType.ShortVideo,
            content: {
                mediaId: wechatyMessage.MediaId,
                thumbMediaId: wechatyMessage.ThumbMediaId
            }
        });
    }

    if (msgType == 'link') {
        atts.push({
            contentType: AttachmentType.Link,
            content: {
                title: wechatyMessage.Title,
                description: wechatyMessage.Description,
                url: wechatyMessage.Url
            }
        });
    }

    if (msgType == 'location') {
        atts.push({
            contentType: AttachmentType.Location,
            content: {
                locationX: wechatyMessage.Location_X,
                locationY: wechatyMessage.Location_Y,
                scale: wechatyMessage.Scale,
                label: wechatyMessage.Label
            }
        });
    }
    */

    const addr: builder.IAddress = {
      channelId: 'wechaty',
      user: { id: wechatyMessage.from().id,  name: wechatyMessage.from().name() },
      bot:  { id: wechatyMessage.to()!.id,    name: wechatyMessage.to()!.name() },
      conversation: { id: 'Convo1' },
    }

    let msg = new builder.Message()
                    .address(addr)
                    .timestamp()
                    .entities([])

    switch (wechatyMessage.type()) {
      case MsgType.TEXT:
        msg = msg.text(wechatyMessage.content())
        break
      default:
        msg = msg.text('')
    }

    msg = msg.attachments(atts)

    if (this.onEventHandler) {
      this.onEventHandler([msg.toMessage()])
    }

    return this
  }

  public processEvent(event: builder.IEvent): this {
    if (this.onEventHandler) {
        this.onEventHandler([event])
    }
    return this
  }

  public onEvent(handler: (
    events: builder.IEvent[],
    cb?: (err: Error) => void) => void,
  ): void {
      this.onEventHandler = handler
  }

  public onInvoke(
    handler: (
      event: builder.IEvent,
      cb?: (err: Error, body: any, status?: number) => void,
    ) => void,
  ): void {
      this.onInvokeHandler = handler
  }

  /**
   * Bot Originated
   */
  public async send(
    messageList: builder.IMessage[],
    done: (
      err:        Error,
      addresses?: builder.IAddress[],
    ) => void,
  ): Promise<void> {

    const addresses: any[] = []

    for (const idx in messageList) {
      const msg = messageList[idx]
      try {
        const wechatyContact = Contact.load(msg.address.user.id)
        await wechatyContact.ready()

        if (msg.type === 'delay') {
          await new Promise(r => setTimeout(r, (<any>msg).value))
        } else if (msg.type === 'message') {
          if (msg.text) {
            await wechatyContact.say(msg.text)
          }
          if (msg.attachments && msg.attachments.length > 0) {
            for (let j = 0; j < msg.attachments.length; j++) {
              // renderAttachment(msg.attachments[j])
            }
          }
          addresses.push({
            ...msg.address,
            id: idx,
          })
        }
      } catch (e) {
        return done(e)
      }
    }
    return done(undefined!, addresses)

    /*
    if (message.attachments && message.attachments.length > 0) {
        for (var i = 0; i < message.attachments.length; i++) {
            var atm = message.attachments[i],
                atmType = atm.contentType,
                atmCont = atm.content;

            if (!atmCont) continue;

            switch(atmType) {
                case AttachmentType.Image:
                    this.wechatAPI.sendImage(user.id, atmCont.mediaId, errorHandle);
                    break;
                case AttachmentType.Voice:
                    this.wechatAPI.sendVoice(user.id, atmCont.mediaId, errorHandle);
                    break;
                case AttachmentType.Video:
                    this.wechatAPI.sendVideo(user.id, atmCont.mediaId, atmCont.thumbMediaId, errorHandle);
                    break;
                case AttachmentType.Music:
                    this.wechatAPI.sendMusic(user.id, atmCont, errorHandle);
                    break;
                case AttachmentType.News:
                    this.wechatAPI.sendNews(user.id, atmCont, errorHandle);
                    break;
                case AttachmentType.MpNews:
                    this.wechatAPI.sendMpNews(user.id, atmCont.mediaId, errorHandle);
                    break;
                case AttachmentType.Card:
                    this.wechatAPI.sendCard(user.id, atmCont, errorHandle);
                    break;
                default:
                    // Unknow attachment
                    break;
            }
        }
    }
    */

  }

  public startConversation(
    address: builder.IAddress,
    cb: (
      err:     Error,
      address?: builder.IAddress,
    ) => void,
  ): void {
    cb(undefined!, {
      ...address,
      conversation: {
        id: 'Convo1',
      },
    })
  }

}

export default WechatyConnector
