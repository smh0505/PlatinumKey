<template>
    <div class="inv-bg">
        <div class="inv-empty" v-if="inventory.items.length === 0">비었음!</div>
        <div class="inv-items" v-else>
            <div v-for="(item, index) in inventory.pageView" class="row-item">
                <div class="item-count" :class="typeConfig(index)">{{ item.count }}</div>
                <div class="item-name" :key="index"><Marquee :text="item.key"></Marquee></div>
                <div class="item-buttons">
                    <div>
                        <button @click="inventory.addOne(inventory.pageNum * ITEMS_PER_PAGE + index)">
                            <span class="material-symbols-rounded">add</span>
                        </button>
                        <button @click="inventory.subOne(inventory.pageNum * ITEMS_PER_PAGE + index)">
                            <span class="material-symbols-rounded">remove</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="inv-pages" v-if="inventory.items.length > ITEMS_PER_PAGE + 1">
            <button class="page-button" @click="inventory.prevPage()">
                <span class="material-symbols-rounded">first_page</span>
            </button>
            <div class="page-number">{{ inventory.pageNum + 1 }} / {{ inventory.maxPage }} 페이지</div>
            <button class="page-button" @click="inventory.nextPage()">
                <span class="material-symbols-rounded">last_page</span>
            </button>
        </div>
        <div class="inv-buttons">
            <button class="dice-button" @click="inventory.removeAll('턴')">턴 감소</button>
            <button class="song-button" @click="inventory.removeAll('곡')">곡 감소</button>
            <button class="manual-button" @click="manualAdd">수기입력</button>
        </div>
    </div>
</template>

<script lang="ts">
import { ITEMS_PER_PAGE, useItemStore } from '../stores/ItemStore';
import Marquee from './Marquee.vue';
import * as LocalForage from 'localforage'

export default {
    data() {
        return {
            inventory: useItemStore(),
            ITEMS_PER_PAGE,
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

@mixin transparent-button {
    background-color: transparent;
    transition: background-color 0.2s ease-out;

    &:hover {
        background-color: #8886;
    }
}

.inv-bg {
    display: flex;
    flex-direction: column;
    gap: 4px;

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
        gap: 4px;
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

    .inv-pages {
        grid-row: 5;
        display: flex;

        .page-button {
            @include transparent-button;
            width: 32px;
            margin: 4px;
            vertical-align: top;
        }

        .page-number {
            flex-grow: 1;
            text-align: center;
        }
    }

    .inv-buttons {
        display: grid;
        grid-template-columns: 2fr 2fr 1fr;
        gap: 4px;

        color: #fff8;

        > button {
            @include transparent-button;
            font-size: 16px;
            line-height: 26px;

            .material-symbols-rounded {
                vertical-align: middle;
            }
        }
        .dice-button {
            border-top: 4px solid rgba(0, 255, 0, 0.5);
        }
        .song-button {
            border-top: 4px solid rgba(255, 255, 0, 0.5);
        }
        .manual-button {
            border-top: 4px solid rgba(255, 255, 255, 0.25);
        }
    }

}
</style>
