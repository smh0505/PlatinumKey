<template>
    <div class="diceContainer">
        <div class="diceResult" :style="config">
            <div v-for="r in result" @click="roll(buttonIdx)">{{ dices[tempIdx].faces[r] }}</div>
            <div class="doubleCount" @click="roll(buttonIdx)">{{ returnValue }}</div>
            <Transition name="diceFade">
                <div v-show="!isBegun" class="diceInit" @click="roll(buttonIdx)">클릭하여 시작!</div>
            </Transition>
        </div>
        <canvas id="dice-box" ref="rollCanvas" @click="roll(buttonIdx)"></canvas>
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
import { dices } from '../scripts/Dice'
import { useBoardStore } from '../stores/BoardStore';

let diceBox: any

function setDPI(canvas: HTMLCanvasElement, scaleFactor: number) {
    const rect = canvas.getBoundingClientRect()
    canvas.style.width = rect.width + "px"
    canvas.style.height = rect.height + "px"
    canvas.width = rect.width * scaleFactor
    canvas.height = rect.height * scaleFactor
}

export default {
    data: () => ({
        result: [] as number[],
        board: useBoardStore(),
        isBegun: false,

        buttonTypes: [
            '일반',   '저속', '후진', '열쇠',   '조커',
            '모서리', '고속', '전진', '막고라', '슈퍼랜덤'
        ],
        buttonIdx: 0,
        tempIdx: 0,
        dices: dices
    }),
    computed: {
        deviceScaleFactor() {
            return (window.devicePixelRatio || 1)
        },
        config() {
            return {
                "background-color": this.board.doubleCount < 3
                    ? "rgba(128, 128, 128, 0.5)"
                    : "rgba(255, 0, 0, 0.5)",
                "font-size": [3, 5, 8].includes(this.tempIdx) ? "92pt" : "120pt"
            }
        },
        returnValue() {
            if (this.buttonIdx === 0) return this.board.doubleCount.toString() + "회"
            if (this.buttonIdx === 9) return this.dices[this.tempIdx].name
            return this.dices[this.buttonIdx].name
        }
    },
    methods: {
        init() {
            const rollCanvas = this.$refs.rollCanvas as HTMLCanvasElement
            setDPI(rollCanvas, this.deviceScaleFactor)
            diceBox = new DiceBox("#dice-box", {
                assetPath: location.pathname + "/assets/",
                mass: 0.8,
                scale: 9,
                startingHeight: 5,
                spinForce: 7,
                throwForce: 8,
                lightIntensity: 2,
                friction: 0.5,
                onRollComplete: (r: any[]) => this.check(r),
            })

            diceBox.init()
                .then(() => diceBox.updateConfig({ theme: 'normal' }))
                .then(() => diceBox.updateConfig({ theme: 'primary' }))
                .then(() => diceBox.updateConfig({ theme: 'secondary' }))
                .then(() => diceBox.updateConfig({ theme: 'finally' }))
            this.isBegun = true
        },
        roll(index: number) {
            this.result = [] as number[]
            this.tempIdx = index < 9 ? index : Math.floor(Math.random() * 7) + 1
            if (this.board.doubleCount === 3) this.board.doubleCount = 0

            if (!diceBox) this.init()
            else diceBox.roll(this.dices[this.tempIdx].type, { theme: this.dices[this.tempIdx].theme })
        },
        check(r: any[]) {
            this.result = r[0].rolls.map((x: any) => x.value - 1)
            if (this.buttonIdx === 0) {
                this.board.isDouble = r[0].rolls[0].value === r[0].rolls[1].value
                this.board.doubleCount = this.board.isDouble ? this.board.doubleCount + 1 : 0
            }
        }
    }
}
</script>

<style lang="scss">
.diceContainer {
    width: 100%;
    height: 100%;

    .diceResult {
        display: flex;
        position: absolute;
        justify-content: space-evenly;
        align-items: center;

        width: 500px;
        height: 500px;

        font-weight: bold;
        -webkit-text-stroke-color: white;
        -webkit-text-stroke-width: 3px;

        div {
            z-index: 5;
            user-select: none;
        }

        .doubleCount {
            position: absolute;
            right: 16px;
            bottom: 0px;

            font-size: 48pt;
            font-weight: normal;
            font-style: italic;
            color: rgba(255, 255, 255, 0.9);

            -webkit-text-stroke-width: 0px;
        }

        .diceInit {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 500px;
            height: 500px;

            font-size: 48pt;
            -webkit-text-stroke-width: 1px;
            background-color: rgba(black, 0.5);
        }
    }

    #dice-box {
        display: flex;
        position: absolute;
        width: 500px;
        height: 500px;
    }

    .diceButtonGroup {
        display: grid;
        position: absolute;
        grid-template-columns: repeat(5, 1fr);
        grid-template-rows: repeat(2, 1fr);

        bottom: 8px;
        width: 500px;
        height: 80px;
        gap: 4px;

        .diceButton {
            background-color: black;
            color: white;
            transition: all 0.2s ease-out;

            &.isSelected, &:hover {
                background-color: white;
                color: black;
            }
        }
    }
}

.diceFade-enter-active,
.diceFade-leave-active {
    transition: opacity 0.3s ease;
}

.diceFade-enter-from,
.diceFade-leave-to {
    opacity: 0;
}
</style>
