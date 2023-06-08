<template>
    <div v-show="show" class="diceContainer">
        <iframe class="dice" src="https://shepherdingsheep.github.io/hdwv_2"></iframe>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        show: Boolean
    }
}
</script>

<style lang="scss">
.diceContainer {
    width: 500px;
    height: 100%;
    margin-inline: auto;

    .dice {
        width: 100%;
        height: 100%;
        border: none;
        scale: 90%;
    }
}
</style>