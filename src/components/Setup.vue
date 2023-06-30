<template>
    <div class="setupContainer">
        <button class="extra-button" @keydown.prevent @click="board.limitless = !board.limitless"
            :class="{ yes: board.limitless, no: !board.limitless }">
            <span class="material-symbols-rounded">{{ board.limitless ? 'done' : 'close' }}</span>자낳괴 옵션</button>
        <div class="setupHeader">기본 설정</div>
        <div class="setupTabs">
            <button class="tabButton" :class="{ tabSelected: state === 0 }" @click="state = 0">판때기</button>
            <button class="tabButton" :class="{ tabSelected: state === 1 }" @click="state = 1">황금열쇠</button>
            <button class="tabButton" :class="{ tabSelected: state === 2 }" @click="state = 2">기타 설정</button>
        </div>
        <div class="setupBody">
            <div class="setup-board" v-show="state === 0">
                <p class="setup-comment">
                    Enter로 주제를 추가합니다. Ctrl+Enter를 누르면 대주제를 복제하고, Shift+Enter를 누르면 윗 줄로 돌아갑니다.
                </p>
                <BlocksList :list="options.themes" @addtheme="addTheme" @removetheme="removeTheme" />
            </div>
            <div class="setup-goldenkey" v-show="state === 1">
                <div class="goldenkeyList">
                    <KeysList :list="keyLogs" :selected="logSelected" @loadkeys="loadKey" @deletekeys="deleteKey" />
                </div>
                <div class="goldenkeyList">
                    <DefaultKeys v-if="logSelected === 0" :list="options.defaultKeys" @addkey="addKey" @removekey="removeKey" />
                    <CustomKeys v-else :list="customKeys" />
                </div>
            </div>
            <dl class="setup-options" v-show="state === 2">
                <div :class="{ disabled: controlLevel < 4 }">
                    <dt>자동 장면 전환 사용</dt>
                    <dd>
                        <input type="checkbox" v-model="options.useSceneSwitching" />
                    </dd>
                    <div :class="{ disabled: !options.useSceneSwitching }" v-if="controlLevel >= 4">
                        <dt>전환할 장면</dt>
                        <dd>
                            <select v-model="options.scenePlaying" size="5" multiple>
                                <option disabled>플레이 중일 때: Ctrl 키로 다중 선택</option>
                                <option value="">(전환하지 않음)</option>
                                <option v-if="scenes" v-for="scene in scenes" :value="scene">{{ scene }}</option>
                            </select>

                            <select v-model="options.sceneNotPlaying" size="5">
                                <option disabled>플레이 중이 아닐 때:</option>
                                <option value="">(전환하지 않음)</option>
                                <option v-if="scenes" v-for="scene in scenes" :value="scene">{{ scene }}</option>
                            </select>
                        </dd>
                    </div>
                </div>
                <p class="setup-comment" v-if="controlLevel < 0">
                    해당 기능은 OBS에서만 쓸 수 있습니다.
                </p>
                <p class="setup-comment" v-else-if="controlLevel < 4">
                    해당 기능은 OBS의 브라우저 소스 속성 맨 아래의 <b>페이지 권한</b>이 <b>고급 접근 권한</b> 이상이여야 사용 가능합니다!
                </p>
                <hr />
                <dt>트위치 ID</dt>
                <dd>https://twitch.tv/
                    <input type="text" class="toonationPassword" v-model="options.channel">
                </dd>
                <dt>투네이션 통합 위젯 비밀키</dt>
                <dd>https://toon.at/widget/alertbox/
                    <input type="password" class="toonationPassword" v-model="options.password">
                </dd>
            </dl>
        </div>
        <div class="setupFooter">
            <button class="footButton" @click="options.save()">저장</button>
            <button class="footButton" @click="fillGoldenKey()">황금열쇠 적용</button>
        </div>
    </div>
</template>

<script lang="ts">
import type { KeyDefinition } from '../stores/OptionsStore'

import BlocksList from './BlocksList.vue'
import KeysList from './KeysList.vue'
import DefaultKeys from './DefaultKeys.vue'
import CustomKeys from './CustomKeys.vue'

import * as LocalForage from 'localforage'
import { useWheelStore } from '../stores/WheelStore'
import { useBoardStore } from '../stores/BoardStore'
import { useOptionsStore } from '../stores/OptionsStore'
import { DateTime } from 'luxon'

