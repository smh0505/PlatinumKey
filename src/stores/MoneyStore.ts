import { defineStore } from 'pinia';
import { useBoardStore } from './BoardStore'

const board = useBoardStore()

export const useMoneyStore = defineStore('currency', {
    state() {
        return {
            money: 0
        }
    },
    actions: {
        addMoney(index: number) {
            const theme = board.themes.find(x => x.theme === board.board[index])

            if (this.checkMonopoly(index)) this.money += 30
            else if (theme) {
                const score = [35, 25, 15]
                this.money += score[Math.min(score.length, theme.stepped)]
            }
            console.log(this.money)
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
                        const k = board.themes.find(x => x.theme === board.board[lines[i][j]])
                        if (k && k.stepped === 0) return false
                    }
                    return true
                }
            }
            return false
        }
    }
})