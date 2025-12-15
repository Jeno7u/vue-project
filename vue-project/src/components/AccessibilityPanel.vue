<template>
    <div class="access-panel">
        <h3>Доступность (WCAG)</h3>
        <div class="rows">
            <div v-for="(c, i) in colors" :key="i" class="row">
                <div class="swatch" :style="{ background: c }"></div>
                <div class="info">
                    <div class="hex">{{ c.toUpperCase() }}</div>
                    <div class="contrast">
                        <span
                            >↔ White: {{ contrastWithWhite(c) }} —
                            {{ levelWithWhite(c) }}</span
                        >
                        <span
                            >↔ Black: {{ contrastWithBlack(c) }} —
                            {{ levelWithBlack(c) }}</span
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ colors: { type: Array, default: () => [] } });

function srgb(v) {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
}

function contrast(a, b) {
    const L1 = luminance(a);
    const L2 = luminance(b);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return +((hi + 0.05) / (lo + 0.05)).toFixed(2);
}

function levelFromRatio(r) {
    if (r >= 7) return "AAA (normal)";
    if (r >= 4.5) return "AA (normal)";
    if (r >= 3) return "AA (large)";
    return "Недостаточно";
}

function contrastWithWhite(hex) {
    return contrast(hex, "#FFFFFF");
}
function contrastWithBlack(hex) {
    return contrast(hex, "#000000");
}
function levelWithWhite(hex) {
    return levelFromRatio(contrastWithWhite(hex));
}
function levelWithBlack(hex) {
    return levelFromRatio(contrastWithBlack(hex));
}
</script>

<style scoped>
.access-panel {
    padding: 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
}
.access-panel h3 {
    margin: 0 0 8px 0;
}
.rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
}
.row {
    display: flex;
    gap: 8px;
    align-items: center;
}
.swatch {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.info {
    display: flex;
    flex-direction: column;
}
.hex {
    font-family: monospace;
    font-weight: 700;
}
.contrast {
    font-size: 12px;
    color: #444;
}
</style>
