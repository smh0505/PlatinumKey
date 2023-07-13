<template>
    <div class="clockFrame">
        <div class="laps">
            <button @keydown.prevent class="seekButton centered" @click="seekSongs(-1)">
                <span class="material-icons-outlined">remove</span>
            </button>
            <span class="lapsCount" @click="board.clockwise = !board.clockwise">
                <span class="material-icons-outlined" v-if="!board.clockwise">undo</span>
                <mark>{{ board.songs }}<small>{{ ordinalSuffix(board.songs) }}</small></mark><small> ROUND</small>
            </span>
            <button @keydown.prevent class="seekButton centered" @click="seekSongs(+1)">
                <span class="material-icons-outlined">add</span>
            </button>
        </div>
        <div class="money">
            <button @keydown.prevent class="seekButton centered" @click="e => seekMoney(e, -1)">
                <span class="material-icons-outlined">remove</span>
            </button>
            <span class="moneyAmount">
                {{ board.money }}<small>$ vs {{ board.limit }}<template v-if="board.limitless">+</template></small>
            </span>
            <button @keydown.prevent class="seekButton centered" @click="e => seekMoney(e, +1)">
                <span class="material-icons-outlined">add</span>
            </button>
            <div class="seekHint">
                CTRL … ×10
                <br />
                SHIFT … ×100
            </div>
        </div>
        <!-- <div class="clockwise" @click="$emit('reverse')">
        </div> -->
        <div class="clock" :class="{ paused }" @click="startButton()">
            <button @keydown.prevent class="seekButton centered" @click.stop="e => seekMin(e, -1)">
                <span class="material-icons-outlined">remove</span>
            </button>
            <span class="clockTime">
                {{ elapsed.toFormat('hh:mm:ss') }}
            </span>
            <button @keydown.prevent class="seekButton centered" @click.stop="e => seekMin(e, +1)">
                <span class="material-icons-outlined">add</span>
            </button>
            <div class="seekHint">
                CTRL … × 10m
                <br />
                SHIFT … × 1h
            </div>
        </div>
    </div>
    <div class="notice" @click="updateNotice" v-if="message">
        <Marquee :text="message" />
    </div>
    <div class="notice-button" @click="updateNotice" v-else>
        <span class="material-icons-outlined">edit</span>
    </div>
</template>

<script lang="ts">
import { useBoardStore } from '../stores/BoardStore';
import { DateTime, Duration } from 'luxon'
import * as LocalForage from 'localforage'
import Marquee from './Marquee.vue'

export default {
    components: {
        Marquee,
    },
    data() {
        return {
            start: DateTime.now(),
            elapsed: Duration.fromMillis(0),
            paused: true,
            intervalId: 0,
            board: useBoardStore(),
            message: '열심히 했기 때문에 그만큼 보답을 받은게 아닐까 생각합니다. 감사합니다.'
        }
    },
    computed: {
        isClockwise() {
            return this.board.clockwise ? {} : { transform: 'scale(-1, 1)' }
        }
    },
    methods: {
        seekSongs(direction: number): void {
            this.board.songs += direction
        },
        seekMoney(e: MouseEvent, direction: number) {
            let amount = direction

            if (e.ctrlKey || e.metaKey)
                amount *= 10
            if (e.shiftKey)
                amount *= 100

            this.board.updateMoney(amount)
        },
        seekMin(e: MouseEvent, direction: number) {
            const time = { minutes: 1 }

            if (e.ctrlKey || e.metaKey)
                time.minutes = 10
            if (e.shiftKey)
                time.minutes = 60

            if(direction > 0) {
                this.elapsed = this.elapsed.plus(time)
                this.start = this.start.minus(time)
            } else {
                this.elapsed = this.elapsed.minus(time)
                this.start = this.start.plus(time)
            }
        },
        startButton(): void {
            if (this.paused) {
                this.paused = false
                this.start = DateTime.now().minus(this.elapsed)
                this.intervalId = window.setInterval(() => {
                    this.elapsed = DateTime.now().diff(this.start)
                }, 1000)
            } else {
                this.paused = true
                this.elapsed = DateTime.now().diff(this.start)
                window.clearInterval(this.intervalId)
            }
        },
        ordinalSuffix(number: number) {
            const _ = number % 10
            const __ = number % 100
            if (_ === 1 && __ !== 11) {
                return 'ST'
            } else if  (_ === 2 && __ !== 12) {
                return 'ND'
            } else if  (_ === 3 && __ !== 13) {
                return 'RD'
            } else {
                return 'TH'
            }
        },
        updateNotice() {
            const message = prompt('메시지를 입력해주세요.')
            this.message = message == null? this.message : message
        }
    },
    mounted() {
        window.addEventListener('beforeunload', () => {
            LocalForage.setItem('timer-snapshot', JSON.parse(JSON.stringify({
                time: this.elapsed,
                clockwise: this.board.clockwise
            })))
        })
    }
}
</script>

<style lang="scss">

@import '../styles/mixin';

@mixin borderless {
    border: none;
    // border-radius: 8px;
}
.clockFrame, .notice {
    display: flex;
    margin: 0 0 6px 0;
    padding: 4px;
    gap: 4px;

    background-color: #222e;
    color: #fff;
    // text-shadow: 0 0 0.25em #000, 0 0 0.5em #000;
    @include borderless;
}

.clockFrame {
    // decoration
    font-family: var(--font-numeric);
    // font-variant-numeric: tabular-nums;
    font-weight: 300;
    letter-spacing: 0.05ex;

    font-size: 1.625rem;
    line-height: 2.5rem;

    user-select: none;

    > * {
        flex-grow: 1;
        text-align: center;
    }

    .laps, .money, .clock {
        position: relative;
        display: flex;
        justify-content: space-around;
        text-align: center;

        mark {
            background: none;
            color: #fce;
        }

        .seekButton {
            position: absolute;
            height: 100%;
            left: 0;

            border: 0;
            background: #000c;

            &:active {
                background-color: #9df6;
            }
        }
        .seekButton ~ .seekButton {
            left: unset;
            right: 0;
        }
        .seekButton, .seekHint {
            transition: opacity 0.2s ease-out;
            opacity: 0;
        }
        &:hover > .seekButton, &:hover > .seekHint {
            opacity: 1;
        }

        .seekHint {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            left: 0;
            margin: auto;
            padding: 0.5em;

            font-size: 0.666em;
            font-weight: 400;

            line-height: 24px;
            background: #222d;
            color: #fff;
            opacity: 0;

            white-space: nowrap;
            word-break: keep-all;
            pointer-events: none;
            z-index: 5;

            > kbd {
                display: inline-block;
                font: inherit;
                padding: 0 0.2em;
            }
        }
    }

    .clockwise {
        // decoration
        @include borderless;
        background: none;
        color: inherit;
        font: inherit;

        .clockwiseLabel {
            margin-left: 8px;
        }
    }

    .clock {
        transition: background 0.2s ease-out;
        background: none;

        &.paused {
            background-color: rgba(255, 0, 0, 0.5);
        }
    }

    .material-icons-outlined {
        vertical-align: middle;
    }
}
.notice {
    font-size: 1.25rem;
    white-space: nowrap;
    word-break: keep-all;
    text-align: center;
    text-indent: 40px;
    overflow: hidden;

    user-select: none;

    .marquee > div {
        flex-grow: 1;
    }
}
.notice-button {
    @include hidden-button;
}
</style>
