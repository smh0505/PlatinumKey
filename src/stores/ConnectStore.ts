import { ref } from 'vue'
import { defineStore } from "pinia";
import { useBoardStore } from "./BoardStore";
import { useWheelStore } from './WheelStore';

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

export const useConnectStore = defineStore('connection', {
    state() {
        return {
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
        connectTwitch(begin: boolean, channel: string = "arpa__") {
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
                    status: 'connected'
                })
            }

            this.socket_twitch.onmessage = msg => {
                if (msg.data.includes('PING')) {
                    this.socket_twitch?.send('PONG :tmi.twitch.tv')
                }
                if (begin && msg.data.includes('!픽')) {
                    const { name, status } = useBoardStore().parse(msg.data)
                    this.result({
                        type: 'vote',
                        status: status,
                        detail: name
                    })
                }
            }

            this.socket_twitch.onclose = () => {
                const filtered = this.logs.filter(x => x.type === "twitch")
                if (filtered.length === 0 || filtered.slice(-1)[0].status === "connected") {
                    this.result({
                        type: 'twitch',
                        status: "disconnected"
                    })
                }
                setTimeout(this.connectTwitch, 1000, begin, channel)
            }
        },
        connectToonation(payload: string) {
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
                if (msg.data.includes('roulette')) {
                    const amount = JSON.parse(msg.data).content.amount as number
                    const count = amount / 1000
                    if (useBoardStore().limitless) useBoardStore().limit += count

                    const roulette = JSON.parse(msg.data).content.message as string
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
                setTimeout(this.connectToonation, this.retryCount > 0 ? 1000 : 10, payload);
                this.retryCount++
            }
        }
    }
})