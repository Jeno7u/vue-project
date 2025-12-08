<template>
    <div id="app">
        <header class="app-header">
            <h1>🎯 Vue 3 Практика - Основы</h1>
            <p>Изучаем реактивность, директивы и компоненты</p>
        </header>
        <!-- Палитра генератор -->
        <main class="main-content">
            <PaletteGenerator />
        </main>
        <footer class="app-footer">
            <p>Vue 3 + Vite • Практика 27</p>
        </footer>
    </div>
</template>
<script>
import {} from "vue";
import PaletteGenerator from "./components/PaletteGenerator.vue";
export default {
    name: "App",
    components: {
        PaletteGenerator,
    },
};
</script>
<style>
/* Глобальные стили */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
body {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
}
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}
/* Стили шапки 
.app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}
.app-header h1 {
    margin-bottom: 0.5rem;
    font-size: 2.5rem;
}
.app-header p {
    opacity: 0.9;
    font-size: 1.1rem;
}
/* Навигация */
.navigation {
    display: flex;
    justify-content: center;
    gap: 1rem;
    padding: 1.5rem;
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    flex-wrap: wrap;
}
.nav-button {
    padding: 0.75rem 1.5rem;
    border: 2px solid #667eea;
    background-color: transparent;
    color: #667eea;
    border-radius: 25px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
}
.nav-button:hover {
    background-color: #667eea;
    color: white;
    transform: translateY(-2px);
}
.nav-button.active {
    background-color: #667eea;
    color: white;
}
/* Основное содержимое */
.main-content {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
}
.welcome-message {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
}
.welcome-message h2 {
    margin-bottom: 1rem;
    color: #333;
}
/* Подвал */
.app-footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: auto;
}
</style>
