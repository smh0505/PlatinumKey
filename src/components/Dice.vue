<template>
    <div class="diceContainer">
        <div id="dice-box" @click="roll"></div>
        <div class="dice-result"></div>
    </div>
</template>

<script lang="ts">
// @ts-ignore
import DiceBox from '@3d-dice/dice-box'

let diceBox: any;

export default {
    data() {
        return {
            result: 0
        }
    },
    methods: {
        roll() {
            if (!diceBox) {
                diceBox = new DiceBox("#dice-box", {
                    assetPath: "/assets/",
                    mass: 0.8,
                    scale: 9,
                    spinForce: 8,
                    throwForce: 10
                })
                diceBox.init()
                    .then(() => diceBox.roll('2d4'))
                    .then((r: any) => console.log(this.check(r)))
            }
            else diceBox.roll('2d4')
                .then((r: any) => console.log(this.check(r)))
        },
        check(r: any) {
            this.result = r[0].value + r[1].value
            return r[0].value === r[1].value
        }
    }
}
</script>

<style lang="scss">
.diceContainer {
    display: flex;
    justify-content: center;
    width: 100%;
    height: 100%;

    #dice-box {
        display: flex;
        width: 100%;
        height: 320px;
    }

    .dice-result {
        display: flex;
        position: absolute;
        top: 80px;
        z-index: -10;

        background-color: rgba(128, 128, 128, 0.5);
        width: 300px;
        height: 200px;
    }
}
</style>
