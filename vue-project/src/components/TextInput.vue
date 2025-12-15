<template>
    <input
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        v-bind="$attrs"
    />
</template>

<script setup>
const props = defineProps({ modelValue: { type: String, default: "" } });
</script>

<style scoped>
input {
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #ccc;
}
</style>
