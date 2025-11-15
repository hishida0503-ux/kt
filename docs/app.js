const DEFAULT_MASTERS = {
  events: ["U12全日本サッカー選手権", "県リーグ", "招待大会"],
  eventDays: ["1日目", "2日目", "3日目", "①", "②", "③", "予選", "決勝トーナメント"],
  venues: ["フードリエサッカーフィールド青木", "市民グラウンド", "県営サッカー場"],
  meetingPlaces: ["菊東小", "市民グラウンド駐車場", "学校正門前", "現地"],
  staff: ["田島さん", "橋間さん", "石田"],
  referees: ["橋間さん", "五月女さん", "石田"],
  uniforms: ["正ユニ", "サブユニ（白）", "サブユニ（紺）"],
  items: ["サッカー用具一式", "ジャグ", "飲み物", "マイタオル", "着替え", "昼食", "ウィダー等の栄養補給ゼリー"]
};

const LS_KEY_HISTORY = 'templateApp.history.v2';
const LS_KEY_MASTERS = 'templateApp.masters.v2';

let masters = loadMasters();
let formData = {};
let touchStartX = 0;
let touchEndX = 0;

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function loadMasters() {
  try {
    const raw = localStorage.getItem(LS_KEY_MASTERS);
    if (raw) {
      const loaded = JSON.parse(raw);
      return {
        events: loaded.events || DEFAULT_MASTERS.events,
        eventDays: loaded.eventDays || DEFAULT_MASTERS.eventDays,
        venues: loaded.venues || DEFAULT_MASTERS.venues,
        meetingPlaces: loaded.meetingPlaces || DEFAULT_MASTERS.meetingPlaces,
        staff: loaded.staff || DEFAULT_MASTERS.staff,
        referees: loaded.referees || DEFAULT_MASTERS.referees,
        uniforms: loaded.uniforms || DEFAULT_MASTERS.uniforms,
        items: loaded.items || DEFAULT_MASTERS.items
      };
    }
  } catch {}
  return DEFAULT_MASTERS;
}

function saveMasters(obj) {
  localStorage.setItem(LS_KEY_MASTERS, JSON.stringify(obj));
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveHistory(hist) {
  localStorage.setItem(LS_KEY_HISTORY, JSON.stringify(hist));
}

function formatDateJp(yyyy_mm_dd) {
  if (!yyyy_mm_dd) return '';
  const [y, m, d] = yyyy_mm_dd.split('-').map(x => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  const wdays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${m}月${d}日(${wdays[dt.getDay()]})`;
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-content`).classList.add('active');
  
  if (tabName === 'preview') {
    renderOutput();
    document.getElementById('floatingActions').classList.add('show');
  } else {
    document.getElementById('floatingActions').classList.remove('show');
  }
  
  if (tabName === 'history') {
    renderHistory();
  }
}

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const threshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) < threshold) return;
  
  const currentTab = document.querySelector('.tab.active').dataset.tab;
  const tabs = ['input', 'preview', 'history'];
  const currentIndex = tabs.indexOf(currentTab);
  
  if (diff > 0 && currentIndex < tabs.length - 1) {
    switchTab(tabs[currentIndex + 1]);
  } else if (diff < 0 && currentIndex > 0) {
    switchTab(tabs[currentIndex - 1]);
  }
}

document.getElementById('masterBtn').addEventListener('click', () => {
  renderMasterModal();
  document.getElementById('masterModal').classList.add('show');
});

document.getElementById('closeMasterBtn').addEventListener('click', () => {
  document.getElementById('masterModal').classList.remove('show');
});

