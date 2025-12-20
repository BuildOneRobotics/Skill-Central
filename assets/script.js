document.addEventListener('DOMContentLoaded', ()=>{
  const homeEl = document.getElementById('home');
  const appEl = document.getElementById('app');
  // Determine whether this page contains the authenticated app UI.
  const isAppPage = !!appEl;
  const enterSiteBtn = document.getElementById('enter-site');
  const enterSiteMainBtn = document.getElementById('enter-site-main');
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
  let colorTheme = localStorage.getItem('colorTheme') || 'mauve';
  let fontFamily = localStorage.getItem('font') || 'verdana';
  let fontSize = parseInt(localStorage.getItem('fontSize')) || 16;

  // Catppuccin Latte color themes for blobs
  const colorThemes = {
    mauve: { primary: '#9d4edd', secondary: '#b197fc' },
    lavender: { primary: '#7287fd', secondary: '#9d4edd' },
    blue: { primary: '#1e66f5', secondary: '#209fb5' },
    sky: { primary: '#04a5e5', secondary: '#209fb5' },
    teal: { primary: '#179299', secondary: '#40a02b' },
    green: { primary: '#40a02b', secondary: '#179299' },
    peach: { primary: '#fe640b', secondary: '#df8e1d' },
    flamingo: { primary: '#eebebe', secondary: '#ca9ee6' },
    pink: { primary: '#f4b8e4', secondary: '#ca9ee6' },
    red: { primary: '#e64553', secondary: '#e8414f' }
  };

  function applySettings() {
    document.documentElement.style.setProperty('--font-family', fontFamily === 'verdana' ? "'Verdana', sans-serif" : fontFamily === 'arial' ? "'Arial', sans-serif" : "'Georgia', serif");
    document.documentElement.style.setProperty('--font-size', fontSize + 'px');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = theme === 'auto' ? (prefersDark ? 'dark' : 'light') : theme;
    document.body.setAttribute('data-theme', currentTheme);
    const accents = { blue: '#89b4fa', green: '#a6e3a1', purple: '#cba6f7', red: '#f38ba8' };
    document.documentElement.style.setProperty('--accent', accents[accentColor]);
    
    // Apply blob colors based on selected color theme
    const selectedTheme = colorThemes[colorTheme] || colorThemes.mauve;
    document.documentElement.style.setProperty('--blob-primary', selectedTheme.primary);
    document.documentElement.style.setProperty('--blob-secondary', selectedTheme.secondary);
  }

  applySettings();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySettings);

  // Persistence / security notes:
  // - Data is saved locally in the browser `localStorage` under keys such as:
  //   - 'users' => JSON { email: hashedPassword }
  //   - 'currentUser' => currently logged-in email
  //   - 'isAdmin' => 'true' or 'false'
  //   - 'topics' => array of topic objects (subjects, lessons)
  //   - `files_<email>` => uploaded files for a user
  //   - `progress_<email>` => per-user progress state
  // - WARNING: The admin credential check below is hardcoded in this script and
  //   is visible in the repository. For production, move auth and data to a
  //   backend service and remove any hardcoded secrets from source files.

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
      if (isAppPage) {
        showApp();
      } else {
        window.location.href = 'dashboard.html';
      }
      return true;
    }
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    // Handle legacy format if it's an object
    if (!Array.isArray(users)) {
      users = Object.keys(users).map(e => ({ email: e, password: users[e] }));
    }
    const hashed = await hashPassword(pwd);
    const user = users.find(u => u.email === email && u.password === hashed);
    if (user) {
      currentUser = email;
      isAdmin = false;
      localStorage.setItem('currentUser', email);
      localStorage.setItem('isAdmin', 'false');
      if (isAppPage) {
        showApp();
      } else {
        window.location.href = 'dashboard.html';
      }
      return true;
    }
    return false;
  }

  async function signup(email, pwd) {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    // Handle legacy format if it's an object
    if (!Array.isArray(users)) {
      users = Object.keys(users).map(e => ({ email: e, password: users[e] }));
    }
    // Check if user exists
    if (users.some(u => u.email === email)) return false;
    users.push({ email, password: await hashPassword(pwd) });
    localStorage.setItem('users', JSON.stringify(users));
    currentUser = email;
    isAdmin = false;
    localStorage.setItem('currentUser', email);
    localStorage.setItem('isAdmin', 'false');
    updateLearnerCount();
    if (isAppPage) {
      showApp();
    } else {
      window.location.href = 'dashboard.html';
    }
    return true;
  }

  function logout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    // If we're on the dashboard page, send user back to the public homepage.
    if (isAppPage) {
      window.location.href = 'index.html';
    } else {
      showHome();
    }
  }

  function showHome() {
    homeEl.classList.remove('hidden');
    authEl.classList.add('hidden');
    appEl.classList.add('hidden');
    footerEl.classList.add('hidden');
    loadPreviewTopics();
    updateLearnerCount();
  }

  function showAuth(showSignup = false) {
    if (showSignup) {
      window.location.href = 'signup.html';
    } else {
      window.location.href = 'signin.html';
    }
  }

  // Homepage config: stored in localStorage under 'homepage'.
  // Structure example:
  // { hero: {title, subtitle, cta}, features: [{title,desc}], testimonials: [{text,author}] }
  function getHomepageConfig() {
    try {
      return JSON.parse(localStorage.getItem('homepage') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveHomepageConfig(cfg) {
    localStorage.setItem('homepage', JSON.stringify(cfg));
  }

  function renderHomepage() {
    const cfg = getHomepageConfig();
    // Hero
    const heroEl = document.querySelector('.hero');
    if (heroEl) {
      const title = cfg.hero?.title || 'Welcome to Skill Central';
      const sub = cfg.hero?.subtitle || 'Master practical life skills with interactive, bite-sized courses.';
      heroEl.querySelector('h2').textContent = title;
      heroEl.querySelector('p').textContent = sub;
      const cta = heroEl.querySelector('.learn-btn') || heroEl.querySelector('#enter-site-main');
      if (cta) cta.textContent = cfg.hero?.cta || 'Get Started';
    }

    // Features
    const featuresEl = document.getElementById('features');
    if (featuresEl) {
      featuresEl.innerHTML = '';
      const features = cfg.features || [
        { title: 'Practical Courses', desc: 'Short, actionable lessons focused on everyday skills.' },
        { title: 'Personal Progress', desc: 'Track learning with per-lesson completion and a dashboard.' },
        { title: 'Admin Tools', desc: 'Edit topics, lessons and homepage content without deploying.' }
      ];
      features.forEach(f => {
        const card = document.createElement('div');
        card.className = 'feature-card';
        const h = document.createElement('h4'); h.textContent = f.title;
        const p = document.createElement('p'); p.textContent = f.desc;
        card.appendChild(h); card.appendChild(p);
        featuresEl.appendChild(card);
      });
    }

    // Testimonials
    const testEl = document.querySelector('.testimonials');
    if (testEl) {
      testEl.innerHTML = '';
      const tests = cfg.testimonials || [
        { text: 'Clear, practical, and well-structured.', author: 'Alex' },
        { text: 'Great for busy people. Short lessons that actually stick.', author: 'Priya' }
      ];
      tests.forEach(t => {
        const d = document.createElement('div'); d.className = 'testimonial';
        const p = document.createElement('p'); p.textContent = `"${t.text}" — ${t.author || ''}`;
        d.appendChild(p); testEl.appendChild(d);
      });
    }
  }

  // Initialize homepage rendering on public page
  if (homeEl) renderHomepage();

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

  function updateLearnerCount() {
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    // Handle legacy format if it's an object
    if (!Array.isArray(users)) {
      users = Object.keys(users);
    }
    const learnerCountEl = document.getElementById('learner-count');
    if (learnerCountEl) {
      learnerCountEl.textContent = users.length;
    }
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

  // Home events - redirect to separate auth pages
  enterSiteBtn?.addEventListener('click', () => window.location.href = 'signup.html');
  document.getElementById('show-login-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signin.html';
  });
  enterSiteMainBtn?.addEventListener('click', () => window.location.href = 'signup.html');
  document.getElementById('cta-signup')?.addEventListener('click', () => window.location.href = 'signup.html');
  document.getElementById('footer-signup')?.addEventListener('click', () => window.location.href = 'signup.html');
  
  accountBtn?.addEventListener('click', showAccount);

  logoutBtn?.addEventListener('click', logout);

  adminPanelBtn?.addEventListener('click', () => {
    adminEditEl.classList.toggle('hidden');
    populateLessonSelects();
  });

  addTopicForm?.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('topic-name').value;
    const image = document.getElementById('topic-image')?.value || '';
    const desc = document.getElementById('topic-desc').value;
    const subjectsText = document.getElementById('topic-subjects').value;
    const subjects = subjectsText.split(',').map(s => ({ name: s.trim(), lessons: [] }));
    const topicObj = { name, description: desc, subjects };
    if (image) topicObj.image = image;
    topicsData.push(topicObj);
    localStorage.setItem('topics', JSON.stringify(topicsData));
    loadTopics();
    addTopicForm.reset();
  });

  // Populate topic & subject selects for adding lessons
  function populateLessonSelects() {
    const topicSelect = document.getElementById('lesson-topic');
    const subjectSelect = document.getElementById('lesson-subject');
    if (!topicSelect) return;
    topicSelect.innerHTML = '<option value="">Select Topic</option>';
    topicsData.forEach((t, ti) => {
      const opt = document.createElement('option');
      opt.value = ti;
      opt.textContent = t.name;
      topicSelect.appendChild(opt);
    });
    // when topic changes, populate subjects
    topicSelect.onchange = () => {
      const ti = parseInt(topicSelect.value);
      subjectSelect.innerHTML = '<option value="">Select Subject</option>';
      if (Number.isNaN(ti)) return;
      (topicsData[ti].subjects || []).forEach((s, si) => {
        const opt = document.createElement('option');
        opt.value = si;
        opt.textContent = s.name;
        subjectSelect.appendChild(opt);
      });
    };
  }

  // Handle adding lessons via admin form
  addLessonForm?.addEventListener('submit', e => {
    e.preventDefault();
    const topicIndex = parseInt(document.getElementById('lesson-topic').value);
    const subjectIndex = parseInt(document.getElementById('lesson-subject').value);
    const title = document.getElementById('lesson-title').value;
    const content = document.getElementById('lesson-content').value;
    const type = document.getElementById('lesson-type').value;
    const image = document.getElementById('lesson-image')?.value || '';
    if (Number.isNaN(topicIndex) || Number.isNaN(subjectIndex)) return alert('Select a topic and subject');
    const lesson = { title, content, type };
    if (image) lesson.image = image;
    topicsData[topicIndex].subjects[subjectIndex].lessons.push(lesson);
    localStorage.setItem('topics', JSON.stringify(topicsData));
    loadTopics();
    addLessonForm.reset();
    populateLessonSelects();
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
  searchEl?.addEventListener('input', () => {
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
  filesBtn?.addEventListener('click', () => {
    if (topicsEl.classList.contains('hidden')) {
      showTopics();
    } else {
      showFiles();
    }
  });

  // Upload
  uploadBtn?.addEventListener('click', () => {
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
  document.getElementById('burger-menu')?.addEventListener('click', () => {
    document.getElementById('mobile-menu')?.classList.toggle('open');
  });

  // Menu items
  document.getElementById('menu-home')?.addEventListener('click', e => {
    e.preventDefault();
    showTopics();
    document.getElementById('mobile-menu')?.classList.remove('open');
  });

  document.getElementById('menu-settings')?.addEventListener('click', e => {
    e.preventDefault();
    showSettings();
    document.getElementById('mobile-menu')?.classList.remove('open');
  });

  menuAccountLink?.addEventListener('click', e => {
    e.preventDefault();
    showAccount();
    document.getElementById('mobile-menu').classList.remove('open');
  });

  // Footer links
  document.getElementById('footer-home')?.addEventListener('click', e => {
    e.preventDefault();
    showHome();
  });

  document.getElementById('footer-settings')?.addEventListener('click', e => {
    e.preventDefault();
    showSettings();
  });

  footerAccountLink?.addEventListener('click', e => {
    e.preventDefault();
    showAccount();
  });

  document.getElementById('footer-files')?.addEventListener('click', e => {
    e.preventDefault();
    showFiles();
  });

  document.getElementById('footer-logout')?.addEventListener('click', e => {
    e.preventDefault();
    logout();
  });


  // Settings
  document.getElementById('back-from-settings')?.addEventListener('click', () => {
    showTopics();
  });

  document.getElementById('theme-select')?.addEventListener('change', e => {
    theme = e.target.value;
    localStorage.setItem('theme', theme);
    applySettings();
  });

  document.getElementById('accent-select')?.addEventListener('change', e => {
    accentColor = e.target.value;
    localStorage.setItem('accent', accentColor);
    applySettings();
  });

  document.getElementById('color-theme-select')?.addEventListener('change', e => {
    colorTheme = e.target.value;
    localStorage.setItem('colorTheme', colorTheme);
    applySettings();
  });

  document.getElementById('font-select')?.addEventListener('change', e => {
    fontFamily = e.target.value;
    localStorage.setItem('font', fontFamily);
    applySettings();
  });

  document.getElementById('font-size-slider')?.addEventListener('input', e => {
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

  // Set initial values (only if the elements exist on this page)
  if (document.getElementById('theme-select')) document.getElementById('theme-select').value = theme;
  if (document.getElementById('accent-select')) document.getElementById('accent-select').value = accentColor;
  if (document.getElementById('color-theme-select')) document.getElementById('color-theme-select').value = colorTheme;
  if (document.getElementById('font-select')) document.getElementById('font-select').value = fontFamily;
  if (document.getElementById('font-size-slider')) document.getElementById('font-size-slider').value = fontSize;

  // Admin homepage editor bindings (if present)
  const homepageForm = document.getElementById('homepage-form');
  const homepageJson = document.getElementById('homepage-json');
  const loadHomepageBtn = document.getElementById('load-homepage');
  const saveHomepageBtn = document.getElementById('save-homepage');
  const resetHomepageBtn = document.getElementById('reset-homepage');

  if (homepageForm) {
    loadHomepageBtn?.addEventListener('click', () => {
      const cfg = getHomepageConfig();
      homepageJson.value = JSON.stringify(cfg, null, 2);
      alert('Loaded homepage JSON into editor.');
    });

    saveHomepageBtn?.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(homepageJson.value);
        saveHomepageConfig(parsed);
        alert('Homepage saved. Changes will appear on the public homepage.');
      } catch (e) {
        alert('Invalid JSON: ' + e.message);
      }
    });

    resetHomepageBtn?.addEventListener('click', () => {
      if (!confirm('Reset homepage to defaults?')) return;
      localStorage.removeItem('homepage');
      homepageJson.value = '';
      alert('Homepage reset.');
    });
  }

  // Gist export/import for topics
  async function createGistFromTopics(token, makePublic = false) {
    const topics = JSON.parse(localStorage.getItem('topics') || '[]');
    const body = {
      description: 'Skill-Central topics backup',
      public: !!makePublic,
      files: {
        'topics.json': {
          content: JSON.stringify(topics, null, 2)
        }
      }
    };
    const res = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Gist creation failed: ' + res.statusText);
    return await res.json();
  }

  async function loadTopicsFromGist(gistId, token) {
    const url = `https://api.github.com/gists/${gistId}`;
    const res = await fetch(url, token ? { headers: { 'Authorization': `token ${token}` } } : {});
    if (!res.ok) throw new Error('Failed to load gist: ' + res.statusText);
    const data = await res.json();
    if (data.files && data.files['topics.json'] && data.files['topics.json'].content) {
      const content = data.files['topics.json'].content;
      try {
        const parsed = JSON.parse(content);
        localStorage.setItem('topics', JSON.stringify(parsed));
        topicsData = parsed;
        loadTopics();
        return true;
      } catch (e) {
        throw new Error('Invalid JSON in gist topics.json');
      }
    }
    throw new Error('topics.json not found in gist');
  }

  // Admin buttons for gist handling
  const createGistBtn = document.getElementById('create-gist');
  const gistTokenInput = document.getElementById('gist-token');
  const gistPublicCheckbox = document.getElementById('gist-public');
  const loadGistBtn = document.getElementById('load-gist');
  const gistIdInput = document.getElementById('gist-id');
  const downloadTopicsBtn = document.getElementById('download-topics');
  const clearTopicsBtn = document.getElementById('clear-topics');

  createGistBtn?.addEventListener('click', async () => {
    const token = gistTokenInput.value.trim();
    if (!token) return alert('Please paste a GitHub token with `gist` scope in the token field.');
    try {
      createGistBtn.disabled = true;
      const res = await createGistFromTopics(token, gistPublicCheckbox.checked);
      alert('Gist created: ' + res.html_url + '\nGist ID: ' + res.id);
    } catch (e) {
      alert(e.message);
    } finally { createGistBtn.disabled = false; }
  });

  loadGistBtn?.addEventListener('click', async () => {
    const gid = gistIdInput.value.trim();
    const token = gistTokenInput.value.trim();
    if (!gid) return alert('Enter the Gist ID to load from.');
    try {
      loadGistBtn.disabled = true;
      await loadTopicsFromGist(gid, token || null);
      alert('Topics imported from gist.');
    } catch (e) {
      alert(e.message);
    } finally { loadGistBtn.disabled = false; }
  });

  downloadTopicsBtn?.addEventListener('click', () => {
    const topics = localStorage.getItem('topics') || '[]';
    const blob = new Blob([topics], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'topics.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  clearTopicsBtn?.addEventListener('click', () => {
    if (!confirm('Clear all local topics? This cannot be undone.')) return;
    localStorage.setItem('topics', JSON.stringify([]));
    topicsData = [];
    loadTopics();
    alert('Local topics cleared.');
  });
});