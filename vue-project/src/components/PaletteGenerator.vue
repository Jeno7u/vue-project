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
                <label>
                    Базовый цвет:
                    <input type="color" v-model="baseHex" />
                </label>
                <label>
                    Тип палитры:
                    <select v-model="paletteType">
                        <option value="analogous">Аналогичная</option>
                        <option value="monochrome">Монохромная</option>
                        <option value="triad">Триада</option>
                        <option value="complementary">Комплементарная</option>
                    </select>
                </label>
                <label>
                    Настроение:
                    <select v-model="mood">
                        <option value="calm">Спокойные</option>
                        <option value="energetic">Энергичные</option>
                        <option value="professional">Профессиональные</option>
                    </select>
                </label>
            </div>
            <div class="right">
                <button @click="generatePalette">Случайная палитра</button>
                <button @click="savePalette">Сохранить</button>
            </div>
        </div>

        <div class="layout-grid">
            <div class="left-column">
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
                        >Клик по карточке — копировать. 🔒 Закрепите цвет, чтобы
                        не менять его.</small
                    >
                </div>
                <div class="bottom-row">
                    <ColorWheel :colors="colors.map((c) => c.hex)" />
                </div>
            </div>

            <div class="right-column">
                <div class="preview-area">
                    <MockupPreview
                        :colors="colors.map((c) => c.hex)"
                        :bgMode="bgMode"
                    />
                </div>

                <div class="base-info" v-if="colorInfo">
                    <div>
                        <strong>Базовый цвет:</strong>
                        {{ colorInfo.name || colorInfo.hex }}
                    </div>
                    <div v-if="colorInfo.rgb">
                        RGB: {{ colorInfo.rgb.r }}, {{ colorInfo.rgb.g }},
                        {{ colorInfo.rgb.b }}
                    </div>
                    <div v-if="colorInfo.hsl">
                        HSL: {{ colorInfo.hsl.h }}, {{ colorInfo.hsl.s }}%,
                        {{ colorInfo.hsl.l }}%
                    </div>
                </div>

                <AccessibilityPanel :colors="colors.map((c) => c.hex)" />
                <AccentSuggestions
                    :colors="colors.map((c) => c.hex)"
                    @apply="onApplyAccent"
                />
                <PaletteLibrary
                    :currentColors="colors.map((c) => c.hex)"
                    @apply="applyLibraryPalette"
                />
                <ExportPanel :colors="colors.map((c) => c.hex)" />
            </div>
        </div>

        <div class="toast" v-if="toast">{{ toast }}</div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import ColorCard from "./ColorCard.vue";
import MockupPreview from "./MockupPreview.vue";
import AccessibilityPanel from "./AccessibilityPanel.vue";
import AccentSuggestions from "./AccentSuggestions.vue";
import ColorWheel from "./ColorWheel.vue";
import PaletteLibrary from "./PaletteLibrary.vue";
import ExportPanel from "./ExportPanel.vue";

const STORAGE_KEY = "vue_palette_v1";

const count = ref(5);
const format = ref("HEX");
const bgMode = ref("light");
const toast = ref("");

const baseHex = ref("#3366ff");
const paletteType = ref("analogous");
const mood = ref("calm");

const colors = ref([]); // array of { hex, locked, copied }
const colorInfo = ref(null);

