<template>
    <div class="inv-bg">
        <div class="inv-empty" v-if="inventory.items.length === 0">비었음!</div>
        <div class="inv-items" v-else>
            <div v-for="(item, index) in inventory.items" class="row-item">
                <div class="item-count" :class="typeConfig(index)">{{ item.count }}</div>
                <div class="item-name" :key="index"><Marquee :text="item.key"></Marquee></div>
                <div class="item-buttons">
                    <div>
                        <button @click="inventory.addOne(index)">
                            <span class="material-icons-outlined">add</span>
                        </button>
                        <button @click="inventory.subOne(index)">
                            <span class="material-icons-outlined">remove</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <button class="manual-button" @click="manualAdd">수기입력</button>
    </div>
</template>

<script lang="ts">
import { useItemStore } from '../stores/ItemStore';
import Marquee from './Marquee.vue';
import * as LocalForage from 'localforage'

export default {
    data() {
        return {
            inventory: useItemStore(),
        }
    },
    components: {
        Marquee
    },
    methods: {
        typeConfig(index: number) {
            return {
                "dice": this.inventory.items[index].type === '턴',
                "song": this.inventory.items[index].type === '곡',
                "limit": this.inventory.items[index].type === '개'
            }
        },
        manualAdd() {
            this.inventory.addItem(String(prompt('황금열쇠의 이름을 정확히 입력해주세요.')))
        }
    },
    mounted() {
        window.addEventListener('beforeunload', () => {
            LocalForage.setItem('items-snapshot', JSON.parse(JSON.stringify(this.inventory.items)))
        })
    }
}
</script>

<style lang="scss">

@import '../styles/mixin';

@mixin transparent-button {
    background-color: transparent;
    transition: background-color 0.2s ease-out;

    &:hover {
        background-color: #8886;
    }
}

.inv-bg {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
    line-height: 36px;

    background-color: #222e;
    color: white;

    .inv-empty {
        display: flex;
        justify-content: center;
        align-items: center;

        flex-grow: 1;

        font-size: 36px;
    }

    .inv-items {
        display: grid;
        min-width: 0;
        gap: 3px;
        padding: 4px;

        grid-template-columns: min-content auto 0;

        width: 100%;
        margin-bottom: auto;

        font-size: 20px;

        .row-item {
            display: contents;

            .item-count {
                padding: 0 6px;
                border-right: 4px solid rgba(255, 255, 255, 0.25);
                vertical-align: top;

                text-align: right;
                font-size: 24px;
                line-height: 32px;
                font-family: var(--font-numeric);
                font-variant-numeric: lining-nums;

                min-width: 64px;

                // this line giving their width to text.
                word-break: keep-all;
                white-space: nowrap;

                &::after {
                    display: inline-block;
                    content: '개';

                    font-size: 16px;
                    margin-left: 2px;
                }

                &.dice {
                    border-right: 4px solid rgba(0, 255, 0, 0.75);
                    &::after {
                        content: '턴'
                    }
                }

                &.song {
                    border-right: 4px solid rgba(255, 255, 0, 0.75);
                    &::after {
                        content: '곡'
                    }
                }
            }

            .item-name {
                overflow-x: hidden;
                white-space: nowrap;
                font-size: 20px;
                text-indent: 4px;
            }

            .item-buttons {
                position: relative;

                opacity: 0;
                transition: opacity 0.2s ease-out;

                > div {
                    position: absolute;
                    display: flex;
                    top: 0;
                    right: 0;
                    bottom: 0;
                    margin: auto;
                }

                button {
                    @include transparent-button;
                    padding: 6px;
                }
            }

            &:hover .item-buttons {
                opacity: 1;
            }
        }
    }

    .manual-button {
        @include hidden-button;

        right: 0;
        bottom: -0.25em;
        padding: 0.5em;
        line-height: 1em;
        transform: translateY(100%);
    }
}
</style>
