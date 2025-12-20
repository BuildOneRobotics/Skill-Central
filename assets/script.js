document.addEventListener('DOMContentLoaded', ()=>{
  const homeEl = document.getElementById('home');
  const authEl = document.getElementById('auth');
  const appEl = document.getElementById('app');
  const enterSiteBtn = document.getElementById('enter-site');
  const enterSiteMainBtn = document.getElementById('enter-site-main');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const showSignup = document.getElementById('show-signup');
  const showLogin = document.getElementById('show-login');
  const logoutBtn = document.getElementById('logout');
  const adminPanelBtn = document.getElementById('admin-panel');
  const topicsEl = document.getElementById('topics');
  const filesEl = document.getElementById('files');
  const filesBtn = document.getElementById('files-btn');
  const searchEl = document.getElementById('search');
  const fileListEl = document.getElementById('file-list');
  const fileUpload = document.getElementById('file-upload');
  const uploadBtn = document.getElementById('upload-btn');
  const previewTopicsEl = document.getElementById('preview-topics');
  const adminEditEl = document.getElementById('admin-edit');
  const addTopicForm = document.getElementById('add-topic-form');
  const addLessonForm = document.getElementById('add-lesson-form');
  const editTopicsEl = document.getElementById('edit-topics');
  const accountSection = document.getElementById('account');
  const accountEmailEl = document.getElementById('account-email');
  const accountStatusEl = document.getElementById('account-status');
  const progressSummaryEl = document.getElementById('progress-summary');
  const resetProgressBtn = document.getElementById('reset-progress');
  const accountBtn = document.getElementById('account-btn');
  const footerAccountLink = document.getElementById('footer-account');
  const menuAccountLink = document.getElementById('menu-account');
  const footerEl = document.querySelector('.site-footer');

  let currentUser = null;
  let isAdmin = false;
  let topicsData = [];
  let currentTopicIndex = -1;
  let currentSubjectIndex = -1;
  let theme = localStorage.getItem('theme') || 'auto';
  let accentColor = localStorage.getItem('accent') || 'blue';
  let fontFamily = localStorage.getItem('font') || 'verdana';
  let fontSize = parseInt(localStorage.getItem('fontSize')) || 16;

  function applySettings() {
    document.documentElement.style.setProperty('--font-family', fontFamily === 'verdana' ? "'Verdana', sans-serif" : fontFamily === 'arial' ? "'Arial', sans-serif" : "'Georgia', serif");
    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
    document.body.setAttribute('data-theme', currentTheme);
    const accents = { blue: '#89b4fa', green: '#a6e3a1', purple: '#cba6f7', red: '#f38ba8' };
    document.documentElement.style.setProperty('--accent', accents[accentColor]);
  }

  applySettings();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);

  // Improved hashing using Web Crypto API
  async function hashPassword(pwd) {
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function login(email, pwd) {
    if (email === 'ben.steels@outlook.com' && pwd === 'fhwe87syu') {
      currentUser = email;
      isAdmin = true;
      localStorage.setItem('currentUser', email);
      localStorage.setItem('isAdmin', 'true');
      showApp();
      return true;
    }
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const hashed = await hashPassword(pwd);
    if (users[email] && users[email] === hashed) {
      currentUser = email;
      isAdmin = false;
      localStorage.setItem('currentUser', email);
      localStorage.setItem('isAdmin', 'false');
      showApp();
      return true;
    }
    return false;
  }

  async function signup(email, pwd) {
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) return false;
    users[email] = await hashPassword(pwd);
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = email;
    isAdmin = false;
    localStorage.setItem('currentUser', email);
    localStorage.setItem('isAdmin', 'false');
    showApp();
    return true;
  }

  function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    showHome();
  }

  function showHome() {
    homeEl.classList.remove('hidden');
    authEl.classList.add('hidden');
    appEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    loadPreviewTopics();
  }

  function showAuth(showSignup = false) {
    homeEl.classList.add('hidden');
    authEl.classList.remove('hidden');
    appEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    if (showSignup) {
      document.querySelector('.auth-container').classList.add('hidden');
      document.getElementById('signup-container').classList.remove('hidden');
    } else {
      document.getElementById('signup-container').classList.add('hidden');
      document.querySelector('.auth-container').classList.remove('hidden');
    }
  }

  function showApp() {
    homeEl.classList.add('hidden');
    authEl.classList.add('hidden');
    appEl.classList.remove('hidden');
    footerEl.classList.remove('hidden');
    if (isAdmin) {
      adminPanelBtn.classList.remove('hidden');
    }
    showTopics();
  }

  function showTopics() {
    topicsEl.classList.remove('hidden');
    filesEl.classList.add('hidden');
    document.getElementById('settings-page').classList.add('hidden');
    adminEditEl.classList.add('hidden');
    accountSection.classList.add('hidden');
  }

  function showFiles() {
          if (!accountSection.classList.contains('hidden')) renderAccount();
    topicsEl.classList.add('hidden');
    filesEl.classList.remove('hidden');
    document.getElementById('settings-page').classList.add('hidden');
      if (!accountSection.classList.contains('hidden')) renderAccount();
    adminEditEl.classList.add('hidden');
    accountSection.classList.add('hidden');
  }

  function showSettings() {
    topicsEl.classList.add('hidden');
    filesEl.classList.add('hidden');
    document.getElementById('settings-page').classList.remove('hidden');
    adminEditEl.classList.add('hidden');
    accountSection.classList.add('hidden');
  }

  function showAccount() {
    topicsEl.classList.add('hidden');
    filesEl.classList.add('hidden');
    document.getElementById('settings-page').classList.add('hidden');
    adminEditEl.classList.add('hidden');
    accountSection.classList.remove('hidden');
    renderAccount();
  }

  function loadPreviewTopics() {
    const topics = JSON.parse(localStorage.getItem('topics') || '[]');
    if (topics.length === 0) {
      fetch('assets/topics.json')
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('topics', JSON.stringify(data));
          renderPreviewTopics(data.slice(0, 3));
        });
    } else {
      renderPreviewTopics(topics.slice(0, 3));
    }
  }

  function renderPreviewTopics(topics) {
    previewTopicsEl.innerHTML = '';
    topics.forEach(t => {
      const card = document.createElement('div');
      card.className = 'preview-card';
      const h = document.createElement('h4');
      h.textContent = t.name;
      card.appendChild(h);
      if (t.description) {
        const p = document.createElement('p');
        p.textContent = t.description;
        card.appendChild(p);
      }
      previewTopicsEl.appendChild(card);
    });
  }

  function renderAccount() {
    if (!currentUser || !progressSummaryEl) return;
    accountEmailEl.textContent = currentUser;
    accountStatusEl.textContent = isAdmin ? 'Administrator access' : 'Learner access';
    const progress = getProgressState();
    const totalLessons = topicsData.reduce((total, topic) => total + topic.subjects.reduce((subjectSum, subj) => subjectSum + subj.lessons.length, 0), 0);
    const completedLessons = Object.values(progress.lessons || {}).filter(entry => entry.completed).length;
    const overallPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
    let summaryHTML = `
      <article class="progress-card">
        <h4>Overall Progress</h4>
        <p>${completedLessons} of ${totalLessons} lessons completed</p>
        <div class="progress-meter"><span style="width:${overallPercent}%"></span></div>
        <small>${overallPercent}% complete</small>
      </article>
    `;
    topicsData.forEach((topic, topicIndex) => {
      const topicTotal = topic.subjects.reduce((count, subj) => count + subj.lessons.length, 0);
      let topicComplete = 0;
      const subjectLines = topic.subjects.map((subject, subjIndex) => {
        const subjectCompleted = subject.lessons.reduce((count, _, lessonIndex) => count + (isLessonCompleted(topicIndex, subjIndex, lessonIndex) ? 1 : 0), 0);
        topicComplete += subjectCompleted;
        return `<p class="subject-progress">${subject.name}: ${subjectCompleted}/${subject.lessons.length}</p>`;
      }).join('');
      const topicPercent = topicTotal ? Math.round((topicComplete / topicTotal) * 100) : 0;
      summaryHTML += `
        <article class="progress-card">
          <h5>${topic.name}</h5>
          <p>${topicComplete}/${topicTotal} lessons completed</p>
          <div class="progress-meter"><span style="width:${topicPercent}%"></span></div>
          ${subjectLines}
        </article>
      `;
    });
    progressSummaryEl.innerHTML = summaryHTML;
  }

  function showHome() {
    homeEl.classList.remove('hidden');
    authEl.classList.add('hidden');
    appEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    accountSection.classList.add('hidden');
    loadPreviewTopics();
  }

  function showAuth(showSignup = false) {
    homeEl.classList.add('hidden');
    authEl.classList.remove('hidden');
    appEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    accountSection.classList.add('hidden');
    if (showSignup) {
      document.querySelector('.auth-container').classList.add('hidden');
      document.getElementById('signup-container').classList.remove('hidden');
    } else {
      document.getElementById('signup-container').classList.add('hidden');
      document.querySelector('.auth-container').classList.remove('hidden');
    }
  }

  function showApp() {
    homeEl.classList.add('hidden');
    authEl.classList.add('hidden');
    appEl.classList.remove('hidden');
    footerEl.classList.remove('hidden');
    accountSection.classList.add('hidden');
    if (isAdmin) {
      adminPanelBtn.classList.remove('hidden');
    }
    showTopics();
  }
      const card = document.createElement('article');
      card.className = 'lesson-card';
      const h = document.createElement('h3');
      h.textContent = l.title;
      card.appendChild(h);
      const p = document.createElement('p');
      p.textContent = l.content;
      card.appendChild(p);
      if (l.image) {
        const img = document.createElement('img');
        img.src = l.image;
        img.alt = l.title;
        card.appendChild(img);
      }
      if (isAdmin) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Lesson';
        editBtn.onclick = () => editLesson(k);
        card.appendChild(editBtn);
      }
        lessonListEl.appendChild(card);
        const status = document.createElement('span');
        status.className = 'lesson-status';
        const key = makeLessonKey(currentTopicIndex, currentSubjectIndex, k);
        const completed = isLessonCompleted(currentTopicIndex, currentSubjectIndex, k);
        status.textContent = completed ? 'Completed' : 'In progress';
        card.appendChild(status);
        const actions = document.createElement('div');
        actions.className = 'lesson-actions';
        if (!completed) {
          const completeBtn = document.createElement('button');
          completeBtn.textContent = 'Mark Complete';
          completeBtn.className = 'secondary';
          completeBtn.onclick = () => {
            markLessonComplete(currentTopicIndex, currentSubjectIndex, k);
          };
          actions.appendChild(completeBtn);
        }
        card.appendChild(actions);
        lessonListEl.appendChild(card);
    });
  }

  function editLesson(lessonIndex) {
    const lesson = topicsData[currentTopicIndex].subjects[currentSubjectIndex].lessons[lessonIndex];
    const editDiv = document.createElement('div');
    editDiv.className = 'edit-lesson';
    editDiv.innerHTML = `
      <input type="text" value="${lesson.title}" id="edit-lesson-title-${lessonIndex}" />
      <textarea id="edit-lesson-content-${lessonIndex}">${lesson.content}</textarea>
      <input type="text" value="${lesson.image || ''}" id="edit-lesson-image-${lessonIndex}" placeholder="Image URL" />
      <button class="save" onclick="saveLesson(${lessonIndex})">Save</button>
      <button class="delete" onclick="deleteLesson(${lessonIndex})">Delete</button>
    `;
    document.getElementById('lesson-list').appendChild(editDiv);
  }

  window.saveLesson = (lessonIndex) => {
    const title = document.getElementById(`edit-lesson-title-${lessonIndex}`).value;
    const content = document.getElementById(`edit-lesson-content-${lessonIndex}`).value;
    const image = document.getElementById(`edit-lesson-image-${lessonIndex}`).value;
    topicsData[currentTopicIndex].subjects[currentSubjectIndex].lessons[lessonIndex] = { title, content, image };
    localStorage.setItem('topics', JSON.stringify(topicsData));
    const subject = topicsData[currentTopicIndex].subjects[currentSubjectIndex];
    renderLessons(subject.lessons);
  };

  window.deleteLesson = (lessonIndex) => {
    topicsData[currentTopicIndex].subjects[currentSubjectIndex].lessons.splice(lessonIndex, 1);
    localStorage.setItem('topics', JSON.stringify(topicsData));
    const subject = topicsData[currentTopicIndex].subjects[currentSubjectIndex];
    renderLessons(subject.lessons);
  };

  function loadFiles() {
    const files = JSON.parse(localStorage.getItem(`files_${currentUser}`) || '[]');
    renderFiles(files);
  }

  function renderFiles(files) {
    fileListEl.innerHTML = '';
    files.forEach((f, i) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <div class="name">${f.name}</div>
        <div class="size">${f.size} bytes</div>
        <button onclick="deleteFile(${i})">Delete</button>
      `;
      fileListEl.appendChild(item);
    });
  }

  window.deleteFile = (index) => {
    const files = JSON.parse(localStorage.getItem(`files_${currentUser}`) || '[]');
    files.splice(index, 1);
    localStorage.setItem(`files_${currentUser}`, JSON.stringify(files));
    loadFiles();
  };

  function editTopic(index) {
    const topic = topicsData[index];
    const editDiv = document.createElement('div');
    editDiv.className = 'edit-topic';
    let subjectsHtml = topic.subjects.map((subj, subjIndex) => `
      <div class="subject-edit">
        <input type="text" value="${subj.name}" placeholder="Subject Name" id="edit-subj-name-${index}-${subjIndex}" />
        <textarea placeholder="Lessons (one per line)" id="edit-subj-lessons-${index}-${subjIndex}">${subj.lessons.map(l => l.title).join('\n')}</textarea>
        <button onclick="deleteSubject(${index}, ${subjIndex})">Delete Subject</button>
      </div>
    `).join('');
    editDiv.innerHTML = `
      <h4>Edit Topic: ${topic.name}</h4>
      <input type="text" value="${topic.name}" id="edit-name-${index}" placeholder="Topic Name" />
      <textarea id="edit-desc-${index}" placeholder="Description">${topic.description || ''}</textarea>
      <h5>Subjects</h5>
      <div id="subjects-container-${index}">${subjectsHtml}</div>
      <button onclick="addSubject(${index})">Add Subject</button>
      <button class="save" onclick="saveTopic(${index})">Save Topic</button>
      <button class="delete" onclick="deleteTopic(${index})">Delete Topic</button>
    `;
    editTopicsEl.innerHTML = '';
    editTopicsEl.appendChild(editDiv);
    adminEditEl.classList.remove('hidden');
  }

  window.saveTopic = (index) => {
    const name = document.getElementById(`edit-name-${index}`).value;
    const desc = document.getElementById(`edit-desc-${index}`).value;
    const subjects = [];
    const container = document.getElementById(`subjects-container-${index}`);
    const subjEdits = container.querySelectorAll('.subject-edit');
    subjEdits.forEach(edit => {
      const subjName = edit.querySelector('input').value.trim();
      const lessonsText = edit.querySelector('textarea').value;
      const lessons = lessonsText.split('\n').filter(l => l.trim()).map(title => ({ title: title.trim(), content: '', type: 'lesson' })); // assuming content empty for now
      if (subjName) subjects.push({ name: subjName, lessons });
    });
    topicsData[index] = { name, description: desc, subjects };
    localStorage.setItem('topics', JSON.stringify(topicsData));
    loadTopics();
    editTopicsEl.innerHTML = '';
    adminEditEl.classList.add('hidden');
  };

  window.deleteSubject = (topicIndex, subjIndex) => {
    const container = document.getElementById(`subjects-container-${topicIndex}`);
    const subjEdits = container.querySelectorAll('.subject-edit');
    if (subjEdits[subjIndex]) subjEdits[subjIndex].remove();
  };

  window.addSubject = (topicIndex) => {
    const container = document.getElementById(`subjects-container-${topicIndex}`);
    const newSubj = document.createElement('div');
    newSubj.className = 'subject-edit';
    newSubj.innerHTML = `
      <input type="text" placeholder="Subject Name" />
      <textarea placeholder="Lessons (one per line)"></textarea>
      <button onclick="deleteSubject(${topicIndex}, ${container.querySelectorAll('.subject-edit').length})">Delete Subject</button>
    `;
    container.appendChild(newSubj);
  };

  // Check if logged in
  const savedUser = localStorage.getItem('currentUser');
  const savedAdmin = localStorage.getItem('isAdmin') === 'true';
  if (savedUser) {
    currentUser = savedUser;
    isAdmin = savedAdmin;
    showApp();
  } else {
    showHome();
  }

  // Home events
  enterSiteBtn.addEventListener('click', () => showAuth(true));
  document.getElementById('show-login-link').addEventListener('click', e => {
    e.preventDefault();
    showAuth(false);
  });
  enterSiteMainBtn.addEventListener('click', showAuth);
  accountBtn?.addEventListener('click', showAccount);

  // Auth events
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const pwd = document.getElementById('password').value;
    if (await login(email, pwd)) {
      // success
    } else {
      alert('Invalid credentials');
    }
  });

  signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const pwd = document.getElementById('signup-password').value;
    const confirmPwd = document.getElementById('confirm-password').value;
    if (pwd !== confirmPwd) {
      alert('Passwords do not match');
      return;
    }
    if (await signup(email, pwd)) {
      // success
    } else {
      alert('User already exists');
    }
  });

  showSignup.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector('.auth-container').classList.add('hidden');
    document.getElementById('signup-container').classList.remove('hidden');
  });

  showLogin.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('signup-container').classList.add('hidden');
    document.querySelector('.auth-container').classList.remove('hidden');
  });

  document.getElementById('close-auth').addEventListener('click', () => {
    authEl.classList.add('hidden');
  });

  document.getElementById('close-auth-signup').addEventListener('click', () => {
    authEl.classList.add('hidden');
  });

  logoutBtn.addEventListener('click', logout);

  adminPanelBtn.addEventListener('click', () => {
    adminEditEl.classList.toggle('hidden');
    populateLessonSelects();
  });

  addTopicForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('topic-name').value;
    const desc = document.getElementById('topic-desc').value;
    const subjectsText = document.getElementById('topic-subjects').value;
    const subjects = subjectsText.split(',').map(s => ({ name: s.trim(), lessons: [] }));
    topicsData.push({ name, description: desc, subjects });
    localStorage.setItem('topics', JSON.stringify(topicsData));
    loadTopics();
    addTopicForm.reset();
  });

  function renderLessons(lessons) {
    const lessonListEl = document.getElementById('lesson-list');
    lessonListEl.innerHTML = '';
    lessons.forEach((l, k) => {
      const card = document.createElement('article');
      card.className = 'lesson-card';
      const h = document.createElement('h3');
      h.textContent = l.title;
      card.appendChild(h);
      const p = document.createElement('p');
      p.textContent = l.content;
      card.appendChild(p);
      if (l.image) {
        const img = document.createElement('img');
        img.src = l.image;
        img.alt = l.title;
        card.appendChild(img);
      }
      if (isAdmin) {
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit Lesson';
        editBtn.onclick = () => editLesson(k);
        card.appendChild(editBtn);
      }
      const status = document.createElement('span');
      status.className = 'lesson-status';
      const key = makeLessonKey(currentTopicIndex, currentSubjectIndex, k);
      const completed = isLessonCompleted(currentTopicIndex, currentSubjectIndex, k);
      status.textContent = completed ? 'Completed' : 'In progress';
      card.appendChild(status);
      const actions = document.createElement('div');
      actions.className = 'lesson-actions';
      if (!completed) {
        const completeBtn = document.createElement('button');
        completeBtn.textContent = 'Mark Complete';
        completeBtn.className = 'secondary';
        completeBtn.onclick = () => {
          markLessonComplete(currentTopicIndex, currentSubjectIndex, k);
        };
        actions.appendChild(completeBtn);
      }
      card.appendChild(actions);
      lessonListEl.appendChild(card);
    });
  }

  function makeLessonKey(topicIndex, subjectIndex, lessonIndex) {
    return `${topicIndex}-${subjectIndex}-${lessonIndex}`;
  }

  function getProgressState() {
    if (!currentUser) return { lessons: {} };
    return JSON.parse(localStorage.getItem(`progress_${currentUser}`) || '{"lessons":{}}');
  }

  function saveProgressState(state) {
    if (!currentUser) return;
    localStorage.setItem(`progress_${currentUser}`, JSON.stringify(state));
  }

  function markLessonComplete(topicIndex, subjectIndex, lessonIndex) {
    const state = getProgressState();
    const key = makeLessonKey(topicIndex, subjectIndex, lessonIndex);
    state.lessons[key] = { completed: true, timestamp: Date.now() };
    saveProgressState(state);
    const topic = topicsData[topicIndex];
    if (!topic) return;
    const subject = topic.subjects[subjectIndex];
    if (!subject) return;
    renderLessons(subject.lessons);
    renderAccount();
  }

  function isLessonCompleted(topicIndex, subjectIndex, lessonIndex) {
    if (!currentUser) return false;
    const state = getProgressState();
    const key = makeLessonKey(topicIndex, subjectIndex, lessonIndex);
    return state.lessons[key]?.completed;
  }

  // Search
  searchEl.addEventListener('input', () => {
    const q = searchEl.value.trim().toLowerCase();
    if (!q) {
      renderTopics(topicsData);
      return;
    }
    const filtered = topicsData.map(t => ({
      ...t,
      subjects: t.subjects.filter(s => s.name.toLowerCase().includes(q))
    })).filter(t => t.name.toLowerCase().includes(q) || t.subjects.length > 0);
    renderTopics(filtered);
  });

  // Files toggle
  filesBtn.addEventListener('click', () => {
    if (topicsEl.classList.contains('hidden')) {
      showTopics();
    } else {
      showFiles();
    }
  });

  // Upload
  uploadBtn.addEventListener('click', () => {
    const files = Array.from(fileUpload.files);
    const userFiles = JSON.parse(localStorage.getItem(`files_${currentUser}`) || '[]');
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        userFiles.push({ name: f.name, size: f.size, data: reader.result });
        localStorage.setItem(`files_${currentUser}`, JSON.stringify(userFiles));
        loadFiles();
      };
      reader.readAsDataURL(f);
    });
  });

  // Burger menu
  document.getElementById('burger-menu').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
  });

  // Menu items
  document.getElementById('menu-home').addEventListener('click', e => {
    e.preventDefault();
    showTopics();
    document.getElementById('mobile-menu').classList.remove('open');
  });

  document.getElementById('menu-settings').addEventListener('click', e => {
    e.preventDefault();
    showSettings();
    document.getElementById('mobile-menu').classList.remove('open');
  });

  menuAccountLink?.addEventListener('click', e => {
    e.preventDefault();
    showAccount();
    document.getElementById('mobile-menu').classList.remove('open');
  });

  // Footer links
  document.getElementById('footer-home').addEventListener('click', e => {
    e.preventDefault();
    showHome();
  });

  document.getElementById('footer-settings').addEventListener('click', e => {
    e.preventDefault();
    showSettings();
  });

  footerAccountLink?.addEventListener('click', e => {
    e.preventDefault();
    showAccount();
  });

  document.getElementById('footer-files').addEventListener('click', e => {
    e.preventDefault();
    showFiles();
  });

  document.getElementById('footer-logout').addEventListener('click', e => {
    e.preventDefault();
    logout();
  });

  // Settings
  document.getElementById('back-from-settings').addEventListener('click', () => {
    showTopics();
  });

  document.getElementById('theme-select').addEventListener('change', e => {
    theme = e.target.value;
    localStorage.setItem('theme', theme);
    applySettings();
  });

  document.getElementById('accent-select').addEventListener('change', e => {
    accentColor = e.target.value;
    localStorage.setItem('accent', accentColor);
    applySettings();
  });

  document.getElementById('font-select').addEventListener('change', e => {
    fontFamily = e.target.value;
    localStorage.setItem('font', fontFamily);
    applySettings();
  });

  document.getElementById('font-size-slider').addEventListener('input', e => {
    fontSize = parseInt(e.target.value);
    localStorage.setItem('fontSize', fontSize);
    applySettings();
  });

  resetProgressBtn?.addEventListener('click', () => {
    if (!currentUser) return;
    if (confirm('Clear your progress? This cannot be undone.')) {
      localStorage.setItem(`progress_${currentUser}`, JSON.stringify({ lessons: {} }));
      renderLessons(topicsData[currentTopicIndex]?.subjects[currentSubjectIndex]?.lessons || []);
      renderAccount();
    }
  });

  // Set initial values
  document.getElementById('theme-select').value = theme;
  document.getElementById('accent-select').value = accentColor;
  document.getElementById('font-select').value = fontFamily;
  document.getElementById('font-size-slider').value = fontSize;
});