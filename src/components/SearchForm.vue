<template>
  <div class="search-container">
    <h1>Компонент поиска</h1>
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
        <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="44" height="44" rx="4" fill="#00499C"/>
          <mask id="mask0_2616_125" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="10" y="10" width="24" height="24">
          <path d="M13 19.9989C13 23.8649 16.134 26.9989 20 26.9989C21.2055 26.9989 22.3399 26.6941 23.3303 26.1575L27.5859 30.4131C28.367 31.1942 29.6333 31.1942 30.4144 30.4131C31.1954 29.6321 31.1954 28.3658 30.4144 27.5847L26.1587 23.329C26.6953 22.3387 27 21.2044 27 19.9989C27 16.1329 23.866 12.9989 20 12.9989C16.134 12.9989 13 16.1329 13 19.9989ZM25 19.9989C25 22.7603 22.7614 24.9989 20 24.9989C17.2386 24.9989 15 22.7603 15 19.9989C15 17.2375 17.2386 14.9989 20 14.9989C22.7614 14.9989 25 17.2375 25 19.9989Z" fill="white"/>
          </mask>
          <g mask="url(#mask0_2616_125)">
          <rect x="10" y="10" width="24" height="24" fill="white"/>
          </g>
        </svg>
      </button>
      
      <!-- Блок подсказок -->
      <div 
        class="suggestions-container" 
        v-show="showSuggestions && (filteredHistory.length || suggestionsToShow.length || apiSuggestions.length || authors.length || products.length || isLoading)"
      >
        <div v-if="isLoading" class="loading">Загрузка...</div>
        
        <template v-else>
          <!-- История поиска -->
          <template v-if="!searchQuery">
            <div v-if="filteredHistory.length" class="suggestions-title">
              История запросов
              <button @click="clearHistory" class="clear-history">
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
              <button 
                @click.stop="removeFromHistory(item, $event)" 
                class="remove-item"
              >
                ×
              </button>
            </div>

            <!-- Популярные запросы -->
            <div v-if="!filteredHistory.length && suggestionsToShow.length" class="suggestions-title">
              Популярные запросы
            </div>
            <div 
              v-for="(item, index) in suggestionsToShow" 
              :key="'popular-'+index"
              class="suggestion-item"
              @mousedown="selectSuggestion(item)"
            >
              {{ item }}
            </div>
          </template>
          
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
              <img 
                v-if="product.picture" 
                :src="getProductImageUrl(product.picture)" 
                alt=""
                class="product-image"
                loading="lazy"
              >
              <div class="product-info">
                <strong>{{ product.title }}</strong>
                <div class="product-author" v-if="product.author">{{ product.author }}</div>
              </div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useDebounceFn } from '@vueuse/core';

const searchQuery = ref('');
const showSuggestions = ref(false);
const isLoading = ref(false);
const apiSuggestions = ref([]);
const authors = ref([]);
const products = ref([]);
const searchHistory = ref([]);
const activeSuggestionIndex = ref(-1);
const suggestionElements = ref([]);

// Константы для API
const API_BASE_URL = 'https://web-gate.chitai-gorod.ru';
const API_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDg1NDY1NDYsImlhdCI6MTc0ODM3ODU0NiwiaXNzIjoiL2FwaS92MS9hdXRoL2Fub255bW91cyIsInN1YiI6IjM4Njc2OWY5ZDFmNDFhNjA5Mzc1YmJkZTg2NGNjMjFkZDkyZjJkMzJjNDEyODhmNzg2NDk0NjNmNmMyMGEzNTAiLCJ0eXBlIjoxMH0.vI1l7byma8KDNJYANKyZCLipFiqujMl8NcSJ-IceuKk';

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

// Фильтрация истории (первые 5 записей)
const filteredHistory = computed(() => {
  return getHistoryFromStorage().slice(0, 5);
});

// Популярные запросы (показываются только если история пуста)
const suggestionsToShow = computed(() => {
  if (!searchQuery.value && !filteredHistory.value.length) {
    return [
      'благословение небожителей',
      'гарри поттер',
      'человек бензопила',
      'свита короля'
    ];
  }
  return [];
});

