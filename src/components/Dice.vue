<template>
    <div class="diceContainer">
        <div id="dice-box" @click="roll"></div>
        <div class="diceButtonGroup">
            <button v-for="(button, index) in buttonTypes"
                    class="diceButton"
                    :class="{ isSelected: buttonIdx === index}"
                    @keydown.prevent
                    @click="buttonIdx = index">{{ button }}</button>
        </div>
    </div>
</template>

<script lang="ts">
// @ts-ignore
import DiceBox from '@3d-dice/dice-box'

let diceBox: any;

export default {
    data: () => ({
        result: [] as string[],
        doubleCount: 0,

        buttonTypes: [
            '일반',   '저속', '후진', '열쇠',   '조커',
            '모서리', '고속', '전진', '막고라', '슈퍼랜덤'
        ],
        buttonIdx: 0
    }),
    methods: {
        config(buttonType: string, buttonIdx: number) {
            return {
                [buttonType]: true,
                isSelected: this.buttonIdx === buttonIdx
            }
        },
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
                    .then((r: any) => this.check(r))
            }
            else diceBox.roll('2d4')
                .then((r: any[]) => this.check(r))
        },
        check(r: any[]) {
            this.result = r.map((x: any) => x.value)
            if (r.length === 2 && r[0].value === r[1].value) {
                this.doubleCount += 1
            } else this.doubleCount = 0
            console.log(this.result)
        }
    }
}
</script>

<style lang="scss">
.diceContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;

    #dice-box {
        display: flex;
        width: 640px;
        height: 320px;
        background-color: rgba(128, 128, 128, 0.5);
    }

    .diceButtonGroup {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(2, 1fr);

        width: 640px;
        height: 80px;
        margin-top: 4px;
        gap: 4px;

        .diceButton {
            background-color: black;
            color: white;
            transition: all 0.2s ease-out;

            &.isSelected {
                background-color: white;
                color: black;
            }

            &:hover {
                background-color: white;
                color: black;
            }
        }
    }
}
</style>
