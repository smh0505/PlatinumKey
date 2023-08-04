<template>
    <Board :class="{ 'not-started': !board.started }">
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
                    v-show="ui.page === 'raffle'"
                    :index="ui.param" />
                <Laps
                    v-show="ui.page === 'laps'" />
                <div
                    class="setup-standalone"
                    v-if="ui.page === 'setup'">
                    <Setup />
                </div>
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
                <button @keydown.prevent @click="ui.navigate('laps')">페이즈 도전</button>
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

import Start from './components/start/Start.vue'
import Setup from './components/setup/Setup.vue'
import Dice from './components/Dice.vue'
import Wheel from './components/Wheel.vue'
import Timer from './components/Timer.vue'
import Items from './components/Items.vue'
import LogList from './components/LogList.vue'
import Laps from './components/Laps.vue'

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
        Start, Setup, Board, Dice, Timer, Wheel, Items, LogList, Raffle, Laps
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
@import './styles/mixin';

.board {

    .center {
        grid-area: 2 / 2 / 7 / 8;
        position: relative;
        display: grid;
        grid-template-columns: 10fr 8fr;
        gap: 24px;

        box-shadow: 0 0 0 1px black inset;

        > .left-panel, > .right-panel {
            padding: 8px;
        }

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
        @include wallpaper('./assets/start.png', cover, white);
        &.phase-0 {
            @include wallpaper('./assets/livehouse.png', cover, white);
        }
        &.phase-1 {
            @include wallpaper('./assets/budokan.jpg', cover, white);
        }
        &.phase-2, &.phase-3 {
            @include wallpaper('./assets/tokyo-dome.jpg', cover, white);
        }
    }

    .free {
        @include wallpaper('./assets/free.png', cover);
    }

    .golden {
        @include wallpaper('./assets/keys.png', auto, yellow);
    }

    .djmax {
        @include wallpaper('./assets/djmax.png');
    }

    .ez2on {
        @include wallpaper('./assets/ez2on.png');
    }

    .mars {
        @include wallpaper('./assets/mars.png');
    }

    .circle {
        @include wallpaper('./assets/circle.png');
    }

    .truck {
        @include wallpaper('./assets/truck.png');
    }

    .testify {
        @include wallpaper('./assets/testify.png');
    }
}
</style>
