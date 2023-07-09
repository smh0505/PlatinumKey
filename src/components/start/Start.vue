<template>
    <div class="start">
        <div class="start-intro" v-show="ui.param === null">
            <blockquote class="version">
                게임 버전: {{ BUILD_TIMESTAMP }}
                (v{{ VERSION }})
            </blockquote>
            <h1>판때기</h1>
            <h2>
                RHYTHM MARBLE
                –
                VACANCE SEASON
            </h2>
            <ul class="start-intro-menu">
                <li @click="ui.navigate('start', 'select-key')"> 게임 시작 </li>
                <li @click="continueGame"> 이어하기 </li>
                <li @click="ui.navigate('start', 'settings')"> 설정 </li>
            </ul>
            <blockquote class="footer">
                © 2023 김편집 / Project 판때기. All Rights Reserved.
            </blockquote>
        </div>
        <KeySelect v-if="ui.param === 'select-key'" />
        <Setup v-if="ui.param === 'settings'" />
    </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon'

import { useBoardStore } from '../../stores/BoardStore'
import { useConnectStore } from '../../stores/ConnectStore'
import { useOptionsStore } from '../../stores/OptionsStore'
import { useUIStore } from '../../stores/UIStore'
import { useWheelStore } from '../../stores/WheelStore'

import packageinfo from '../../../package.json'

import KeySelect from './KeySelect.vue'
import Setup from './Setup.vue'

export default {
    components: {
        KeySelect,
        Setup
    },
    data: () => ({
        BUILD_TIMESTAMP: DateTime.fromISO(import.meta.env.BUILD_TIMESTAMP).toFormat('yyyy.MM.dd.HHmm.0000'),
        VERSION: packageinfo.version,

        board: useBoardStore(),
        options: useOptionsStore(),
        wheel: useWheelStore(),
        connect: useConnectStore(),
        ui: useUIStore(),
    }),
    methods: {
        async continueGame() {
            //
        },
    }
}

</script>

<style lang="scss">

@import '../../styles/mixin';

.start {
    width: calc(100% + 16px);
    height: calc(100% + 16px);
    margin: -8px;
    grid-area: 1 span / 2 span;
    overflow-y: hidden;

    color: white;
    background: #000c;

    user-select: none;

    > * {
        height: 100%;
    }
}
.start-intro {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    text-align: center;
    padding: 8vh 1vw;

    line-height: 1;

    h1, h2 {
        margin: 0;
    }
    h1 {
        font-size: 12vh;
        font-weight: 100;
        line-height: 1;

        text-shadow: 0 0 0.1em #000;
        letter-spacing: 0.25em;
        text-indent: 0.25em;
        margin-bottom: 0.25em;
    }
    h2 {
        font-size: 2vh;
        font-weight: 200;
        line-height: 1.25;

        text-shadow: 0 0 0.2em #000;
        letter-spacing: 0.375em;
        text-indent: 0.375em;
    }
    &-menu {
        margin: 8vh 0 0 0;
        padding: 0;
        list-style: none;

        width: 20%;
        min-width: 16rem;

        > li {
            @include button;

            padding: 0.75em 0;
            margin: 12px 0;
            font-size: 1.75vh;
            font-weight: 300;
        }
    }
    blockquote {
        position: absolute;
        font-size: 1.2rem;
        font-weight: 300;
        line-height: 1.5em;
        color: #ddd;

        &.version {
            top: 0;
            left: 0;
            text-align: left;
        }
        &.footer {
            bottom: 0;
        }
    }
}

</style>
