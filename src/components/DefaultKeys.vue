<template>
    <div class="defaultKey" v-for="(item, index) in list" :key="index">
        <input type="text" class="text-input" v-model="item.key">
        <input type="number" class="text-input" v-model="item.count" min="1">
        <button class="button-input" @click="$emit('addkey', index)">
            <span class="material-symbols-rounded">add</span>
        </button>
        <button class="button-input" @click="$emit('removekey', index)" v-if="index !== 0">
            <span class="material-symbols-rounded">close</span>
        </button>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        list: Array<{ key: string, count: number }>
    },
    emits: ['addkey', 'removekey']
}
</script>

<style lang="scss">
.defaultKey {
    display: grid;
    grid-template-columns: 1fr 6rem 3rem 3rem;
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