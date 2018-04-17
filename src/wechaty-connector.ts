import * as builder         from 'botbuilder'
import * as QrcodeTerminal  from 'qrcode-terminal'

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
  private handler?: any

  constructor(
    public options: WechatyConnectorOptions = {},
  ) {
    this.wechaty = Wechaty.instance({
      profile: 'botbuilder-wechaty-connector',
    })
  }

  public listen(): void {
    this.wechaty
    .on('message', msg => {
      if (!msg.self() && !msg.room()) {
        this.processMessage(msg)
      }
    })
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

    this.wechaty.start()
  }

  public processMessage(wechatyMessage: Message): this {
    const atts: builder.AttachmentType[] = []
    const msgType = wechatyMessage.type()

    if (!this.handler) {
        throw new Error('Error no handler')
    }

    const addr: builder.IAddress = {
        channelId: 'wechaty',
        user: { id: wechatyMessage.from().id,  name: wechatyMessage.from().name() },
        bot:  { id: wechatyMessage.to()!.id,    name: wechatyMessage.to()!.name() },
        conversation: { id: 'Convo1' },
    }

    let msg = new builder.Message()
                     .address(addr)
                     .timestamp(new Date().toISOString())
                     .entities([])

    if (msgType === MsgType.TEXT) {
        msg = msg.text(wechatyMessage.content())
    } else {
        msg = msg.text('')
    }

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

    msg = msg.attachments(atts)
    this.handler([msg.toMessage()])
    return this
  }

  public onEvent(
    handler: (
      events: builder.IEvent[],
      callback?: (err: Error) => void,
    ) => void,
  ): void {
    this.handler = handler
  }

  public async send(
    messages: builder.IMessage[],
    callback: (
      err:        Error,
      addresses?: builder.IAddress[],
    ) => void,
  ): Promise<void> {
    for (let i = 0; i < messages.length; i++) {
      console.log(messages[i].text)
      await this.postMessage(messages[i], callback)
    }
  }

  public startConversation(
    address: builder.IAddress,
    callback: (
      err:      Error,
      address?: builder.IAddress,
    ) => void,
  ): void {
      const addr = Object.assign(address, {
          conversation: { id: 'Convo1' },
      })

      callback(null!, addr)
  }

  public async postMessage(
    message: builder.IMessage,
    callback: (
      err:        Error,
      addresses?: builder.IAddress[],
    ) => void,
  ): Promise<void> {
    const addr = message.address
    const user = addr.user

    if (message.text && message.text.length > 0) {
      const wechatyContact = Contact.load(user.id)
      await wechatyContact.ready()
      await wechatyContact.say(message.text)
    }

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

}
