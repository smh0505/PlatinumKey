<template>
    <div class="wheelContainer">
        <v-stage :config="{ width: 340, height: 300 }">
            <v-layer ref="layer">
                <v-group ref="group">
                    <v-rect v-for="(item, index) in wheel.wheel" :config="sectorConfig(index, item)"></v-rect>
                    <v-text v-for="(item, index) in wheel.wheel" :config="textConfig(index, item)"></v-text>
                </v-group>
                <v-line :config="arrowOne"></v-line>
                <v-line :config="arrowTwo"></v-line>
                <v-rect :config="outline"></v-rect>
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
import type { GoldenKey } from '../stores/WheelStore';
import Konva from 'konva';

let anim: any
let group: any
let layer: any
const states = {
    idle: 0,
    spinning: 1,
    stopping: 2,
    result: 3
}

export default {
    data() {
        return {
            // websocket
            connection: useConnectStore(),

            // wheel
            wheel: useWheelStore(),
            yPos: 0,
            speed: 50,
            arrowOne: {
                points: [310, 150, 330, 160, 330, 140],
                fill: 'black',
                closed: true
            },
            arrowTwo: {
                points: [10, 140, 10, 160, 30, 150],
                fill: 'black',
                closed: true
            },
            outline: {
                x: 0,
                y: 0,
                width: 340,
                height: 300,
                stroke: 'black',
                strokeWidth: 8
            },

            // button
            state: 0,
            buttonLabels: ['돌리기', '멈추기', '', '다음'],

            // result
            inventory: useItemStore()
        }
    },
    computed: {
        result() {
            const target = Math.floor((this.yPos + 150) / 32) % this.wheel.sumOptions()
            let output = 0
            for (let i = 0; i < this.wheel.options.length; i++) {
                if (target >= this.wheel.sumOptions(i)) output += 1
            }
            return this.wheel.options[output - 1].key
        },
        showResult() {
            return this.state === states.result
        },
        showButton() {
            return this.state !== states.stopping && this.wheel.options.length > 0
        }
    },
    methods: {
        // properties
        sectorConfig(index: number, item: GoldenKey) {
            return {
                x: 20,
                y: 32 * this.wheel.sumWheel(index),
                width: 300,
                height: 32 * item.count,
                fill: item.color,
                stroke: 'black',
            }
        },
        textConfig(index: number, item: GoldenKey) {
            return {
                x: 20,
                y: 32 * this.wheel.sumWheel(index),
                width: 300,
                height: 32 * item.count,
                text: item.key,
                fontSize: 20,
                fontStyle: 'bold',
                align: 'center',
                verticalAlign: 'middle'
            }
        },

        // wheel functions
        spin() {
            anim = new Konva.Animation(_ => {
                this.yPos += this.state === states.idle ? 1 : this.speed
                if (this.yPos > this.wheel.sumOptions() * 32) this.yPos = 0
                if (this.state === 2) this.speed -= 1 / Math.PI
                if (this.speed < 0) {
                    this.state = 3
                    this.speed = 0
                }
                group.y(this.yPos * -1)
            }, layer)
        },
        click() {
            this.state = remainder(this.state + 1, 4)
            if (this.state === states.idle) {
                this.inventory.addItem(this.result)
                this.wheel.subOption(this.result)
                this.connection.roulette_idle = true;
                this.connection.roulette_temp.forEach(x => this.wheel.addOption(x))
                this.connection.roulette_temp.splice(0, this.connection.roulette_temp.length)
                this.speed = Math.floor(Math.random() * 21) + 40 
            } else {
                this.connection.roulette_idle = false;
            }
        },
    },
    mounted() {
        // @ts-ignore
        group = this.$refs.group.getNode()
        // @ts-ignore
        layer = this.$refs.layer.getNode()

        this.spin()
        anim.start()
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
