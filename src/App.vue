<template>
    <div class="board">
        <div class="center block">
            <!--left panel-->
            <div name="left-panel">
                <Dice v-show="state === 0" />
                <div v-show="state === 1" v-if="payload"><Wheel :payload="payload"></Wheel></div>
                <Raffle v-show="state === 2" :begin="started" :index="boardIndex" @reset="boardIndex = 0" :channel="options.channel"></Raffle>
            </div>

            <!--right panel-->
            <div name="right-panel">
                <Timer :clockwise="clockwise" @reverse="clockwise = !clockwise"></Timer>
                <Inventory v-show="this.state >= 0"></Inventory>
            </div>

            <!--right-bottom buttons-->
            <div class="static-menu" v-show="this.state >= 0">
                <button @click="showSetup = true">기본 설정</button>
                <button @click="showStart = true">판때기 메뉴</button>
            </div>
        </div>

        <!--modals-->
        <teleport to="body">
            <transition name="modal">
                <Setup v-if="showSetup" :hasBegun="started" @close="beginGame"></Setup>
            </transition>
        </teleport>

        <teleport to="body">
            <transition name="modal">
                <StartMenu v-if="showStart" @shuffle="shuffle()" @addkey="addKey()"
                    @reset="restore()" @close="showStart = false"></StartMenu>
            </transition>
        </teleport>

        <div v-for="(block, index) in blocks" class="block" :style="block.style" :class="blockType(index)">
            <!--number tags-->
            <div v-if="index !== 0 && index !== 13" class="blockNumber centered">{{ index }}</div>

            <!--start-->
            <div v-if="index === 0" style="width: 100%; height: 100%;">
                <button class="blockButton centered" @click="closeAll">출발</button>
            </div>

            <!--free-->
            <button v-else-if="index === 13" class="blockButton centered" @click="state = 0">뱅하싶</button>

            <!--golden key-->
            <button v-else-if="board.isGoldenKey(index)" class="blockButton centered" @click="state = 1">황금열쇠</button>

            <!--islands-->
            <button v-else-if="index === 7 || index === 20" class="blockButton centered" @click="select(index)">{{ board.selectAll(index).length }}</button>

            <!--other blocks-->
            <div v-else style="width: 100%; height: 100%;" :style="fillColor(index)">
                <div class="blockDetail">{{ board.board[index] }}</div>
                <button class="blockButton centered" @click="select(index)">{{ board.selectAll(index).length }}</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
// components
import Dice from './components/Dice.vue'
import Wheel from './components/Wheel.vue'
import Timer from './components/Timer.vue'
import Inventory from './components/Inventory.vue'
import Setup from './components/Setup.vue'
import StartMenu from './components/StartMenu.vue'
import Raffle from './components/Raffle.vue'

// imports
import { useBoardStore } from './stores/BoardStore'
import * as LocalForage from 'localforage'

let backupBoard = [] as string[]

