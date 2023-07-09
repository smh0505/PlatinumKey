<template>
    <PageBase class="start-setup" title="설정">
        <Setup />

        <template v-slot:buttons>
            <button @click="options.save()" class="success">저장</button>
        </template>
    </PageBase>
</template>

<script lang="ts">

import { useOptionsStore } from '../../stores/OptionsStore'

import Setup from '../setup/Setup.vue'
import PageBase from './PageBase.vue'

export default {
    components: {
        Setup,
        PageBase
    },
    data: () => ({
        options: useOptionsStore()
    })
}

</script>

<style lang="scss">

@import '../../styles/mixin';

.start-setup {
    grid-template-columns: 18.25rem 1fr;

    .start-menu {
        > li > label {
            text-align: left;
        }
        .save {
            display: none !important;
        }
    }
}

</style>
