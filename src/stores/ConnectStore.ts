import { defineStore } from "pinia";

export const useConnectStore = defineStore('connection', {
    state() {
        return {
            logs: [] as log[]
        }
    },
    getters: {
        output(state) {
            return state.logs.slice(-10)
        }
    },
    actions: {
        result(type: number, positive: boolean, detail: string | null = null) {
            if(type === 1 || type === 2) {
                // remove same kind of recent-10 connection log
                for(let i = Math.max(0, this.logs.length - 10); i < this.logs.length; i++) {
                    console.log(i, this.logs[i], type)
                    if(this.logs[i].type === type) {
                        this.logs.splice(i, 1)
                        break
                    }
                }
            }
            this.logs.push({
                type: type,
                positive: positive,
                detail: detail
            })
        }
    }
})

interface log {
    type: number,
    positive: boolean,
    detail: string | null
}

/**
 * Details for logs
 * (0, true) => twitch chat connected
 * (0, false) => twitch chat disconnected
 * (1, true) => toonation connected
 * (1, false) => toonation disconnected
 * (2, true) => vote successful
 * (2, false) => vote failed
 */
