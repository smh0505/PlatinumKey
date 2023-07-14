import { defineStore } from "pinia";

export const useItemStore = defineStore('items', {
    state() {
        return {
            items: [] as item[],
            pageNum: 0
        }
    },
    getters: {
    },
    actions: {
        // insertion
        addItem(name: string) {
            const object = this.checkType(name)
            if (object) {
                const idx = this.items.findIndex(x => x.key === object.key)
                if (idx !== -1) this.items[idx].count += object.count
                else this.items.push(object)
            }
        },
        checkType(name: string) {
            const match = name.match(regex)
            if(!match) return

            const option = name.replace(regex, '').trim()
            return {
                key: option,
                count: Number(match.groups?.count),
                type: ITEM_LABEL_MAPPING[match.groups?.type!]
            }
        },

        // controls
        addOne(index: number) {
            this.items[index].count += 1
        },
        subOne(index: number) {
            this.items[index].count -= 1
            if (this.items[index].count === 0) {
                this.items.splice(index, 1)
            }
        },
        subAll() {
            for (let i = this.items.length - 1; i > -1; i--) {
                if (this.items[i].type === '곡') this.subOne(i)
            }
        }
    }
})

interface item{
    key: string,
    count: number,
    type: '곡' | '개'
}

const regex = /\((?<count>\d+)(?<type>[턴곡개회번])\)/

const ITEM_LABEL_MAPPING: { [key: string]: item["type"] } = {
    턴: '곡',
    곡: '곡',
    개: '개',
    회: '개',
    번: '개'
}
