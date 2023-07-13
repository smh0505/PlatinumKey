<template>
    <PageBase class="start-goldenkey" title="황금열쇠 선택">

        <ul class="start-menu">
            <li
                :class="{ selected: selectedKey == null }"
                @click="selectedKey = null">
                <label>기본 설정</label>
            </li>
            <li
                v-for="[key, _] of history"
                :class="{ selected: selectedKey == key }">
                <label @click="selectedKey = key"> {{ formatTime(key) }} </label>
                <button @click="wheel.deleteHistory(key)"><span class="material-icons-outlined">close</span></button>
            </li>
        </ul>

        <main>
            <KeyList
                :list="currentWheel"
                :editable="selectedKey == null"
                @add="addKey"
                @remove="removeKey"></KeyList>
        </main>

        <template v-slot:buttons>
            <button @click="beginGame(false)"> 황금열쇠 없이 계속 </button>
            <button @click="beginGame(true)" class="success"> 게임 시작 </button>
        </template>
    </PageBase>
</template>

<script lang="ts">
import { DateTime } from 'luxon'

import { useBoardStore } from '../../stores/BoardStore'
import { useConnectStore } from '../../stores/ConnectStore'
import { useOptionsStore } from '../../stores/OptionsStore'
import { useUIStore } from '../../stores/UIStore'
import { useWheelStore } from '../../stores/WheelStore'

import KeyList from './KeyList.vue'
import PageBase from './PageBase.vue'

export default {
    components: {
        KeyList,
        PageBase
    },
    data: () => ({
        board: useBoardStore(),
        options: useOptionsStore(),
        wheel: useWheelStore(),
        connect: useConnectStore(),
        ui: useUIStore(),

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
            this.ui.navigate("")
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
            return DateTime.fromISO(ts).toFormat('yyyy/MM/dd　HH:mm:ss')
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

@import '../../styles/mixin';

.start-goldenkey {
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
