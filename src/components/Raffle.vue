<template>
    <div class="raffleContainer">
        <div class="raffleHeader" :style="color">
            <div class="theme"><Marquee :text="theme"></Marquee></div>
            <div class="count">×{{ state === 0 ? pool.length : temp.length }}</div>
        </div>
        <div class="raffleList">
            <div class="rafflePool" v-if="state === 0">
                <Scroll :list="pool.map(x => ({
                    text: x.song,
                    class: {
                        'iidx-title-inline': true
                    }
                }))"></Scroll>
            </div>
            <div class="raffleResult" v-if="state !== 0">
                <div class="genre">{{ theme }}</div>
                <div class="iidx-title large"><span>{{ temp[tempIdx].song }}</span></div>
                <div class="artist">{{ temp[tempIdx].name }}</div>
            </div>
        </div>
        <div class="usedList">
            <Scroll :list="board.usedList.map(x => ({ text: x.name + ' => ' + x.song }))"></Scroll>
        </div>
        <div class="raffleButtons">
            <button @keydown.prevent v-if="pool.length > 0" @click="click()">{{ buttonLabels[state] }}</button>
            <button @keydown.prevent v-if="state === 2" @click="retry()">재추첨</button>
            <button @keydown.prevent v-if="state === 2" @click="cancel()">추첨 취소</button>
        </div>
    </div>
</template>

<script lang="ts">
import { useBoardStore, vote } from '../stores/BoardStore';
import { useConnectStore } from '../stores/ConnectStore';
import { remainder } from '../scripts/Calculate';

import Marquee from './Marquee.vue';
import Scroll from './Scroll.vue';
import * as LocalForage from 'localforage'

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
        // controls
        click() {
            this.state = remainder(this.state + 1, 3)
            switch (this.state) {
                case 0:
                    this.board.remove(this.temp[this.tempIdx])
                    this.tempIdx = 0
                    this.board.addMoney(Number(this.index))
                    break
                case 1:
                    this.temp = this.pool
                    this.seekIndex()
                    break
                case 2:
                    window.clearInterval(this.intervalId)
            }
        },
        seekIndex() {
            this.tempIdx = (this.tempIdx + 1) % this.temp.length
            if(this.state === 1) {
                requestAnimationFrame(() => this.seekIndex())
            }
        },
        retry() {
            this.state = 1
            this.seekIndex()
        },
        cancel() {
            this.state = 0
            this.tempIdx = 0
        }
    },
    mounted() {
        this.connection.connectTwitch(Boolean(this.begin), String(this.channel))
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
    grid-template-rows: 48px minmax(0, 2fr) 1fr 48px;
    width: 700px;
    height: 100%;

    .raffleHeader {
        display: grid;
        grid-template-columns: auto min-content;

        line-height: 32px;
        padding-bottom: 4px;

        .theme {
            display: flex;
            font-size: 30px;
            padding-inline: 14px;
            align-items: center;
            overflow: hidden;
            white-space: nowrap;
        }

        .count {
            display: flex;
            align-items: center;
            font-size: 30px;
            font-family: var(--font-numeric);
            font-variant-numeric: tabular-nums;
            padding: 0px 20px;
        }
    }

    .raffleList {
        background-color: #000c;

        .rafflePool {
            color: #fff;

            height: 100%;

            padding: 4px 8px;
            font-size: 16px;
            overflow: hidden;
        }

        .raffleResult {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            gap: 1em;

            background-color: #000a;
            color: white;
            padding: 8px 16px;
            font-size: 24px;
            height: 100%;

            > .genre, > .artist {
                flex-shrink: 0;
            }
            > .artist {
                font-weight: 600;
            }
            > .iidx-title {
                min-height: 50%;
            }
        }
    }

    .usedList {
        background-color: #000c;
        color: #fff9;
        margin-top: 8px;

        padding: 4px 8px;
        font-size: 16px;
        overflow: hidden;
    }
}

.raffleButtons {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(5, 1fr);
    margin-top: 8px;
    gap: 8px;

    & > * {
        background-color: rgba(0, 0, 0, 0.7);
        color: white;
        font-size: 20px;
        transition: all 0.2s ease-out;

        &:hover {
            background-color: white;
            color: black;
        }
    }
}
</style>
