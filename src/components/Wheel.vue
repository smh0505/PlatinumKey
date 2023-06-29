<template>
    <div class="wheelContainer">
        <v-stage :config="{ width: 640, height: 640 }">
            <v-layer>
                <v-wedge v-for="(item, index) in options.options" :config="sectorConfig(index, item)"></v-wedge>
                <v-text v-for="(item, index) in options.options" :config="textConfig(index, item)"></v-text>
                <v-line :config="arrow"></v-line>
            </v-layer>
        </v-stage>
        <div v-if="showResult" class="resultScreen">
            <div class="label">다음 황금열쇠는</div>
            <div class="value iidx-title large"><span>{{ result }}</span></div>
        </div>
        <button @keydown.prevent v-show="showButton" class="wheelButton" @click="click">{{ buttonLabels[state] }}</button>
    </div>
</template>

<script lang="ts">
import { useWheelStore } from '../stores/WheelStore';
import { useItemStore } from '../stores/ItemStore'
import { useConnectStore } from '../stores/ConnectStore'
import { remainder } from '../scripts/Calculate';
import { DateTime } from 'luxon';
import * as LocalForage from 'localforage'

interface option {
    key: string,
    count: number,
    color: string
}

export default {
    props: {
        payload: String,
    },
    data() {
        return {
            // websocket
            connection: useConnectStore(),

            // wheel
            options: useWheelStore(),
            startAngle: 0,
            speed: 50,
            arrow: {
                points: [555, 320, 575, 330, 575, 310],
                fill: 'black',
                closed: true
            },

            // button
            states: {
                idle: 0,
                spinning: 1,
                stopping: 2,
                result: 3
            },
            state: 0,
            buttonLabels: ['돌리기', '멈추기', '', '다음'],

            // result
            inventory: useItemStore()
        }
    },
    computed: {
        result() {
            let output = ''
            let target = this.options.sum(this.options.options.length) - Math.floor(this.startAngle / this.options.unitAngle)
            for (let i = 0; i < this.options.options.length; i++) {
                if (target > this.options.sum(i)) {
                    output = this.options.options[i].key
                }
            }
            return output
        },
        showResult() {
            return this.state === this.states.result
        },
        showButton() {
            return this.state !== this.states.stopping && this.options.options.length > 0
        }
    },
    methods: {
        // properties
        sectorConfig(index: number, item: option) {
            return {
                x: 320,
                y: 320,
                radius: 240,
                angle: item.count * this.options.unitAngle,
                fill: item.color,
                stroke: 'black',
                rotation: this.startAngle + this.options.sum(index) * this.options.unitAngle
            }
        },
        textConfig(index: number, item: option) {
            return {
                text: item.key,
                fontSize: 16,
                fontStyle: 'bold',
                x: 320,
                y: 320,
                offsetX: -60,
                offsetY: 8,
                rotation: this.startAngle + this.options.sum(index) * this.options.unitAngle + item.count * this.options.unitAngle / 2
            }
        },

        // wheel functions
        rotate() {
            this.startAngle += this.speed
            if (this.startAngle >= 360) {
                this.startAngle -= 360
            }
        },
        spin() {
            switch (this.state) {
                case this.states.idle:
                    this.speed = 50
                    break
                case this.states.spinning:
                    this.rotate()
                    break
                case this.states.stopping:
                    this.rotate()
                    this.speed -= 1 / Math.PI
                    if (this.speed <= 0) {
                        this.state = this.states.result
                    }
            }
            window.requestAnimationFrame(this.spin)
        },
        click() {
            this.state = remainder(this.state + 1, 4)
            if (this.state === this.states.idle) {
                this.inventory.addItem(this.result)
                this.options.subOption(this.result)
                this.connection.roulette_temp.forEach(x => this.options.addOption(x))
                this.connection.roulette_temp.splice(0, this.connection.roulette_temp.length)
            }
        },

        // saving
        saveWheel() {
            if (this.options.options.length > 0) {
                const currentTime = DateTime.now()
                const newLog = 'wheel ' + currentTime.toISO()
                LocalForage.setItem(newLog, this.options.options.map(x => ({ key: x.key, count: x.count })))
            }
        }
    },
    mounted() {
        this.spin()
        this.connection.connectToonation(String(this.payload))
        window.addEventListener('beforeunload', this.saveWheel)
    }
}
</script>

<style lang="scss">
.wheelContainer {
    position: relative;
    height: 100%;

    overflow: hidden;

    > div:not([class]) {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
    }
}
.wheelButton {
    position: absolute;
    bottom: 0;
    left: 0;

    width: 140px;
    height: 40px;

    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 20px;
    transition: all 0.2s ease-out;

    &:hover {
        background-color: white;
        color: black;
    }
}

.resultScreen {
    display: flex;
    flex-direction: column;
    justify-content: center;

    gap: 1em;

    position: absolute;
    width: 100%;
    height: calc(100% - 48px);
    left: 0;
    top: 0;
    padding: 12px 16px;

    background-color: #000e;
    text-align: center;

    .label {
        font-size: 24px;
        color: white;
    }

    > .roulette-selected {
        flex-basis: 50%;
    }
}
</style>
