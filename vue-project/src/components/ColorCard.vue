<template>
    <div class="color-card" :style="{ backgroundColor: color }">
        <div class="overlay" v-if="copied">Скопировано</div>
        <div class="card-top">
            <button
                class="icon-btn lock-btn"
                @click.stop="emitLock"
                :aria-pressed="locked"
                :title="locked ? 'Открепить' : 'Закрепить'"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M12 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
                        fill="currentColor"
                    />
                    <path
                        d="M17 8h-1V6a4 4 0 10-8 0v2H7a1 1 0 00-1 1v9a1 1 0 001 1h10a1 1 0 001-1V9a1 1 0 00-1-1zM9 6a3 3 0 116 0v2H9V6z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </div>
        <button
            class="color-body"
            @click="onCopy"
            :aria-label="`Скопировать ${display}`"
        >
            <div class="color-value">{{ display }}</div>
            <div class="copy-icon">📋</div>
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
        const hex = (props.color || "").replace("#", "");
        if (hex.length !== 6) return props.color;
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        return `rgb(${r}, ${g}, ${b})`;
    }
    return (props.color || "").toUpperCase();
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
.icon-btn {
    background: rgba(255, 255, 255, 0.12);
    border: none;
    color: white;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}
.color-body {
    background: transparent;
    border: none;
    color: inherit;
    padding: 12px;
    text-align: left;
    width: 100%;
    cursor: pointer;
    position: relative;
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
.copy-icon {
    position: absolute;
    right: 8px;
    bottom: 8px;
    background: rgba(0, 0, 0, 0.22);
    padding: 4px 6px;
    border-radius: 6px;
    font-size: 12px;
}

@media (max-width: 480px) {
    .color-card {
        width: 100px;
        height: 96px;
    }
}
</style>
