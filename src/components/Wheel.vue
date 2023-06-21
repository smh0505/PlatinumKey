<template>
    <v-stage :config="{ width: 712, height: 712}">
        <v-layer>
            <v-wedge v-for="(item, index) in options.options" :config="sectorConfig(index, item)"></v-wedge>
            <v-text v-for="(item, index) in options.options" :config="textConfig(index, item)"></v-text>
            <v-line :config="arrow"></v-line>
        </v-layer>
    </v-stage>
    <div v-show="showResult" class="resultScreen">
        <div class="label">다음 황금열쇠는</div>
        <div class="value">{{ result }}</div>
    </div>
    <button v-show="showButton" class="wheelButton" @click="click">{{ buttonLabels[state] }}</button>
</template>

<script lang="ts">
import { ref } from 'vue'
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
            socket: ref<WebSocket | null>(null),
            log: useConnectStore(),
            retryCount: 0,

            // wheel
            options: useWheelStore(),
            startAngle: 0,
            speed: 50,
            arrow: {
                points: [586, 356, 606, 366, 606, 346],
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
                x: 356,
                y: 356,
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
                x: 356,
                y: 356,
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
            }
        },

        // websocket
        connect() {
            if(!this.payload) {
                return
            }
            this.socket = new WebSocket('wss://toon.at:8071/' + this.payload)
            this.log.result({
                type: 'toonation',
                status: 'connecting'
            })

            this.socket.onopen = () => {
                this.log.result({
                    type: 'toonation',
                    status: 'connected'
                })
                this.retryCount = 0
            }

            this.socket.onmessage = msg => {
                if (msg.data.includes('roulette')) {
                    const roulette = JSON.parse(msg.data).content.message as string
                    const rValue = roulette.split(' - ')[1]
                    if (rValue !== '꽝') {
                        this.options.addOption(rValue)
                    }
                }
            }

            this.socket.onclose = () => {
                const filtered = this.log.logs.filter(x => x.type === 1)
                if (filtered.length === 0 || filtered.slice(-1)[0].positive) {
                    this.log.result({
                        type: 'toonation',
                        status: 'disconnected'
                    })
                }
                setTimeout(() => this.connect(), this.retryCount > 0? 1000 : 10)
                this.retryCount++
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
        this.connect()
        window.addEventListener('beforeunload', this.saveWheel)
    }
}
</script>

<style lang="scss">
.wheelButton {
    position: absolute;
    width: 96px;
    height: 48px;
    left: 16px;
    bottom: 16px;

    // decoration
    border: none;
    border-radius: 8px;
    font: 20px 'Galmuri14', sans-serif;
    background-color: rgba(148, 255, 127, 0.75);
    transition: all 0.2s ease-out;

    &:hover {
        background-color: rgb(148, 255, 127);
    }
}

.resultScreen {
    position: absolute;
    width: 656px;
    height: 600px;
    left: 32px;
    top: 32px;
    padding: 12px;

    background-color: rgba(0, 0, 0, 0.75);

    .label {
        font: 24px/1.33 'Galmuri14', sans-serif;
        color: white;
    }

    .value {
        font: 40px 'Galmuri14', sans-serif;
        color: yellow;
    }
}
</style>