export default {
    data() {
        return {
            // board
            blocks: [
                { style: 'grid-column: 8; grid-row: 7;' },
                { style: 'grid-column: 7; grid-row: 7;' },
                { style: 'grid-column: 6; grid-row: 7;' },
                { style: 'grid-column: 5; grid-row: 7;' },
                { style: 'grid-column: 4; grid-row: 7;' },
                { style: 'grid-column: 3; grid-row: 7;' },
                { style: 'grid-column: 2; grid-row: 7;' },
                { style: 'grid-column: 1; grid-row: 7;' },
                { style: 'grid-column: 1; grid-row: 6;' },
                { style: 'grid-column: 1; grid-row: 5;' },
                { style: 'grid-column: 1; grid-row: 4;' },
                { style: 'grid-column: 1; grid-row: 3;' },
                { style: 'grid-column: 1; grid-row: 2;' },
                { style: 'grid-column: 1; grid-row: 1;' },
                { style: 'grid-column: 2; grid-row: 1;' },
                { style: 'grid-column: 3; grid-row: 1;' },
                { style: 'grid-column: 4; grid-row: 1;' },
                { style: 'grid-column: 5; grid-row: 1;' },
                { style: 'grid-column: 6; grid-row: 1;' },
                { style: 'grid-column: 7; grid-row: 1;' },
                { style: 'grid-column: 8; grid-row: 1;' },
                { style: 'grid-column: 8; grid-row: 2;' },
                { style: 'grid-column: 8; grid-row: 3;' },
                { style: 'grid-column: 8; grid-row: 4;' },
                { style: 'grid-column: 8; grid-row: 5;' },
                { style: 'grid-column: 8; grid-row: 6;' }
            ],
            state: 0,
            board: useBoardStore(),
            boardIndex: 0,

            // timer
            clockwise: true,

            // wheel
            payload: "",

            // setup
            showSetup: true,
            started: false,
            options: {},

            // start
            showStart: false,
        }
    },
    components: {
        Dice, Timer, Setup, Wheel, Inventory, StartMenu, Raffle
    },
    methods: {
        // game setup
        async beginGame({ options, payload }) {
            this.showSetup = false
            this.options = options
            if (!this.started) {
                this.payload = payload
                this.started = true;

                await this.board.setupThemes()
                this.board.buildBoard()
                backupBoard = this.board.board
            }
        },

        // start menu
        shuffle() {
            this.state = 0
            this.boardIndex = 0
            this.board.shuffleBoard(this.clockwise)
            this.board.buildBoard()
            this.showStart = false
        },
        addKey() {
            this.state = 0
            this.boardIndex = 0
            this.board.goldenKeys.push(-1)
            this.board.shuffleBoard(this.clockwise)
            this.board.buildBoard()
            this.showStart = false
        },
        restore() {
            this.state = 0
            this.boardIndex = 0
            this.board.board = backupBoard
            this.board.goldenKeys = [2, 5, 9, 11, 15, 18, 22, 24]
            this.showStart = false
        },
        closeAll() {
            this.state = -1
        },

        // select
        select(index: number) {
            this.boardIndex = index
            this.state = 2
        },

        // config
        blockType(index: number) {
            return {
                go: index === 0,
                free: index === 13,
                golden: this.board.isGoldenKey(index),
                djmax: this.board.board[index] === '디맥섬',
                ez2on: this.board.board[index] === '투온섬',
                mars: this.board.board[index] === '식스타섬',
                circle: this.board.board[index] === '뱅섬',
                truck: this.board.board[index] === '프세카섬',
            }
        },
        fillColor(index: number) {
            const theme = this.board.board[index]
            return {
                "background-color": this.board.getColor(theme)
            }
        }
    },
    mounted() {
        window.addEventListener('beforeunload', () => {
            LocalForage.setItem('board-snapshot', JSON.parse(JSON.stringify({
                board: this.board.board,
                themes: this.board.themes,
                goldenKeys: this.board.goldenKeys,
                backup: backupBoard
            })))
        })
    }
}
</script>

<style lang="scss">
.board {
    display: grid;
    height: 100vh;

    // grid
    grid-template-columns: 316px repeat(6, 1fr) 316px;
    grid-template-rows: 176px repeat(5, 1fr) 176px;

    // decoration
    border: 2px solid;
    // background-color: lightgray;

    .block {
        border: 2px solid;
        position: relative;

        .blockNumber {
            position: absolute;
            width: 32px;
            z-index: 5;

            // content
            font: bold 20px/1.4 sans-serif;

            // decoration
            border-bottom: 4px solid;
            border-right: 4px solid;
            background-color: white;
        }

        .blockDetail {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;

            white-space: pre-wrap;
            text-align: center;
            font: 24px 'KBO-Dia-Gothic_bold', sans-serif;
        }

        .blockButton {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0px;

            // content
            font: 40px "Galmuri14", sans-serif;
            white-space: pre-wrap;

            // decoration
            background-color: transparent;
            color: transparent;
            border: none;
            transition: all 0.1s ease-out;

            &:hover {
                background-color: rgba(255, 255, 255, 0.7);
                color: black;
            }
        }
    }

    .center {
        grid-area: 2 / 2 / 7 / 8;
        position: relative;
        display: grid;
        grid-template-columns: 7fr 5fr;

        // background-image: url('./assets/RM2023SM.png');
        background-position: center;
        background-size: cover;

        .static-menu {
            position: absolute;
            right: 8px;
            bottom: 8px;

            display: flex;
            gap: 4px;

            font-size: 14px;
            line-height: 28px;

            > button {
                width: 120px;
                background-color: #333d;
                color: #fff;
            }
        }
    }

    .go {
        background-color: white;
        background-image: url('./assets/start.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .free {
        background-color: black;
        background-image: url('./assets/free.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .golden {
        background-color: yellow;
        background-image: url('./assets/keys.png');
        background-position: center;
        background-repeat: no-repeat;
        background-clip: border-box;
    }

    .djmax {
        background-color: transparent;
        background-image: url('./assets/djmax.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .ez2on {
        background-color: transparent;
        background-image: url('./assets/ez2on.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .mars {
        background-color: transparent;
        background-image: url('./assets/mars.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .circle {
        background-color: transparent;
        background-image: url('./assets/circle.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }

    .truck {
        background-color: transparent;
        background-image: url('./assets/truck.png');
        background-position: center;
        background-size: cover;
        background-clip: border-box;
    }
}

.modal-enter-from {
    opacity: 0;

    .setupContainer {
        transform: scale(1.1);
    }
}

.modal-leave-to {
    opacity: 0;

    .setupContainer {
        transform: scale(1.1);
    }
}

</style>
