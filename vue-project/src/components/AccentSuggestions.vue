<template>
    <div class="accent-panel">
        <h3>Подбор акцентов</h3>
        <div class="list">
            <div v-for="(acc, i) in accents" :key="i" class="item">
                <div class="sw" :style="{ background: acc }"></div>
                <div class="hex">{{ acc.toUpperCase() }}</div>
                <button @click="$emit('apply', acc)">Применить</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({ colors: { type: Array, default: () => [] } });
const emit = defineEmits(["apply"]);

function hexToHsl(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let H = 0,
        S = 0,
        L = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        S = d / (1 - Math.abs(2 * L - 1));
        switch (max) {
            case r:
                H = ((g - b) / d) % 6;
                break;
            case g:
                H = (b - r) / d + 2;
                break;
            case b:
                H = (r - g) / d + 4;
                break;
        }
        H = Math.round(H * 60);
        if (H < 0) H += 360;
        S = Math.round(S * 100);
    } else {
        H = 0;
        S = 0;
    }
    L = Math.round(L * 100);
    return { h: H, s: S, l: L };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0,
        g = 0,
        b = 0;
    if (h < 60) {
        r = c;
        g = x;
    } else if (h < 120) {
        r = x;
        g = c;
    } else if (h < 180) {
        g = c;
        b = x;
    } else if (h < 240) {
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        b = c;
    } else {
        r = c;
        b = x;
    }
    const R = Math.round((r + m) * 255),
        G = Math.round((g + m) * 255),
        B = Math.round((b + m) * 255);
    return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
        2,
        "0"
    )}${B.toString(16).padStart(2, "0")}`;
}

function makeAccentsFrom(hex) {
    const base = hexToHsl(hex);
    // lighter, darker, complementary
    const lighter = hslToHex(
        base.h,
        clamp(base.s - 6, 0, 100),
        clamp(base.l + 18, 0, 100)
    );
    const darker = hslToHex(
        base.h,
        clamp(base.s + 4, 0, 100),
        clamp(base.l - 18, 0, 100)
    );
    const comp = hslToHex((base.h + 180) % 360, clamp(base.s, 0, 100), base.l);
    return [lighter, comp, darker];
}

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

const accents = computed(() => {
    if (!props.colors.length) return [];
    // generate from dominant (first) color
    return makeAccentsFrom(props.colors[0]);
});
</script>

<style scoped>
.accent-panel {
    padding: 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
}
.list {
    display: flex;
    gap: 8px;
}
.item {
    display: flex;
    gap: 8px;
    align-items: center;
}
.sw {
    width: 40px;
    height: 40px;
    border-radius: 6px;
}
.hex {
    font-family: monospace;
}
.item button {
    padding: 6px 8px;
}
</style>
