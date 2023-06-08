<template>
    <div class="clockFrame">
        <div class="laps">
            <button class="lapsButton centered" @click="lapsIdx = previous">
                <span class="material-symbols-rounded">arrow_back</span>
            </button>
            <span class="lapsCount centered">{{ laps[lapsIdx] }}</span>
            <button class="lapsButton centered" @click="lapsIdx = next">
                <span class="material-symbols-rounded">arrow_forward</span>
            </button>
        </div>
        <button class="clockwise" @click="$emit('reverse')">
            <span class="material-symbols-rounded" :style="isClockwise">cycle</span>
            <div class="clockwiseLabel">{{ clockwise ? "시계" : "반시계" }}</div>
        </button>
        <div class="clock">
            <button class="clockButton centered" @click="subMin()">
                <span class="material-symbols-rounded">remove</span>
            </button>
            <button class="clockFace centered" :class="{ red: paused, blue: !paused }" @click="startButton()">
                {{ elapsed.toFormat('hh:mm:ss') }}
            </button>
            <button class="clockButton centered" @click="addMin()">
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
        previous() {
            return remainder(this.lapsIdx - 1, 4)
        },
        next() {
            return remainder(this.lapsIdx + 1, 4)
        },
        isClockwise() {
            return this.clockwise ? {} : { transform: 'scale(-1, 1)' }
        }
    },
    methods: {
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
    border-radius: 8px;
}

.clockFrame {
    display: grid;
    height: 48px;
    margin: 6px;
    padding: 4px;
    gap: 4px;

    // grid
    grid-template-columns: repeat(4, 1fr);

    // decoration
    background-color: white;
    @include borderless;

    .laps {
        display: grid;
        grid-template-columns: repeat(3, 1fr);

        .lapsButton {
            @include borderless;
            background-color: rgba(255, 165, 0, 0.5);
            transition: all 0.1s ease-out;

            &:hover {
                background-color: orange;
            }
        }

        .lapsCount {
            font-size: 24px;
        }
    }

    .clockwise {
        display: flex;
        position: relative;
        align-items: center;

        // decoration
        @include borderless;
        background-color: rgba(0, 255, 0, 0.5);
        transition: all 0.1s ease-out;

        &:hover {
            background-color: rgb(0, 200, 0);
        }

        .clockwiseLabel {
            position: absolute;
            font-size: 24px;
            right: 4px;
        }
    }

    .clock {
        grid-column: 3 / 5;
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 4px;

        .clockButton {
            @include borderless;
            background-color: rgba(150, 216, 241, 0.5);
            transition: all 0.1s ease-out;

            &:hover {
                background-color: rgb(150, 216, 241);
            }
        }

        .clockFace {
            @include borderless;
            grid-column: 2 / 5;
            font-size: 24px;
        }

        .red {
            background-color: rgba(255, 0, 0, 0.5);
            transition: all 0.1s ease-out;

            &:hover {
                background-color: red;
            }
        }

        .blue {
            background-color: rgba(0, 162, 255, 0.5);
            transition: all 0.1s ease-out;

            &:hover {
                background-color: rgb(0, 162, 255);
            }
        }
    }
}
</style>