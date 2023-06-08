<template>
    <div class="boardBlocks" v-for="(item, index) in list" :key="index">
        <input type="text" class="text-input" placeholder="대주제" v-model="item.head">
        <input type="text" class="text-input" placeholder="소주제" v-model="item.tail">
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
    emits: ['addtheme', 'removetheme']
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