<template>
    <div class="boardBlocks" v-for="(item, index) in list" :key="index">
        <input
            type="text"
            class="text-input"
            placeholder="대주제"
            v-model="item.head"
            ref="head"
            @keydown.enter="e => addItemByKeydown(e, 'head', index)">
        <input
            type="text"
            class="text-input"
            placeholder="소주제"
            v-model="item.tail"
            ref="tail"
            @keydown.enter="e => addItemByKeydown(e, 'tail', index)">
        <button class="button-input" @click="$emit('addtheme', index)">
            <span class="material-symbols-rounded">add</span>
        </button>
        <button class="button-input" @click="$emit('removetheme', index)" v-if="index !== 0">
            <span class="material-symbols-rounded">close</span>
        </button>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        list: Array<{ head: string, tail: string }>
    },
    emits: ['addtheme', 'removetheme'],
    methods: {
        addItemByKeydown(event: KeyboardEvent, position: string, index: number) {
            const ctrlPressed = event.ctrlKey || event.metaKey

            if (event.shiftKey) {
                this.$refs[position][index - 1].focus()
                return
            } else if (!ctrlPressed && this.list[index + 1]) {
                this.$refs[position][index + 1].focus()
                return
            }

            this.$emit('addtheme', index)
            this.$nextTick(() => {
                if (ctrlPressed)
                    this.list[index + 1].head = this.list[index].head

                if (ctrlPressed && position === 'tail')
                    this.$refs.tail[index + 1].focus()
                else
                    this.$refs.head[index + 1].focus()
            })
        }
    }
}
</script>

<style lang="scss">
.boardBlocks {
    display: grid;
    grid-template-columns: 1fr 1fr 3rem 3rem;
    margin-block: 8px;
    column-gap: 8px;

    .text-input {
        padding: 8px;
        border: none;
        border-radius: 8px;
    }

    .button-input {
        border: none;
        border-radius: 8px;
        background-color: rgba(212, 0, 255, 0.75);
        color: white;
        transition: all 0.2s ease-out;

        &:hover {
            background-color: rgb(212, 0, 255)
        }
    }
}
</style>
