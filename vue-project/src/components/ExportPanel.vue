<template>
    <div class="export-panel">
        <h3>Экспорт и интеграция</h3>
        <label
            >Имя палитры: <input v-model="name" placeholder="Моя палитра"
        /></label>

        <div class="exports">
            <div class="export-block">
                <div class="header">CSS variables</div>
                <textarea readonly :value="cssVars" rows="6"></textarea>
                <div class="row">
                    <button @click="copy(cssVars)">Копировать CSS</button>
                    <button @click="downloadFile(cssVars, nameForFile('.css'))">
                        Скачать .css
                    </button>
                </div>
            </div>

            <div class="export-block">
                <div class="header">SCSS variables</div>
                <textarea readonly :value="scssVars" rows="6"></textarea>
                <div class="row">
                    <button @click="copy(scssVars)">Копировать SCSS</button>
                    <button
                        @click="downloadFile(scssVars, nameForFile('.scss'))"
                    >
                        Скачать .scss
                    </button>
                </div>
            </div>

            <div class="export-block">
                <div class="header">Tailwind colors (snippet)</div>
                <textarea readonly :value="tailwindSnippet" rows="6"></textarea>
                <div class="row">
                    <button @click="copy(tailwindSnippet)">
                        Копировать Tailwind
                    </button>
                    <button
                        @click="
                            downloadFile(tailwindSnippet, nameForFile('.js'))
                        "
                    >
                        Скачать tailwind.js
                    </button>
                </div>
            </div>
        </div>

        <div class="share">
            <label>Ссылка для шаринга:</label>
            <input readonly :value="shareLink" />
            <div class="row">
                <button @click="copy(shareLink)">Копировать ссылку</button>
                <button @click="downloadJSON">Скачать JSON</button>
            </div>
        </div>
        <div v-if="localToast" class="local-toast">{{ localToast }}</div>
    </div>
</template>

<script setup>
import { computed, ref } from "vue";
const props = defineProps({ colors: { type: Array, default: () => [] } });

const name = ref("");
const localToast = ref("");

function formatVarName(i) {
    return `color-${i + 1}`;
}

const cssVars = computed(() => {
    if (!props.colors.length) return "";
    let out = ":root {\n";
    props.colors.forEach((c, i) => (out += `  --${formatVarName(i)}: ${c};\n`));
    out += "}";
    return out;
});

const scssVars = computed(() => {
    if (!props.colors.length) return "";
    return props.colors.map((c, i) => `$${formatVarName(i)}: ${c};`).join("\n");
});

const tailwindSnippet = computed(() => {
    if (!props.colors.length) return "";
    const pal = props.colors.reduce(
        (acc, c, i) => ((acc[formatVarName(i)] = c), acc),
        {}
    );
    return `module.exports = { theme: { extend: { colors: { ${
        name.value || "palette"
    }: ${JSON.stringify(pal, null, 2)} } } } }`;
});

function copy(text) {
    if (!text) return;
    const value =
        typeof text === "function"
            ? text()
            : text && text.value !== undefined
            ? text.value
            : text;
    navigator.clipboard
        .writeText(value)
        .then(() => {
            showLocalToast("Скопировано в буфер");
        })
        .catch(() => showLocalToast("Ошибка копирования"));
}

function showLocalToast(msg, t = 1300) {
    localToast.value = msg;
    setTimeout(() => (localToast.value = ""), t);
}

function nameForFile(ext) {
    const base = (name.value || "palette").replace(/[^a-z0-9\-_]/gi, "_");
    return `${base}${ext}`;
}

function downloadFile(contentRef, filename) {
    const text =
        typeof contentRef === "function"
            ? contentRef()
            : contentRef && contentRef.value !== undefined
            ? contentRef.value
            : contentRef;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showLocalToast("Файл скачан");
}

function downloadJSON() {
    const payload = { name: name.value || "", colors: props.colors };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nameForFile(".json");
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showLocalToast("JSON скачан");
}

const shareLink = computed(() => {
    if (!props.colors.length) return "";
    const payload = { name: name.value || "", colors: props.colors };
    const encoded = encodeURIComponent(btoa(JSON.stringify(payload)));
    return `${location.origin}${location.pathname}?palette=${encoded}`;
});
</script>

<style scoped>
.export-panel {
    padding: 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.exports {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.export-block textarea {
    width: 100%;
    font-family: monospace;
}
.row {
    display: flex;
    gap: 8px;
    margin-top: 6px;
}
.share input {
    width: 100%;
    font-family: monospace;
}
</style>
