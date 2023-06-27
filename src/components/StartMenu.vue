<template>
    <div class="startMask">
        <div class="startContainer">
            <div class="startHeader">판때기 메뉴</div>
            <div class="startBody">
                <button class="startMenuButton" @click="$emit('shuffle')">판 섞기</button>
                <button class="startMenuButton" @click="$emit('addkey')">판 섞기 + 열쇠 추가</button>
                <button class="startMenuButton" @click="$emit('reset')">판 초기화</button>
                <button class="startMenuButton" @click="">로그 보기</button>
            </div>
            <div class="startFooter">
                <button class="footButton" @click="$emit('close')">닫기</button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default {
    emits: ['shuffle', 'addkey', 'reset', 'close']
}
</script>

<style lang="scss">
.startMask {
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 50;

    width: 100%;
    height: 100%;

    background-color: rgba(0, 0, 0, 0.7);
    transition: opacity 0.2s ease;

    .startContainer {
        width: 40%;
        margin: auto;
        padding: 28px 20px;

        background-color: rgba(0, 255, 255, 0.8);
        box-shadow: 12px 9px 29px 0px rgba(0, 0, 0, 0.75);
        border-radius: 8px;
        transition: all 0.2s ease;

        .startHeader {
            font: bold 32px 'KBO-Dia-Gothic_bold', sans-serif;
            text-align: center;
        }

        .startBody {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            grid-template-rows: repeat(2, 1fr);
            margin: 16px;
            gap: 16px;

            .startMenuButton {
                padding: 24px;
                border: none;
                border-radius: 8px;
                background-color: rgba(127, 255, 212, 0.6);
                font: normal 20px 'KBO-Dia-Gothic_bold', sans-serif;
                transition: all 0.2s ease;

                &:hover {
                    background-color: rgb(127, 255, 212);
                }
            }
        }

        .startFooter {
            display: flex;
            justify-content: center;

            .footButton {
                padding: 12px 20px;
                border: none;
                border-radius: 8px;
                background-color: rgba(192, 255, 67, 0.7);
                font: bold 16px 'KBO-Dia-Gothic_bold', sans-serif;
                transition: all 0.2s ease;

                &:hover {
                    background-color: rgb(192, 255, 67);
                }
            }
        }
    }
}
</style>
