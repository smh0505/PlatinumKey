<template>
    <div class="laps-challenge">
        <div class="laps-challenge-header" :class="config">
            <p>이번 스테이지는...</p>
            <h3>{{ stages[board.laps] ?? stages.at(-1) }}</h3>
        </div>
        <div class="laps-challenge-content">
            <div class="laps-challenge-target">
                <b>{{ board.limit }}석</b>의 좌석을 채워 다음 무대로 향하자!
                <template v-if="board.money < board.limit">
                    <br />
                    <b>{{ board.limit - board.money }}명</b>만 더 모으면 성공!
                </template>
            </div>
            <div class="laps-challenge-random" :class="result">
                <b>{{ state === 0 ? '???' : target }}</b>명
            </div>
        </div>
        <div class="laps-challenge-buttons">
            <button @keydown.prevent @mousedown.left="click">{{ labels[state] }}</button>
        </div>
    </div>
</template>

<script lang="ts">
import { useBoardStore } from '../stores/BoardStore';
import { remainder } from '../scripts/Calculate';

export default {
    data() {
        return {
            board: useBoardStore(),
            stages: ['라이브 하우스', '부도칸', '도쿄 돔'],

            target: 0,

            state: 0,
            labels: ['도전', '멈추기', '다음'],
            timer: 0
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
        result() {
            return {
                win: this.state === 2 && this.target >= this.board.limit,
                lose: this.state === 2 && this.target < this.board.limit
            }
        }
    },
    methods: {
        randomize() {
            this.target = Math.floor(Math.random() * this.board.limit) + this.board.money
            this.timer = window.requestAnimationFrame(this.randomize)
        },
        click() {
            this.state = remainder(this.state + 1, 3)
            if (this.state === 0) {
                if (this.target >= this.board.limit) this.board.updateLimit()
                this.target = 0
            }
            if (this.state === 1) this.randomize()
            if (this.state === 2) window.cancelAnimationFrame(this.timer)
        }
    }
}
</script>

<style lang="scss">
@import '../styles/mixin';

.laps-challenge {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 2.5rem;
    gap: 8px;

    width: 100%;
    height: 100%;

    color: white;
    text-shadow: 0 0 0.5em #000;

    &-header {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;

        font-size: 1.5rem;
        font-family: 'Giants-Inline';

        padding: 0.5rem 1rem;

        > p, > h3 {
            margin: 0;
        }
        > h3 {
            font-size: 3rem;
        }

        &.livehouse {
            @include wallpaper('../assets/livehouse.png');
        }

        &.budokan {
            @include wallpaper('../assets/budokan.jpg');
        }

        &.tokyo-dome {
            @include wallpaper('../assets/tokyo-dome.jpg');
        }
    }
    &-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.8);
    }

    &-target {
        font-size: 1.75em;
        font-family: 'KBO-Dia-Gothic';
        margin-bottom: 2.5rem;
    }

    &-random {
        font-size: 2rem;
        font-family: 'KBO-Dia-Gothic';

        > b {
            font-size: 4rem;
        }

        &.win {
            color: rgb(55, 211, 41);
        }

        &.lose {
            color: rgb(255, 108, 108);
        }
    }

    .laps-challenge-buttons {
        display: flex;

        > button {
            width: 120px;
            height: 40px;

            font-size: 1.25rem;
            background-color: rgba(black, 0.8);
            color: white;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: white;
                color: black;
            }
        }
    }
}
</style>
