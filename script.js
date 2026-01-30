/*
 * script.js
 * Controla as interações da página Bloco Data Folia.
 * Todo o código roda após DOMContentLoaded para garantir que o DOM esteja pronto.
 * Não há dependências externas. Persistência é feita via localStorage de forma defensiva.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Seleção de elementos
  const appRoot = document.getElementById('df-app');
  const blockNameEl = document.getElementById('blockName');
  const sprintInput = document.getElementById('sprintInput');
  const startBtn = document.getElementById('startBtn');
  const contextSection = document.getElementById('contextSection');
  const moodSection = document.getElementById('moodSection');
  const wordSection = document.getElementById('wordSection');
  const sprintSection = document.getElementById('sprintSection');
  const closingSection = document.getElementById('closingSection');

  const moodButtons = document.querySelectorAll('.df-mood-btn');
  const moodFeedback = document.getElementById('moodFeedback');
  const moodScore = document.getElementById('moodScore');
  const moodNextBtn = document.getElementById('moodNextBtn');

  const wordInput = document.getElementById('wordInput');
  const wordAddBtn = document.getElementById('wordAddBtn');
  const wordClearBtn = document.getElementById('wordClearBtn');
  const wordCloud = document.getElementById('wordCloud');
  const wordNextBtn = document.getElementById('wordNextBtn');

  const cardObjective = document.getElementById('cardObjective');
  const cardPriorities = document.getElementById('cardPriorities');
  const cardRisks = document.getElementById('cardRisks');
  const sprintNextBtn = document.getElementById('sprintNextBtn');

  const planningBtn = document.getElementById('planningBtn');
  const chantDisplay = document.getElementById('chantDisplay');

  const presentationToggle = document.getElementById('presentationToggle');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsModal = document.getElementById('settingsModal');
  const configBlockName = document.getElementById('configBlockName');
  const configDevOpsLink = document.getElementById('configDevOpsLink');
  const configSaveBtn = document.getElementById('configSaveBtn');
  const configCancelBtn = document.getElementById('configCancelBtn');
  const resetBtn = document.getElementById('resetBtn');

  const confirmDialog = document.getElementById('confirmDialog');
  const confirmMessage = document.getElementById('confirmMessage');
  const confirmYes = document.getElementById('confirmYes');
  const confirmNo = document.getElementById('confirmNo');

  // Estado interno para callback da confirmação
  let confirmCallback = null;

  /**
   * Função utilitária para ler JSON do localStorage de forma segura
   * @param {string} key
   * @param {any} defaultValue
   */
  function loadJson(key, defaultValue) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  /**
   * Função para salvar JSON no localStorage de forma segura
   * @param {string} key
   * @param {any} value
   */
  function saveJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Falha de armazenamento, ignorar
    }
  }

  /**
   * Função para salvar uma string simples no localStorage de forma segura
   * @param {string} key
   * @param {string} value
   */
  function saveString(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Ignorar erros de quota ou permissão
    }
  }

  /**
   * Carrega valores do localStorage e inicializa a interface
   */
  function loadInitialState() {
    // Nome do bloco
    let storedBlockName = '';
    try {
      storedBlockName = localStorage.getItem('blockName');
    } catch (e) {
      storedBlockName = '';
    }
    if (storedBlockName) {
      blockNameEl.textContent = storedBlockName;
    }
    // Nome da sprint
    let storedSprintName = '';
    try {
      storedSprintName = localStorage.getItem('sprintName');
    } catch (e) {
      storedSprintName = '';
    }
    if (storedSprintName) {
      sprintInput.value = storedSprintName;
    }
    // Modo apresentação
    let presentation = '';
    try {
      presentation = localStorage.getItem('presentationMode');
    } catch (e) {
      presentation = '';
    }
    if (presentation === 'true') {
      appRoot.classList.add('presentation-mode');
    }
    // Palavras
    const words = loadJson('words', []);
    if (words.length) {
      renderWordCloud(words);
      wordNextBtn.classList.remove('df-hidden');
    }
    // Moods: se houver contagens salvas, renderiza placar
    const moodCounts = loadJson('moodCounts', {});
    const hasMood = Object.keys(moodCounts).some((key) => moodCounts[key] > 0);
    if (hasMood) {
      updateMoodScore();
      moodScore.classList.remove('df-hidden');
    }
    // Cards
    try {
      cardObjective.innerHTML = localStorage.getItem('cardObjective') || '';
      cardPriorities.innerHTML = localStorage.getItem('cardPriorities') || '';
      cardRisks.innerHTML = localStorage.getItem('cardRisks') || '';
    } catch (e) {
      cardObjective.innerHTML = '';
      cardPriorities.innerHTML = '';
      cardRisks.innerHTML = '';
    }
  }

  /**
   * Mostra uma seção e esconde as outras (mantém contexto sempre visível)
   * @param {HTMLElement} section
   */
  function showSection(section) {
    // Todas as seções interativas
    const sections = [moodSection, wordSection, sprintSection, closingSection];
    sections.forEach((sec) => {
      if (sec === section) {
        sec.classList.remove('df-hidden');
      } else {
        sec.classList.add('df-hidden');
      }
    });
  }

  /**
   * Exibe a nuvem de palavras
   * @param {string[]} words
   */
  function renderWordCloud(words) {
    wordCloud.innerHTML = '';
    const colorPalette = [
      'var(--df-primary)',
      'var(--df-secondary)',
      'var(--df-accent1)',
      'var(--df-accent2)'
    ];
    words.forEach((word) => {
      const span = document.createElement('span');
      span.className = 'df-chip';
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      span.style.backgroundColor = color;
      span.style.color = '#fff';
      span.textContent = word;
      wordCloud.appendChild(span);
    });
  }

  /**
   * Atualiza o placar de moods
   */
  function updateMoodScore() {
    const counts = loadJson('moodCounts', {});
    const moods = [
      'Axé no talo',
      'Pipoca organizada',
      'Trio elétrico com dependências',
      'Camarote do foco',
      'Sem corda, mas vamo!'
    ];
    let html = '<ul>';
    moods.forEach((m) => {
      const count = counts[m] || 0;
      html += `<li>${m}: ${count}</li>`;
    });
    html += '</ul>';
    moodScore.innerHTML = html;
  }

  /**
   * Exibe diálogo de confirmação
   * @param {string} message
   * @param {Function} onYes
   */
  function showConfirm(message, onYes) {
    confirmCallback = onYes;
    confirmMessage.textContent = message;
    confirmDialog.classList.remove('df-hidden');
  }

  // Eventos de confirmação
  confirmYes.addEventListener('click', () => {
    if (typeof confirmCallback === 'function') {
      confirmCallback();
    }
    confirmDialog.classList.add('df-hidden');
  });
  confirmNo.addEventListener('click', () => {
    confirmCallback = null;
    confirmDialog.classList.add('df-hidden');
  });

  // Botão começar
  startBtn.addEventListener('click', () => {
    // Salvar nome da sprint
    const name = sprintInput.value.trim();
    if (name) saveString('sprintName', name);
    // Desativar
    sprintInput.disabled = true;
    startBtn.disabled = true;
    // Mostrar primeira seção (mood)
    showSection(moodSection);
  });

  // Seleção de moods
  moodButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedMood = btn.getAttribute('data-mood');
      // Adicionar classe selecionado
      moodButtons.forEach((b) => b.classList.remove('df-selected'));
      btn.classList.add('df-selected');
      // Atualizar contagem
      const counts = loadJson('moodCounts', {});
      counts[selectedMood] = (counts[selectedMood] || 0) + 1;
      saveJson('moodCounts', counts);
      // Feedback
      moodFeedback.textContent = `Você escolheu: ${selectedMood}`;
      moodFeedback.classList.remove('df-hidden');
      // Placar
      updateMoodScore();
      moodScore.classList.remove('df-hidden');
      // Mostrar próximo
      moodNextBtn.classList.remove('df-hidden');
    });
  });

  // Próximo após mood
  moodNextBtn.addEventListener('click', () => {
    showSection(wordSection);
  });

  // Adicionar palavra
  function addWord() {
    const word = wordInput.value.trim();
    if (!word) return;
    const words = loadJson('words', []);
    words.push(word);
    saveJson('words', words);
    renderWordCloud(words);
    wordInput.value = '';
    wordNextBtn.classList.remove('df-hidden');
  }
  wordAddBtn.addEventListener('click', addWord);
  wordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addWord();
      e.preventDefault();
    }
  });

  // Limpar palavras com delegação para maior compatibilidade
  wordSection.addEventListener('click', (evt) => {
    const target = evt.target;
    if (target && (target.id === 'wordClearBtn' || target.closest('#wordClearBtn'))) {
      try {
        localStorage.removeItem('words');
      } catch (err) {
        /* ignore */
      }
      wordCloud.innerHTML = '';
      wordNextBtn.classList.add('df-hidden');
      evt.preventDefault();
    }
  });

  // Próximo após palavra
  wordNextBtn.addEventListener('click', () => {
    showSection(sprintSection);
  });

  // Salvando conteúdo dos cards
  function saveCard(key, element) {
    const html = element.innerHTML.trim();
    saveString(key, html);
  }
  cardObjective.addEventListener('blur', () => saveCard('cardObjective', cardObjective));
  cardPriorities.addEventListener('blur', () => saveCard('cardPriorities', cardPriorities));
  cardRisks.addEventListener('blur', () => saveCard('cardRisks', cardRisks));

  // Próximo após sprint
  sprintNextBtn.addEventListener('click', () => {
    showSection(closingSection);
  });

  // Fechamento: mostrar grito e abrir link
  planningBtn.addEventListener('click', () => {
    const chants = [
      'É carnaval, vamo quebrar tudo!',
      'Puxa o trio e vamos pro sprint!',
      'Axé, foco e entrega!',
      'Data Folia: no ritmo do código!'
    ];
    const phrase = chants[Math.floor(Math.random() * chants.length)];
    chantDisplay.textContent = phrase;
    chantDisplay.classList.remove('df-hidden');
    // Abrir link do DevOps após breve intervalo
    let link = '';
    try {
      link = localStorage.getItem('devOpsLink');
    } catch (e) {
      link = '';
    }
    if (link) {
      setTimeout(() => {
        window.open(link, '_blank');
      }, 1000);
    }
  });

  // Modo apresentação
  presentationToggle.addEventListener('click', () => {
    appRoot.classList.toggle('presentation-mode');
    saveString(
      'presentationMode',
      appRoot.classList.contains('presentation-mode')
    );
  });

  // Abrir configurações
  settingsToggle.addEventListener('click', () => {
    configBlockName.value = blockNameEl.textContent;
    let devLink = '';
    try {
      devLink = localStorage.getItem('devOpsLink') || '';
    } catch (e) {
      devLink = '';
    }
    configDevOpsLink.value = devLink;
    settingsModal.classList.remove('df-hidden');
  });

  // Cancelar configurações
  configCancelBtn.addEventListener('click', () => {
    settingsModal.classList.add('df-hidden');
  });

  // Salvar configurações
  configSaveBtn.addEventListener('click', () => {
    const name = configBlockName.value.trim();
    const link = configDevOpsLink.value.trim();
    if (name) {
      blockNameEl.textContent = name;
      saveString('blockName', name);
    }
    if (link) {
      saveString('devOpsLink', link);
    } else {
      try {
        localStorage.removeItem('devOpsLink');
      } catch (e) {
        /* ignore */
      }
    }
    settingsModal.classList.add('df-hidden');
  });

  // Reset geral com confirmação
  resetBtn.addEventListener('click', () => {
    showConfirm('Deseja realmente resetar todos os dados da sprint?', () => {
      const keys = [
        'moodCounts',
        'words',
        'cardObjective',
        'cardPriorities',
        'cardRisks',
        'sprintName'
      ];
      keys.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch (e) {
          /* ignore */
        }
      });
      location.reload();
    });
  });

  // Fechar modais ao clicar fora
  window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.add('df-hidden');
    }
    if (e.target === confirmDialog) {
      confirmDialog.classList.add('df-hidden');
      confirmCallback = null;
    }
  });

  // Inicializar UI
  loadInitialState();
});
