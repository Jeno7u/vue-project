<template>
    <div class="library">
        <h3>Библиотека палитр</h3>
        <div class="library-controls">
            <input v-model="query" placeholder="Поиск по имени или тегам" />
            <button @click="openCreate">Сохранить текущую</button>
            <button @click="exportLibrary">Экспорт библиотеки</button>
            <button @click="triggerImport">Импорт библиотеки</button>
            <input
                ref="fileInput"
                type="file"
                accept="application/json"
                style="display: none"
                @change="onFileChosen"
            />
        </div>

        <div class="list">
            <div v-if="filtered.length === 0" class="empty">
                Нет сохранённых палитр
            </div>
            <div v-for="p in filtered" :key="p.id" class="palette-item">
                <div class="swatches">
                    <div
                        v-for="c in p.colors"
                        :key="c"
                        class="sw"
                        :style="{ background: c }"
                    ></div>
                </div>
                <div class="meta">
                    <div class="title">{{ p.name }}</div>
                    <div class="tags">{{ p.tags?.join(", ") }}</div>
                </div>
                <div class="actions">
                    <button @click="$emit('apply', p)">Применить</button>
                    <button @click="toggleFav(p)">
                        {{ p.favorite ? "★" : "☆" }}
                    </button>
                    <button @click="openEdit(p)">Изменить</button>
                    <button @click="remove(p.id)">Удалить</button>
                </div>
            </div>
        </div>

        <div class="editor" v-if="editing">
            <h4>{{ editing.id ? "Редактировать" : "Создать" }} палитру</h4>
            <label>Имя: <TextInput v-model="editing.name" /></label>
            <label>Теги (через запятую): <input v-model="tagsInput" /></label>
            <div class="editor-actions">
                <button @click="saveEdit">Сохранить</button>
                <button @click="closeEdit">Отмена</button>
            </div>
        </div>
        <div v-if="localToast" class="local-toast">{{ localToast }}</div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import TextInput from "./TextInput.vue";
const emit = defineEmits(["apply"]);
const props = defineProps({
    currentColors: { type: Array, default: () => [] },
});

const STORAGE_KEY = "vue_palette_library_v1";
const items = ref([]);
const query = ref("");
const editing = ref(null);
const tagsInput = ref("");
const localToast = ref("");
const fileInput = ref(null);

function load() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        items.value = raw ? JSON.parse(raw) : [];
    } catch (e) {
        items.value = [];
    }
}

function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
}

function openCreate() {
    editing.value = {
        id: null,
        name: "",
        tags: [],
        colors: props.currentColors.slice(),
    };
    tagsInput.value = "";
}

function openEdit(p) {
    editing.value = { ...p, colors: p.colors.slice() };
    tagsInput.value = (p.tags || []).join(", ");
}

function closeEdit() {
    editing.value = null;
    tagsInput.value = "";
}

function saveEdit() {
    if (!editing.value) return;
    const tags = tagsInput.value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    if (!editing.value.id) {
        const id = Date.now().toString(36);
        items.value.unshift({
            id,
            name: editing.value.name || "Без имени",
            tags,
            colors: editing.value.colors.slice(),
            favorite: false,
            created: Date.now(),
        });
    } else {
        const idx = items.value.findIndex((x) => x.id === editing.value.id);
        if (idx >= 0)
            items.value[idx] = {
                ...items.value[idx],
                name: editing.value.name,
                tags,
                colors: editing.value.colors.slice(),
            };
    }
    persist();
    closeEdit();
}

function remove(id) {
    if (!window.confirm("Удалить эту палитру?")) return;
    items.value = items.value.filter((x) => x.id !== id);
    persist();
    showLocalToast("Палитра удалена");
}

function toggleFav(p) {
    p.favorite = !p.favorite;
    persist();
}

function apply(p) {
    emit("apply", p);
}

function showLocalToast(msg, t = 1400) {
    localToast.value = msg;
    setTimeout(() => (localToast.value = ""), t);
}

function exportLibrary() {
    const blob = new Blob([JSON.stringify(items.value, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "palette-library.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showLocalToast("Библиотека экспортирована");
}

function triggerImport() {
    fileInput.value?.click();
}

function onFileChosen(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            if (!Array.isArray(parsed)) throw new Error("invalid");
            // merge, avoid id collisions
            const existingIds = new Set(items.value.map((i) => i.id));
            parsed.forEach((p) => {
                if (!p.id || existingIds.has(p.id))
                    p.id =
                        Date.now().toString(36) +
                        Math.random().toString(36).slice(2, 6);
                items.value.unshift({
                    ...p,
                    created: Date.now(),
                    favorite: !!p.favorite,
                });
            });
            persist();
            showLocalToast("Импорт завершён");
        } catch (err) {
            showLocalToast("Ошибка импорта");
        }
    };
    reader.readAsText(f);
}

const filtered = computed(() => {
    const q = (query.value || "").toLowerCase().trim();
    let list = items.value.slice();
    // sort favorites first, then recent
    list.sort((a, b) => b.favorite - a.favorite || b.created - a.created);
    if (!q) return list;
    return list.filter(
        (it) =>
            (it.name || "").toLowerCase().includes(q) ||
            (it.tags || []).some((t) => t.toLowerCase().includes(q))
    );
});

onMounted(() => load());
</script>

<style scoped>
.library {
    padding: 10px;
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);
}
.library-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
}
.list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}
.palette-item {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 6px;
    border-radius: 8px;
}
.swatches {
    display: flex;
    gap: 4px;
}
.sw {
    width: 28px;
    height: 28px;
    border-radius: 4px;
}
.meta {
    flex: 1;
}
.actions button {
    margin-left: 6px;
}
.editor {
    margin-top: 12px;
    padding: 8px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
}
.editor-actions {
    margin-top: 8px;
}
.empty {
    color: #666;
}
.local-toast {
    position: relative;
    margin-top: 8px;
    padding: 6px 10px;
    background: #222;
    color: #fff;
    border-radius: 6px;
    display: inline-block;
}
</style>
