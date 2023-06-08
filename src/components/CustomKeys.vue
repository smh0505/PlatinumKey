<template>
    <div class="customKey" v-for="item in list">
        <div>{{ item.key }}</div>
        <div>x {{ item.count }}</div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        list: Array<{ key: string, count: number }>
    }
}
</script>

<style lang="scss">
.customKey {
    display: grid;
    grid-template-columns: 1fr 6rem;
    padding: 8px;
    column-gap: 8px;
    border-radius: 8px;
    background-color: white;
}
</style>