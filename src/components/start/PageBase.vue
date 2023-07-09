<template>
    <div class="start-common">
        <h3>{{ title }}</h3>
        <!-- <button @focus.prevent class="close"></button> -->
        <slot></slot>

        <footer>
            <button
                @click="ui.navigate('start', null)"
                style="margin-right: auto"> 뒤로 </button>

            <slot name="buttons"></slot>
        </footer>
    </div>
</template>

<script lang="ts">
import { useUIStore } from '../../stores/UIStore'


export default {
    props: {
        title: String
    },
    data: () => ({
        ui: useUIStore()
    })
}

</script>

<style lang="scss">

@import '../../styles/mixin';

.start-common {
    display: grid;
    grid-template-areas: "a a" "b c" "d d";
    grid-template-columns: 3fr 5fr;
    grid-template-rows: 6rem 1fr 5rem;
    gap: 0 2rem;

    $inner-padding: 6rem;

    > h3, > footer {
        padding: 0 $inner-padding;
        grid-column: 1 / span 2;
    }
    > .start-menu, > main {
        margin: 3rem 0 1.5rem 0;
        overflow-y: auto;
        grid-row: 2;
    }
    > h3 {
        font-size: 3rem;
        font-weight: 700;
        line-height: 7.5rem;

        margin: 0;
        background: #0009;
        box-shadow: 0 -0.1rem 0 #fff6 inset;
    }

    > .start-menu {
        padding-left: $inner-padding;
        padding-right: 0.25rem;
        list-style: none;

        > li {
            position: relative;
            display: flex;
            gap: 0.25rem;
            margin: 0.25rem 0;

            font-weight: 300;
            text-align: center;
            font-variant-numeric: tabular-nums;


            > label, > button {
                @include button;

                padding: 0.5rem;

                font-size: 1.25rem;
                line-height: 1.5rem;

                background: #0013;
            }
            > label {
                flex-grow: 1;
            }

            &.selected {
                > * {
                    background-color: #0029;
                }

                &::before {
                    position: absolute;
                    top: 0;
                    left: -0.375rem;
                    bottom: 0;
                    margin: auto;

                    content: 'ACTIVE';

                    padding: 0 0.375em 0 0;
                    border-right: 1px solid #fff;

                    height: 100%;
                    line-height: 2.5rem;

                    transform: translateX(-100%);
                }
            }
        }
    }
    > main {
        margin-right: $inner-padding - 0.5rem;
        padding-right: 0.5rem;
        padding-left: 0.5rem;
    }
    > footer {
        display: flex;
        justify-content: flex-end;
        align-items: flex-start;
        gap: 1rem;

        font-size: 1.25rem;
        line-height: 2.5rem;

        > button {
            @include button;

            font-weight: 500;
            min-width: 12rem;
        }
    }
}

</style>
