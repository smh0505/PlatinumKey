import { defineStore } from "pinia";
import { DateTime } from "luxon";
import * as LocalForage from 'localforage'

import { parse } from "../scripts/IRC";

export const useBoardStore = defineStore('board', {
    state() {
        return {
            // board
            themes: [] as theme[],
            board: [] as string[],
            goldenKeys: [2, 5, 9, 11, 15, 18, 22, 24],

            // raffle pools
            pool: [] as vote[],
            islandPool: [] as vote[],
            usedList: [] as { name: string, song: string }[]
        }
    },
    actions: {
        // generate
        async setupThemes() {
            const themes = await LocalForage.getItem('themes') as { head: string, tail: string }[]

            while (this.themes.length < 14) {
                const i = this.themes.length
                const j = Math.floor(Math.random() * themes.length)
                const theme = themes[j].head + ':\n' + themes[j].tail
                const color = colors[i]

                if (!this.themes.map(x => x.theme).includes(theme)) {
                    this.themes.push({ theme: theme, color: color })
                }
            }
        },
        buildBoard() {
            this.board = Array(26).fill('')
            this.board[0] = '출발'
            this.board[13] = '뱅하싶'
            this.goldenKeys.forEach(value => this.board[value] = '황금열쇠')

            // islands
            const island1 = Math.floor(Math.random() * 5)
            this.board[7] = islands[island1]

            let island2 = Math.floor(Math.random() * 5)
            while (island2 === island1) {
                island2 = Math.floor(Math.random() * 5)
            }
            this.board[20] = islands[island2]

            // other blocks
            const themes = this.shuffleThemes()
            for (let i = 0, j = 0; i < this.board.length && j < themes.length; i++) {
                if (this.board[i] === '') {
                    this.board[i] = themes[j++]
                }
            }
        },

        // modify
        shuffleThemes() {
            let themes = this.themes.map(x => x.theme)

            for (let i = themes.length - 1; i > 0; i--){
                const j = Math.floor(Math.random() * i)
                const x = themes[i]
                themes[i] = themes[j]
                themes[j] = x
            }

            return themes
        },
        shuffleBoard(clockwise: boolean) {
            const count = this.goldenKeys.length
            let newKeys = [] as number[]
            let board = [
                1, 2, 3, 4, 5, 6,
                8, 9, 10, 11, 12,
                14, 15, 16, 17, 18, 19,
                21, 22, 23, 24, 25
            ]

            // initial key
            if (clockwise) {
                const k = Math.floor(Math.random() * 5)
                newKeys.push(board.slice(-5)[k])
                board.splice(k + 17, 1)
            } else {
                const k = Math.floor(Math.random() * 6)
                newKeys.push(board.slice(0, 6)[k])
                board.splice(k, 1)
            }

            // other keys
            while (newKeys.length < count) {
                const k = Math.floor(Math.random() * board.length)
                newKeys.push(board[k])
                board.splice(k, 1)
            }

            this.goldenKeys = newKeys
        },

        // return values
        isGoldenKey(index: number) {
            return this.goldenKeys.includes(index)
        },
        getColor(theme: string) {
            const pair = this.themes.find(x => x.theme === theme)
            if (pair) return pair.color
            else return "white"
        },

        // add votes
        parse(msg: string) {
            const parsedMsg = parse(msg)
            const match = parsedMsg.text.match(/!픽 (?<index>\d+) (?<song>.+)/)
            if (match) {
                const index = Number(match.groups?.index)
                const map = [...Array(26).keys()]
                    .filter(x => !this.goldenKeys.includes(x))
                    .filter(x => ![7, 20].includes(x))
                if (map.includes(index))
                {
                    return {
                        name: parsedMsg.name,
                        result: this.insert(parsedMsg.name, Number(match.groups?.index), String(match.groups?.song))
                    }
                } else {
                    return {
                        name: parsedMsg.name,
                        result: false
                    }
                }
            } else {
                return {
                    name: parsedMsg.name,
                    result: false
                }
            }
        },
        insert(name: string, index: number, song: string) {
            const newVote = {
                name: name,
                theme: this.board[index],
                song: song,
                timestamp: DateTime.now()
            }

            if ([7, 20].includes(index)) {
                if (this.checkTimeIsland(name, newVote.timestamp)) {
                    const idx = this.islandPool.findIndex(x => x.name === name)
                    if (idx !== -1) {
                        this.islandPool.splice(idx, 1)
                    }
                    this.islandPool.push(newVote)
                    return true
                } else return false
            } else {
                if (this.checkTime(name, newVote.timestamp)) {
                    const group = this.pool.filter(x => x.name === name)
                    if (group.length === 3) {
                        const idx = this.pool.indexOf(group[0])
                        this.pool.splice(idx, 1)
                    }
                    this.pool.push(newVote)
                    return true
                } else return false
            }
        },
        checkTime(name: string, time: DateTime) {
            const group = this.pool.filter(x => x.name === name)
            if (group.length > 0) {
                const last = group.slice(-1)[0]
                return time.diff(last.timestamp).as('seconds') > 30
            } else return true
        },
        checkTimeIsland(name: string, time: DateTime) {
            const last = this.islandPool.find(x => x.name === name)
            if (last) {
                return time.diff(last.timestamp).as('seconds') > 30
            } else return true
        },

        // manage votes
        selectAll(index: number) {
            if ([7, 20].includes(index)) {
                return this.islandPool.filter(x => x.theme === this.board[index])
            } else {
                return this.pool.filter(x => x.theme === this.board[index])
            }
        },
        remove(target: vote) {
            this.usedList.push({ name: target.name, song: target.song })
            this.pool.filter(x => x.name === target.name).forEach(x => {
                this.pool.splice(this.pool.indexOf(x), 1)
            })
            this.islandPool.filter(x => x.name === target.name).forEach(x => {
                this.islandPool.splice(this.islandPool.indexOf(x), 1)
            })
        }
    }
})

// interfaces
interface theme {
    theme: string,
    color: string
}
export interface vote {
    name: string,
    theme: string,
    song: string,
    timestamp: DateTime
}

// constants
const islands = ['디맥섬', '투온섬', '식스타섬', '뱅섬', '프세카섬']
const colors = [
    '#ffbfce', '#f17ef7', '#7bb2f2', '#f9bdf2', '#7cf4b4',
    '#c3fc85', '#ddbffc', '#bdccfc', '#bcfc9f', '#f6fc8a',
    '#a5e7f7', '#fc888e', '#fcdbbf', '#f9b17a'
]