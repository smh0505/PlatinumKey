import { toRaw } from 'vue'
import { defineStore } from 'pinia'
import * as LocalForage from 'localforage'

import type { ParsedIRCMessage } from "./ConnectStore";
import type { ThemeDefinition } from './OptionsStore';

const STEP_PRIZES = [100, 200, 300]
const MONOPOLY_PRIZE = 500
const LIMITS = [5000, 10000, 20000]

const CORNERS = [0, 7, 13, 20]

export const useBoardStore = defineStore('board', {
    state() {
        return {
            // board
            started: false,
            clockwise: true,

            themes: [] as Theme[],
            themeColors: {} as { [key: ThemeDefinition["head"]]: string },
            board: [] as string[],
            initialBoard: [] as string[],
            goldenKeys: [2, 5, 9, 11, 15, 18, 22, 24],

            // raffle pools
            pool: [] as Vote[],
            islandPool: [] as Vote[],
            usedList: [] as Vote[],

            // money
            money: 0,
            limit: 5000,
            laps: 0,
            songs: 1,
            limitless: false,

            // dice
            isDouble: false,
            doubleCount: 0
        }
    },
    actions: {
        async begin(themes: ThemeDefinition[]) {
            if(this.started) return

            await this.setupThemes(themes)
            this.buildBoard()

            this.initialBoard = this.board
            this.started = true
        },
        async snapshot() {
            LocalForage.setItem('board-snapshot', toRaw(this.$state))
        },
        async restore() {
            const snapshot = await LocalForage.getItem('board-snapshot')
            if(!snapshot) return

            this.$patch(snapshot)
        },
        // generate
        async setupThemes(_themes: ThemeDefinition[]) {
            const themes = [..._themes]
            const colors = [...COLORS]

            while (this.themes.length < 14) {
                const index = Math.floor(Math.random() * themes.length)
                const theme = themes[index]

                if(!this.themeColors[theme.head]) {
                    this.themeColors[theme.head] = colors.splice(Math.floor(colors.length * Math.random()), 1)[0]
                }

                this.themes.push({ theme: theme.head + ':\n' + theme.tail, color: this.themeColors[theme.head], stepped: 0 })
                themes.splice(index, 1)
            }
        },
        buildBoard() {
            this.board = Array(26).fill('')
            this.board[0] = '출발'
            this.board[13] = '세계여행'
            this.goldenKeys.forEach(value => this.board[value] = '황금열쇠')

            // islands
            const islands = ['디맥섬', '투온섬', '식스타섬', '뱅섬', '프세카섬', '아르케아섬']

            const island1 = Math.floor(Math.random() * 6)
            this.board[7] = islands[island1]
            islands.splice(island1, 1)

            const island2 = Math.floor(Math.random() * 5)
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
        shuffleBoard(addKey: boolean = false) {
            if (addKey) {
                this.goldenKeys.push(-1)
            }
            const count = this.goldenKeys.length
            let newKeys = [] as number[]
            let board = [ ...Array(26).keys() ].filter(i => !CORNERS.includes(i))

            // initial key
            const k = this.clockwise
                ? board.length - Math.ceil(Math.random() * 5)
                : Math.floor(Math.random() * 6)
            newKeys.push(board[k])
            board.splice(k, 1)

            // other keys
            while (newKeys.length < count) {
                const k = Math.floor(Math.random() * board.length)
                newKeys.push(board[k])
                board.splice(k, 1)
            }

            this.goldenKeys = newKeys
            this.buildBoard()
        },
        unshuffleBoard() {
            this.board = this.initialBoard
            this.goldenKeys = [2, 5, 9, 11, 15, 18, 22, 24]
        },

        // return values
        isGoldenKey(index: number) {
            if (!this.started) {
                return false
            }
            return this.goldenKeys.includes(index)
        },
        getColor(theme: string) {
            const pair = this.themes.find(x => x.theme === theme)
            if (pair) return pair.color
            else return '#999'
        },
        isMonopoly(index: number) {
            if (!this.started) {
                return false
            }
            const lines = [
                [1, 2, 3, 4, 5, 6],
                [8, 9, 10, 11, 12],
                [14, 15, 16, 17, 18, 19],
                [21, 22, 23, 24, 25]
            ]

            for (let i = 0; i < 4; i++) {
                if (lines[i].includes(index)) {
                    const line = lines[i].filter(x => !this.goldenKeys.includes(x)).map(x => this.board[x])
                    const themes = this.themes.filter(x => line.includes(x.theme)).map(x => x.stepped)
                    return !themes.includes(0)
                }
            }
            return false
        },

        // add votes
        parse({ tags, content, source }: ParsedIRCMessage): { name: string, status: 'accepted' | 'cooldown' | 'rejected' | 'failed' } {
            const { groups: match } = content.match(/!픽 (?<index>\d+) (?<song>.+)/) ?? {}
            const name = tags.display_name ?? source.nick
            const uid = source.nick ?? source.full // i don't think this parse shall fail

            if (!match) return { name, status: 'failed' }

            const index = Number(match.index)
            const excluded = [0, 13].concat(this.goldenKeys)
            const map = [...Array(26).keys()].filter(x => !excluded.includes(x))

            if (map.includes(index)) {
                const status = this.insert(uid, name, Number(match.index), match.song)
                return { name, status }
            } else return { name, status: 'failed' }
        },
        insert(uid: string, name: string, index: number, song: string) {
            const newVote = {
                uid,
                name,
                theme: this.board[index],
                song,
                timestamp: Date.now()
            }
            const isIsland = [7, 20].includes(index)

            if (this.usedList.find(x => x.uid === newVote.uid)) return 'rejected'    // already picked
            if (!this.checkTime(uid, newVote.timestamp, isIsland)) return 'cooldown' // cooldown

            // accepted
            if (isIsland) {  // island
                const idx = this.islandPool.findIndex(x => x.uid === uid)
                if (idx !== -1) this.islandPool.splice(idx, 1)
                this.islandPool.push(newVote)
            } else {    // normal
                const group = this.pool.filter(x => x.uid === uid)
                if (group.length === 3) this.pool.splice(this.pool.indexOf(group[0]), 1)
                this.pool.push(newVote)
            }
            return 'accepted'
        },
        checkTime(uid: string, time: number, isIsland: boolean) {
            const group = isIsland
                ? this.islandPool.filter(x => x.uid === uid)
                : this.pool.filter(x => x.uid === uid)
            const last = group.at(-1)
            if (last) return (time - last.timestamp) > 30_000
            else return true
        },

        // manage votes
        selectAll(index: number) {
            return [7, 20].includes(index)
                ? this.islandPool.filter(x => x.theme === this.board[index])
                : this.pool.filter(x => x.theme === this.board[index])
        },
        remove(target: Vote) {
            this.usedList.push(target)
            this.pool = this.pool.filter(x => x.uid != target.uid)
            this.islandPool = this.islandPool.filter(x => x.uid != target.uid)
        },

        // control money
        addMoney(index: number) {
            const prize = this.getPrizeByIndex(index)
            if (prize) this.updateMoney(this.isDouble ? prize * 2 : prize)
            this.isDouble = false

            const theme = this.themes.find(x => x.theme === this.board[index])
            if (theme) theme.stepped += 1
        },
        getPrizeByIndex(index: number) {
            const theme = this.themes.find(x => x.theme === this.board[index])
            if (theme) {
                return this.isMonopoly(index)
                    ? MONOPOLY_PRIZE
                    : (STEP_PRIZES[theme.stepped] ?? STEP_PRIZES.at(-1))
            }
        },
        updateMoney(amount: number) {
            this.money += amount
        },
        updateLimit() {
            this.laps += 1
            this.limit = LIMITS[this.laps] ?? LIMITS.at(-1)
        },
        getSalary() {
            this.updateLimit()
            this.shuffleBoard()
        }
    }
})

// interfaces
interface Theme {
    theme: string,
    color: string,
    stepped: number
}
export interface Vote {
    uid: string,
    name: string,
    theme: string,
    song: string,
    timestamp: number
}

// constants
const COLORS = [
    '#ffbfce', '#f17ef7', '#7bb2f2', '#f9bdf2', '#7cf4b4',
    '#c3fc85', '#ddbffc', '#bdccfc', '#bcfc9f', '#f6fc8a',
    '#a5e7f7', '#fc888e', '#fcdbbf', '#f9b17a'
]
