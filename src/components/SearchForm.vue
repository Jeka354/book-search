<template>
  <div class="search-container">
    <h1>Найти книгу или товар</h1>
    <div class="search-input-wrapper">
      <input 
        type="text" 
        placeholder="Введите название книги или товара"
        v-model="searchQuery"
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="onBlur"
        class="search-input"
      >
      <button class="search-button" @click="performSearch">
        <svg class="search-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
      <div class="suggestions-container" v-show="showSuggestions && filteredSuggestions.length">
        <div class="suggestions-title">История запросов</div>
        <div 
          class="suggestion-item" 
          v-for="(item, index) in filteredSuggestions" 
          :key="index"
          @mousedown="selectSuggestion(item)"
        >
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// загдушка. !!! Добавить локальное хранилище
const searchHistory = ref([
  'пиши сокращай ильяхов',
  'пушкин сказки',
  'ручка шариковая синяя 7 мм',
  'гарри поттер',
  'грри пттр'
]);

const searchQuery = ref('');
const showSuggestions = ref(false);

// Фильтруем историю поиска в зависимости от введённых данных
const filteredSuggestions = computed(() => {
  if (!searchQuery.value) return searchHistory.value;
  return searchHistory.value.filter(item => 
    item.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Выпадающие подсказки из истории при фокусе и вводе текста 
const handleInput = () => {
  showSuggestions.value = true;
};

// скрыть подсказки при потере фокуса
const onBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const selectSuggestion = (suggestion) => {
  searchQuery.value = suggestion;
  showSuggestions.value = false;
  performSearch();
};


const performSearch = () => {
  if (!searchQuery.value.trim()) return;
  
  // Добавить  запрос в историю, если его там нет
  if (!searchHistory.value.includes(searchQuery.value)) {
    searchHistory.value.unshift(searchQuery.value);
  }
  
  console.log('Выполняем поиск:', searchQuery.value);
};

</script>

<style scoped>
.search-container {
  padding: 20px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 10px 40px 10px 15px;
  box-sizing: border-box;
}

.search-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.search-icon {
  width: 20px;
  height: 20px;
  fill: #555;
}

.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 100;
  margin-top: 5px;
}

.suggestions-title {
  padding: 8px 15px;
  font-size: 0.9em;
  color: #666;
  border-bottom: 1px solid #eee;
}

.suggestion-item {
  padding: 8px 15px;
  cursor: pointer;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}
</style>