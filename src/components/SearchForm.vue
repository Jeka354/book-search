<template>
  <div class="search-container">
    <h1>Найти книгу или товар</h1>
    <div class="search-input-wrapper">
      <input 
        type="text" 
        placeholder="Введите название книги или товара"
        class="search-input"
      >
      <button class="search-button">
        <svg class="search-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchForm'
}
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
</style>