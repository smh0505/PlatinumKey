import { defineStore } from 'pinia'
import { remainder } from '../scripts/Calculate'

export const useWheelStore = defineStore('wheel', {
    state() {
        return {
            options: [] as goldenkey[]
        }
    },
    getters: {
        unitAngle(state) {
            return 360 / sum(state.options.length, state.options)
        }
    },
    actions: {
        fill(list: { key: string, count: number }[]) {
            for (let i = 0; i < list.length; i++){
                this.options.push({ key: list[i].key, count: list[i].count, color: colors[index] })
                index = remainder(index + 1, 15)
            }
        },
        sum(index: number) {
            return sum(index, this.options)
        },
        addOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            if (idx !== -1) {
                this.options[idx].count += 1
            } else {
                this.options.push({ key: name, count: 1, color: colors[index] })
                index = remainder(index + 1, 15)
            }
        },
        subOption(name: string) {
            const idx = this.options.findIndex(x => x.key === name)
            this.options[idx].count -= 1
            if (this.options[idx].count === 0) {
                this.options.splice(idx, 1)
            }
        }
    }
})

interface goldenkey {
    key: string,
    count: number,
    color: string
}

let index = 0
const colors = [
    "#ffc1ca",
    "#aefcc8",
    "#d7ffa0",
    "#f2a798",
    "#c3ea70",

    "#95f9ec",
    "#d4bdfc",
    "#ffc6fa",
    "#f4c89c",
    "#fc7bc4",

    "#72bde5",
    "#ed6a91",
    "#8cf7a5",
    "#f187ff",
    "#b381e8",
]

function sum(index: number, options: goldenkey[]) {
    let x = 0
    for (let i = 0; i < index; i++) {
        x += options[i].count
    }
    return x
}