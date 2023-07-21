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

            colorIndex: 0,
            wheel: [] as GoldenKey[]
        }
    },
    actions: {
        // preparation
        fill(list: GoldenKeyDefinition[]) {
            this.options = list.map((item, index) => ({ ...item, color: COLORS[index % COLORS.length] }))
            this.colorIndex = this.options.length
            this.generateWheel()
        },
        generateWheel() {
            const total = sum(null, this.options)

            this.wheel = []
            if (total > 0) {
                if (total < 19) {
                    for (let _ = 0; _ < Math.ceil(19 / total); _++)
                        this.options.forEach((x: GoldenKey) => this.wheel.push(x))
                } else {
                    this.options.forEach((x: GoldenKey) => this.wheel.push(x))
                    this.options.forEach((x: GoldenKey) => this.wheel.push(x))
                }
            }
        },

        sumOptions(index: number | null = null) {
            return sum(index, this.options)
        },
        sumWheel(index: number | null = null) {
            return sum(index, this.wheel)
        },
        addOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            if (idx !== -1) {
                this.options[idx].count += 1
            } else {
                this.options.push({ key: name, count: 1, color: COLORS[this.colorIndex++ % COLORS.length] })
            }
            this.generateWheel()
        },
        subOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            this.options[idx].count -= 1
            if (this.options[idx].count === 0) {
                this.options.splice(idx, 1)
            }
            this.generateWheel()
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

function sum(index: number | null, options: GoldenKey[]) {
    let sum = 0
    const counts = options.map((x: GoldenKey) => x.count).slice(0, index ?? options.length)
    counts.forEach((x: number) => sum += x)
    return sum
}
