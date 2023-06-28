<template>
    <div class="diceContainer">
        <iframe class="dice" src="https://shepherdingsheep.github.io/hdwv_2"></iframe>
    </div>
</template>

<script lang="ts">
export default {
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
        transform: scale(0.9);
        vertical-align: top;
    }
}
</style>
