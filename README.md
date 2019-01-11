# BOTBUILDER-WECHATY-ADAPTER

[![npm version](https://badge.fury.io/js/botbuilder-wechaty-connector.svg)](https://badge.fury.io/js/botbuilder-wechaty-connector)
[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-blue.svg)](https://github.com/chatie/wechaty)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Greenkeeper badge](https://badges.greenkeeper.io/huan/botbuilder-wechaty-connector.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.com/huan/botbuilder-wechaty-connector.svg?branch=master)](https://travis-ci.com/huan/botbuilder-wechaty-connector)
[![Build Status](https://zixia.visualstudio.com/zixia/_apis/build/status/zixia.botbuilder-wechaty-connector)](https://zixia.visualstudio.com/zixia/_build/latest?definitionId=3)

![BotBuilder Wechaty Adapter](docs/images/botbuilder-wechaty.jpg)
> Source: [Time to do it differently, build chatbots with streams](http://fizzylogic.nl/2018/03/09/time-to-do-it-differently-build-chatbots-with-streams/)

Microsoft Bot Framework v4 adapter for Wechat **PERSONAL** Account

If you are finding the Bot Framework v3 version of this adapter, please goto:

1. the [v3.0](https://github.com/huan/botbuilder-wechaty-connector/tree/v3.0) branch, or 
1. NPM [botbuilder-wechaty-connecter@3](https://www.npmjs.com/package/botbuilder-wechaty-connector)

## FEATURES

* Ready for Microsoft Bot Framework v4
* **no need a registered bot** on [dev.botframework.com](https://dev.botframework.com/), but require a wechat personal(NOT official!) account.
* Powered by [wechaty](https://github.com/chatie/wechaty)
* Support receiving and sending almost any wechat message types(WIP)

## TODO

* [ ] Add Room Message Support
* [ ] Add Full Message Types Support(current we only support text messages)

## INSTALLATION

```shell
npm install botbuilder-wechaty-adapter
```

## Preparation

We assume that, you already have a wechat personal account.

## Usage

**Step 1**, create your bot with wechaty connector

```ts
import { UniversalBot }     from 'botbuilder'
import { WechatyConnector } from 'botbuilder-wechaty-connector'

const wechatyConnector = new WechatyConnector()
wechatyConnector.listen()

const bot = new UniversalBot(wechatyConnector)
```

**Step 2**, add dialogs and you can see `message` in session object include wechat message content you sent.

```ts
bot.dialog('/', function (session) {
  console.log('Wechat message: ', session.message)
})
```

And, you can find media content like image, voice, video, etc in `message.attachments` of session object.(Not implement yet)

```ts
bot.dialog('/', function (session) {
  console.log('Wechat media: ', session.message.attachments)
});
```

**Step 4**, sending message out is the same.

Send text message

```ts
bot.dialog('/', function (session) {
  session.send("Im a wechaty bot!");
});
```

### Attachment

To Be Supported.

## EXAMPLE

An example is located at `examples/` directory. Using following command to run it.

```shell
npm run example
```

## THANKS

This package is greatly inspired by:

1. [botbuilder-wechat-connector](https://github.com/jyfcrw/botbuilder-wechat-connector), so thanks @jyfcrw.
1. [botbuilder-wechat](https://github.com/markusf/botbuilder-wechat), so thanks @markusf.

## ISSUES

Please feel free to [open issues](https://github.com/huan/botbuilder-wechaty-connector/issues/new), if you have any suggestion.

## SEE ALSO

* [Create a bot with the Bot Builder SDK for Node.js](https://docs.microsoft.com/en-us/azure/bot-service/nodejs/bot-builder-nodejs-quickstart)
* [Key concepts in the Bot Builder SDK for Node.js](https://docs.microsoft.com/en-us/azure/bot-service/nodejs/bot-builder-nodejs-concepts)
* [VIDEO: Become a Bot Builder with Microsoft Bot Framework - James Mann speaking at dotnetsheff in April, 2017](https://pusher.com/sessions/meetup/dotnetsheff/become-a-bot-builder-with-microsoft-bot-framework)

## CHANGELOG

### v4.0 master

Upgrade to Microsoft BotBuilder v4

1. Package name was rename to `botbuilder-wechaty-adapter` from `botbuilder-wechaty-connect` for following the v4 naming style.

### v3.0 (Jan 11, 2018)

Release `botbuilder-wechaty-connector@3.0` for BotBuilder v3

1. Work with Microsoft Bot Framework v3
1. Skip messages from other than a personal account(like official account, and SYS message)
1. Refactoring all the code from `ConsoleConnector`

### v0.0.1 (Apr 17, 2018)

1. Working with Wechaty Personal Text Messages.
1. An example run by `npm run example`

## AUTHOR

[Huan LI](http://linkedin.com/in/zixia) \<zixia@zixia.net\>

<a href="https://stackexchange.com/users/265499">
  <img src="https://stackexchange.com/users/flair/265499.png" width="208" height="58" alt="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites" title="profile for zixia on Stack Exchange, a network of free, community-driven Q&amp;A sites">
</a>

## COPYRIGHT & LICENSE

* Code & Docs © 2016-2019 Huan LI \<zixia@zixia.net\>
* Code released under the Apache-2.0 License
* Docs released under Creative Commons
