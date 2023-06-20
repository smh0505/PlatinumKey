<template>
    <div class="inv-container">
        <LogList></LogList>
        <Items></Items>
    </div>
</template>

<script lang="ts">
import Items from './Items.vue';
import LogList from './LogList.vue';

export default {
    components: {
        Items, LogList
    }
}
</script>

<style lang="scss">
.inv-container {
    display: grid;
    grid-template-columns: 1fr 2fr;

    margin: 6px;
    gap: 4px;
    height: 240px;
}
</style>
