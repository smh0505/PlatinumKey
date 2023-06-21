import { defineStore } from "pinia";
import { remainder } from "../scripts/Calculate";

export const ITEMS_PER_PAGE = 4

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
                if (idx !== -1) {
                    if (object.type !== itemType.limit) {
                        this.items[idx].count += object.count
                    }
                } else {
                    this.items.push(object)
                }
            }
        },
        checkType(name: string) {
            for (let i = 0; i < regex.length; i++){
                const match = name.match(regex[i])
                if (match) {
                    return {
                        key: String(match.groups?.option.trim()),
                        count: Number(match.groups?.count),
                        type: i
                    }
                }
            }
        },

        // controls
        removeAll(type: number) {
            for (let i = this.items.length - 1; i > -1; i--) {
                if (this.items[i].type === type) {
                    this.subOne(i)
                }
            }
            if (this.pageNum > 0 && this.pageNum >= this.maxPage) {
                this.pageNum = this.maxPage - 1
            }
        },
        addOne(index: number) {
            this.items[index].count += 1
        },
        subOne(index: number) {
            this.items[index].count -= 1
            if (this.items[index].count === 0) {
                this.items.splice(index, 1)
            }
            if (this.pageNum > 0 && this.pageNum >= this.maxPage) {
                this.pageNum = this.maxPage - 1
            }
        },

        // pages
        prevPage() {
            this.pageNum = remainder(this.pageNum - 1, this.maxPage)
        },
        nextPage() {
            this.pageNum = remainder(this.pageNum + 1, this.maxPage)
        }
    }
})

interface item{
    key: string,
    count: number,
    type: number
}

export const itemType = {
    dice: 0,
    song: 1,
    limit: 2
}

const regex = [
    /(?<count>\d+)턴간(?<option>.+)/,
    /(?<count>\d+)곡동안(?<option>.+)/,
    /(?<option>.+)\((?<count>\d+)회\)/
]
