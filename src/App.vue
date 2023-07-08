<template>
    <Board>
        <Start v-if="ui.page === 'start'" />
        <template v-else>
            <!--left panel-->
            <div class="left-panel">
                <Dice
                    v-show="ui.page === 'dice'" />
                <Wheel
                    v-show="ui.page === 'wheel'"
                    v-if="connect.toonationPayload"
                    :payload="connect.toonationPayload" />
                <Raffle
                    v-if="ui.page === 'raffle' && options.channel"
                    :index="ui.param" />
                <Setup
                    v-if="ui.page === 'setup'" />
            </div>

            <!--right panel-->
            <div class="right-panel">
                <Timer />
                <div class="inv-container">
                    <LogList :visible-count="ui.page? 10 : 5"></LogList>
                    <Items v-show="ui.page"></Items>
                </div>
            </div>

            <!--right-bottom buttons-->
            <div class="static-menu" v-show="ui.page">
                <button @keydown.prevent v-if="!board.started" @click="beginGame">게임 시작</button>
                <button @keydown.prevent @click="board.getSalary()">월급 받기</button>
                <button @keydown.prevent @click="ui.navigate('setup')">기본 설정</button>
                <button @keydown.prevent @click="board.shuffleBoard()">판 섞기</button>
                <button @keydown.prevent @click="board.shuffleBoard(true)">황금열쇠 추가</button>
                <button @keydown.prevent @click="board.unshuffleBoard()">판 되돌리기</button>
            </div>
        </template>
    </Board>
</template>

<script lang="ts">
// components
import Board from './components/board/Board.vue'

import Start from './components/Start.vue'
import Dice from './components/Dice.vue'
import Wheel from './components/Wheel.vue'
import Timer from './components/Timer.vue'
import Items from './components/Items.vue'
import LogList from './components/LogList.vue'
import Setup from './components/setup/Setup.vue'
import Raffle from './components/Raffle.vue'

// imports
import { useBoardStore } from './stores/BoardStore'
import { useOptionsStore } from './stores/OptionsStore'
import { useUIStore } from './stores/UIStore'

import { useConnectStore } from './stores/ConnectStore'
import { useWheelStore } from './stores/WheelStore'

export default {
    data() {
        return {
            // board
            board: useBoardStore(),
            connect: useConnectStore(),
            options: useOptionsStore(),
            wheel: useWheelStore(),
            ui: useUIStore(),
        }
    },
    components: {
        Start, Board, Dice, Timer, Setup, Wheel, Items, LogList, Raffle
    },
    methods: {
        // game setup
        async beginGame() {
            if (!this.board.started) {
                this.wheel.fill(this.options.defaultKeys)
                this.connect.connectAll()
                await this.board.begin(this.options.themes)
            }
        }
    },
    mounted() {
        window.addEventListener('beforeunload', () => {
            this.board.snapshot()
        })

        this.ui.initOBS()

        this.options.load()
    }
}
</script>

<style lang="scss">
.board {

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

            display: grid;
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
