import { ref, onMounted } from 'vue'

export function useDictionary() {
  const query = ref('')
  const currentWord = ref('')
  const phonetic = ref('')
  const errortitle = ref('')
  const errormessage = ref('')
  const suggestionsArray = ref<string[]>([])
  const definitionsArray = ref<string[]>([])
  const synonymsArray = ref<string[]>([])
  const loading = ref(false)
  const initialLoading = ref(true)

  function speak(text: string) {
    if (!text || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  }

  onMounted(async () => {
    try {
      let found = false;
      let attempts = 0;
      
      while (!found && attempts < 3) {
        attempts++;
        try {
          const data = await $fetch<string[]>('https://random-word-api.herokuapp.com/word');
          const randomWord = data[0];

          definitionsArray.value = [];
          synonymsArray.value = [];
          const dictResponse = await $fetch<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
          
          dictResponse[0].meanings.forEach(({ definitions, synonyms }: any) => {
            definitions.forEach(({ definition }: any) => {
              if (typeof definition === 'string') {
                definitionsArray.value.push(definition);
              }
            });
            if (synonyms && synonyms.length) {
              synonyms.forEach((syn: string) => {
                if (!synonymsArray.value.includes(syn)) synonymsArray.value.push(syn);
              });
            }
          });
          
          currentWord.value = dictResponse[0].word;
          phonetic.value = dictResponse[0].phonetic ?? '';
          found = true;
        } catch (err) {
          // Word not found in dictionary or fetch failed, loop will retry
        }
      }
      
      if (!found) {
        currentWord.value = "Welcome";
        phonetic.value = "";
        definitionsArray.value = ["Please search for a word above."];
        synonymsArray.value = [];
      }
    } catch (error) {
      console.error('Failed to fetch initial word:', error);
    } finally {
      initialLoading.value = false;
    }
  })

  async function searchWord() {
    definitionsArray.value = []
    suggestionsArray.value = []
    synonymsArray.value = []
    errortitle.value = ''
    errormessage.value = ''
    loading.value = true

    try {
      const [dictResponse, sugResponse] = await Promise.all([
        $fetch<any>(`https://api.dictionaryapi.dev/api/v2/entries/en/${query.value}`),
        $fetch<any>(`https://api.datamuse.com/sug?s=${query.value}`)
      ])

      dictResponse[0].meanings.forEach(({ definitions, synonyms }: any) => {
        definitions.forEach(({ definition }: any) => {
          if (typeof definition === 'string') {
            definitionsArray.value.push(definition)
          }
        })
        if (synonyms && synonyms.length) {
          synonyms.forEach((syn: string) => {
            if (!synonymsArray.value.includes(syn)) synonymsArray.value.push(syn)
          })
        }
      })

      sugResponse.forEach(({ word: sugWord }: any) => {
        if (typeof sugWord === 'string') {
          suggestionsArray.value.push(sugWord)
        }
      })

      phonetic.value = dictResponse[0].phonetic ?? ''
      currentWord.value = dictResponse[0].word
    } catch (error: any) {
      if (error?.data) {
        errortitle.value = error.data.title ?? 'Error'
        errormessage.value = error.data.message ?? 'Something went wrong'
      } else {
        errortitle.value = 'Error'
        errormessage.value = error.message ?? 'Something went wrong'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    query,
    currentWord,
    phonetic,
    errortitle,
    errormessage,
    suggestionsArray,
    definitionsArray,
    synonymsArray,
    loading,
    initialLoading,
    speak,
    searchWord
  }
}
