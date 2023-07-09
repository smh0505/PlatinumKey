<template>
    <div class="boardBlocks" v-for="(item, index) in list" :key="index">
        <input
            type="text"
            class="text-input"
            placeholder="대주제"
            v-model="item.head"
            ref="head"
            @keypress.enter="e => addItemByKeydown(e, 'head', index)">
        <input
            type="text"
            class="text-input"
            placeholder="소주제"
            v-model="item.tail"
            ref="tail"
            @keypress.enter="e => addItemByKeydown(e, 'tail', index)">
        <button class="button-input" @click="$emit('add', index)">
            <span class="material-symbols-rounded">add</span>
        </button>
        <button class="button-input" @click="$emit('remove', index)" v-if="index !== 0">
            <span class="material-symbols-rounded">close</span>
        </button>
    </div>
</template>

<script lang="ts">
import type { ThemeDefinition } from '../../stores/OptionsStore'

export default {
    props: {
        list: Array<ThemeDefinition>
    },
    emits: ['add', 'remove'],
    methods: {
        addItemByKeydown(event: KeyboardEvent, position: 'head' | 'tail', index: number) {
            const ctrlPressed = event.ctrlKey || event.metaKey

            if (event.shiftKey) {
                this.focus(position, index, -1)
                return
            } else if (!ctrlPressed && this.list?.[index + 1]) {
                this.focus(position, index, +1)
                return
            }

            this.$emit('add', index)
            this.$nextTick(() => {
                if (!this.list) return
                if (ctrlPressed) {
                    this.list[index + 1].head = this.list[index].head
                    this.focus(position, index, +1)
                } else {
                    this.focus('head', index, +1)
                }
            })
        },
        focus(position: 'head' | 'tail', index: number, offset: number) {
            const refs = {
                head: this.$refs.head as HTMLInputElement[],
                tail: this.$refs.tail as HTMLInputElement[]
            }

            refs[position][index + offset].focus()
        },
    }
}
</script>

<style lang="scss">
</style>
