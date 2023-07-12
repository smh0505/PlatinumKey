<template>
    <ul class="start-menu setup-menu">
        <li
            :class="{ selected: currentTab === 'plate' }"
            @click="currentTab = 'plate'">
            <label>판때기 구성</label>
        </li>
        <li
            :class="{ selected: currentTab === 'misc' }"
            @click="currentTab = 'misc'">
            <label>일반 설정</label>
        </li>
        <li @click="board.limitless = !board.limitless" style="margin-left: auto;">
            <label>
                <span class="material-symbols-rounded">{{ board.limitless ? 'done' : 'close' }}</span>
                나는 자낳괴입니다
            </label>
        </li>
        <li class="save success" @click="saveAll">
            저장
        </li>
    </ul>

    <main class="setup-main" v-if="currentTab === 'plate'">
        <p class="setup-comment">
            Enter로 주제를 추가합니다. Ctrl+Enter를 누르면 대주제를 복제하고, Shift+Enter를 누르면 윗 줄로 돌아갑니다.
        </p>
        <BlocksList :list="options.themes" @add="addTheme" @remove="removeTheme" />
    </main>

    <main class="setup-main" v-if="currentTab === 'misc'">
        <dl class="setup-options">
            <dt>자동 장면 전환 사용</dt>
            <dd :class="{ disabled: controlLevel < 4 }">
                <input type="checkbox" v-model="options.useSceneSwitching" />
            </dd>
            <template v-if="controlLevel >= 4">
                <dt>전환할 장면</dt>
                <dd :class="{ disabled: !options.useSceneSwitching }">
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
            </template>

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
    </main>
</template>

<script lang="ts">
import BlocksList from './BlocksList.vue'

import { useWheelStore } from '../../stores/WheelStore'
import { useBoardStore } from '../../stores/BoardStore'
import { useOptionsStore } from '../../stores/OptionsStore'

export default {
    props: {
        show: Boolean
    },
    components: {
        BlocksList
    },
    data() {
        return {
            // tabs
            currentTab: 'plate',

            // obs
            controlLevel: -1 as OBSControlLevel | -1, // 4 required for scene switching
            scenes: null as string[] | null,

            // store
            wheel: useWheelStore(),
            board: useBoardStore(),
            options: useOptionsStore()
        }
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

@import '../../styles/mixin';

.setup-standalone {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    width: calc(100% + 8px);
    height: calc(100% + 8px);

    margin: -8px 0 0 -8px;
    padding: 8px 0 0 8px;
    overflow: none;

    .start-menu {
        display: flex;
        gap: 0.25rem;

        margin: 0;
        padding: 0;

        font-size: 1.25rem;
        color: white;

        > li {
            @include button;

            margin: 0;
            padding: 0 1rem;

            list-style: none;
            background-color: #000c;

            line-height: 2em;

            .material-symbols-rounded {
                vertical-align: -0.3rem;
            }
        }
    }

    main {
        color: #fff;
        background: #000c;
        border: 1px solid #fff9;

        min-width: 0;
        flex-grow: 1;
        padding: 0.5rem 1rem;
        overflow-y: auto;
    }
}

.setup-main {
    input, button, select {
        @include button;
        padding: 0.5rem;
        line-height: 1.5em;
    }
    .boardBlocks {
        display: grid;
        grid-template-columns: 1fr 1fr 2.75rem 2.75rem;
        gap: 0.25rem;
        margin: 0.25rem 0;
    }
}
.setup-options {
    display: grid;
    grid-template-columns: max-content 6fr;
    gap: 0.5rem 1rem;

    line-height: 2.5em;

    dt, dd {
        display: flex;
        margin: 0;
    }
    dd {
        > input[type=text], > input[type=password], > select {
            flex-grow: 1;
        }
    }
    > hr {
        width: 100%;
        grid-column: 1 / span 2;
    }
}

</style>