function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
}

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
    // h in [0,360], s,l in [0,100]
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
        b = 0;
    } else if (h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (h < 300) {
        r = x;
        g = 0;
        b = c;
    } else {
        r = c;
        g = 0;
        b = x;
    }
    const R = Math.round((r + m) * 255);
    const G = Math.round((g + m) * 255);
    const B = Math.round((b + m) * 255);
    return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(
        2,
        "0"
    )}${B.toString(16).padStart(2, "0")}`;
}

function generatePalette() {
    const n = count.value;
    const base = hexToHsl(baseHex.value);
    const out = [];

    // mood presets influence saturation/lightness ranges
    let satBase = 60,
        satVar = 12,
        lightBase = 50,
        lightVar = 10;
    if (mood.value === "calm") {
        satBase = 38;
        satVar = 8;
        lightBase = 62;
        lightVar = 10;
    }
    if (mood.value === "energetic") {
        satBase = 78;
        satVar = 12;
        lightBase = 48;
        lightVar = 10;
    }
    if (mood.value === "professional") {
        satBase = 52;
        satVar = 10;
        lightBase = 50;
        lightVar = 8;
    }

    const pushColor = (h, s, l) =>
        out.push({
            hex: hslToHex(
                ((h % 360) + 360) % 360,
                clamp(Math.round(s), 0, 100),
                clamp(Math.round(l), 0, 100)
            ),
            locked: false,
            copied: false,
        });

    if (paletteType.value === "monochrome") {
        // same hue, vary lightness
        const h = base.h || 200;
        for (let i = 0; i < n; i++) {
            const t = n === 1 ? 0.5 : i / (n - 1);
            const l = lightBase - lightVar + t * (lightVar * 2);
            const s = Math.max(6, satBase - satVar + t * satVar * 2);
            pushColor(h, s, l);
        }
    } else if (paletteType.value === "analogous") {
        const spread = 24;
        const center = base.h || Math.floor(Math.random() * 360);
        const half = Math.floor(n / 2);
        for (let i = 0; i < n; i++) {
            const offset = (i - half) * spread;
            const h = center + offset;
            const s = satBase + (i - half) * (satVar / (half || 1));
            const l = lightBase + (i - half) * (lightVar / (half || 1));
            pushColor(h, s, l);
        }
    } else if (paletteType.value === "triad") {
        // base, +120, +240 repeated
        const baseHue = base.h || Math.floor(Math.random() * 360);
        const tri = [baseHue, (baseHue + 120) % 360, (baseHue + 240) % 360];
        for (let i = 0; i < n; i++) {
            const h = tri[i % 3];
            const t = Math.floor(i / 3);
            const s = satBase + (t % 2 === 0 ? satVar : -satVar / 2);
            const l = lightBase + (t % 2 === 0 ? lightVar / 2 : -lightVar / 2);
            pushColor(h, s, l);
        }
    } else if (paletteType.value === "complementary") {
        const baseHue = base.h || Math.floor(Math.random() * 360);
        const comp = (baseHue + 180) % 360;
        for (let i = 0; i < n; i++) {
            const h = i % 2 === 0 ? baseHue : comp;
            const t = Math.floor(i / 2);
            const s = satBase + (i % 2 ? -satVar / 2 : satVar / 2);
            const l = lightBase + (t % 2 ? -lightVar / 2 : lightVar / 2);
            pushColor(h, s, l);
        }
    } else {
        // fallback random spread
        const baseHue = base.h || Math.floor(Math.random() * 360);
        const step = 360 / n;
        for (let i = 0; i < n; i++) {
            const hue = Math.round((baseHue + step * i) % 360);
            const sat = satBase + (i % 2 === 0 ? satVar : -satVar);
            const light = lightBase + (i % 2 === 0 ? lightVar : -lightVar);
            pushColor(hue, sat, light);
        }
    }

    // preserve locked colors (placeholders kept in same positions)
    if (colors.value.length) {
        for (let i = 0; i < Math.min(colors.value.length, out.length); i++) {
            if (colors.value[i] && colors.value[i].locked)
                out[i] = { ...colors.value[i] };
        }
    }

    colors.value = out;
}

async function fetchColorInfo(hex) {
    try {
        const clean = (hex || "").replace("#", "");
        if (!clean) {
            colorInfo.value = null;
            return;
        }
        const res = await fetch(`https://www.thecolorapi.com/id?hex=${clean}`);
        if (!res.ok) throw new Error("api");
        const data = await res.json();
        colorInfo.value = {
            name: data.name?.value || "",
            rgb: data.rgb?.value || null,
            hsl: data.hsl?.value || null,
            hex: data.hex?.value || hex,
        };
    } catch (e) {
        colorInfo.value = null;
    }
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

function onApplyAccent(hex) {
    if (!colors.value.length) return;
    if (colors.value.length >= 2)
        colors.value[1] = { hex, locked: false, copied: false };
    else colors.value.push({ hex, locked: false, copied: false });
    showToast(`${hex.toUpperCase()} применён как акцент`);
}

function applyLibraryPalette(palette) {
    if (!palette || !palette.colors) return;
    // replace current colors with palette colors (preserve locked flags where possible)
    const newColors = palette.colors.map((h) => ({
        hex: h,
        locked: false,
        copied: false,
    }));
    // if existing had locked colors, keep them
    for (let i = 0; i < Math.min(colors.value.length, newColors.length); i++) {
        if (colors.value[i] && colors.value[i].locked)
            newColors[i] = { ...colors.value[i] };
    }
    colors.value = newColors;
    showToast(`Палитра "${palette.name || "Без имени"}" применена`);
}

function savePalette() {
    const payload = {
        colors: colors.value.map((c) => ({ hex: c.hex, locked: c.locked })),
        count: count.value,
        format: format.value,
        bgMode: bgMode.value,
        baseHex: baseHex.value,
        paletteType: paletteType.value,
        mood: mood.value,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    showToast("Палитра сохранена");
}

onMounted(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    // If a shareable palette is provided in the URL, apply it
    try {
        const params = new URLSearchParams(location.search);
        const encoded = params.get("palette");
        if (encoded) {
            const decoded = JSON.parse(atob(decodeURIComponent(encoded)));
            if (decoded && decoded.colors) {
                colors.value = decoded.colors.map((h) => ({
                    hex: h,
                    locked: false,
                    copied: false,
                }));
                baseHex.value = decoded.name || baseHex.value;
                showToast("Применена шаринговая палитра");
                return;
            }
        }
    } catch (e) {
        /* ignore invalid payload */
    }
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            count.value = parsed.count || 5;
            format.value = parsed.format || "HEX";
            bgMode.value = parsed.bgMode || "light";
            baseHex.value = parsed.baseHex || baseHex.value;
            paletteType.value = parsed.paletteType || paletteType.value;
            mood.value = parsed.mood || mood.value;
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
    // fetch info for base color
    fetchColorInfo(baseHex.value);
});

watch(
    [
        () => count.value,
        () => baseHex.value,
        () => paletteType.value,
        () => mood.value,
    ],
    () => {
        // regenerate keeping locked ones
        generatePalette();
        fetchColorInfo(baseHex.value);
    }
);

watch(
    colors,
    (nv) => {
        // auto-save minimal state
        const payload = {
            colors: nv.map((c) => ({ hex: c.hex, locked: c.locked })),
            count: count.value,
            format: format.value,
            bgMode: bgMode.value,
            baseHex: baseHex.value,
            paletteType: paletteType.value,
            mood: mood.value,
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
.layout-grid {
    display: flex;
    gap: 18px;
    align-items: flex-start;
}
.left-column {
    flex: 1;
}
.right-column {
    width: 320px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.bottom-row {
    margin-top: 12px;
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
