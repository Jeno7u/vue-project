<template>
    <section class="palette-app">
        <div class="controls">
            <div class="left">
                <label
                    >Количество:
                    <select v-model.number="count">
                        <option :value="3">3</option>
                        <option :value="5">5</option>
                        <option :value="7">7</option>
                    </select>
                </label>
                <label
                    >Формат:
                    <select v-model="format">
                        <option value="HEX">HEX</option>
                        <option value="RGB">RGB</option>
                    </select>
                </label>
                <label
                    >Фон:
                    <select v-model="bgMode">
                        <option value="light">Светлый</option>
                        <option value="dark">Тёмный</option>
                    </select>
                </label>
            </div>
            <div class="right">
                <button @click="generatePalette">Случайная палитра</button>
                <button @click="savePalette">Сохранить</button>
            </div>
        </div>

        <div class="palette-row">
            <ColorCard
                v-for="(c, i) in colors"
                :key="i"
                :color="c.hex"
                :locked="c.locked"
                :format="format"
                :copied="c.copied"
                @toggle-lock="toggleLock(i)"
                @copy="copyHex($event, i)"
            />
        </div>

        <div class="actions">
            <small
                >Клик по карточке — копировать. 🔒 Закрепите цвет, чтобы не
                менять его.</small
            >
        </div>

        <div class="preview-area">
            <MockupPreview
                :colors="colors.map((c) => c.hex)"
                :bgMode="bgMode"
            />
        </div>

        <div class="toast" v-if="toast">{{ toast }}</div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ColorCard from "./ColorCard.vue";
import MockupPreview from "./MockupPreview.vue";

const STORAGE_KEY = "vue_palette_v1";

const count = ref(5);
const format = ref("HEX");
const bgMode = ref("light");
const toast = ref("");

const colors = ref([]); // array of { hex, locked, copied }

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
        const color =
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        return Math.round(255 * color)
            .toString(16)
            .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette() {
    const n = count.value;
    const baseHue = Math.floor(Math.random() * 360);
    const step = 360 / n;
    const out = [];
    for (let i = 0; i < n; i++) {
        const hue = Math.round((baseHue + step * i) % 360);
        const sat = 65;
        const light = 50 + (i % 2 === 0 ? 6 : -6);
        const hex = hslToHex(hue, sat, light);
        out.push({ hex, locked: false, copied: false });
    }

    // preserve locked colors
    if (colors.value.length) {
        for (let i = 0; i < Math.min(colors.value.length, out.length); i++) {
            if (colors.value[i] && colors.value[i].locked)
                out[i] = { ...colors.value[i] };
        }
    }

    colors.value = out;
}

function toggleLock(i) {
    colors.value[i].locked = !colors.value[i].locked;
}

async function copyHex(hex, i) {
    try {
        await navigator.clipboard.writeText(hex);
        colors.value.forEach((c) => (c.copied = false));
        if (colors.value[i]) colors.value[i].copied = true;
        showToast(`${hex.toUpperCase()} скопирован`);
        setTimeout(() => {
            if (colors.value[i]) colors.value[i].copied = false;
        }, 1200);
    } catch (err) {
        showToast("Ошибка копирования");
    }
}

function showToast(msg, time = 1600) {
    toast.value = msg;
    setTimeout(() => (toast.value = ""), time);
}

function savePalette() {
    const payload = {
        colors: colors.value.map((c) => ({ hex: c.hex, locked: c.locked })),
        count: count.value,
        format: format.value,
        bgMode: bgMode.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showToast("Палитра сохранена");
}

onMounted(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            count.value = parsed.count || 5;
            format.value = parsed.format || "HEX";
            bgMode.value = parsed.bgMode || "light";
            colors.value = (parsed.colors || []).map((c) => ({
                hex: c.hex,
                locked: !!c.locked,
                copied: false,
            }));
        } catch (e) {
            generatePalette();
        }
    } else {
        generatePalette();
    }
});

watch([() => count.value], () => {
    // regenerate keeping locked ones
    generatePalette();
});

watch(
    colors,
    (nv) => {
        // auto-save minimal state
        const payload = {
            colors: nv.map((c) => ({ hex: c.hex, locked: c.locked })),
            count: count.value,
            format: format.value,
            bgMode: bgMode.value,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    },
    { deep: true }
);
</script>

<style scoped>
.palette-app {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
.controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}
.controls label {
    margin-right: 8px;
}
.controls .right button {
    margin-left: 8px;
}
.palette-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}
.actions {
    color: #666;
}
.preview-area {
    margin-top: 12px;
}
.toast {
    position: fixed;
    right: 18px;
    bottom: 18px;
    background: #222;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
}

@media (max-width: 640px) {
    .palette-row {
        justify-content: center;
    }
}
</style>
