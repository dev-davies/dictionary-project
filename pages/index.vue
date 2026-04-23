<script setup>
const config = useRuntimeConfig()
const baseURL = config.app.baseURL ?? '/'

const {
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
} = useDictionary()

useHead({
  title: 'Dictionary by Davies'
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-300 flex flex-col items-center justify-start p-4 pt-16 lg:p-8 font-sans">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <img class="mx-auto mb-6 w-20 h-20 drop-shadow-lg" :src="`${baseURL}logo.png`" alt="Dictionary logo">
      <h1 class="text-3xl font-bold text-slate-100 mb-2">My Dictionary</h1>
      <p class="text-slate-400 text-sm">
        Definitions from Free Dictionary API &middot;
        <a target="_blank" href="https://dictionaryapi.dev/" class="text-emerald-500 hover:text-emerald-400 transition-colors">Learn more</a>
      </p>
    </div>

    <!-- Search Form -->
    <form class="w-full max-w-md mb-8 relative" @submit.prevent="searchWord()">
      <label for="word-input" class="sr-only">Enter a word</label>
      <div class="flex shadow-lg rounded-md relative z-10">
        <input
          id="word-input"
          v-model="query"
          type="text"
          class="font-mono w-full bg-slate-900/50 border border-slate-800 rounded-l-md px-4 py-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all backdrop-blur-sm"
          placeholder="Enter a word..."
          required
          autofocus
        >
        <button
          class="bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-600 hover:border-emerald-500 rounded-r-md px-6 py-3 font-semibold transition-colors flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed"
          type="submit"
          :disabled="loading"
        >
          <span v-if="loading" class="mr-2 animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ loading ? 'Searching…' : 'Search' }}
        </button>
      </div>
      <p v-if="errortitle" class="text-red-400 text-sm mt-3 font-mono absolute w-full text-center">
        <strong class="font-bold">{{ errortitle }}:</strong> {{ errormessage }}
      </p>
    </form>

    <!-- Main Content -->
    <div class="w-full max-w-2xl flex-grow pb-16">
      <div v-if="initialLoading" class="flex justify-center mt-12">
        <div class="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>

      <template v-else>
        <!-- Word Header -->
        <div class="flex items-center justify-center space-x-4 mb-8">
          <button 
            @click="speak(currentWord)"
            class="text-slate-400 hover:text-emerald-400 transition-colors p-2 rounded-full hover:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            title="Click to hear pronunciation"
          >
            <!-- Using filter invert to make the black icon white/grayish to fit dark mode -->
            <img :src="`${baseURL}sound.svg`" alt="Pronounce word" class="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity" style="filter: invert(1) brightness(0.8) sepia(1) hue-rotate(100deg) saturate(3);">
          </button>
          <h2 class="font-mono text-4xl font-semibold text-slate-100 tracking-tight">{{ currentWord }}</h2>
          <div class="font-mono text-lg text-emerald-500">{{ phonetic }}</div>
        </div>

        <!-- Terminal Card -->
        <div class="bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-xl p-6 md:p-8 shadow-xl">
          <h6 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-800/50 pb-2">Definitions</h6>
          <ol class="list-decimal list-outside pl-4 space-y-3 text-slate-300 leading-relaxed marker:text-slate-500">
            <li v-for="(definition, index) in definitionsArray" :key="index" class="pl-2">
              {{ definition }}
            </li>
          </ol>

          <!-- Synonyms -->
          <template v-if="synonymsArray.length">
            <h6 class="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 border-b border-slate-800/50 pb-2">Synonyms</h6>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="(synonym, index) in synonymsArray"
                :key="'syn-'+index"
                class="font-mono text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                title="Click to search"
                @click="query = synonym; searchWord()"
              >
                {{ synonym }}
              </button>
            </div>
          </template>

          <!-- Suggestions -->
          <template v-if="suggestionsArray.length">
            <h6 class="text-sm font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 border-b border-slate-800/50 pb-2">Suggestions</h6>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(suggestion, index) in suggestionsArray"
                :key="index"
                class="font-mono text-xs px-2.5 py-1 bg-slate-800/50 text-slate-400 border border-slate-700/50 rounded"
              >
                {{ suggestion }}
              </span>
            </div>
          </template>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="w-full text-center py-6 mt-auto text-xs text-slate-500 font-mono tracking-widest uppercase border-t border-slate-800/50">
      Dictionary by Davies &copy; {{ new Date().getFullYear() }}
    </div>
  </div>
</template>
