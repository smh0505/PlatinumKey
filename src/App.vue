<template>
    <div class="board">
        <div class="center">
            <!--left panel-->
            <div class="left-panel">
                <Dice v-show="state === 0" />
                <Wheel v-show="state === 1" v-if="payload" :payload="payload"></Wheel>
                <Raffle v-show="state === 2" v-if="options.channel" :begin="started" :index="boardIndex" :channel="options.channel"></Raffle>
            </div>

            <!--right panel-->
            <div class="right-panel">
                <Timer :clockwise="clockwise" @reverse="clockwise = !clockwise"></Timer>
                <div class="inv-container">
                    <LogList :visible-count="state < 0? 5 : 10"></LogList>
                    <Items v-show="state >= 0"></Items>
                </div>
            </div>

            <!--right-bottom buttons-->
            <div class="static-menu" v-show="state >= 0">
                <button @keydown.prevent @click="salary()">월급 받기</button>
                <button @keydown.prevent @click="showSetup = true">기본 설정</button>
                <button @keydown.prevent @click="showStart = true">판때기 메뉴</button>
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

        <div
            v-for="(block, index) in blocks"
            :style="block.style"
            :class="[
                'block', {
                    ...blockType(index),
                    top: 13 < index && index < 20,
                    right: 20 < index && index < 26,
                    bottom: 0 < index && index < 7,
                    left: 7 < index && index < 13,
                    corner: [0, 7, 13, 20].includes(index),
                    monopoly: board.checkMonopoly(index)
                }
            ]">
            <!--number tags-->
            <header
                class="block-header"
                v-if="index !== 0 && index !== 13"
                :style="fillColor(index)">
                <div class="block-number">{{ index }}</div>
            </header>

            <div class="block-prize">{{ board.getPrizeByIndex(index) }}<small>$</small></div>

            <!--start-->
            <div
                v-if="index === 0"
                style="width: 100%; height: 100%;"
                @click="closeAll(); switchScene(true)"
                @contextmenu.prevent="state = 2">
            </div>

            <!--free-->
            <div
                v-else-if="index === 13"
                class="blockButton centered"
                @click="state = 0">뱅하싶</div>

            <!--golden key-->
            <div
                v-else-if="board.isGoldenKey(index)"
                class="blockButton centered"
                @click="state = 1">황금열쇠</div>

            <!--islands-->
            <div
                v-else-if="index === 7 || index === 20"
                class="blockButton centered"
                @click="select(index)">{{ board.selectAll(index).length }}</div>

            <!--other blocks-->
            <template v-else>
                <div class="block-content">{{ board.board[index] }}</div>
                <div class="blockButton centered" @click="select(index)">{{ board.selectAll(index).length }}</div>
            </template>
        </div>
    </div>
</template>

<script lang="ts">
// components
import Dice from './components/Dice.vue'
import Wheel from './components/Wheel.vue'
import Timer from './components/Timer.vue'
import Items from './components/Items.vue'
import LogList from './components/LogList.vue'
import Setup from './components/Setup.vue'
import StartMenu from './components/StartMenu.vue'
import Raffle from './components/Raffle.vue'

