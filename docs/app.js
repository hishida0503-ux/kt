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
  const refereeNote = document.querySelector('[data-section="refereeStaff"] textarea');
  if (refereeNote && formData.refereeNote) refereeNote.value = formData.refereeNote;
  if (formData.uniform) {
    const rb = document.querySelector(`input[name="uniform"][value="${formData.uniform}"]`);
    if (rb) rb.checked = true;
  }
  const uniformNote = document.querySelector('[data-section="uniform"] textarea');
  if (uniformNote && formData.uniformNote) uniformNote.value = formData.uniformNote;
  if (formData.items && formData.items.length > 0) {
    formData.items.forEach(item => {
      const cb = document.querySelector(`#checkbox-group-items input[value="${item}"]`);
      if (cb) cb.checked = true;
    });
  }
  const itemsNote = document.querySelector('[data-section="items"] textarea');
  if (itemsNote && formData.itemsNote) itemsNote.value = formData.itemsNote;
  const carpoolTextarea = document.querySelector('[data-section="carpool"] textarea');
  if (carpoolTextarea && formData.carpool) carpoolTextarea.value = formData.carpool;
  formData.matchRows.forEach((m, idx) => {
    if (m) {
      const meetingSection = document.querySelector(`[data-meeting-idx="${idx}"]`);
      if (meetingSection) {
        const selects = meetingSection.querySelectorAll('select');
        const textInputs = meetingSection.querySelectorAll('input[type="text"]');
        if (selects[0] && m.time) selects[0].value = m.time;
        if (selects[1] && m.type) selects[1].value = m.type;
        if (selects[2]) {
          if (m.place && masters.meetingPlaces.includes(m.place)) {
            selects[2].value = m.place;
          } else if (m.placeOther) {
            selects[2].value = '__other__';
            selects[2].dispatchEvent(new Event('change'));
            if (textInputs[0]) textInputs[0].value = m.placeOther;
          }
        }
        updateMeetingCompletion(idx);
      }
    }
  });
  const meetingNoteArea = document.querySelector('[data-section="meeting"] > textarea:last-of-type');
  if (meetingNoteArea && formData.meetingNote) {
    meetingNoteArea.value = formData.meetingNote;
  }
  formData.matchRows.forEach((m, idx) => {
    if (m) {
      const rows = document.querySelectorAll('[data-section="match"] .dynamic-row');
      if (rows[idx]) {
        const inputs = rows[idx].querySelectorAll('input');
        const selects = rows[idx].querySelectorAll('select');
        const textareas = rows[idx].querySelectorAll('textarea');
        const checkboxes = rows[idx].querySelectorAll('input[type="checkbox"]');
        if (inputs[0] && m.time) inputs[0].value = m.time;
        if (inputs[1] && m.opponent) inputs[1].value = m.opponent;
        if (selects[0] && m.duration) selects[0].value = m.duration;
        if (selects[1] && m.court) selects[1].value = m.court;
        if (checkboxes[0] && m['現地調整']) checkboxes[0].checked = true;
        if (checkboxes[1] && m['未定']) checkboxes[1].checked = true;
        if (textareas[0] && m.note) textareas[0].value = m.note;
      }
    }
  });
  formData.refereeRows.forEach((r, idx) => {
    if (r) {
      const rows = document.querySelectorAll('[data-section="referee"] .dynamic-row');
      if (rows[idx]) {
        const inputs = rows[idx].querySelectorAll('input');
        const selects = rows[idx].querySelectorAll('select');
        const textareas = rows[idx].querySelectorAll('textarea');
        const checkboxes = rows[idx].querySelectorAll('input[type="checkbox"]');
        if (inputs[0] && r.time) inputs[0].value = r.time;
        if (inputs[1] && r.opponent) inputs[1].value = r.opponent;
        if (selects[0] && r.duration) selects[0].value = r.duration;
        if (selects[1] && r.court) selects[1].value = r.court;
        if (checkboxes[0] && r['現地調整']) checkboxes[0].checked = true;
        if (checkboxes[1] && r['未定']) checkboxes[1].checked = true;
        if (checkboxes[2] && r['当該']) checkboxes[2].checked = true;
        if (textareas[0] && r.note) textareas[0].value = r.note;
      }
    }
  });
  checkCompletion();
  renderOutput();
}
document.getElementById('saveMasterBtn').addEventListener('click', () => {
  const savedFormData = JSON.parse(JSON.stringify(formData));
  saveMastersFromModal();
  document.getElementById('masterModal').classList.remove('show');
  renderInputForm();
  formData = savedFormData;
  restoreFormData();
  showToast('マスタを保存しました');
});
function renderInputForm() {
  const container = document.getElementById('input-content');
  container.innerHTML = '';
  formData = {
    event: '', eventOther: '', eventDay: '',
    date: '',
    venue: '', venueOther: '',
    meetingRows: [],
    meetingNote: '',
    useHighway: false, highway: '', highwayNote: '',
    matchRows: [],
    refereeRows: [],
    staff: [], staffNote: '',
    refereeStaff: [], refereeNote: '',
    uniform: '', uniformNote: '',
    items: [], itemsNote: '',
    carpool: ''
  };
  const sections = [
    { id: 'basic', title: '基本情報', render: renderBasicSection },
    { id: 'meeting', title: '集合情報', render: renderMeetingSection },
    { id: 'highway', title: '高速道路', render: renderHighwaySection },
    { id: 'match', title: '試合スケジュール', render: renderMatchSection },
    { id: 'referee', title: '審判担当', render: renderRefereeSection },
    { id: 'staff', title: 'スタッフ', render: renderStaffSection },
    { id: 'refereeStaff', title: '審判員', render: renderRefereeStaffSection },
    { id: 'uniform', title: 'ユニフォーム', render: renderUniformSection },
    { id: 'items', title: '持ち物', render: renderItemsSection },
    { id: 'carpool', title: '配車情報', render: renderCarpoolSection }
  ];
  sections.forEach(sec => {
    const section = createAccordionSection(sec.id, sec.title);
    sec.render(section.content);
    container.appendChild(section.element);
  });
}
function createAccordionSection(id, title) {
  const section = document.createElement('div');
  section.className = 'accordion-section';
  section.dataset.section = id;
  const header = document.createElement('div');
  header.className = 'accordion-header';
  const titleDiv = document.createElement('div');
  titleDiv.className = 'accordion-title';
  titleDiv.innerHTML = `<span class="accordion-check">✓</span> ${title}`;
  const icon = document.createElement('span');
  icon.className = 'accordion-icon';
  icon.textContent = '▼';
  header.appendChild(titleDiv);
  header.appendChild(icon);
  const content = document.createElement('div');
  content.className = 'accordion-content';
  header.addEventListener('click', () => {
    section.classList.toggle('open');
  });
  section.appendChild(header);
  section.appendChild(content);
  return { element: section, content };
}
function markSectionCompleted(sectionId) {
  const section = document.querySelector(`[data-section="${sectionId}"]`);
  if (section) section.classList.add('completed');
}
function renderBasicSection(container) {
  addSelectWithOther(container, '大会名', 'event', masters.events);
  const label = document.createElement('label');
  label.textContent = '日程区分';
  const select = document.createElement('select');
  //... (TRUNCATED TO SAVE SPACE)