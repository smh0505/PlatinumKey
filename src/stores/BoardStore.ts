import { defineStore } from "pinia";
import { DateTime } from "luxon";
import * as LocalForage from 'localforage'

import { parse } from "../scripts/IRC";

const STEP_PRIZES = [35, 25, 15]
const MONOPOLY_PRIZE = 30

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
            usedList: [] as { name: string, song: string }[],

            // money
            money: 0,
            limit: 1000,
            laps: 1,
            limitless: false
        }
    },
    actions: {
        // generate
        async setupThemes() {
            const themes = await LocalForage.getItem('themes') as { head: string, tail: string }[]

            while (this.themes.length < 14) {
                const i = this.themes.length
                const j = Math.floor(Math.random() * themes.length)

                this.themes.push({ theme: themes[j].head + ':\n' + themes[j].tail, color: colors[i], stepped: 0 })
                themes.splice(j, 1)
            }
        },
        buildBoard() {
            this.board = Array(26).fill('')
            this.board[0] = '출발'
            this.board[13] = '뱅하싶'
            this.goldenKeys.forEach(value => this.board[value] = '황금열쇠')

            // islands
            const islands = ['디맥섬', '투온섬', '식스타섬', '뱅섬', '프세카섬']

            const island1 = Math.floor(Math.random() * 5)
            this.board[7] = islands[island1]
            islands.splice(island1, 1)

            const island2 = Math.floor(Math.random() * 4)
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
        checkMonopoly(index: number) {
            const lines = [
                [1, 2, 3, 4, 5, 6],
                [8, 9, 10, 11, 12],
                [14, 15, 16, 17, 18, 19],
                [21, 22, 23, 24, 25]
            ]

            for (let i = 0; i < 4; i++) {
                if (lines[i].includes(index)) {
                    for (let j = 0; j < lines[i].length; j++) {
                        const k = this.themes.find(x => x.theme === this.board[lines[i][j]])
                        if (k && k.stepped === 0) return false
                    }
                    return true
                }
            }
            return false
        },

        // add votes
        parse(msg: string): { name: string, status: 'accepted' | 'cooldown' | 'rejected' | 'failed' } {
            const parsedMsg = parse(msg)
            const match = parsedMsg.text.match(/!픽 (?<index>\d+) (?<song>.+)/)
            if (match) {
                const index = Number(match.groups?.index)
                const excluded = [0, 13].concat(this.goldenKeys)
                const map = [...Array(26).keys()].filter(x => !excluded.includes(x))
                if (map.includes(index)) {
                    return {
                        name: parsedMsg.name,
                        status: this.insert(parsedMsg.name, Number(match.groups?.index), String(match.groups?.song))
                    }
                } else {
                    return {
                        name: parsedMsg.name,
                        status: 'rejected'
                    }
                }
            } else {
                return {
                    name: parsedMsg.name,
                    status: 'failed'
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

            // already picked
            if (this.usedList.find(x => x.name === newVote.name)) return 'rejected'

            if ([7, 20].includes(index)) {  // island
                // cooldown
                if (!this.checkTimeIsland(name, newVote.timestamp)) return 'cooldown'

                // accepted
                const idx = this.islandPool.findIndex(x => x.name === name)
                if (idx !== -1) this.islandPool.splice(idx, 1)
                this.islandPool.push(newVote)
                return 'accepted'
            } else {    // normal
                // cooldown
                if (!this.checkTime(name, newVote.timestamp)) return 'cooldown'

                // accepted
                const group = this.pool.filter(x => x.name === name)
                if (group.length === 3) this.pool.splice(this.pool.indexOf(group[0]), 1)
                this.pool.push(newVote)
                return 'accepted'
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
        },

        // control money
        addMoney(index: number) {
            const theme = this.themes.find(x => x.theme === this.board[index])

            if (this.checkMonopoly(index))
                this.money += MONOPOLY_PRIZE
            else if (theme)
                this.money += STEP_PRIZES[theme.stepped++] ?? STEP_PRIZES.at(-1)
        },
        getPrizeByIndex(index: number) {
            const theme = this.themes.find(x => x.theme === this.board[index])
            if(!theme)
                return
            else if (this.checkMonopoly(index))
                return MONOPOLY_PRIZE
            else
                return STEP_PRIZES[theme.stepped] ?? STEP_PRIZES.at(-1)
        },
        updateMoney(amount: number) {
            this.money += amount
        }
    }
})

// interfaces
interface theme {
    theme: string,
    color: string,
    stepped: number
}
export interface vote {
    name: string,
    theme: string,
    song: string,
    timestamp: DateTime
}

// constants
const colors = [
    '#ffbfce', '#f17ef7', '#7bb2f2', '#f9bdf2', '#7cf4b4',
    '#c3fc85', '#ddbffc', '#bdccfc', '#bcfc9f', '#f6fc8a',
    '#a5e7f7', '#fc888e', '#fcdbbf', '#f9b17a'
]
