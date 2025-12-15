<template>
    <div class="wheel-wrap">
        <canvas ref="cnv" width="220" height="220"></canvas>
        <div class="legend">Цветовой круг</div>
    </div>
</template>

<script setup>
import { onMounted, watch, ref } from "vue";
const props = defineProps({ colors: { type: Array, default: () => [] } });
const cnv = ref(null);

function hexToHsl(hex) {
    const h = hex.replace("#", "");
    const r = parseInt(h.substring(0, 2), 16) / 255;
    const g = parseInt(h.substring(2, 4), 16) / 255;
    const b = parseInt(h.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
    let H = 0,
        L = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
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
    }
    return { h: H };
}

function draw() {
    const c = cnv.value;
    if (!c) return;
    const ctx = c.getContext("2d");
    const w = c.width,
        h = c.height;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2,
        cy = h / 2,
        r = Math.min(w, h) / 2 - 10;
    // draw hue circle
    for (let deg = 0; deg < 360; deg++) {
        ctx.beginPath();
        ctx.strokeStyle = `hsl(${deg},100%,50%)`;
        ctx.lineWidth = 10;
        ctx.arc(
            cx,
            cy,
            r,
            ((deg - 0.5) * Math.PI) / 180,
            ((deg + 0.5) * Math.PI) / 180
        );
        ctx.stroke();
    }
    // draw markers for palette
    props.colors.forEach((hex, i) => {
        try {
            const hsl = hexToHsl(hex);
            const angle = ((hsl.h - 90) * Math.PI) / 180;
            const mx = cx + Math.cos(angle) * (r - 18);
            const my = cy + Math.sin(angle) * (r - 18);
            ctx.beginPath();
            ctx.fillStyle = hex;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 2;
            ctx.arc(mx, my, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        } catch (e) {}
    });
}

onMounted(() => draw());
watch(
    () => props.colors,
    () => draw(),
    { deep: true }
);
</script>

<style scoped>
.wheel-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}
.legend {
    font-size: 12px;
    color: #555;
}
</style>
