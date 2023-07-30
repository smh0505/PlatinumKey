<template>
    <div class="raffleContainer" :style="{ '--color': color }">
        <dl class="raffleHeader">
            <dt>SLOT</dt>
            <dd>#{{ backupIdx || index }}</dd>
            <dt>THEME</dt>
            <dd><Marquee :text="theme"></Marquee></dd>
            <dt>PICKS</dt>
            <dd>{{ state === 0 ? pool.length : temp.length }}</dd>
        </dl>
        <div class="raffleList">
            <div class="rafflePool" v-if="state === 0">
                <Scroll :list="pool.map(x => ({
                    text: x.song,
                    class: {
                        'iidx-title-inline': true,
                        'new': isRelativelyNew(x.timestamp)
                    }
                }))"></Scroll>
            </div>
            <div class="raffleResult" v-if="state !== 0">
                <div class="genre">{{ theme }}</div>
                <div :class="[
                    'iidx-title large',
                    { new: isRelativelyNew(temp[tempIdx].timestamp) }
                ]"><span>{{ temp[tempIdx].song }}</span></div>
                <div class="artist">{{ temp[tempIdx].name }}</div>
            </div>
        </div>
        <div class="usedList">
            <Scroll :list="board.usedList.map(x => ({ text: x.name + ' => ' + x.song }))"></Scroll>
        </div>
        <div class="raffleButtons">
            <button @keydown.prevent v-if="isEmpty" @click="click()">{{ buttonLabels[state] }}</button>
            <button @keydown.prevent v-if="state === 2" @click="retry()">재추첨</button>
            <button @keydown.prevent v-if="state === 2" @click="cancel()">추첨 취소</button>
            <button @keydown.prevent v-if="hasPlayed" @click="rollback()"
                    style="grid-column: 5;">직전 추첨 취소</button>
        </div>
    </div>
</template>

<script lang="ts">
import { useBoardStore, Vote } from '../stores/BoardStore';
import { useConnectStore } from '../stores/ConnectStore';
import { useItemStore } from '../stores/ItemStore';
import { remainder } from '../scripts/Calculate';

import Marquee from './Marquee.vue';
import Scroll from './Scroll.vue';

export default {
    props: {
        index: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            board: useBoardStore(),
            connection: useConnectStore(),
            items: useItemStore(),

            backupIdx: 0,
            temp: [] as Vote[],
            tempIdx: 0,

            buttonLabels: ['추첨', '멈추기', '결정'],
            state: 0,

            // updated lazily
            now: Date.now()
        }
    },
    components: { Marquee, Scroll },
    computed: {
        theme() {
            return this.state === 0 ? this.board.board[this.index] : this.board.board[this.backupIdx]
        },
        color() {
            return this.board.getColor(this.theme)
        },
        pool() {
            return this.board.selectAll(this.index)
        },
        isEmpty() {
            return this.state === 0 ? this.pool.length > 0 : this.temp.length > 0
        },
        hasPlayed() {
            return this.state === 0 && this.board.usedList.length > 0
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
                    this.board.addMoney(this.backupIdx)
                    this.board.songs++
                    this.backupIdx = 0
                    this.items.subAll()
                    break
                case 1:
                    this.temp = this.pool
                    this.backupIdx = this.index
                    this.seekIndex()
            }
        },
        seekIndex() {
            // (this.tempIdx + 1) % this.temp.length
            this.tempIdx = Math.floor(Math.random() * this.temp.length)
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
        },
        rollback() {
            const vote = this.board.usedList.pop()
            if (vote) {
                this.board.songs--
                const theme = this.board.themes.find(x => x.theme === vote.theme)
                if (theme) theme.stepped -= 1
            }
        },
        isRelativelyNew(timestamp: number) {
            return (this.now - timestamp) < 10 * 60 * 1000
        }
    },
    mounted() {
        setInterval(() => {
            this.now = Date.now()
        }, 1000)
    }
}
</script>

<style lang="scss">
.raffleContainer {
    position: relative;
    display: grid;
    grid-template-rows: min-content minmax(0, 2fr) 1fr 48px;
    width: 100%;
    height: 100%;


    .raffleHeader {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 5rem auto 5rem;
        grid-template-rows: 1rem 2.5rem;

        margin: 0;
        padding: 0.25rem 0.75rem;

        font-family: var(--font-numeric);
        font-variant-numeric: tabular-nums;
        font-weight: 500;
        background-color: white;
        border-top: 0.5rem solid var(--color);

        > dt {
            font-size: 0.875rem;
        }
        > dd {
            margin: 0;
            font-size: 2rem;
            line-height: 2.5rem;

            white-space: nowrap;
            word-break: keep-all;
            overflow: hidden;
        }
        > dt:last-of-type, > dd:last-of-type {
            text-align: right;
        }
    }

    .raffleList {
        background-color: #000c;

        .rafflePool {
            color: #fff;

            height: 100%;

            padding: 4px 8px;
            font-size: 20px;
            line-height: 24px;
            overflow: hidden;

            filter: drop-shadow(0 0 0.05em black) drop-shadow(0 0 0.05em black) drop-shadow(0 0 0.05em black);

            &:has(.overflown) {
                box-shadow: 0 0.75em 0.5em -1em #000 inset, 0 -0.75em 0.5em -1em #000 inset;
            }
            .scroll {
                text-align: center;
                justify-content: center;

                br {
                    display: block;
                    content: '';
                    height: 0.25em;
                }
            }
        }

        .raffleResult {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;

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
