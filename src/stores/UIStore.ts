import { defineStore } from 'pinia'

import { useOptionsStore } from './OptionsStore'

export type UIPageState = 'dice' | 'wheel' | 'raffle' | 'setup' | ''

export const useUIStore = defineStore('ui', {
    state: () => ({
        page: 'dice' as UIPageState,
        param: null as any,

        // obs
        currentScene: '' as string,

        lastParam: {} as { [key in UIPageState]: any }
    }),
    actions: {
        navigate(page: UIPageState, param?: any) {
            this.switchScene(!page)
            this.page = page

            if (param)
                this.param = this.lastParam[page] = param
            else
                this.param = this.lastParam[page]
        },

        switchScene(toPlaying: boolean) {
            const options = useOptionsStore()

            if (!options.useSceneSwitching) {
                return
            }

            const currentlyInPlayingScene = options.scenePlaying?.includes(this.currentScene)
            const currentlyInNotPlayingScene = options.sceneNotPlaying === this.currentScene

            const hasPlayingSceneConfigured = options.scenePlaying?.length > 0
            const hasNotPlayingSceneConfigured = options.sceneNotPlaying != null

            if (toPlaying) {
                if (currentlyInPlayingScene && options.scenePlaying?.length > 1) {
                    // already on any of playing scene?
                    const currentIndex = options.scenePlaying.indexOf(this.currentScene)
                    if (currentIndex < 0)
                        return
                    // then move to next scene
                    const to = options.scenePlaying[currentIndex + 1] || options.scenePlaying[0]
                    window.obsstudio?.setCurrentScene?.(to)

                } else if (hasNotPlayingSceneConfigured? currentlyInNotPlayingScene : true) {
                    // (currently in not-playing scene) or (not-playing scene not configured)
                    // -> go to playing scene
                    window.obsstudio?.setCurrentScene?.(options.scenePlaying[0])
                }
            } else {
                if (hasPlayingSceneConfigured? currentlyInPlayingScene : true) {
                    // (currently in playing scene) or (playing scene not configured)
                    // -> go to not-playing scene
                    window.obsstudio?.setCurrentScene?.(options.sceneNotPlaying)
                }
            }
        },
        initOBS() {
            window.addEventListener('obsSceneChanged', (event) => {
                this.currentScene = event.detail.name
            })
            window.obsstudio?.getCurrentScene((scene: OBSSceneInfo) => {
                this.currentScene = scene.name
            })
        },

    }
})

