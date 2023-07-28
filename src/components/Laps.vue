<template>
    <div class="lapsContainer">
        <div class="lapsBackground" :class="config">
            <div class="lapsHeader">이번 스테이지는...</div>
            <div class="lapsStage">{{ stages[board.laps] ?? stages.at(-1) }}</div>
            <div class="lapsFooter">{{ alert }}</div>
            <div class="lapsRandom" :class="result">{{ state === 0 ? '???' : target }}</div>
        </div>
        <button class="lapsButton" @keydown.prevent @mousedown.left="click">{{ labels[state] }}</button>
    </div>
</template>

<script lang="ts">
import { useBoardStore } from '../stores/BoardStore';
import { remainder } from '../scripts/Calculate';

let temp: number

export default {
    data() {
        return {
            board: useBoardStore(),
            stages: ['라이브 하우스', '일본 무도관', '도쿄 돔'],

            target: 0,

            state: 0,
            labels: ['도전', '멈추기', '다음']
        }
    },
    computed: {
        config() {
            return {
                livehouse: this.board.laps === 0,
                budokan: this.board.laps === 1,
                'tokyo-dome': this.board.laps >= 2
            }
        },
        alert() {
            if (this.board.money >= this.board.limit)
                return `${this.board.limit}명을 채워 통과!`
            else return `${this.board.limit - this.board.money}명 이상 모으면 성공!`
        },
        result() {
            return {
                win: this.state === 2 && this.target >= this.board.limit - this.board.money,
                lose: this.state === 2 && this.target < this.board.limit - this.board.money
            }
        }
    },
    methods: {
        randomize() {
            this.target = Math.floor(Math.random() * this.board.limit)
            temp = window.requestAnimationFrame(this.randomize)
        },
        click() {
            this.state = remainder(this.state + 1, 3)
            if (this.state === 0) {
                if (this.target >= this.board.limit - this.board.money) this.board.updateLimit()
                else this.board.updateMoney(100)
                this.target = 0
            }
            if (this.state === 1) this.randomize()
            if (this.state === 2) window.cancelAnimationFrame(temp)
        }
    }
}
</script>

<style lang="scss">
@mixin wallpaper {
    background-position: center;
    background-size: cover;
    background-clip: border-box;
}

.lapsContainer {
    .lapsBackground {
        display: flex;
        position: relative;

        width: 100%;
        height: 350px;

        &.livehouse {
            background-image: url('../assets/livehouse.png');
            @include wallpaper;
        }

        &.budokan {
            background-image: url('../assets/budokan.jpg');
            @include wallpaper;
        }

        &.tokyo-dome {
            background-image: url('../assets/tokyo-dome.jpg');
            @include wallpaper;
        }

        .lapsHeader {
            position: absolute;
            top: 8px;
            left: 12px;

            color: white;
            font: 20pt 'Giants-Inline', sans-serif;
            text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;
        }

        .lapsStage {
            position: absolute;
            top: 40px;
            left: 12px;

            color: white;
            font: 36pt 'Giants-Inline', sans-serif;
            text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;
        }

        .lapsFooter {
            position: absolute;
            bottom: 8px;
            left: 8px;

            color: white;
            font: 20pt 'KBO-Dia-Gothic_bold', sans-serif;
            text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;
        }

        .lapsRandom {
            position: absolute;
            bottom: 8px;
            right: 16px;

            color: white;
            font: 44pt 'KBO-Dia-Gothic_bold', sans-serif;
            text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;

            &.win {
                color: rgb(55, 211, 41);
            }

            &.lose {
                color: rgb(216, 20, 20);
            }
        }
    }
    
    .lapsButton {
        position: absolute;
        bottom: 8px;

        width: 120px;
        height: 40px;

        font-size: 20pt;
        background-color: rgba(black, 0.8);
        color: white;
        transition: all 0.2s ease-out;

        &:hover {
            background-color: white;
            color: black;
        }
    }
}
</style>
