<template>
    <div class="logSlots">
        <div v-for="log in connection.output" :class="logConfig(log)">{{ logText(log) }}</div>
    </div>
</template>

<script lang="ts">
import { useConnectStore } from '../stores/ConnectStore';

export default {
    data() {
        return {
            connection: useConnectStore()
        }
    },
    methods: {
        logConfig(log: { type: number, positive: boolean, detail: string | null }) {
            return {
                "twitch-conn": log.type === 0 && log.positive === true,
                "twitch-disc": log.type === 0 && log.positive === false,
                "toon-conn": log.type === 1 && log.positive === true,
                "toon-disc": log.type === 1 && log.positive === false,
                "vote-succ": log.type === 2 && log.positive === true,
                "vote-fail": log.type === 2 && log.positive === false
            }
        },
        logText(log: { type: number, positive: boolean, detail: string | null }) {
            let output = ""
            switch (log.type) {
                case 0:
                    if (log.positive) output = "트위치 챗 연결됨!"
                    else output = "트위치 챗 연결중..."
                    break
                case 1:
                    if (log.positive) output = "투네이션 연결됨!"
                    else output = "투네이션 연결중..."
                    break
                case 2:
                    output = String(log.detail)
            }
            return output
        }
    }
}
</script>

<style lang="scss">
.logSlots {
    display: grid;
    grid-template-rows: repeat(10, 1fr);
    font-weight: bold;

    .twitch-conn {
        background-color: rgb(255, 0, 255);
        color: black;
    }

    .twitch-disc {
        background-color: rgb(102, 0, 102);
        color: white;
    }

    .toon-conn {
        background-color: rgb(157, 255, 0);
        color: black;
    }

    .toon-disc {
        background-color: rgb(81, 131, 0);
        color: white;
    }

    .vote-succ {
        background: blue;
        color: white;
    }

    .vote-fail {
        background-color: red;
        color: white;
    }
}
</style>