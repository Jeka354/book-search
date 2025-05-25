<template>
  <div class="search-container">
    <h1>Найти книгу или товар</h1>
    <div class="search-input-wrapper">
      <input 
        type="text" 
        v-model="searchQuery"
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="onBlur"
        @keydown="handleKeyDown"
        placeholder="Введите название книги или товара"
        class="search-input"
      >
      <button class="search-button" @click="performSearch">
        <svg class="search-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
      
      <!-- Блок подсказок -->
      <div 
        class="suggestions-container" 
        v-show="showSuggestions && (filteredHistory.length || apiSuggestions.length || authors.length || products.length || isLoading)"
      >
        <div v-if="isLoading" class="loading">Загрузка...</div>
        
        <template v-else>
          <!-- История поиска -->
          <div v-if="!searchQuery && filteredHistory.length" class="suggestions-title">
            История запросов
            <button v-if="filteredHistory.length" @click="clearHistory" class="clear-history">
              Очистить историю
            </button>
          </div>
          <div 
            v-for="(item, index) in filteredHistory" 
            :key="'history-'+index"
            class="suggestion-item"
            @mousedown="selectSuggestion(item)"
          >
            {{ item }}
            <button @click.stop="removeFromHistory(item)" class="remove-item">×</button>
          </div>
          
          <!-- Результаты поиска -->
          <template v-if="searchQuery">
            <div class="suggestions-title">Результаты поиска</div>
            
            <!-- Подсказки -->
            <div 
              v-for="(suggestion, index) in apiSuggestions" 
              :key="'suggest-'+index"
              :ref="el => setSuggestionRef(el, index)"
              class="suggestion-item"
              :class="{ 'active-suggestion': activeSuggestionIndex === index }"
              @mousedown="selectSuggestion(suggestion)"
            >
              <span class="suggestion-base">{{ suggestion.base }}</span>
              <span class="suggestion-completion">{{ suggestion.completion }}</span>
              <span class="suggestion-hint" v-if="index === 0">
                {{ suggestion.completion.split(' ')[0] }}
              </span>
            </div>
            
            <!-- Авторы -->
            <div class="suggestions-category" v-if="authors.length">Авторы</div>
            <div 
              v-for="(author, index) in authors" 
              :key="'author-'+index"
              :ref="el => setSuggestionRef(el, apiSuggestions.length + index)"
              class="suggestion-item author-item"
              :class="{ 'active-suggestion': activeSuggestionIndex === apiSuggestions.length + index }"
              @mousedown="selectSuggestion(author)"
            >
              {{ author }}
            </div>
            
            <!-- Товары -->
            <div class="suggestions-category" v-if="products.length">Книги и товары</div>
            <div 
              v-for="(product, index) in products" 
              :key="'product-'+index"
              :ref="el => setSuggestionRef(el, apiSuggestions.length + authors.length + index)"
              class="suggestion-item product-item"
              :class="{ 'active-suggestion': activeSuggestionIndex === apiSuggestions.length + authors.length + index }"
              @mousedown="selectSuggestion(product)"
            >
              <strong>{{ product.title }}</strong>
              <div class="product-author" v-if="product.author">{{ product.author }}</div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

// const POPULAR_SUGGESTIONS = ['книги', 'канцтовары', 'подарки', 'бестселлеры', 'новинки'];

const searchQuery = ref('');
const showSuggestions = ref(false);
const isLoading = ref(false);
const apiSuggestions = ref([]);
const authors = ref([]);
const products = ref([]);
const searchHistory = ref([]);
const debounceTimeout = ref(null);
const activeSuggestionIndex = ref(-1);
const suggestionElements = ref([]);

// Получение истории из LocalStorage
const getHistoryFromStorage = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// Сохранение истории в LocalStorage
const saveHistoryToStorage = (history) => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
};

// Инициализация истории при загрузке
searchHistory.value = getHistoryFromStorage();

// Фильтрация истории
const filteredHistory = computed(() => {
  if (searchQuery.value) {
    return searchHistory.value.filter(item => 
      item.toLowerCase().includes(searchQuery.value.toLowerCase())
      ).slice(0, 5);
  }
  return searchHistory.value.slice(0, 5);
});

// Обработчик ввода
const handleInput = () => {
  showSuggestions.value = true;
  activeSuggestionIndex.value = -1;
  
  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
  
  debounceTimeout.value = setTimeout(() => {
    if (searchQuery.value.length >= 3) {
      fetchSuggestions(searchQuery.value);
    } else {
      apiSuggestions.value = [];
      authors.value = [];
      products.value = [];
    }
  }, 200);
};

// Имитация API
const fetchSuggestions = async (phrase) => {
  isLoading.value = true;
  apiSuggestions.value = [];
  authors.value = [];
  products.value = [];
  
  try {
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Здесь должен быть реальный запрос к API
    // Вместо этого используем mock-данные
    const mockResponse = {
      included: [
        // Подсказки
        {
          attributes: {
            plainPhrase: phrase + ' подсказка 1',
            template: `{{${phrase}}} подсказка 1`
          },
          type: 'searchPhraseSuggest'
        },
        // Авторы
        {
          attributes: {
            fullName: 'Автор для ' + phrase
          },
          type: 'searchFoundAuthor'
        },
        // Товары
        {
          attributes: {
            title: 'Товар по запросу ' + phrase,
            authors: [{ fullName: 'Автор товара' }]
          },
          type: 'product'
        }
      ]
    };
    
    // Обработка подсказок
    apiSuggestions.value = mockResponse.included
      .filter(item => item?.type === 'searchPhraseSuggest')
      .map(item => {
        const match = item.attributes.template.match(/\{\{(.+?)\}\}(.*)/);
        return {
          base: match[1],
          completion: match[2],
          full: item.attributes.plainPhrase
        };
      })
      .slice(0, 5);
      
    // Обработка авторов
    authors.value = mockResponse.included
      .filter(item => item?.type === 'searchFoundAuthor')
      .map(item => item.attributes.fullName)
      .slice(0, 2);
      
    // Обработка товаров
    products.value = mockResponse.included
      .filter(item => item?.type === 'product')
      .map(item => ({
        title: item.attributes.title,
        author: item.attributes.authors?.[0]?.fullName || ''
      }))
      .slice(0, 2);
      
  } catch (error) {
    console.error('API error:', error);
  } finally {
    isLoading.value = false;
  }
};

