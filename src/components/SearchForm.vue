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
      <div class="suggestions-container" v-show="showSuggestions && (filteredSuggestions.length || isLoading)">
        <div v-if="isLoading" class="loading">Загрузка...</div>
        <div v-else>
          <div class="suggestions-title">
            {{ searchQuery ? 'Результаты поиска' : 'История запросов' }}
            <!--Кнопка очистки истории при её наличии истории-->
            <button v-if="!searchQuery && searchHistory.length" @click="clearHistory" class="clear-history">
                Очистить историю
            </button>
          </div>
        </div>
        
        <div 
          class="suggestion-item" 
          v-for="(item, index) in filteredSuggestions" 
          :key="index"
          @mousedown="selectSuggestion(item.replace(/^(Автор|Товар): /, ''))"
        >
          {{ item }}
          <!--Кнопка удаления при нахождении запроса в истории-->
          <button 
          v-if="!searchQuery && searchHistory.includes(item)"
          @click.stop="removeFromHistory(item)"
          class="remove-item"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed} from 'vue';

const API_URL = 'https://web-gate.chitai-gorod.ru';
const API_TOKEN = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3VzZXItcmlnaHQiLCJzdWIiOiJjOTMxYmZlMzYxNTMzMjMyNTA0MDg4MDA2NjA2OTRlMmRiNTJkODkyNzhkYWU2NThkNWQxYTQ0NGJmMDUzY2NmIiwiaWF0IjoxNzQ3NzQzMDAzLCJleHAiOjE3NDc3NDY2MDMsInR5cGUiOjEwfQ.mL9gIIlHMOGL0TtHwcPj1Shlh4N_nCjvpBgC9aCX9kk';
const POPULAR_SUGGESTIONS = ['книги', 'канцтовары', 'подарки', 'бестселлеры', 'новинки'];

const searchHistory = ref(['пиши сокращай ильяхов',
  'пушкин сказки',
  'ручка шариковая синяя 7 мм',
  'гарри поттер',
  'грри пттр',
  'поттер'
]); //пока с заглушкой
const searchQuery = ref(''); // поисковый запрос
const showSuggestions = ref(false); // флаг отображения подсказок
const apiSuggestions = ref([]); // апишка для подсказок
const authors = ref([]);
const products = ref([]);
const isLoading = ref(false); // флаг загрузки
const debounceTimeout = ref(null); //

// Методы для LocalStorage
// Проверка на существование истории
const getHistoryFromStorage = () => {
  try {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

// Сохранение запроса в локалку
const saveHistoryToStorage = (history) => {
  try {
    localStorage.setItem('searchHistory', JSON.stringify(history));
  } catch (e) {
    console.error('LocalStorage error:', e);
  }
};

// удаление из истории одного эллемента
const removeFromHistory = (query) => {
  const history = getHistoryFromStorage().filter(item => item !== query);
  saveHistoryToStorage(history);
  searchHistory.value = history;
};

// Очистка всех запросов из истории
const clearHistory = () => {
  saveHistoryToStorage([]);
  searchHistory.value = [];
};

// загрузка подсказок из АПИ
const fetchSuggestions = async (phrase) => {
  if (phrase.length < 3) return;
  
  isLoading.value = true;
  
  try {
    const response = await fetch(
      `${API_URL}/api/v2/search/search-phrase-suggests?phrase=${encodeURIComponent(phrase)}&include[]=authors&include[]=products`,
      {
        headers: {
          'Authorization': API_TOKEN
        }
      }
    );
    
    const data = await response.json();
    
    apiSuggestions.value = data.included
      .filter(item => item.type === 'searchPhraseSuggest')
      .map(item => item.attributes.plainPhrase)
      .slice(0, 5);
      
    authors.value = data.included
      .filter(item => item.type === 'searchFoundAuthor')
      .map(item => item.attributes.fullName)
      .slice(0, 2);
      
    products.value = data.included
      .filter(item => item.type === 'product')
      .map(item => item.attributes.title)
      .slice(0, 3);
      
  } catch (error) {
    console.error('API error:', error);
  } finally {
    isLoading.value = false;
  }
};

// Фильтруем историю поиска в зависимости от введённых данных
const filteredSuggestions = computed(() => {
  if (!searchQuery.value) {
    const history = getHistoryFromStorage();
    return history.length ? history.slice(0, 5) : POPULAR_SUGGESTIONS;
  }

  if (searchQuery.value.length < 3) {
    return [];
  }
  
  return [
    ...apiSuggestions.value,
    ...authors.value.map(author => `Автор: ${author}`),
    ...products.value.map(product => `Товар: ${product}`)
  ];
});

// Выпадающие подсказки из истории при фокусе и вводе текста 
const handleInput = () => {
  showSuggestions.value = true;

  if (debounceTimeout.value) {
    clearTimeout(debounceTimeout.value);
  }
  
  debounceTimeout.value = setTimeout(() => {
    fetchSuggestions(searchQuery.value);
  }, 200);
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
  const history = getHistoryFromStorage();
  if (!history.includes(searchQuery.value)) {
    const newHistory = [searchQuery.value, ...history].slice(0, 10);
    saveHistoryToStorage(newHistory);
    searchHistory.value = newHistory;
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

.loading {
  padding: 10px;
  color: #666;
}

.clear-history {
  float: right;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 0.8em;
}

.remove-item {
  float: right;
  background: none;
  border: none;
  color: #ff0000;
  cursor: pointer;
  padding: 0 5px;
}

.remove-item:hover {
  color: #f00;
}
</style>