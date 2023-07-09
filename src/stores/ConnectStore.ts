import { ref } from 'vue'
import { defineStore } from "pinia";
import { useBoardStore } from "./BoardStore";
import { useWheelStore } from './WheelStore';
import { useOptionsStore } from './OptionsStore';

export interface ConnectionLog {
    type: 'twitch' | 'toonation'
    status: 'disconnected' | 'connecting' | 'connected'
    detail?: string
}

interface VoteLog {
    type: 'vote',
    status: 'accepted' | 'rejected' | 'failed' | 'cooldown',
    detail: string
}

export type Log = ConnectionLog | VoteLog

export interface ParsedIRCMessage {
    tags: { [key: string]: string },
    source: {
        full: string,
        nick?: string,
        user?: string,
        host?: string
    },
    command: string,
    params: string,
    content: string
}

const IRC_REGEXES = {
    line: /^(?:@(?<tags>(?:.+?=.*?)(?:;.+?=.*?)*) )?(?::(?<source>[^ ]+?) )?(?<command>[0-9]{3}|[a-zA-Z]+)(?: (?<params>.+?))?(?: :(?<content>.*))?$/,
    user: /^(?:(?<nick>[^\s]+?)!(?<user>[^\s]+?)@)?(?<host>[^\s]+)$/
}

export const useConnectStore = defineStore('connection', {
    state() {
        return {
            toonationPayload: '' as string | null,

            logs: [] as Log[],
            socket_twitch: ref<WebSocket | null>(null),
            socket_toonation: ref<WebSocket | null>(null),
            retryCount: 0,
            roulette_idle: true,
            roulette_temp: [] as string[]
        }
    },
    actions: {
        result({ type, status, detail }: Log) {
            if(type === 'twitch' || type === 'toonation') {
                // remove same kind of recent-10 connection log
                for(let i = Math.max(0, this.logs.length - 10); i < this.logs.length; i++) {
                    if(this.logs[i].type === type) {
                        this.logs.splice(i, 1)
                        break
                    }
                }
            }

            this.logs.push({ type, status, detail } as Log)
        },
        async connectAll() {
            const options = useOptionsStore()
            this.connectTwitch(options.channel || undefined)

            await this.prepareToonation(options.password)
            this.connectToonation()
        },
        connectTwitch(channel: string = 'arpa__') {
            if (this.socket_twitch) {
                return
            }
            this.socket_twitch = new WebSocket('wss://irc-ws.chat.twitch.tv')
            this.result({
                type: 'twitch',
                status: 'connecting'
            })

            this.socket_twitch.onopen = () => {
                this.socket_twitch?.send('CAP REQ :twitch.tv/commands twitch.tv/tags')
                this.socket_twitch?.send('NICK justinfan9705')
                this.socket_twitch?.send('JOIN #' + channel)
                this.result({
                    type: 'twitch',
                    status: 'connected',
                    detail: channel
                })
            }

            this.socket_twitch.onmessage = (msg) => {
                const lines = msg.data.split('\r\n') as string[]
                lines.forEach(line => this.parseTwitch(line))
            }

            this.socket_twitch.onclose = () => {
                const filtered = this.logs.filter(x => x.type === "twitch")
                if (filtered.length === 0 || filtered.slice(-1)[0].status === "connected") {
                    this.result({
                        type: 'twitch',
                        status: "disconnected"
                    })
                }
                this.socket_twitch = null
                setTimeout(this.connectTwitch, 1000, channel)
            }
        },
        parseTwitch(line: string) {
            if (!line)
                return

            const { groups: match } = IRC_REGEXES.line.exec(line) ?? {}

            if(!match)
                return

            if (match.command === 'PING') {
                this.socket_twitch?.send(`PONG ${match.params}`)
            } else if (match.command === 'PRIVMSG') {
                // temporal early return
                if(!match.content.includes('!픽'))
                    return

                const message: ParsedIRCMessage = {
                    tags: Object.fromEntries(
                        match.tags?.split(/(?<!\\);/)
                            .map(_ => _.split(/(?<!\\)=/))
                            .map(([a, ...b]) => [
                                a.replaceAll('-', '_'),
                                b.join('=')
                            ])
                        ?? []
                    ),
                    source: {
                        full: match.source,
                        ...(IRC_REGEXES.user.exec(match.source)?.groups ?? {})
                    },
                    command: match.command,
                    params: match.params,
                    content:
                        match.content.startsWith('\x01ACTION')
                        ? match.content.slice(8, -1)
                        : match.content
                }

                // WARNING: early return made !픽 check unnecessary
                const { name, status } = useBoardStore().parse(message)
                this.result({
                    type: 'vote',
                    status: status,
                    detail: name
                })
            }
        },
        async prepareToonation(password: string) {
            const response = await fetch("https://cors-proxy.bloppyhb.workers.dev/https://toon.at/widget/alertbox/" + password).then(d => d.text())
            const match = /"payload":"(\w+)"/.exec(response)
            if(match) {
                this.toonationPayload = match[1]
                return match[1]
            } else {
                throw new Error('투네이션 Payload를 가져오지 못했습니다.')
            }
        },
        connectToonation(payload?: string) {
            if (!payload)
                payload = this.toonationPayload!
            if (!payload)
                throw new Error('no payload given')
            if (this.socket_toonation)
                return

            this.socket_toonation = new WebSocket('wss://toon.at:8071/' + payload)
            this.result({
                type: 'toonation',
                status: 'connecting'
            })

            this.socket_toonation.onopen = () => {
                this.result({
                    type: 'toonation',
                    status: 'connected'
                })
                this.retryCount = 0
            }

            this.socket_toonation.onmessage = msg => {
                const data = JSON.parse(msg.data)
                if (data.content.roulette) {
                    const amount = data.content.amount as number
                    const count = amount / 1000
                    if (useBoardStore().limitless) useBoardStore().limit += count

                    const roulette = data.content.message as string
                    const rValue = roulette.split(' - ')[1]
                    if (rValue !== '꽝') {
                        if (this.roulette_idle) useWheelStore().addOption(rValue)
                        else this.roulette_temp.push(rValue)
                    }
                }
            }

            this.socket_toonation.onclose = () => {
                const filtered = this.logs.filter(x => x.type === 'toonation')
                if (filtered.length === 0 || filtered.slice(-1)[0].status === 'connected') {
                    this.result({
                        type: 'toonation',
                        status: 'disconnected'
                    })
                }
                this.socket_toonation = null
                setTimeout(this.connectToonation, this.retryCount > 0 ? 1000 : 10, payload);
                this.retryCount++
            }
        }
    }
})
