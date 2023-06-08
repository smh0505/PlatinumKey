<template>
    <div ref="container" class="scrollContainer">
        <div class="scroll">
            <div :class="{ partOne: isOverflown }">
                <span v-for="item in list">{{ item }}<br></span>
            </div>
            <div v-if="isOverflown" class="partTwo">
                <span v-for="item in list">{{ item }}<br></span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        list: Array
    },
    data() {
        return {
            isOverflown: false
        }
    },
    methods: {
        measure() {
            const container = this.$refs.container as HTMLDivElement
            return container.scrollHeight > container.clientHeight
        }
    },
    mounted() {
        this.isOverflown = this.measure()
    },
    updated() {
        this.isOverflown = this.measure()
    }
}
</script>

<style lang="scss">
.scrollContainer {
    height: 100%;
    margin: 0px;
    padding: 0px;

    .scroll {
        position: relative;
        display: flex;

        .partOne {
            animation: scrollPartOne 10s linear infinite;
        }

        .partTwo {
            position: absolute;
            animation: scrollPartTwo 10s linear infinite;
        }
    }
}

@keyframes scrollPartOne {
    0% { transform: translateY(0%) }
    100% { transform: translateY(-100%) }
}

@keyframes scrollPartTwo {
    0% { transform: translateY(100%) }
    100% { transform: translateY(0%) }
}
</style>