import { defineStore } from "pinia";

export interface ConnectionLog {
    type: 'twitch' | 'toonation'
    status: 'disconnected' | 'connecting' | 'connected'
    detail?: string
}
export interface VoteLog {
    type: 'vote',
    status: 'accepted' | 'rejected' | 'failed' | 'cooldown',
    detail: string
}

export type Log = ConnectionLog | VoteLog

export const useConnectStore = defineStore('connection', {
    state() {
        return {
            logs: [] as Log[]
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
        }
    }
})
