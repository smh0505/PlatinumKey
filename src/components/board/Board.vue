<template>
    <main class="board">
        <div class="center">
            <slot></slot>
        </div>

        <Block
            v-for="index in 26"
            :index="index - 1"
            :style="{ gridArea: '_' + (index - 1) }">
        </Block>
    </main>
</template>

<script lang="ts">
import Block from './Block.vue'

export default {
    components: {
        Block
    },
    methods: {
        //
    }
}
</script>

<style lang="scss">
.board {
    display: grid;
    height: 100vh;

    // grid
    grid-template-columns: 320px repeat(6, 1fr) 320px;
    grid-template-rows: 180px repeat(5, 1fr) 180px;

    grid-template-areas:
        "_13 _14 _15 _16 _17 _18 _19 _20"
        "_12 __  __  __  __  __  __  _21"
        "_11 __  __  __  __  __  __  _22"
        "_10 __  __  __  __  __  __  _23"
        "_9  __  __  __  __  __  __  _24"
        "_8  __  __  __  __  __  __  _25"
        "_7  _6  _5  _4  _3  _2  _1  _0";

    // decoration
    box-shadow: 0 0 0 2px #000 inset;
    // background-color: lightgray;

    .left-panel, .right-panel {
        height: 100%;
        overflow: auto;
    }
}
</style>
