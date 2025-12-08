<template>
    <div class="mockup" :class="bgMode">
        <div class="top" :style="{ backgroundColor: colors[0] || '#ddd' }">
            Header
        </div>
        <div class="content">
            <button
                class="mock-btn"
                :style="{ backgroundColor: colors[1] || '#999' }"
            >
                Кнопка
            </button>
            <div class="card" :style="{ borderColor: colors[2] || '#bbb' }">
                Карточка
            </div>
        </div>
        <div class="footer" :style="{ backgroundColor: colors[3] || '#eee' }">
            Footer
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    colors: { type: Array, default: () => [] },
    bgMode: { type: String, default: "light" },
});
</script>

<style scoped>
.mockup {
    border-radius: 12px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.mockup.light {
    background: #fff;
    color: #111;
}
.mockup.dark {
    background: #111;
    color: #fff;
}
.top {
    padding: 12px;
    border-radius: 8px;
    color: white;
    font-weight: 700;
}
.content {
    display: flex;
    gap: 12px;
    align-items: center;
}
.mock-btn {
    padding: 8px 12px;
    border: none;
    color: white;
    border-radius: 6px;
    cursor: default;
}
.card {
    padding: 18px;
    border: 2px solid;
    border-radius: 8px;
    min-width: 120px;
}
.footer {
    padding: 8px;
    border-radius: 6px;
    color: white;
}
</style>
