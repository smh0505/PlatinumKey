<template>
    <div class="setupContainer">
        <button class="extra-button" @keydown.prevent @click="board.limitless = !board.limitless"
            :class="{ yes: board.limitless, no: !board.limitless }">
            <span class="material-symbols-rounded">{{ board.limitless ? 'done' : 'close' }}</span>자낳괴 옵션</button>
        <div class="setupHeader">기본 설정</div>
        <div class="setupTabs">
            <button class="tabButton" :class="{ tabSelected: state === 0 }" @click="state = 0">판때기</button>
            <button class="tabButton" :class="{ tabSelected: state === 1 }" @click="state = 1">기타 설정</button>
        </div>
        <div class="setupBody">
            <div class="setup-board" v-show="state === 0">
                <p class="setup-comment">
                    Enter로 주제를 추가합니다. Ctrl+Enter를 누르면 대주제를 복제하고, Shift+Enter를 누르면 윗 줄로 돌아갑니다.
                </p>
                <BlocksList :list="options.themes" @add="addTheme" @remove="removeTheme" />
            </div>
            <dl class="setup-options" v-show="state === 1">
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
        </div>
    </div>
</template>

<script lang="ts">
import type { KeyDefinition } from '../../stores/OptionsStore'

import BlocksList from './BlocksList.vue'
import KeysList from './KeysList.vue'

import { useWheelStore } from '../../stores/WheelStore'
import { useBoardStore } from '../../stores/BoardStore'
import { useOptionsStore } from '../../stores/OptionsStore'

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
        // saving
        async saveAll() {
            this.options.save()
        }
    },
    mounted() {
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


</style>
