<template>
    <transition name="modal">
        <div v-if="show" class="setupMask">
            <div class="setupContainer">
                <div class="setupHeader">기본 설정</div>
                <div class="setupTabs">
                    <button class="tabButton" :class="{ tabSelected: state === 0 }" @click="state = 0">판때기</button>
                    <button class="tabButton" :class="{ tabSelected: state === 1 }" @click="state = 1">황금열쇠</button>
                    <button class="tabButton" :class="{ tabSelected: state === 2 }" @click="state = 2">투네이션</button>
                </div>
                <div class="setupBody">
                    <div class="setup-board" v-show="state === 0">
                        <BlocksList :list="themes" @addtheme="addTheme" @removetheme="removeTheme" />
                    </div>
                    <div class="setup-goldenkey" v-show="state === 1">
                        <div class="goldenkeyList">
                            <KeysList :list="keyLogs" :selected="logSelected" @loadkeys="loadKey" @deletekeys="deleteKey" />
                        </div>
                        <div class="goldenkeyList">
                            <DefaultKeys v-if="logSelected === 0" :list="defaultKeys" @addkey="addKey" @removekey="removeKey" />
                            <CustomKeys v-else :list="customKeys" />
                        </div>
                    </div>
                    <div class="setup-toonation" v-show="state === 2">
                        <div class="toonationLabel">투네이션 통합 위젯 비밀키</div>
                        <div class="toonationInput">https://toon.at/widget/alertbox/ 
                            <input type="password" class="toonationPassword" v-model="password">
                        </div>
                    </div>
                </div>
                <div class="setupFooter">
                    <button class="footButton" @click="saveAll()">시작하기</button>
                </div>
            </div>
        </div>
    </transition>
</template>

<script lang="ts">
import BlocksList from './BlocksList.vue'
import KeysList from './KeysList.vue'
import DefaultKeys from './DefaultKeys.vue'
import CustomKeys from './CustomKeys.vue'

import * as LocalForage from 'localforage'
import { useWheelStore } from '../stores/WheelStore'
import { DateTime } from 'luxon'

export default {
    props: {
        show: Boolean,
        hasBegun: Boolean
    },
    data() {
        return {
            // tabs
            states: ['판때기', '황금열쇠', '투네이션'],
            state: 0,

            // board
            themes: [{ head: "", tail: "" }],

            // goldenkeys
            keyLogs: ["기본 설정"],
            keyFiles: [] as string[],
            logSelected: 0,
            defaultKeys: [{ key: "", count: 1 }],
            customKeys: [] as { key: string, count: number }[],

            // toonation
            password: "",
            warning: false,

            // store
            wheel: useWheelStore()
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
            this.themes.splice(index + 1, 0, { head: "", tail: "" })
        },
        removeTheme(index: number) {
            this.themes.splice(index, 1)
        },

        // goldenkeys
        addKey(index: number) {
            this.defaultKeys.splice(index + 1, 0, { key: "", count: 1 })
        },
        removeKey(index: number) {
            this.defaultKeys.splice(index, 1)
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
        saveAll() {
            if (this.themes.length < 14) {
                window.alert('오류: 판때기의 주제가 최소 14개 있어야 정상작동합니다.')
            } else {
                fetch("https://corsproxy.io/?https://toon.at/widget/alertbox/" + this.password)
                    .then(response => response.text())
                    .then(text => this.parse(text))
            }
        },
        parse(data: string) {
            const regex = /"payload":"(?<payload>\w+)"/
            const payload = data.match(regex)?.groups?.payload
            if (payload) {
                LocalForage.setItem('themes', JSON.parse(JSON.stringify(this.themes)))
                LocalForage.setItem('items', JSON.parse(JSON.stringify(this.defaultKeys)))
                LocalForage.setItem('toonation', this.password)

                this.return()
                this.$emit('close', payload)
            } else {
                window.alert("오류: Payload를 불러오지 못했습니다.\n비밀키를 다시 확인해주세요.")
            }
        },
        return() {
            if (!this.hasBegun) {
                if (this.logSelected === 0) {
                    this.wheel.fill(this.defaultKeys)
                } else {
                    this.wheel.fill(this.customKeys)
                }
            }
        }
    },
    mounted() {
        LocalForage.getItem('themes').then(value => {
            if (value !== null) {
                const themes = value as { head: string, tail: string }[]
                this.themes.splice(0, 1)
                themes.forEach(x => this.themes.push(x))
            }
        })
        LocalForage.getItem('items').then(value => {
            if (value !== null) {
                const items = value as { key: string, count: number }[]
                this.defaultKeys.splice(0, 1)
                items.forEach(x => this.defaultKeys.push(x))
            }
        })
        LocalForage.getItem('toonation').then(value => {
            if (value !== null) {
                const password = value as string
                this.password = password
            }
        })
        LocalForage.keys().then(list => {
            list.forEach(x => {
                if (x.includes("wheel")) {
                    this.keyLogs.push(DateTime.fromISO(x.slice(6)).toLocaleString(DateTime.DATETIME_FULL))
                    this.keyFiles.push(x)
                }
            })
        })
    }
}
</script>

<style lang="scss">
.setupMask {
    display: flex;
    position: fixed;

    // position
    top: 0;
    left: 0;
    z-index: 50;

    // size
    width: 100%;
    height: 100%;

    // decoration
    background-color: rgba(0, 0, 0, 0.7);
    transition: opacity 0.2s ease;

    .setupContainer {
        width: 65%;
        margin: auto;
        padding: 28px 20px;

        // decoration
        background-color: rgba(0, 255, 255, 0.8);
        box-shadow: 12px 9px 29px 0px rgba(0, 0, 0, 0.75);
        border-radius: 8px;
        transition: all 0.2s ease;

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

            .setup-board {
                max-height: 100%;
                overflow: scroll;

                &::-webkit-scrollbar {
                    background: transparent;
                    width: 0px;
                    height: 0px;
                }
            }

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

            .setup-toonation {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;

                .toonationLabel {
                    font: bold 20px sans-serif;
                }

                .toonationInput {
                    font-size: 20px;
                }

                .toonationPassword {
                    font-size: 20px;
                    padding: 8px;
                    border: none;
                    border-radius: 8px;
                    width: 400px;
                }
            }
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