export default {
    props: {
        show: Boolean
    },
    data() {
        return {
            // tabs
            states: ['판때기', '황금열쇠', '투네이션'],
            state: 0,

            // board

            // goldenkeys
            keyLogs: ["기본 설정"],
            keyFiles: [] as string[],
            logSelected: 0,
            customKeys: [] as KeyDefinition[],

            // toonation
            warning: false,

            // obs
            controlLevel: -1 as OBSControlLevel | -1, // 4 required for scene switching
            scenes: null as string[] | null,

            // store
            wheel: useWheelStore(),
            board: useBoardStore(),
            options: useOptionsStore()
        }
    },
    components: {
        DefaultKeys,
        CustomKeys,
        KeysList,
        BlocksList
    },
    methods: {
        // themes
        addTheme(index: number) {
            this.options.themes.splice(index + 1, 0, { head: "", tail: "" })
        },
        removeTheme(index: number) {
            this.options.themes.splice(index, 1)
        },

        // goldenkeys
        addKey(index: number) {
            this.options.defaultKeys.splice(index + 1, 0, { key: "", count: 1 })
        },
        removeKey(index: number) {
            this.options.defaultKeys.splice(index, 1)
        },
        loadKey(index: number) {
            this.logSelected = index
            if (this.logSelected !== 0) {
                LocalForage.getItem(this.keyFiles[index - 1]).then(value => {
                    if (value) {
                        this.customKeys = value as { key: string, count: number }[]
                    }
                })
            }
        },
        deleteKey(index: number) {
            LocalForage.removeItem(this.keyFiles[index - 1])
            this.keyFiles.splice(index - 1, 1)
            this.keyLogs.splice(index, 1)
            this.logSelected = index - 1
        },

        // saving
        async saveAll() {
            this.options.save()

            if (this.options.themes.length < 14) {
                window.alert('오류: 판때기의 주제가 최소 14개 있어야 정상작동합니다.')
            }
        },
        fillGoldenKey() {
            if (!this.board.started) {
                if (this.logSelected === 0) {
                    this.wheel.fill(this.options.defaultKeys)
                } else {
                    this.wheel.fill(this.customKeys)
                }
            }
        }
    },
    mounted() {
        LocalForage.keys().then(list => {
            list.forEach(x => {
                if (x.includes("wheel")) {
                    this.keyLogs.push(DateTime.fromISO(x.slice(6)).toLocaleString(DateTime.DATETIME_FULL))
                    this.keyFiles.push(x)
                }
            })
        })

        window.obsstudio?.getControlLevel((level: OBSControlLevel) => {
            this.controlLevel = level
        })
        window.obsstudio?.getScenes((scenes: string[]) => {
            this.scenes = scenes
        })
    }
}
</script>

<style lang="scss">

.setupContainer {
    position: relative;

    // decoration
    background-color: rgba(0, 255, 255, 0.8);

    .setupHeader {
        font: bold 32px sans-serif;
        text-align: center;
    }

    .setupTabs {
        display: flex;
        justify-content: center;
        margin: 8px;
        gap: 12px;

        .tabButton {
            font-size: 16px;
            padding: 12px 8px;
            border: none;
            border-radius: 8px;
            background-color: transparent;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: cyan;
            }
        }

        .tabSelected {
            background-color: rgba(0, 255, 0, 0.8)
        }
    }

    .setupBody {
        height: 400px;
        padding-bottom: 8px;

        max-height: 100%;
        overflow-y: auto;

        .setup-goldenkey {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            column-gap: 8px;

            height: 100%;
            overflow: hidden;

            .goldenkeyList {
                display: flex;
                flex-direction: column;
                padding: 8px;
                row-gap: 8px;
                border-radius: 8px;
                background-color: rgba(0, 128, 90, 0.8);

                overflow: scroll;

                &::-webkit-scrollbar {
                    background: transparent;
                    width: 0px;
                    height: 0px;
                }
            }
        }

        .setup-options {
            display: grid;
            grid-template-columns: 240px auto;
            gap: 12px;

            input {
                font-size: 20px;
            }
            select {
                font-size: 18px;
            }
            input[type=text], input[type=password], select {
                padding: 8px;
                border: none;
                width: 400px;
            }
            input[type=checkbox] {
                width: 1em;
                height: 1em;
            }

            dt {
                user-select: none;
                text-align: right;
                opacity: inherit;

                line-height: 40px;
                font-weight: bold;
            }
            dd {
                opacity: inherit;
                margin: 0;
            }

            div {
                display: contents;
                &.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                    user-select: none;
                }
            }
            hr {
                grid-column: span 2;
            }
            .setup-comment {
                grid-column: 2 / -1;
                text-align: left;
                margin-top: 0;
                margin-bottom: 0;
            }
        }
    }

    .setup-comment {
        grid-column: 1 / -1;
        text-align: center;
    }

    .setupFooter {
        display: flex;
        justify-content: center;
        gap: 12px;

        .footButton {
            padding: 8px 12px;
            border: none;
            border-radius: 8px;
            background-color: rgba(255, 255, 0, 0.7);
            font-size: 16px;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: yellow;
            }
        }
    }

    .extra-button {
        display: flex;
        position: absolute;
        align-items: center;
        top: 16px;
        right: 20px;
        padding: 8px 12px;
        transition: all 0.2s ease-out;

        &.yes {
            background-color: rgba(green, 0.75);
            color: black;

            &:hover {
                background-color: green;
                color: white;
            }
        }

        &.no {
            background-color: rgba(red, 0.75);
            color: black;

            &:hover {
                background-color: red;
                color: white;
            }
        }
    }
}

</style>
