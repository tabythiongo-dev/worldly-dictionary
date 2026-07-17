// Get DOM elements
const searchForm = document.querySelector('#searchForm');
const wordInput = document.querySelector('#wordInput');
const resultsDiv = document.querySelector('#results');

const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// 1. Handle form submit
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const word = wordInput.value.trim();
  
  if (!word) {
    displayError('Please enter a word to search');
    return;
  }
  
  fetchWordData(word);
});

// 2. Fetch data from API
function fetchWordData(word) {
  resultsDiv.innerHTML = `<p class="placeholder">Searching for "${word}"...</p>`;
  
  fetch(`${API_URL}${word}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Word not found. Try another word.');
      }
      return res.json();
    })
    .then(data => updateDOM(data))
    .catch(err => displayError(err.message));
}

// 3. Display data in DOM
function updateDOM(data) {
  const wordData = data[0];
  
  const word = wordData.word;
  const phonetic = wordData.phonetic || wordData.phonetics.find(p => p.text)?.text || '';
  const audio = wordData.phonetics.find(p => p.audio)?.audio || '';
  const meanings = wordData.meanings;
  
  let html = `
    <div class="word-card">
      <h2 class="word-title">${word}</h2>
      <div class="phonetic">
        ${phonetic}
        ${audio ? `<button class="audio-btn" onclick="playAudio('${audio}')">🔊 Play</button>` : ''}
      </div>
  `;
  
  meanings.forEach(meaning => {
    html += `
      <div class="meaning">
        <p class="part-of-speech">${meaning.partOfSpeech}</p>
    `;
    
    meaning.definitions.forEach((def, index) => {
      html += `
        <p class="definition"><strong>${index + 1}.</strong> ${def.definition}</p>
        ${def.example ? `<p class="example">"${def.example}"</p>` : ''}
      `;
    });
    
    if (meaning.synonyms && meaning.synonyms.length > 0) {
      html += `
        <div class="synonyms">
          <strong>Synonyms:</strong><br>
          ${meaning.synonyms.slice(0, 10).map(syn => `<span>${syn}</span>`).join('')}
        </div>
      `;
    }
    
    html += `</div>`;
  });
  
  html += `</div>`;
  resultsDiv.innerHTML = html;
}

// 4. Play audio
function playAudio(audioUrl) {
  if (audioUrl) {
    const audio = new Audio(audioUrl);
    audio.play().catch(() => displayError('Audio not available for this word'));
  }
}

// 5. Display errors
function displayError(message) {
  resultsDiv.innerHTML = `
    <div class="error">
      <p>❌ ${message}</p>
    </div>
  `;
}