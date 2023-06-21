<template>
    <ul class="logSlots">
        <li
            v-for="log in logs"
            :class="[
                'type-' + log.type,
                'status-' + log.status
            ]">{{ logText(log) }}</li>
    </ul>
</template>

<script lang="ts">
import type { ConnectionLog, Log } from '../stores/ConnectStore';
import { useConnectStore } from '../stores/ConnectStore';

const CONNECTION_LABEL_MAP: { [key in ConnectionLog['type']]: string } = {
    twitch: '트위치',
    toonation: '투네이션'
}
const CONNECTION_STATUS_MAP: { [key in ConnectionLog['status']]: string } = {
    disconnected: '연결 끊김!',
    connecting: '연결 중…',
    connected: '연결됨!'
}

export default {
    props: {
        visibleCount: {
            type: Number,
            default: 10
        }
    },
    data() {
        return {
            connection: useConnectStore(),
        }
    },
    methods: {
        logText(log: Log) {
            if (log.type in CONNECTION_LABEL_MAP) {
                log = log as ConnectionLog
                return CONNECTION_LABEL_MAP[log.type] + ' ' + CONNECTION_STATUS_MAP[log.status]
            } else {
                return log.detail
            }
        }
    },
    computed: {
        logs() {
            return this.connection.logs.slice(-this.visibleCount)
        }
    }
}
</script>

<style lang="scss">
.logSlots {
    display: grid;
    grid-template-rows: repeat(10, 1fr);

    margin: 0;
    padding: 0;

    font-weight: 500;
    font-size: 18px;
    line-height: 24px;

    color: white;
    text-shadow: 0 0 0.25em #000, 0 0 0.5em #000, 0 0 0.5em #000;

    list-style: none;

    > li {
        display: flex;
        justify-content: flex-end;

        padding: 0 4px;
        background: linear-gradient(to left, var(--color) 32px, transparent 160px);

        white-space: nowrap;
        word-break: keep-all;
        text-overflow: clip;
        overflow: hidden;
    }

    .type {
        &-twitch, &-toonation {
            font-weight: 300;
            color: #fffc;
        }
        &-twitch {
            --color: #92f5;
        }
        &-toonation {
            --color: #29f7;
        }
        &-vote::after {
            display: inline-block;
            margin-left: 3px;
            font-family: 'Material Symbols Rounded';
            font-weight: 400;
            font-size: 16px;
            vertical-align: top;
        }
    }
    .status {
        &-accepted {
            --color: hsla(120, 80%, 50%, 0.5);
            &::after {
                content: 'done';
            }
        }
        &-cooldown {
            --color: hsla(32, 80%, 50%, 0.7);
            &::after {
                content: 'query_builder';
            }
        }
        &-rejected {
            --color: hsla(0, 80%, 50%, 0.6);
            &::after {
                content: 'block';
            }
        }
        &-failed {
            --color: hsla(0, 80%, 50%, 0.6);
            &::after {
                content: 'question_mark';
            }
        }
    }
}
</style>
