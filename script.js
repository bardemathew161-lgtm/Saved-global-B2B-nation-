const demoLogin = {
  email: 'demo@savedglobal.test',
  password: 'DemoPass123!'
};

const businesses = [
  { name: 'NovaTrade', niche: 'Wholesale export', region: 'Dubai' },
  { name: 'Helio Retail', niche: 'Retail supply chain', region: 'Lagos' },
  { name: 'GreenPeak Energy', niche: 'Clean energy procurement', region: 'Nairobi' },
  { name: 'Atlas Finance', niche: 'Business lending', region: 'Accra' },
  { name: 'CopperLink Logistics', niche: 'Shipping & freight', region: 'Johannesburg' }
];

const notificationData = [
  'You have 4 new partner invites.',
  'A supplier request needs your review.',
  'CRM pipeline updated for 12 leads.',
  'A demo meeting was confirmed for 3:00 PM.'
];

function safeReadStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    // Ignore storage failures in restricted browsers or private mode.
  }
}

const savedTheme = safeReadStorage('saved-b2b-theme-v2');
const state = {
  lightMode: savedTheme
    ? savedTheme === 'light'
    : safeReadStorage('saved-b2b-theme') === 'dark',
  loggedIn: false,
  notifications: notificationData.slice(0, 4)
};

function setTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (document.body) {
    document.body.classList.toggle('light', state.lightMode);
  }
  if (themeToggle) {
    themeToggle.textContent = state.lightMode ? 'Dark mode' : 'Light mode';
  }
}

function renderBusinessResults(query = '') {
  const safeQuery = query.trim().toLowerCase();
  const filtered = businesses.filter((item) => {
    return [item.name, item.niche, item.region].some((value) => value.toLowerCase().includes(safeQuery));
  });

  const results = document.getElementById('business-results');
  if (!results) {
    return;
  }

  if (!filtered.length) {
    results.innerHTML = '<p class="empty-state">No businesses matched your search.</p>';
    return;
  }

  results.innerHTML = filtered
    .map(
      (item) => `
        <article class="result-item">
          <div>
            <strong>${item.name}</strong>
            <p>${item.niche} • ${item.region}</p>
          </div>
          <button class="btn btn-small" type="button">Connect</button>
        </article>
      `
    )
    .join('');
}

function renderNotifications() {
  const panel = document.getElementById('notification-panel');
  const count = document.getElementById('notification-count');
  if (!panel || !count) {
    return;
  }

  panel.innerHTML = state.notifications
    .map((item) => `<div class="notification-item">${item}</div>`)
    .join('');
  count.textContent = String(state.notifications.length);
}

function appendChat(message, sender = 'bot') {
  const chatLog = document.getElementById('chat-log');
  const messageRow = document.createElement('div');
  messageRow.className = `chat-message ${sender}`;
  messageRow.textContent = message;
  chatLog.appendChild(messageRow);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function askAi(question) {
  const payload = { question };
  try {
    const response = await fetch('/api/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Backend unavailable');
    }

    const data = await response.json();
    return data.answer || 'I could not reach the AI assistant right now.';
  } catch (error) {
    const lower = question.toLowerCase();
    if (lower.includes('supplier')) {
      return 'Try filtering by “supplier” in Business Search to shortlist qualified vendors faster.';
    }
    if (lower.includes('lead')) {
      return 'Use the contact form to start a demo call and capture new business interest.';
    }
    return 'Your AI assistant is offline, but the platform is ready to help you explore partners, leads, and buyers.';
  }
}

