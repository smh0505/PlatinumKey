<template>
    <div class="inv-bg">
        <div class="inv-empty" v-if="inventory.items.length === 0">비었음!</div>
        <div class="inv-items" v-else>
            <div v-for="(item, index) in inventory.pageView" class="row-item">
                <div class="item-count" :class="typeConfig(index)">{{ item.count }}</div>
                <div class="item-name" :key="index"><Marquee :text="item.key"></Marquee></div>
                <button class="plus-button" v-if="item.type !== 2" @click="inventory.addOne(inventory.pageNum * 4 + index)">
                    <span class="material-symbols-rounded">exposure_plus_1</span>
                </button>
                <button class="minus-button" @click="inventory.subOne(inventory.pageNum * 4 + index)">
                    <span class="material-symbols-rounded">exposure_neg_1</span>
                </button>
            </div>
            <div class="inv-pages">
                <button class="page-button" @click="inventory.prevPage()">
                    <span class="material-symbols-rounded">first_page</span>
                </button>
                <div class="page-number">{{ inventory.pageNum + 1 }} / {{ inventory.maxPage }} 페이지</div>
                <button class="page-button" @click="inventory.nextPage()">
                    <span class="material-symbols-rounded">last_page</span>
                </button>
            </div>
        </div>
        <div class="inv-buttons">
            <button class="dice-button" @click="inventory.removeAll(0)">턴 감소</button>
            <button class="song-button" @click="inventory.removeAll(1)">곡 감소</button>
        </div>
    </div>
</template>

<script lang="ts">
import { useItemStore, itemType } from '../stores/ItemStore';
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
                "dice": this.inventory.items[index].type === itemType.dice,
                "song": this.inventory.items[index].type === itemType.song
            }
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
.inv-bg {
    display: grid;
    grid-template-rows: 5fr 1fr;
    gap: 4px;

    .inv-empty {
        display: flex;
        justify-content: center;
        align-items: center;

        font: bold 36px 'Galmuri14', sans-serif;
        background-color: purple;
        color: white;
    }

    .inv-items {
        display: grid;
        grid-template-rows: repeat(5, 1fr);

        background-color: purple;
        color: white;
        font: bold 16px 'Galmuri14', sans-serif;

        .row-item {
            display: grid;
            grid-template-columns: 1fr 3fr 1fr 1fr;
            gap: 4px;
            margin: 4px;
            align-items: center;

            .dice {
                background-color: rgba(0, 255, 0, 0.75);
                color: black;
            }

            .song {
                background-color: rgba(255, 255, 0, 0.75);
                color: black;
            }

            .item-count {
                display: flex;
                justify-content: center;
                border-radius: 8px;
                font: bold 20px 'Galmuri14', sans-serif;
            }

            .item-name {
                overflow-x: hidden;
                white-space: nowrap;
                font: 16px 'Galmuri14', sans-serif;
            }

            .plus-button {
                grid-column: 3;
                border: none;
                border-radius: 8px;
                background-color: transparent;
                color: white;
                transition: all 0.2s ease-out;

                &:hover {
                    background-color: white;
                    color: black;
                }
            }

            .minus-button {
                grid-column: 4;
                border: none;
                border-radius: 8px;
                background-color: transparent;
                color: white;
                transition: all 0.2s ease-out;

                &:hover {
                    background-color: white;
                    color: black;
                }
            }
        }

        .inv-pages {
            grid-row: 5;
            display: grid;
            grid-template-columns: 1fr 3fr 1fr;

            .page-button {
                margin: 4px;
                border: none;
                border-radius: 8px;
                background-color: transparent;
                color: white;
                transition: all 0.2s ease-out;

                &:hover {
                    background-color: white;
                    color: black;
                }
            }

            .page-number {
                display: flex;
                justify-content: center;
                align-items: center;
            }
        }
    }

    .inv-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;

        .dice-button {
            font: bold 20px 'Galmuri14', sans-serif;
            background-color: rgba(0, 255, 0, 0.5);
            color: black;
            border-radius: 8px;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: rgb(0, 255, 0);
            }
        }

        .song-button {
            font: bold 20px 'Galmuri14', sans-serif;
            background-color: rgba(255, 255, 0, 0.5);
            color: black;
            border-radius: 8px;
            transition: all 0.2s ease-out;

            &:hover {
                background-color: rgb(255, 255, 0);
            }
        }
    }
}
</style>