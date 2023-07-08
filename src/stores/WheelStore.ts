import { defineStore } from 'pinia'
import LocalForage from 'localforage'
import { DateTime } from 'luxon'

const currentTime = () => DateTime.now().toISO()

export const useWheelStore = defineStore('wheel', {
    state() {
        return {
            currentKey: currentTime() as string,
            options: [] as GoldenKey[],
            history: {} as { [key: string]: GoldenKeyDefinition[] },

            colorIndex: 0
        }
    },
    getters: {
        unitAngle(state) {
            return 360 / sum(state.options.length, state.options)
        }
    },
    actions: {
        fill(list: GoldenKeyDefinition[]) {
            this.options = list.map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }))
            this.colorIndex = this.options.length
        },
        sum(index: number) {
            return sum(index, this.options)
        },
        addOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            if (idx !== -1) {
                this.options[idx].count += 1
            } else {
                this.options.push({ key: name, count: 1, color: COLORS[this.colorIndex++ % COLORS.length] })
            }
        },
        subOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            this.options[idx].count -= 1
            if (this.options[idx].count === 0) {
                this.options.splice(idx, 1)
            }
        },
        async loadHistory() {
            const history = (await LocalForage.getItem('wheels') || {}) as typeof this.history

            const oldKeys = (await LocalForage.keys()).filter(key => key?.startsWith('wheel '))

            for (const key of oldKeys) {
                const ts = key.slice(6)
                const items = await LocalForage.getItem(key) as GoldenKeyDefinition[]

                history[ts] = items
                console.log(ts, history[ts])

                await LocalForage.setItem('_' + key, await LocalForage.getItem(key))
                LocalForage.removeItem(key)
            }
            console.log(oldKeys)
            if (oldKeys.length) {
                await LocalForage.setItem('wheels', history)
            }

            this.$patch({ history })
        },
        deleteHistory(key: string) {
            delete this.history[key]
            return this.save()
        },
        load(key: string) {
            if (!this.history[key]) {
                return
            }

            // don't overwrite for now
            // this.currentKey = key
            this.fill(this.history[key])
        },
        async save() {
            await LocalForage.setItem(this.currentKey, JSON.parse(JSON.stringify((this.options))))
            await LocalForage.setItem('wheels', JSON.parse(JSON.stringify((this.history))))
        }
    }
})

export type GoldenKeyDefinition = {
    key: string,
    count: number
}

export type GoldenKey = GoldenKeyDefinition & {
    color: string
}

const COLORS = [
    "#ffc1ca", "#aefcc8", "#d7ffa0", "#f2a798", "#c3ea70",
    "#95f9ec", "#d4bdfc", "#ffc6fa", "#f4c89c", "#fc7bc4",
    "#72bde5", "#ed6a91", "#8cf7a5", "#f187ff", "#b381e8"
]

function sum(index: number, options: GoldenKey[]) {
    let x = 0
    for (let i = 0; i < index; i++) {
        x += options[i].count
    }
    return x
}