const setSuggestionRef = (el, index) => {
  if (el) {
    // Инициализируем массив при необходимости
    if (!suggestionElements.value[index]) {
      suggestionElements.value = [...suggestionElements.value];
    }
    suggestionElements.value[index] = el;
  }
};

// Выбор подсказки
const selectSuggestion = (item) => {
  let selectedText = '';
  
  if (typeof item === 'string') {
    selectedText = item;
  } else if (item?.full) {
    selectedText = item.full;
  } else if (item?.title) {
    selectedText = item.title;
  }
  
  searchQuery.value = selectedText;
  showSuggestions.value = false;
  performSearch();
};

// Потеря фокуса
const onBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Удаление из истории
const removeFromHistory = (query) => {
  const history = getHistoryFromStorage().filter(item => item !== query);
  saveHistoryToStorage(history);
  searchHistory.value = history;
};

// Очистка истории
const clearHistory = () => {
  saveHistoryToStorage([]);
  searchHistory.value = [];
};

// Выполнение поиска
const performSearch = () => {
  const query = typeof searchQuery.value === 'string' 
    ? searchQuery.value 
    : searchQuery.value.full || searchQuery.value.title || '';
  
  if (!query.trim()) return;
  
  const history = getHistoryFromStorage();
  if (!history.includes(query)) {
    const newHistory = [query, ...history].slice(0, 10);
    saveHistoryToStorage(newHistory);
    searchHistory.value = newHistory;
  }
  
  console.log('Выполняем поиск:', query);
};

const handleKeyDown = (e) => {
  const totalSuggestions = apiSuggestions.value.length + authors.value.length + products.value.length;
  
  if (totalSuggestions === 0) return;
  
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      activeSuggestionIndex.value = activeSuggestionIndex.value <= 0 
        ? totalSuggestions - 1 
        : activeSuggestionIndex.value - 1;
      scrollToActive();
      break;
      
    case 'ArrowDown':
      e.preventDefault();
      activeSuggestionIndex.value = activeSuggestionIndex.value >= totalSuggestions - 1 
        ? 0 
        : activeSuggestionIndex.value + 1;
      scrollToActive();
      break;
      
    case 'Enter':
      if (activeSuggestionIndex.value >= 0) {
        e.preventDefault();
        selectActiveSuggestion();
      }
      break;
      
    case 'Tab':
    case 'ArrowRight':
      if (activeSuggestionIndex.value >= 0) {
        e.preventDefault();
        completeCurrentWord();
      }
      break;
  }
};

const scrollToActive = () => {
  nextTick(() => {
    if (activeSuggestionIndex.value >= 0 && suggestionElements.value[activeSuggestionIndex.value]) {
      suggestionElements.value[activeSuggestionIndex.value].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  });
};

const selectActiveSuggestion = () => {
  const totalApi = apiSuggestions.value.length;
  const totalAuthors = authors.value.length;
  
  if (activeSuggestionIndex.value < totalApi) {
    selectSuggestion(apiSuggestions.value[activeSuggestionIndex.value]);
  } else if (activeSuggestionIndex.value < totalApi + totalAuthors) {
    selectSuggestion(authors.value[activeSuggestionIndex.value - totalApi]);
  } else {
    selectSuggestion(products.value[activeSuggestionIndex.value - totalApi - totalAuthors]);
  }
};

const completeCurrentWord = () => {
  if (activeSuggestionIndex.value < apiSuggestions.value.length) {
    const suggestion = apiSuggestions.value[activeSuggestionIndex.value];
    searchQuery.value = suggestion.base + suggestion.completion.split(' ')[0];
  }
};

// Сбрасываем активный индекс при скрытии подсказок
watch(showSuggestions, (val) => {
  if (!val) activeSuggestionIndex.value = -1;
});
</script>

<style scoped>
.search-container {
  padding: 20px;
  position: relative;
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
  max-height: 400px;
  overflow-y: auto;
}

.loading {
  padding: 10px;
  color: #666;
  text-align: center;
}

.suggestions-title {
  padding: 8px 15px;
  font-size: 0.9em;
  color: #666;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.clear-history {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.8em;
}

.suggestion-item {
  padding: 8px 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-base {
  font-weight: bold;
  color: #1a73e8;
}

.suggestion-completion {
  color: #333;
}

.suggestion-hint {
  color: #999;
  font-size: 0.9em;
  margin-left: 10px;
}

.suggestions-category {
  padding: 8px 15px;
  font-size: 0.9em;
  color: #666;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.author-item {
  padding-left: 25px;
}

.product-item {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-direction: column;
  align-items: flex-start;
}

.product-author {
  font-size: 0.8em;
  color: #666;
  margin-top: 3px;
}

.remove-item {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 1.2em;
  padding: 0 5px;
}

.remove-item:hover {
  color: #f00;
}

.active-suggestion {
  background-color: #e8f0fe !important;
  color: #1a73e8;
}
</style>