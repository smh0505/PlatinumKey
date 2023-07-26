<template>
    <ul :class="['goldenkey-list', { 'goldenkey-list-editable': editable }]">
        <li v-for="(key, index) in list" :key="index">
            <input type="text" v-model="key.key" :disabled="!editable" ref="fields" @keypress.enter="e => enter(e, index)" />
            <input type="number" v-model="key.count" min="1" :disabled="!editable" @keypress.enter="e => enter(e, index)" />
            <button @click="$emit('remove', index)" v-if="editable">
                <span class="material-icons-outlined">close</span>
            </button>
        </li>
        <li class="goldenkey-list-last" v-if="editable">
            <label class="goldenkey-list-last-label" for="goldenkey-list-last-add">
                Enter를 눌러 추가…
            </label>
            <button @click="$emit('add', list.length - 1)" id="goldenkey-list-last-add">
                <span class="material-icons-outlined">add</span>
            </button>
        </li>
    </ul>
</template>

<script lang="ts">
import type { GoldenKeyDefinition } from '../../stores/WheelStore';

export default {
    props: {
        editable: Boolean,
        list: {
            type: Array<GoldenKeyDefinition>,
            default: []
        }
    },
    emits: ['add', 'remove'],
    methods: {
        enter(event: KeyboardEvent, index: number) {
            console.log('keypress.enter at', index)
            if (event.shiftKey) {
                this.focus(index, -1)
            } else if (this.list.length < (index + 1)) {
                this.focus(index, +1)
            } else {
                this.$emit('add', index)
                this.$nextTick(() => {
                    this.focus(index, +1)
                })
            }
        },
        focus(index: number, offset: number) {
            (this.$refs.fields as HTMLInputElement[])[index + offset].focus()
        },
    },
    watch: {
        list(to) {
            console.log(JSON.parse(JSON.stringify(to)))
        }
    }
}
</script>

<style lang="scss">

.goldenkey-list {
    margin: 0;
    padding: 1em;

    > li {
        display: grid;
        gap: 0.25rem;
        grid-template-columns: 4fr 6rem min-content;

        margin: 0.25rem 0;
    }
    &-last-label {
        grid-column: 1 / 2 span;
        text-indent: 0.5rem;
    }
}

</style>
