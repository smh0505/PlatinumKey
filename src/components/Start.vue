<template>
    <div class="start">
        <div class="start-intro" v-show="state === 0">
            <h1>판때기</h1>
            <h2>
                RHYTHM MARBLE
                –
                VACANCE SEASON
            </h2>
            <ul class="start-intro-menu">
                <li @click="state = 1"> 게임 시작 </li>
                <li @click="continueGame"> 이어하기 </li>
                <li> 설정 </li>
            </ul>
            <blockquote>
                Produced by 김편집
                <br />
                Made by Project 판때기
            </blockquote>
        </div>
        <div class="start-goldenkey" v-show="state === 1">
            <h3>황금열쇠 선택</h3>
            <!-- <button @focus.prevent class="close"></button> -->
            <ul class="start-goldenkey-logs">
                <li
                    :class="{ selected: selectedKey == null }"
                    @click="selectedKey = null">
                    <label>기본 설정</label>
                </li>
                <li
                    v-for="[key, _] of history"
                    :class="{ selected: selectedKey == key }">
                    <label @click="selectedKey = key"> {{ formatTime(key) }} </label>
                    <button @click="wheel.deleteHistory(key)"><span class="material-symbols-rounded">close</span></button>
                </li>
            </ul>
            <main>
                <KeysList
                    :list="currentWheel"
                    :editable="selectedKey == null"
                    @add="addKey"
                    @remove="removeKey"></KeysList>
            </main>
            <footer>
                <button @click="beginGame(false)"> 황금열쇠 없이 계속 </button>
                <button @click="beginGame(true)" class="success"> 저장 </button>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { DateTime } from 'luxon';
import { useBoardStore } from '../stores/BoardStore';
import { useConnectStore } from '../stores/ConnectStore';
import { useOptionsStore } from '../stores/OptionsStore';
import { useUIStore } from '../stores/UIStore';
import { useWheelStore } from '../stores/WheelStore';

import KeysList from './setup/KeysList.vue';

export default {
    components: {
        KeysList
    },
    data: () => ({
        board: useBoardStore(),
        options: useOptionsStore(),
        wheel: useWheelStore(),
        connect: useConnectStore(),
        ui: useUIStore(),
        state: 0,
        selectedKey: null as string | null
    }),
    methods: {
        async beginGame(useKey: boolean) {
            const keys = useKey? this.currentWheel : []

            this.options.save()

            if (!this.board.started) {
                this.wheel.fill(keys);
                this.connect.connectAll();
                await this.board.begin(this.options.themes);
            }
            this.ui.navigate("");
        },
        async continueGame() {
            //
        },
        selectKey(key: string) {
            this.selectedKey = key;
        },
        addKey(index: number) {
            this.currentWheel.splice(index + 1, 0, { key: '', count: 0 })
        },
        removeKey(index: number) {
            this.currentWheel.splice(index, 1)
        },
        formatTime(ts: string) {
            return DateTime.fromISO(ts).toLocaleString(DateTime.DATETIME_SHORT_WITH_SECONDS)
        }
    },
    computed: {
        history() {
            return new Map(Object.entries(this.wheel.history).reverse())
        },
        currentWheel() {
            if(this.selectedKey == null) {
                return this.options.defaultKeys
            } else {
                return this.wheel.history[this.selectedKey]
            }
        }
    },
    mounted() {
        this.wheel.loadHistory()
    },
}

</script>

<style lang="scss">

@mixin button {
    background: #0013;
    border: 1px solid #fff8;

    outline: 1px solid transparent;
    outline-offset: 2px;

    cursor: pointer;
    user-select: none;
    transition: background 200ms ease, outline 200ms ease;

    &:hover {
        background: #0039;
    }
    &:active, &:focus {
        border-color: #fff;
        outline: 1px solid white;
        > .material-symbols-rounded {
            color: #fff;
        }
    }
    > .material-symbols-rounded {
        vertical-align: top;
        color: #fff9;

        transition: color 200ms ease;
    }
}

.start {
    width: calc(100% + 16px);
    height: calc(100% + 16px);
    margin: -8px;
    grid-area: 1 span / 2 span;
    overflow-y: hidden;

    color: white;
    background: #0006;

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
        bottom: 0;
        font-weight: 300;
        line-height: 1.5em;
        color: #8888;
    }
}
.start-goldenkey {
    display: grid;
    grid-template-areas: "a a" "b c" "d d";
    grid-template-columns: 2fr 3fr;
    grid-template-rows: 6rem 1fr 5rem;
    gap: 0 2rem;

    $inner-padding: 6rem;

    > h3, > footer {
        padding: 0 $inner-padding;
        grid-column: 1 / span 2;
    }
    > ul, > main {
        margin: 3rem 0 1.5rem 0;
        overflow-y: auto;
        grid-row: 2;
    }
    > h3 {
        font-size: 3rem;
        font-weight: 100;
        line-height: 8rem;

        margin: 0;
        background: #0006;
    }
    > ul {
        padding-left: $inner-padding;
        list-style: none;

        > li {
            position: relative;
            display: flex;
            gap: 0.25rem;
            margin: 0.25rem 0;

            font-weight: 300;
            text-align: center;
            font-variant-numeric: tabular-nums;


            > label, > button {
                @include button;

                padding: 0.5rem;

                font-size: 1.25rem;
                line-height: 1.5rem;

                background: #0013;
            }
            > label {
                flex-grow: 1;
            }

            &.selected {
                > * {
                    background-color: #0029;
                }

                &::before {
                    position: absolute;
                    top: 0;
                    left: -0.375rem;
                    bottom: 0;
                    margin: auto;

                    content: 'ACTIVE';

                    padding: 0 0.375em 0 0;
                    border-right: 1px solid #fff;

                    height: 100%;
                    line-height: 2.5rem;

                    transform: translateX(-100%);
                }
            }
        }
    }
    > main {
        padding-right: $inner-padding;
        padding-left: 0.5rem;
    }
    > footer {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        gap: 1rem;

        font-size: 1.25rem;
        line-height: 2.5rem;

        > button {
            @include button;

            font-weight: 500;
            min-width: 12rem;

            &.success {
                background: #494c;
            }
        }
    }

    .goldenkey-list {
        padding: 0;

        input, button {
            @include button;
            padding: 0.5rem;
            line-height: 1.5rem;
            appearance: none;

            &:disabled {
                color: #fff8;
            }
        }

        .goldenkey-list-last-label {
            line-height: calc(2.5rem + 2px);
            opacity: 0.5;
        }
    }
}
</style>
