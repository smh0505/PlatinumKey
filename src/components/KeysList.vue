<template>
    <button class="logButton" v-for="(item, index) in list" 
        :class="{ logSelected: selected === index }" @click="$emit('loadkeys', index)" :key="index">
        <div>{{ item }}</div>
        <button v-if="selected === index && selected !== 0" class="removeButton" @click="$emit('deletekeys', index)">
            <span class="material-symbols-rounded">close</span>
        </button>
    </button>
</template>

<script lang="ts">
export default {
    props: {
        list: Array<string>,
        selected: Number
    },
    emits: ['loadkeys', 'deletekeys']
}
</script>

<style lang="scss">
.logButton {
    border: none;
    border-radius: 8px;
    padding: 8px;
    font-size: 16px;
    background-color: transparent;
    transition: all 0.2s ease-out;

    &:hover {
        background-color: white;
    }
}

.logSelected {
    background-color: rgba(88, 166, 255, 0.8);
    display: grid;
    grid-template-columns: 1fr 3rem;
    align-items: center;

    .removeButton {
        background-color: white;
        border: none;
        border-radius: 8px;
        transition: all 0.2s ease-out;

        &:hover {
            background-color: black;
            color: white;
        }
    }
}
</style>