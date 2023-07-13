<template>
    <div :class="[ 'block', blockTypes ]">
        <!--number tags-->
        <header
            class="block-header"
            v-if="index !== 0 && index !== 13"
            :style="{ backgroundColor: fillColor }">
            <div class="block-number">{{ index }}</div>
        </header>

        <div class="block-prize">{{ board.getPrizeByIndex(index) }}<small>$</small></div>

        <!--start-->
        <div
            v-if="index === 0"
            style="width: 100%; height: 100%;"
            @click="ui.navigate(''); ui.switchScene(true)"
            @contextmenu.prevent="ui.navigate('raffle')">
        </div>

        <!--free-->
        <div
            v-else-if="index === 13"
            class="block-button centered"
            @click="ui.navigate('dice')">세계여행</div>

        <!--golden key-->
        <div
            v-else-if="board.isGoldenKey(index)"
            class="block-button centered"
            @click="ui.navigate('wheel')">황금열쇠</div>

        <!--islands-->
        <div
            v-else-if="index === 7 || index === 20"
            class="block-button centered"
            @click="ui.navigate('raffle', index)">{{ board.selectAll(index).length }}</div>

        <!--other blocks-->
        <template v-else>
            <div class="block-content">{{ theme }}</div>
            <div class="block-button centered" @click="ui.navigate('raffle', index)">{{ board.selectAll(index).length }}</div>
        </template>
    </div>
</template>

<script lang="ts">
import { useBoardStore } from '../../stores/BoardStore'
import { useUIStore } from '../../stores/UIStore'

const ISLAND_LABELS: { [key: string]: string } = {
    '출발': 'go',
    '세계여행': 'free',
    '디맥섬': 'djmax',
    '투온섬': 'ez2on',
    '식스타섬': 'mars',
    '뱅섬': 'circle',
    '프세카섬': 'truck',
    '아르케아섬': 'testify'
}

export default {
    props: {
        block: Object,
        index: {
            type: Number,
            required: true
        }
    },
    data: () => ({
        board: useBoardStore(),
        ui: useUIStore()
    }),
    computed: {
        theme() {
            return this.board.board[this.index]
        },
        blockTypes() {
            return {
                [ISLAND_LABELS[this.board.board[this.index]] ?? '']: true,

                top: 13 < this.index && this.index < 20,
                right: 20 < this.index && this.index < 26,
                bottom: 0 < this.index && this.index < 7,
                left: 7 < this.index && this.index < 13,
                corner: [0, 7, 13, 20].includes(this.index),

                golden: this.board.isGoldenKey(this.index),
                monopoly: this.board.isMonopoly(this.index)
            }
        },

        fillColor() {
            return this.board.getColor(this.theme)
        }
    }
}

</script>

<style lang="scss">
.block {
    display: flex;
    position: relative;

    background-color: #eee;
    border: 1px solid black;

    &.top { flex-direction: column-reverse; }
    &.bottom { flex-direction: column; }
    &.left { flex-direction: row-reverse; }

    &.top .block-prize { top: 0; left: 0; }
    &.right .block-prize { right: 0; top: 0; }
    &.bottom .block-prize { right: 0; bottom: 0; }
    &.left .block-prize { left: 0; bottom: 0; }
    &.top, &.right {
        .block-prize {
            align-items: flex-start;
        }
        .block-header {
            justify-content: flex-end;
        }
    }
    &.top .block-content { margin-bottom: -1em; }
    &.bottom .block-content { margin-top: -1em; }

    &.left, &.right {
        .block-header {
            min-width: 2em;
            flex-direction: column;
        }
    }
    &.left .block-header {
        text-align: right;
    }
    &.corner .block-header {
        color: white;
        mix-blend-mode: exclusion;
    }
    &.corner, &.golden {
        .block-header {
            background: none !important;
            box-shadow: none;
        }
        .block-prize {
            display: none;
        }
    }
    &.djmax, &.circle, &.testify {
        flex-direction: row-reverse;

        .block-header {
            color: white;
            mix-blend-mode: unset;
            text-shadow: 0 0 0.5em #000, 0 0 0.5em #000, 0 0 0.5em #000;
        }
    }

    &.monopoly {
        background-color: #ff6;
        > .block-header {
            background-color: transparent !important;
        }
    }

    .block-header {
        display: flex;
        justify-content: space-between;

        // content
        font-family: var(--font-numeric);
        font-variant-numeric: lining-nums;
        font-weight: 700;
        font-size: 24px;
        line-height: 24px;
        padding: 8px 10px;

        // box-shadow: 0 0 0 2px black;
    }
    .block-prize {
        display: flex;
        align-items: baseline;
        position: absolute;
        padding: 0.5rem;

        font-size: 4em;
        font-weight: 200;
        line-height: 0.75em;

        opacity: 0.333;
        overflow: hidden;

        > small {
            display: inline-block;
            font-size: 0.5em;
            font-weight: 400;
            line-height: 1em;
        }
    }

    .block-content {
        display: flex;
        justify-content: center;
        align-items: center;

        flex-grow: 1;

        white-space: pre-wrap;
        text-align: center;
        font: 24px 'KBO-Dia-Gothic_bold', sans-serif;
    }

    .block-button {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0px;

        // content
        font-size: 40px;
        white-space: pre-wrap;

        // decoration
        background-color: transparent;
        color: transparent;
        border: none;
        transition: all 0.1s ease-out;

        user-select: none;

        &:hover {
            background-color: rgba(255, 255, 255, 0.7);
            color: black;
        }
    }
}

.not-started .block {
    filter: brightness(25%);

    .block-prize {
        display: none;
    }
}
</style>
