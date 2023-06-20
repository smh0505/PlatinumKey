<template>
    <div class="raffleContainer">
        <div class="raffleList">
            <div class="raffleHeader" :style="color">
                <div class="theme"><Marquee :text="theme"></Marquee></div>
                <button class="reset" @click="$emit('reset')">{{ pool.length }}</button>
            </div>
            <div class="rafflePool" v-if="state === 0">
                <Scroll :list="pool.map(x => x.song)"></Scroll>
            </div>
            <div class="raffleResult" v-if="state !== 0">
                <span>다음 곡은</span><br>
                <span style="color: yellow; font-size: 32px;">{{ temp[tempIdx].song }}</span><br>
                <span>by {{ temp[tempIdx].name }}</span>
            </div>
        </div>
        <div class="usedList">
            <Scroll :list="board.usedList.map(x => x.name + ' => ' + x.song)"></Scroll>
        </div>
        <div class="raffleButtons">
            <button v-if="pool.length > 0" @click="click()">{{ buttonLabels[state] }}</button>
            <button v-if="state === 2" @click="retry()">재추첨</button>
            <button v-if="state === 2" @click="cancel()">추첨 취소</button>
        </div>
    </div>
</template>

<script lang="ts">
import { ref } from 'vue'
import { useBoardStore, vote } from '../stores/BoardStore';
import { useConnectStore } from '../stores/ConnectStore';
import Marquee from './Marquee.vue';
import * as LocalForage from 'localforage'
import Scroll from './Scroll.vue';
import { remainder } from '../scripts/Calculate';

export default {
    props: {
        begin: Boolean,
        index: Number,
        channel: {
            type: String,
            default: 'arpa__'
        }
    },
    data() {
        return {
            socket: ref<WebSocket | null>(null),
            board: useBoardStore(),
            connection: useConnectStore(),

            temp: [] as vote[],
            tempIdx: 0,
            intervalId: 0,

            buttonLabels: ['추첨', '멈추기', '결정'],
            state: 0
        }
    },
    components: { Marquee, Scroll },
    emits: ['reset'],
    computed: {
        theme() {
            return this.board.board[Number(this.index)]
        },
        color() {
            return {
                'background-color': this.board.getColor(this.theme)
            }
        },
        pool() {
            return this.board.selectAll(Number(this.index))
        }
    },
    methods: {
        connect() {
            this.socket = new WebSocket('wss://irc-ws.chat.twitch.tv')

            this.socket.onopen = () => {
                this.socket?.send('CAP REQ :twitch.tv/commands twitch.tv/tags')
                this.socket?.send('NICK justinfan9705')
                this.socket?.send('JOIN #' + this.channel)
                this.connection.result(0, true)
            }

            this.socket.onmessage = msg => {
                if (msg.data.includes('PING')) {
                    this.socket?.send('PONG :tmi.twitch.tv')
                }
                if (this.begin && msg.data.includes('!픽')) {
                    const result = this.board.parse(msg.data)
                    this.connection.result(2, result.result, result.name)
                }
            }

            this.socket.onclose = () => {
                const filtered = this.connection.logs.filter(x => x.type === 0)
                if (filtered.length === 0 || filtered.slice(-1)[0].positive) {
                    this.connection.result(0, false)
                }
                setTimeout(() => this.connect(), 5000)
            }
        },

        // controls
        click() {
            this.state = remainder(this.state + 1, 3)
            switch (this.state) {
                case 0:
                    this.board.remove(this.temp[this.tempIdx])
                    this.tempIdx = 0
                    break
                case 1:
                    this.temp = this.pool
                    this.intervalId = window.setInterval(() => {
                        this.tempIdx = Math.floor(Math.random() * this.temp.length)
                    }, 16)
                    break
                case 2:
                    window.clearInterval(this.intervalId)
            }
        },
        retry() {
            this.state = 1
            this.intervalId = window.setInterval(() => {
                this.tempIdx = Math.floor(Math.random() * this.temp.length)
            }, 16)
        },
        cancel() {
            this.state = 0
            this.tempIdx = 0
        }
    },
    mounted() {
        this.connect()
        window.addEventListener('beforeunload', () => {
            LocalForage.setItem('votes-snapshot', JSON.parse(JSON.stringify({
                pool: this.board.pool,
                island: this.board.islandPool,
                used: this.board.usedList
            })))
        })
    }
}
</script>

<style lang="scss">
.raffleContainer {
    display: grid;
    width: 700px;
    height: 97.5%;
    margin: 8px;
    gap: 8px;
    grid-template-rows: 1fr 1fr 3rem;

    .raffleList {
        border: 4px solid white;
        background-color: rgba(255, 255, 255, 0.8);

        display: grid;
        grid-template-rows: 3rem 1fr;

        .raffleHeader {
            display: grid;
            grid-template-columns: 1fr 6rem;

            .theme {
                display: flex;
                font: 30px 'Galmuri14', sans-serif;
                padding-inline: 8px;
                align-items: center;
                overflow: hidden;
            }

            .reset {
                font: 30px 'Galmuri14', sans-serif;
                background-color: transparent;
                color: black;
                border: none;
                transition: all 0.2s ease-out;

                &:hover {
                    background-color: black;
                    color: white;
                }
            }
        }

        .rafflePool {
            padding: 4px 8px;
            font: 16px 'Galmuri14', sans-serif;
            height: 260px;
            overflow: hidden;
        }

        .raffleResult {
            background-color: rgba(75, 75, 75, 0.8);
            color: white;
            padding: 8px 16px;
            font: 20px 'Galmuri14', sans-serif;
        }
    }

    .usedList {
        border: 4px solid white;
        background-color: rgba(0, 0, 0, 0.8);
        color: white;

        padding: 4px 8px;
        height: 280px;
        font: 16px 'Galmuri14', sans-serif;
        overflow: hidden;
    }

    .raffleButtons {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 8px;

        & > * {
            border: 4px solid white;
            border-radius: 8px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            font: 20px 'Galmuri14', sans-serif;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: white;
                color: black;
            }
        }
    }
}
</style>
