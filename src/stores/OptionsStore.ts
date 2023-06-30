import { defineStore } from 'pinia'
import * as LocalForage from 'localforage'

export type ThemeDefinition = { head: string, tail: string }
export type KeyDefinition = { key: string, count: number }

export const useOptionsStore = defineStore('options', {
    state: () => ({
        themes: [{ head: "", tail: "" }] as ThemeDefinition[],
        defaultKeys: [{ key: "", count: 1 }] as KeyDefinition[],

        channel: 'arpa__',
        password: '',
        useSceneSwitching: false,
        scenePlaying: [] as string[],
        sceneNotPlaying: ''
    }),
    actions: {
        async load() {
            await Promise.all([
                LocalForage.getItem('options').then(value => {
                    // console.log('options', value)
                    if(value !== null) {
                        this.$patch(value as typeof this.$state)
                    }
                }),

                LocalForage.getItem('themes').then(value => {
                    // console.log('themes', value)
                    if (value !== null) {
                        this.$patch({ themes: value as ThemeDefinition[] })
                    }
                    // LocalForage.removeItem('themes')
                }),

                LocalForage.getItem('items').then(value => {
                    // console.log('items', value)
                    if (value !== null) {
                        this.$patch({ defaultKeys: value as KeyDefinition[] })
                    }
                    // LocalForage.removeItem('items')
                })
            ])

            this.save()
        },
        save() {
            LocalForage.setItem('options', JSON.parse(JSON.stringify(this.$state)))
        }
    }
})