// imports
import type Options from './scripts/IOptions'
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
            options: {} as Options,

            // obs
            currentScene: '',

            // start
            showStart: false,
        }
    },
    components: {
        Dice, Timer, Setup, Wheel, Items, LogList, StartMenu, Raffle
    },
    methods: {
        // game setup
        async beginGame({ options, payload }: { options: Options, payload: string }) {
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

        // salary
        salary() {
            this.board.updateMoney(100)
            this.board.laps++
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
        },
        switchScene(toPlaying: boolean) {
            if (!this.options.useSceneSwitching) {
                return
            }

            const currentlyInPlayingScene = this.options.scenePlaying?.includes(this.currentScene)
            const currentlyInNotPlayingScene = this.options.sceneNotPlaying === this.currentScene

            const hasPlayingSceneConfigured = this.options.scenePlaying?.length > 0
            const hasNotPlayingSceneConfigured = this.options.sceneNotPlaying != null

            if (toPlaying) {
                if (currentlyInPlayingScene && this.options.scenePlaying?.length > 1) {
                    // already on any of playing scene?
                    const currentIndex = this.options.scenePlaying.indexOf(this.currentScene)
                    if (currentIndex < 0)
                        return
                    // then move to next scene
                    const to = this.options.scenePlaying[currentIndex + 1] || this.options.scenePlaying[0]
                    window.obsstudio?.setCurrentScene?.(to)

                } else if (hasNotPlayingSceneConfigured? currentlyInNotPlayingScene : true) {
                    // (currently in not-playing scene) or (not-playing scene not configured)
                    // -> go to playing scene
                    window.obsstudio?.setCurrentScene?.(this.options.scenePlaying[0])
                }
            } else {
                if (hasPlayingSceneConfigured? currentlyInPlayingScene : true) {
                    // (currently in playing scene) or (playing scene not configured)
                    // -> go to not-playing scene
                    window.obsstudio?.setCurrentScene?.(this.options.sceneNotPlaying)
                }
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
        window.addEventListener('obsSceneChanged', (event) => {
            this.currentScene = event.detail.name
        })
        window.obsstudio?.getCurrentScene((scene: OBSSceneInfo) => {
            this.currentScene = scene.name
        })

    },
    watch: {
        state(to) {
            if(to >= 0)
                this.switchScene(false)
        }
    }
}
</script>

<style lang="scss">
.board {
    display: grid;
    height: 100vh;

    // grid
    grid-template-columns: 320px repeat(6, 1fr) 320px;
    grid-template-rows: 180px repeat(5, 1fr) 180px;

    // decoration
    box-shadow: 0 0 0 2px #000 inset;
    // background-color: lightgray;

    .left-panel, .right-panel {
        height: 100%;
        overflow: auto;
    }
    .block {
        display: flex;
        position: relative;

        background-color: #eee;
        border: 1px solid black;

        &.top { flex-direction: column-reverse; }
        &.bottom { flex-direction: column; }
        &.left { flex-direction: row-reverse; }

        &.top .block-prize { top: 0; left: 0; }
        &.right .block-prize { right: 0; top: 0; }
        &.bottom .block-prize { right: 0; bottom: 0; }
        &.left .block-prize { left: 0; bottom: 0; }
        &.top .block-header, &.right .block-header { justify-content: flex-end; }

        &.top .block-header { margin-top: -2rem }
        &.bottom .block-header { margin-bottom: -2rem }

        &.left, &.right {
            .block-header {
                min-width: 2em;
                flex-direction: column;
            }
        }
        &.left .block-header {
            text-align: right;
        }
        &.corner .block-header {
            color: white;
            mix-blend-mode: exclusion;
        }
        &.corner, &.golden {
            .block-header {
                background: none !important;
                box-shadow: none;
            }
            .block-prize {
                display: none;
            }
        }
        &.djmax, &.circle {
            flex-direction: row-reverse;

            .block-header {
                color: white;
                mix-blend-mode: unset;
                text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;
            }
        }

        &.monopoly {
            background-color: #ff6;
            > .block-header {
                background-color: transparent !important;
            }
        }

        .block-header {
            display: flex;
            justify-content: space-between;

            // content
            font-family: var(--font-numeric);
            font-variant-numeric: lining-nums;
            font-weight: 500;
            font-size: 24px;
            line-height: 24px;
            padding: 8px 10px;

            // box-shadow: 0 0 0 2px black;
        }
        .block-prize {
            position: absolute;
            padding: 0.5rem;

            font-size: 4em;
            font-weight: 200;
            line-height: 0.8;

            opacity: 0.333;

            > small {
                font-size: 0.5em;
                font-weight: 400;
            }
        }

        .block-content {
            display: flex;
            justify-content: center;
            align-items: center;

            flex-grow: 1;

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
            font-size: 40px;
            white-space: pre-wrap;

            // decoration
            background-color: transparent;
            color: transparent;
            border: none;
            transition: all 0.1s ease-out;

            user-select: none;

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
        grid-template-columns: 10fr 8fr;
        gap: 40px;

        box-shadow: 0 0 0 1px black inset;

        // background-image: url('./assets/RM2023SM.png');
        background-position: center;
        background-size: cover;

        padding: 8px;

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

        .inv-container {
            display: flex;
            justify-items: end;
            gap: 4px;
            height: 240px;

            > .logSlots {
                flex-basis: 33.3%;
                flex-grow: 1;
                margin-left: auto;
                min-width: 0;
            }
            > .inv-bg {
                flex-basis: 66.6%;
                grid-column: span 2;
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

    .setupContainer, .startContainer {
        transform: scale(1.1);
    }
}

.modal-leave-to {
    opacity: 0;

    .setupContainer, .startContainer {
        transform: scale(1.1);
    }
}

</style>
