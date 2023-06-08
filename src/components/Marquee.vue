<template>
    <div ref="container" class="marqueeContainer">
        <div class="marquee">
            <div :class="{ partOne: isOverflown }">
                <span class="end">{{ text }}</span>
            </div>
            <div v-if="isOverflown" class="partTwo">
                <span class="end">{{ text }}</span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    props: {
        text: String
    },
    data() {
        return {
            isOverflown: false
        }
    },
    methods: {
        measure() {
            const container = this.$refs.container as HTMLDivElement
            return container.scrollWidth > container.clientWidth
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
.marqueeContainer {
    width: 100%;
    margin: 0px;
    padding: 0px;

    .marquee {
        position: relative;
        display: flex;

        .partOne {
            animation: marqueePartOne 10s linear infinite;
        }

        .partTwo {
            position: absolute;
            animation: marqueePartTwo 10s linear infinite;
        }

        .end {
            margin-right: 40px;
        }
    }
}

@keyframes marqueePartOne {
    0% { transform: translateX(0%) }
    100% { transform: translateX(-100%) }
}

@keyframes marqueePartTwo {
    0% { transform: translateX(100%) }
    100% { transform: translateX(0%) }
}
</style>