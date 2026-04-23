<script setup>
const config = useRuntimeConfig()
const baseURL = config.app.baseURL ?? '/'

const word = ref('')
const word2 = ref('')
const phonetic = ref('')
const errortitle = ref('')
const errormessage = ref('')
const suggestionsArray = ref([])
const definitionsArray = ref([])
const synonymsArray = ref([])
const loading = ref(false)
const initialLoading = ref(true)

function speak(text) {
  if (!text || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  window.speechSynthesis.speak(utterance)
}

onMounted(async () => {
  try {
    let found = false;
    let attempts = 0;
    
    // The herokuapp can return obscure words the dictionary API doesn't know. 
    // We try up to 3 times to find a valid word.
    while (!found && attempts < 3) {
      attempts++;
      try {
        const data = await $fetch('https://random-word-api.herokuapp.com/word');
        const randomWord = data[0];

        definitionsArray.value = [];
        synonymsArray.value = [];
        const dictResponse = await $fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${randomWord}`);
        
        dictResponse[0].meanings.forEach(({ definitions, synonyms }) => {
          definitions.forEach(({ definition }) => {
            if (typeof definition === 'string') {
              definitionsArray.value.push(definition);
            }
          });
          if (synonyms && synonyms.length) {
            synonyms.forEach(syn => {
              if (!synonymsArray.value.includes(syn)) synonymsArray.value.push(syn);
            });
          }
        });
        
        word2.value = dictResponse[0].word;
        phonetic.value = dictResponse[0].phonetic ?? '';
        found = true;
      } catch (err) {
        // Word not found in dictionary or fetch failed, loop will retry
      }
    }
    
    if (!found) {
      // Fallback if 3 random obscure words failed in a row
      word2.value = "Welcome";
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

async function getDefinitions() {
  definitionsArray.value = []
  suggestionsArray.value = []
  synonymsArray.value = []
  errortitle.value = ''
  errormessage.value = ''
  loading.value = true

  try {
    const [dictResponse, sugResponse] = await Promise.all([
      $fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.value}`),
      $fetch(`https://api.datamuse.com/sug?s=${word.value}`)
    ])

    dictResponse[0].meanings.forEach(({ definitions, synonyms }) => {
      definitions.forEach(({ definition }) => {
        if (typeof definition === 'string') {
          definitionsArray.value.push(definition)
        }
      })
      if (synonyms && synonyms.length) {
        synonyms.forEach(syn => {
          if (!synonymsArray.value.includes(syn)) synonymsArray.value.push(syn)
        })
      }
    })

    sugResponse.forEach(({ word: sugWord }) => {
      if (typeof sugWord === 'string') {
        suggestionsArray.value.push(sugWord)
      }
    })

    phonetic.value = dictResponse[0].phonetic ?? ''
    word2.value = dictResponse[0].word
  } catch (error) {
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

useHead({
  title: 'Dictionary by Davies'
})
</script>

<template>
  <div class="text-center mb-4">
    <img class="mb-4" :src="`${baseURL}logo.png`" alt="Dictionary logo" width="72" height="72">
    <h1 class="h3 mb-3 font-weight-normal">My Dictionary</h1>
    <p>
      Definitions from Free Dictionary API &middot;
      <a target="_blank" href="https://dictionaryapi.dev/">Learn more</a>
    </p>
  </div>

  <form class="form-signin" @submit.prevent="getDefinitions()">
    <div class="form-label-group">
      <input
        id="word-input"
        v-model="word"
        type="text"
        class="st form-control"
        placeholder="Enter a word"
        required
        autofocus
      >
      <label for="word-input">Enter a word</label>
      <button
        class="ts btn btn-lg btn-primary btn-block"
        type="submit"
        :disabled="loading"
      >
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ loading ? 'Searching…' : 'Search' }}
      </button>
    </div>
    <p v-if="errortitle" class="text-danger">
      <strong>{{ errortitle }}:</strong> {{ errormessage }}
    </p>
  </form>

  <div class="text-justify mt-4">
    <div v-if="initialLoading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading…</span>
      </div>
    </div>

    <template v-else>
      <div style="display: flex; align-items: center;">
        <img
          class="m-2"
          :src="`${baseURL}sound.svg`"
          alt="Pronounce word"
          width="30"
          height="30"
          style="cursor: pointer;"
          title="Click to hear pronunciation"
          @click="speak(word2)"
        >
        <h2 class="word font-weight-normal mb-0">{{ word2 }}</h2>
        <div class="m-3 text-muted">{{ phonetic }}</div>
      </div>

      <h6 class="mt-4">Definitions</h6>
      <ol type="1">
        <li v-for="(definition, index) in definitionsArray" :key="index">
          {{ definition }}
        </li>
      </ol>

      <template v-if="synonymsArray.length">
        <h6 class="mt-4">Synonyms:</h6>
        <span
          v-for="(synonym, index) in synonymsArray"
          :key="'syn-'+index"
          class="m-1 badge badge-info badge-outlined"
          style="cursor: pointer;"
          title="Click to search"
          @click="word = synonym; getDefinitions()"
        >
          {{ synonym }}
        </span>
      </template>

      <template v-if="suggestionsArray.length">
        <h6 class="mt-4">Suggestions:</h6>
        <span
          v-for="(suggestion, index) in suggestionsArray"
          :key="index"
          class="m-1 badge badge-default badge-outlined"
        >
          {{ suggestion }}
        </span>
      </template>
    </template>
  </div>

  <p class="mt-5 mb-3 text-muted text-center">
    Dictionary by Davies &copy; {{ new Date().getFullYear() }}
  </p>
</template>
