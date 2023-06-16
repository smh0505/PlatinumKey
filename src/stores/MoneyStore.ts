import { defineStore } from 'pinia';

export const useMoneyStore = defineStore('currency', {
    state() {
        return {
            money: 0
        }
    }
})