import { defineStore } from "pinia";
import { remainder } from "../scripts/Calculate";

export const useItemStore = defineStore('items', {
    state() {
        return {
            items: [] as item[],
            pageNum: 0
        }
    },
    getters: {
        maxPage(state) {
            return Math.ceil(state.items.length / ITEMS_PER_PAGE)
        },
        pageView(state) {
            // 5 items -or- 4 items + page indicators
            if(state.items.length <= (ITEMS_PER_PAGE + 1)) {
                return state.items
            } else {
                return state.items.slice(state.pageNum * ITEMS_PER_PAGE, (state.pageNum + 1) * ITEMS_PER_PAGE)
            }
        }
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
        removeAll(type: '턴' | '곡' | '개') {
            for (let i = this.items.length - 1; i > -1; i--) {
                if (this.items[i].type === type) {
                    this.subOne(i)
                }
            }
            this.setMaxPage()
        },
        addOne(index: number) {
            this.items[index].count += 1
        },
        subOne(index: number) {
            this.items[index].count -= 1
            if (this.items[index].count === 0) {
                this.items.splice(index, 1)
            }
            this.setMaxPage()
        },

        // pages
        prevPage() {
            this.pageNum = remainder(this.pageNum - 1, this.maxPage)
        },
        nextPage() {
            this.pageNum = remainder(this.pageNum + 1, this.maxPage)
        },
        setMaxPage() {
            if (this.pageNum > 0 && this.pageNum >= this.maxPage) {
                this.pageNum = this.maxPage - 1
            }
        }
    }
})

interface item{
    key: string,
    count: number,
    type: '턴' | '곡' | '개'
}

const regex = /\((?<count>\d+)(?<type>[턴곡개회번])\)/

export const ITEMS_PER_PAGE = 4

const ITEM_LABEL_MAPPING: { [key: string]: item["type"] } = {
    턴: '턴',
    곡: '곡',
    개: '개',
    회: '개',
    번: '개'
}