function renderMasterModal() {
  const container = document.getElementById('masterSections');
  container.innerHTML = '';
  
  const masterLabels = {
    events: '大会名',
    eventDays: '日程区分',
    venues: '会場名',
    meetingPlaces: '集合場所',
    staff: 'スタッフ',
    referees: '審判員',
    uniforms: 'ユニフォーム',
    items: '持ち物'
  };

  Object.keys(masterLabels).forEach(key => {
    const section = document.createElement('div');
    section.className = 'master-section';
    
    const title = document.createElement('h3');
    title.textContent = masterLabels[key];
    section.appendChild(title);

    const list = document.createElement('div');
    list.className = 'master-list';
    list.id = `master-${key}`;

    masters[key].forEach((item, idx) => {
      list.appendChild(createMasterItem(key, item, idx));
    });

    section.appendChild(list);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = '+ 追加';
    addBtn.style.marginTop = '12px';
    addBtn.onclick = () => {
      const newItem = createMasterItem(key, '', masters[key].length);
      list.appendChild(newItem);
      newItem.querySelector('input').focus();
    };
    section.appendChild(addBtn);

    container.appendChild(section);
  });
}

function createMasterItem(key, value, idx) {
  const item = document.createElement('div');
  item.className = 'master-item';
  
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  input.placeholder = '項目名を入力';
  
  const delBtn = document.createElement('button');
  delBtn.className = 'btn';
  delBtn.textContent = '削除';
  delBtn.style.padding = '10px';
  delBtn.onclick = () => item.remove();
  
  item.appendChild(input);
  item.appendChild(delBtn);
  return item;
}

function saveMastersFromModal() {
  const newMasters = {
    events: [],
    eventDays: [],
    venues: [],
    meetingPlaces: [],
    staff: [],
    referees: [],
    uniforms: [],
    items: []
  };

  Object.keys(newMasters).forEach(key => {
    const inputs = document.querySelectorAll(`#master-${key} input`);
    inputs.forEach(inp => {
      const val = inp.value.trim();
      if (val) newMasters[key].push(val);
    });
  });

  masters = newMasters;
  saveMasters(masters);
}

function restoreFormData() {
  const eventSelect = document.querySelector('select');
  if (eventSelect && formData.event) {
    if (masters.events.includes(formData.event)) {
      eventSelect.value = formData.event;
    } else if (formData.eventOther) {
      eventSelect.value = '__other__';
      eventSelect.dispatchEvent(new Event('change'));
      const otherInput = eventSelect.nextElementSibling;
      if (otherInput) otherInput.value = formData.eventOther;
    }
  }
  
  const dateInput = document.querySelector('input[type="date"]');
  if (dateInput && formData.date) {
    dateInput.value = formData.date;
  }
  
  const eventDaySelect = document.querySelectorAll('select')[1];
  if (eventDaySelect && formData.eventDay) {
    eventDaySelect.value = formData.eventDay;
  }
  
  const venueSelect = document.querySelectorAll('select')[2];
  if (venueSelect && formData.venue) {
    if (masters.venues.includes(formData.venue)) {
      venueSelect.value = formData.venue;
    } else if (formData.venueOther) {
      venueSelect.value = '__other__';
      venueSelect.dispatchEvent(new Event('change'));
      const otherInput = venueSelect.nextElementSibling;
      if (otherInput) otherInput.value = formData.venueOther;
    }
  }
  
  const highwayCheckbox = document.getElementById('useHighway');
  if (highwayCheckbox && formData.useHighway) {
    highwayCheckbox.checked = true;
    highwayCheckbox.dispatchEvent(new Event('change'));
    const hwInput = document.querySelector('#highway-fields input[type="text"]');
    if (hwInput && formData.highway) hwInput.value = formData.highway;
    const hwNote = document.querySelector('#highway-fields textarea');
    if (hwNote && formData.highwayNote) hwNote.value = formData.highwayNote;
  }
  
  if (formData.staff && formData.staff.length > 0) {
    formData.staff.forEach(s => {
      const cb = document.querySelector(`#checkbox-group-staff input[value="${s}"]`);
      if (cb) cb.checked = true;
    });
  }
  const staffNote = document.querySelector('[data-section="staff"] textarea');
  if (staffNote && formData.staffNote) staffNote.value = formData.staffNote;
  
  if (formData.refereeStaff && formData.refereeStaff.length > 0) {
    formData.refereeStaff.forEach(r => {
      const cb = document.querySelector(`#checkbox-group-refereeStaff input[value="${r}"]`);
      if (cb) cb.checked = true;
    });
  }
