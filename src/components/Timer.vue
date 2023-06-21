<template>
    <div class="clockFrame">
        <div class="laps">
            <button tabindex="-1" class="seekButton centered" @click="seekLaps(-1)">
                <span class="material-symbols-rounded">remove</span>
            </button>
            <span class="lapsCount" @wheel="seekLaps">
                {{ laps[lapsIdx] }}<small>바퀴째</small>
            </span>
            <button tabindex="-1" class="seekButton centered" @click="seekLaps(+1)">
                <span class="material-symbols-rounded">add</span>
            </button>
        </div>
        <div class="clockwise" @click="$emit('reverse')">
            <span class="material-symbols-rounded">{{ clockwise ? 'rotate_right' : 'rotate_left' }}</span>
            <span class="clockwiseLabel">{{ clockwise ? "시계" : "반시계" }}</span>
        </div>
        <div class="clock" :class="{ paused }" @click="startButton()">
            <button tabindex="-1" class="seekButton centered" @click.stop="subMin()">
                <span class="material-symbols-rounded">remove</span>
            </button>
            <span class="clockTime">
                {{ elapsed.toFormat('hh:mm:ss') }}
            </span>
            <button tabindex="-1" class="seekButton centered" @click.stop="addMin()">
                <span class="material-symbols-rounded">add</span>
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { remainder } from '../scripts/Calculate'
import { DateTime, Duration } from 'luxon'
import * as LocalForage from 'localforage'

export default {
    props: {
        clockwise: Boolean
    },
    data() {
        return {
            laps: ['1', '2', '3', 'B'],
            lapsIdx: 0,
            start: DateTime.now(),
            elapsed: Duration.fromMillis(0),
            paused: true,
            intervalId: 0
        }
    },
    computed: {
        isClockwise() {
            return this.clockwise ? {} : { transform: 'scale(-1, 1)' }
        }
    },
    methods: {
        seekLaps(direction: number): void {
            this.lapsIdx = remainder(this.lapsIdx + direction, 4)
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
        subMin(): void {
            this.elapsed = this.elapsed.minus({ minutes: 1 })
            this.start = this.start.plus({ minutes: 1 })
        },
        addMin(): void {
            this.elapsed = this.elapsed.plus({ minutes: 1 })
            this.start = this.start.minus({ minutes: 1 })
        }
    },
    mounted() {
        window.addEventListener('beforeunload', () => {
            LocalForage.setItem('timer-snapshot', JSON.parse(JSON.stringify({
                time: this.elapsed,
                clockwise: this.clockwise
            })))
        })
    }
}
</script>

<style lang="scss">
@mixin borderless {
    border: none;
    // border-radius: 8px;
}

.clockFrame {
    display: flex;
    height: 48px;
    margin: 6px;
    padding: 4px;
    gap: 4px;

    // decoration
    font-family: var(--font-numeric);
    font-variant-numeric: tabular-nums;
    font-size: 26px;
    line-height: 36px;

    user-select: none;

    background-color: #333d;
    color: #fff;
    @include borderless;

    > * {
        flex-grow: 1;
        text-align: center;
    }

    .laps, .clock {
        position: relative;
        display: flex;
        justify-content: space-around;
        text-align: center;

        .seekButton {
            position: absolute;
            height: 100%;
            left: 0;

            border: 0;
            opacity: 0;
            background: #fff6;
            transition: opacity 0.2s ease-out;

            &:active {
                background-color: #9df6;
            }
        }
        .seekButton ~ .seekButton {
            left: unset;
            right: 0;
        }
        &:hover > .seekButton {
            opacity: 1;
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

    .material-symbols-rounded {
        vertical-align: middle;
    }
}
</style>