function validateForm(formData) {
  const errors = [];
  if (!formData.name.trim()) errors.push('Please enter your full name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.push('Please enter a valid email address.');
  if (!formData.company.trim()) errors.push('Please enter your company name.');
  if (!formData.message.trim() || formData.message.trim().length < 8) errors.push('Please add a short project summary with at least 8 characters.');
  return errors;
}

async function submitLeadForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    company: document.getElementById('company').value,
    message: document.getElementById('message').value
  };

  const errors = validateForm(formData);
  const messageBox = document.getElementById('form-message');
  if (errors.length) {
    messageBox.textContent = errors.join(' ');
    messageBox.className = 'form-message error';
    return;
  }

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'The request could not be submitted right now. Please try again later.');
    }

    form.reset();
    messageBox.textContent = 'Your request was submitted successfully.';
    messageBox.className = 'form-message success';
  } catch (error) {
    messageBox.textContent = error instanceof Error
      ? error.message
      : 'The request could not be submitted right now. Please try again later.';
    messageBox.className = 'form-message error';
  }
}

function openLoginModal() {
  document.getElementById('login-modal').classList.remove('hidden');
  document.getElementById('login-modal').setAttribute('aria-hidden', 'false');
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.add('hidden');
  document.getElementById('login-modal').setAttribute('aria-hidden', 'true');
}

async function login(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const message = document.getElementById('login-message');

  if (!email || !password) {
    message.textContent = 'Please enter both your email and password.';
    message.className = 'form-message error';
    return;
  }

  if (email === demoLogin.email && password === demoLogin.password) {
    state.loggedIn = true;
    message.textContent = `Welcome back, ${email.split('@')[0]}.`;
    message.className = 'form-message success';
    setTimeout(() => {
      closeLoginModal();
    }, 600);
    return;
  }

  message.textContent = 'Demo login failed. Use the credentials shown below the form.';
  message.className = 'form-message error';
}

async function init() {
  const year = document.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  setTheme();
  renderBusinessResults();
  renderNotifications();

  const chatLog = document.getElementById('chat-log');
  if (chatLog) {
    appendChat('Welcome to Saved Global B2B Nations. Ask about suppliers, buyers, or growth strategy.');
  }

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      state.lightMode = !state.lightMode;
      safeWriteStorage('saved-b2b-theme-v2', state.lightMode ? 'light' : 'dark');
      setTheme();
    });
  }

  const businessSearch = document.getElementById('business-search');
  if (businessSearch) {
    businessSearch.addEventListener('input', (event) => {
      renderBusinessResults(event.target.value);
    });
  }

  const chatForm = document.getElementById('chat-form');
  if (chatForm) {
    chatForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = document.getElementById('chat-input');
      const question = input ? input.value.trim() : '';
      if (!question) return;
      appendChat(question, 'user');
      input.value = '';
      appendChat('Thinking...', 'bot');
      const answer = await askAi(question);
      const liveChatLog = document.getElementById('chat-log');
      if (liveChatLog && liveChatLog.lastChild) {
        liveChatLog.removeChild(liveChatLog.lastChild);
      }
      appendChat(answer, 'bot');
    });
  }

  const notificationTrigger = document.getElementById('notification-trigger');
  if (notificationTrigger) {
    notificationTrigger.addEventListener('click', () => {
      const panel = document.getElementById('notification-panel');
      if (panel) {
        panel.classList.toggle('open');
      }
    });
  }

  const openLoginBtn = document.getElementById('open-login-btn');
  if (openLoginBtn) {
    openLoginBtn.addEventListener('click', openLoginModal);
  }

  const closeLoginBtn = document.getElementById('close-login-btn');
  if (closeLoginBtn) {
    closeLoginBtn.addEventListener('click', closeLoginModal);
  }

  const loginModal = document.getElementById('login-modal');
  if (loginModal) {
    loginModal.addEventListener('click', (event) => {
      if (event.target === loginModal) {
        closeLoginModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && loginModal && !loginModal.classList.contains('hidden')) {
      closeLoginModal();
    }
  });

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', login);
  }

  const leadForm = document.getElementById('lead-form');
  if (leadForm) {
    leadForm.addEventListener('submit', submitLeadForm);
  }
}

document.addEventListener('DOMContentLoaded', init);