// Задерка отправки запроса через debounce
const debouncedSearch = useDebounceFn((phrase) => {
  if (phrase.length >= 3) {
    fetchSuggestions(phrase);
  } else {
    apiSuggestions.value = [];
    authors.value = [];
    products.value = [];
  }
}, 200);

// Обработчик ввода
const handleInput = () => {
  showSuggestions.value = true;
  activeSuggestionIndex.value = -1;
  debouncedSearch(searchQuery.value);
};

// Функция для поиска объекта по ID в массиве included
const findIncluded = (id, type, included) => {
  return included.find(item => item.id === id && item.type === type);
};

// Добавляем функцию для формирования URL изображения
const getProductImageUrl = (picturePath) => {
  if (!picturePath) return '';
  // Удаляем начальный слэш, если он есть
  const cleanPath = picturePath.startsWith('/') ? picturePath.slice(1) : picturePath;
  return `https://content.img-gorod.ru/${cleanPath}?width=40&height=48&fit=bounds`;
};

const fetchSuggestions = async (phrase) => {
  isLoading.value = true;
  apiSuggestions.value = [];
  authors.value = [];
  products.value = [];
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/search/search-phrase-suggests?phrase=${encodeURIComponent(phrase)}&include=authors,products`,
      {
        headers: {
          'Authorization': API_TOKEN,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const json = await response.json();
    
    // Десериализация JSON API
    const included = json.included || [];
    const relationships = json.data?.relationships || {};
    
    // Обработка подсказок
    if (relationships.suggests?.data) {
      apiSuggestions.value = relationships.suggests.data
        .map(({ id }) => findIncluded(id, 'searchPhraseSuggest', included))
        .filter(Boolean)
        .map(suggest => {
          const match = suggest.attributes.template.match(/\{\{(.+?)\}\}(.*)/);
          return {
            base: match ? match[1] : '',
            completion: match ? match[2] : '',
            full: suggest.attributes.plainPhrase
          };
        })
        .slice(0, 5);
    }
    
    // Обработка авторов
    if (relationships.authors?.data) {
      authors.value = relationships.authors.data
        .map(({ id }) => findIncluded(id, 'searchFoundAuthor', included))
        .filter(Boolean)
        .map(author => author.attributes.fullName)
        .slice(0, 2);
    }
    
    // Обработка товаров 
    if (relationships.products?.data) {
      products.value = relationships.products.data
        .map(({ id }) => findIncluded(id, 'product', included))
        .filter(Boolean)
        .map(product => ({
          title: product.attributes.title,
          author: product.attributes.authors?.[0]?.fullName || '',
          price: product.attributes.price,
          picture: product.attributes.originalPicture || product.attributes.picture 
        }))
        .slice(0, 2);
    }
    
  } catch (error) {
    console.error('API error:', error);
  } finally {
    isLoading.value = false;
  }
};

const setSuggestionRef = (el, index) => {
  if (el) {
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
const removeFromHistory = (query, e) => {
  e.stopPropagation();
  e.preventDefault();
  
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

// Навигация с клавиатуры
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

// Сброс активного индекса
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
  border: 1px solid #a5cfff;
  border-radius: 10px;
  outline: none;
  min-height: 55px;
  width: 100%;
  padding: 10px 60px 10px 15px;
  box-sizing: border-box;
}

.search-input:focus-visible{
  outline: 3px solid #C7DFFB;;
}

.search-button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 1px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
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
  align-items: center;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-base {
  font-weight: bold;
  color: #11101E;
}

.suggestion-completion {
  color: #6e6e6e;
  margin-left: 5px;
}

.suggestion-hint {
  color: #999;
  font-size: 0.9em;
  margin-left: 10px;
}

.suggestions-category {
  padding: 8px 15px;
  font-size: 0.9em;
  color: #00499C;
  background-color: #f5f5f5;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.author-item {
  padding-left: 10px 15px;
}

.product-item {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  flex-direction: row;
  justify-content: start;
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