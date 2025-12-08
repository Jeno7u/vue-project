<template>
    <div class="color-card" :style="{ backgroundColor: color }">
        <div class="overlay" v-if="copied">Скопировано</div>
        <div class="card-top">
            <button class="lock-btn" @click.stop="emitLock">
                <span v-if="locked">🔒</span>
                <span v-else>🔓</span>
            </button>
        </div>
        <button class="color-body" @click="onCopy">
            <div class="color-value">{{ display }}</div>
        </button>
    </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
    color: { type: String, required: true },
    locked: { type: Boolean, default: false },
    format: { type: String, default: "HEX" },
    copied: { type: Boolean, default: false },
});
const emit = defineEmits(["toggle-lock", "copy"]);

const display = computed(() => {
    if (props.format === "RGB") {
        // convert HEX to RGB
        const hex = props.color.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return props.color.toUpperCase();
});

function emitLock() {
    emit("toggle-lock");
}

function onCopy() {
    emit("copy", props.color);
}
</script>

<style scoped>
.color-card {
    position: relative;
    width: 140px;
    height: 120px;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}
.card-top {
    display: flex;
    justify-content: flex-end;
    padding: 6px;
}
.lock-btn {
    background: rgba(255, 255, 255, 0.12);
    border: none;
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
}
.color-body {
    background: transparent;
    border: none;
    color: inherit;
    padding: 12px;
    text-align: left;
    width: 100%;
    cursor: pointer;
}
.color-value {
    font-weight: 700;
    font-family: monospace;
}
.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.4);
    font-weight: 700;
}

@media (max-width: 480px) {
    .color-card {
        width: 100px;
        height: 96px;
    }
}
</style>
