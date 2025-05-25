// Имиитация ответа сервера

export const mockSearchResponse = {
  data: {
    attributes: {},
    id: "mock-id",
    relationships: {
      authors: {
        data: [
          { id: "597079", type: "searchFoundAuthor" },
          { id: "569189", type: "searchFoundAuthor" }
        ]
      },
      products: {
        data: [
          { id: "2405917", type: "product" },
          { id: "2415361", type: "product" }
        ]
      },
      suggests: {
        data: [
          { id: "1", type: "searchPhraseSuggest" },
          { id: "2", type: "searchPhraseSuggest" },
          { id: "3", type: "searchPhraseSuggest" },
          { id: "4", type: "searchPhraseSuggest" },
          { id: "5", type: "searchPhraseSuggest" }
        ]
      }
    },
    type: "searchPhraseSuggestResult"
  },
  included: [
    // Подсказки
    {
      attributes: {
        plainPhrase: "пушкин",
        template: "{{пуш}}кин"
      },
      id: "1",
      type: "searchPhraseSuggest"
    },
    {
      attributes: {
        plainPhrase: "пушкин сказки",
        template: "{{пуш}}кин сказки"
      },
      id: "2",
      type: "searchPhraseSuggest"
    },
    {
      attributes: {
        plainPhrase: "пушкин евгений онегин",
        template: "{{пуш}}кин евгений онегин"
      },
      id: "3",
      type: "searchPhraseSuggest"
    },
    {
      attributes: {
        plainPhrase: "пушкин собрание сочинений",
        template: "{{пуш}}кин собрание сочинений"
      },
      id: "4",
      type: "searchPhraseSuggest"
    },
    {
      attributes: {
        plainPhrase: "пушкин стихи",
        template: "{{пуш}}кин стихи"
      },
      id: "5",
      type: "searchPhraseSuggest"
    },
    // Авторы
    {
      attributes: {
        fullName: "Александр Пушкин",
        slug: "pushkin-aleksandr"
      },
      id: "597079",
      type: "searchFoundAuthor"
    },
    {
      attributes: {
        fullName: "Василий Пушкин",
        slug: "pushkin-vasiliy"
      },
      id: "569189",
      type: "searchFoundAuthor"
    },
    // Товары
    {
      attributes: {
        title: "А.С. Пушкин. Избранное",
        authors: [{ fullName: "Александр Пушкин" }]
      },
      id: "2405917",
      type: "product"
    },
    {
      attributes: {
        title: "Александр Пушкин. Для детей",
        authors: [{ fullName: "Александр Пушкин" }]
      },
      id: "2415361",
      type: "product"
    }
  ]
};