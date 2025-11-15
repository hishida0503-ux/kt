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
  
  formData.meetingRows.forEach((m, idx) => {
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
  
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '選択してください（任意）';
  select.appendChild(defaultOpt);
  
  const eventDays = masters.eventDays || DEFAULT_MASTERS.eventDays;
  eventDays.forEach(day => {
    const opt = document.createElement('option');
    opt.value = day;
    opt.textContent = day;
    select.appendChild(opt);
  });
  
  select.onchange = (e) => {
    formData.eventDay = e.target.value;
    checkCompletion();
  };
  
  container.appendChild(label);
  container.appendChild(select);
  
  addDateField(container, '日付', 'date');
  addSelectWithOther(container, '会場名', 'venue', masters.venues);
}

function renderMeetingSection(container) {
  for (let i = 0; i < 6; i++) {
    const meetingItem = document.createElement('div');
    meetingItem.className = 'accordion-section';
    meetingItem.style.marginBottom = '8px';
    meetingItem.dataset.meetingIdx = i;
    
    const header = document.createElement('div');
    header.className = 'accordion-header';
    header.style.padding = '12px';
    
    const title = document.createElement('div');
    title.className = 'accordion-title';
    title.innerHTML = `<span class="accordion-check">✓</span> 集合情報 ${i + 1}`;
    title.style.fontSize = '0.9rem';
    
    const icon = document.createElement('span');
    icon.className = 'accordion-icon';
    icon.textContent = '▼';
    icon.style.fontSize = '1rem';
    
    header.appendChild(title);
    header.appendChild(icon);
    
    const content = document.createElement('div');
    content.className = 'accordion-content';
    content.style.padding = '0 12px';
    content.appendChild(createMeetingRow(i));
    
    header.addEventListener('click', () => {
      meetingItem.classList.toggle('open');
    });
    
    meetingItem.appendChild(header);
    meetingItem.appendChild(content);
    container.appendChild(meetingItem);
    
    if (i === 0) {
      meetingItem.classList.add('open');
    }
  }
  
  addNoteField(container, 'meetingNote');
}

function createMeetingRow(idx) {
  const row = document.createElement('div');
  row.style.marginBottom = '12px';
  
  const fieldRow1 = document.createElement('div');
  fieldRow1.className = 'field-row';
  
  const timeGroup = document.createElement('div');
  timeGroup.className = 'field-group';
  const timeLabel = document.createElement('label');
  timeLabel.textContent = '時間';
  const timeSelect = document.createElement('select');
  
  const defaultTimeOpt = document.createElement('option');
  defaultTimeOpt.value = '';
  defaultTimeOpt.textContent = '選択してください';
  timeSelect.appendChild(defaultTimeOpt);
  
  for (let h = 6; h <= 22; h++) {
    for (let m = 0; m < 60; m += 5) {
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      const opt = document.createElement('option');
      opt.value = timeStr;
      opt.textContent = timeStr;
      timeSelect.appendChild(opt);
    }
  }
  
  timeSelect.onchange = (e) => {
    if (!formData.meetingRows[idx]) formData.meetingRows[idx] = {};
    formData.meetingRows[idx].time = e.target.value;
    updateMeetingCompletion(idx);
    checkCompletion();
  };
  
  timeGroup.appendChild(timeLabel);
  timeGroup.appendChild(timeSelect);
  
  const typeGroup = createFieldGroup('種類', 'select', ['', '集合', '出発', '到着', '監督者会議'], (e) => {
    if (!formData.meetingRows[idx]) formData.meetingRows[idx] = {};
    formData.meetingRows[idx].type = e.target.value;
    updateMeetingCompletion(idx);
    checkCompletion();
  });
  
  fieldRow1.appendChild(timeGroup);
  fieldRow1.appendChild(typeGroup);
  row.appendChild(fieldRow1);
  
  const fieldRow2 = document.createElement('div');
  fieldRow2.className = 'field-row full';
  
  const placeGroup = document.createElement('div');
  placeGroup.className = 'field-group';
  const placeLabel = document.createElement('label');
  placeLabel.textContent = '場所';
  const placeSelect = document.createElement('select');
  
  const defaultPlaceOpt = document.createElement('option');
  defaultPlaceOpt.value = '';
  defaultPlaceOpt.textContent = '選択してください';
  placeSelect.appendChild(defaultPlaceOpt);
  
  const meetingPlaces = masters.meetingPlaces || DEFAULT_MASTERS.meetingPlaces;
  meetingPlaces.forEach(place => {
    const opt = document.createElement('option');
    opt.value = place;
    opt.textContent = place;
    placeSelect.appendChild(opt);
  });
  
  const otherOpt = document.createElement('option');
  otherOpt.value = '__other__';
  otherOpt.textContent = 'その他（自由入力）';
  placeSelect.appendChild(otherOpt);
  
  const placeInput = document.createElement('input');
  placeInput.placeholder = '場所を入力';
  placeInput.style.display = 'none';
  placeInput.style.marginTop = '8px';
  
  placeSelect.onchange = (e) => {
    if (!formData.meetingRows[idx]) formData.meetingRows[idx] = {};
    if (e.target.value === '__other__') {
      placeInput.style.display = 'block';
      formData.meetingRows[idx].place = placeInput.value;
      formData.meetingRows[idx].placeOther = placeInput.value;
    } else {
      placeInput.style.display = 'none';
      formData.meetingRows[idx].place = e.target.value;
      formData.meetingRows[idx].placeOther = '';
    }
    updateMeetingCompletion(idx);
    checkCompletion();
  };
  
  placeInput.oninput = (e) => {
    if (!formData.meetingRows[idx]) formData.meetingRows[idx] = {};
    formData.meetingRows[idx].place = e.target.value;
    formData.meetingRows[idx].placeOther = e.target.value;
    updateMeetingCompletion(idx);
    checkCompletion();
  };
  
  placeGroup.appendChild(placeLabel);
  placeGroup.appendChild(placeSelect);
  placeGroup.appendChild(placeInput);
  
  fieldRow2.appendChild(placeGroup);
  row.appendChild(fieldRow2);
  
  return row;
}

function updateMeetingCompletion(idx) {
  const meetingSection = document.querySelector(`[data-meeting-idx="${idx}"]`);
  if (meetingSection) {
    const m = formData.meetingRows[idx];
    if (m && (m.time || m.type || m.place)) {
      meetingSection.classList.add('completed');
    } else {
      meetingSection.classList.remove('completed');
    }
  }
}

function renderHighwaySection(container) {
  addCheckboxField(container, '高速道路を使用', 'useHighway', () => {
    const hwContainer = document.getElementById('highway-fields');
    hwContainer.style.display = formData.useHighway ? 'block' : 'none';
  });
  
  const hwContainer = document.createElement('div');
  hwContainer.id = 'highway-fields';
  hwContainer.style.display = 'none';
  
  addTextField(hwContainer, '高速道路', 'highway', '例: 宇都宮IC〜黒磯板室IC');
  addNoteField(hwContainer, 'highwayNote');
  
  container.appendChild(hwContainer);
}

function renderMatchSection(container) {
  for (let i = 0; i < 6; i++) {
    container.appendChild(createMatchRow(i));
  }
}

function renderRefereeSection(container) {
  for (let i = 0; i < 6; i++) {
    container.appendChild(createRefereeRow(i));
  }
}

function renderStaffSection(container) {
  addCheckboxGroup(container, 'staff', masters.staff);
  addNoteField(container, 'staffNote');
}

function renderRefereeStaffSection(container) {
  addCheckboxGroup(container, 'refereeStaff', masters.referees);
  addNoteField(container, 'refereeNote');
}

function renderUniformSection(container) {
  addRadioGroup(container, 'uniform', masters.uniforms);
  addNoteField(container, 'uniformNote');
}

function renderItemsSection(container) {
  addCheckboxGroup(container, 'items', masters.items);
  addNoteField(container, 'itemsNote');
}

function renderCarpoolSection(container) {
  addTextareaField(container, '配車情報', 'carpool', '例:\n🚙石田号 石田父、まや、たくと\n🚙田島号 田島父、たじあお');
}

function addSelectWithOther(container, labelText, key, options) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const select = document.createElement('select');
  
  const defaultOpt = document.createElement('option');
  defaultOpt.value = '';
  defaultOpt.textContent = '選択してください';
  select.appendChild(defaultOpt);
  
  options.forEach(opt => {
    const optEl = document.createElement('option');
    optEl.value = opt;
    optEl.textContent = opt;
    select.appendChild(optEl);
  });
  
  const otherOpt = document.createElement('option');
  otherOpt.value = '__other__';
  otherOpt.textContent = 'その他（自由入力）';
  select.appendChild(otherOpt);
  
  const otherInput = document.createElement('input');
  otherInput.placeholder = '自由入力';
  otherInput.style.display = 'none';
  otherInput.style.marginTop = '8px';
  
  select.onchange = (e) => {
    if (e.target.value === '__other__') {
      otherInput.style.display = 'block';
      formData[key] = '';
      formData[key + 'Other'] = otherInput.value;
    } else {
      otherInput.style.display = 'none';
      formData[key] = e.target.value;
      formData[key + 'Other'] = '';
    }
    checkCompletion();
  };
  
  otherInput.oninput = (e) => {
    formData[key + 'Other'] = e.target.value;
    checkCompletion();
  };
  
  container.appendChild(label);
  container.appendChild(select);
  container.appendChild(otherInput);
}

function addDateField(container, labelText, key) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.type = 'date';
  input.onchange = (e) => { formData[key] = e.target.value; checkCompletion(); };
  container.appendChild(label);
  container.appendChild(input);
}

function addTextField(container, labelText, key, placeholder) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const input = document.createElement('input');
  input.placeholder = placeholder || '';
  input.oninput = (e) => {
    formData[key] = e.target.value;
    checkCompletion();
  };
  container.appendChild(label);
  container.appendChild(input);
}

function addCheckboxField(container, labelText, key, callback) {
  const wrap = document.createElement('div');
  wrap.style.marginTop = '12px';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = key;
  checkbox.onchange = (e) => {
    formData[key] = e.target.checked;
    if (callback) callback();
    checkCompletion();
  };
  const label = document.createElement('label');
  label.htmlFor = key;
  label.textContent = labelText;
  label.style.display = 'inline';
  label.style.marginLeft = '8px';
  wrap.appendChild(checkbox);
  wrap.appendChild(label);
  container.appendChild(wrap);
}

function addCheckboxGroup(container, key, options) {
  const group = document.createElement('div');
  group.className = 'checkbox-group';
  group.id = `checkbox-group-${key}`;
  
  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.value = opt;
    cb.onchange = () => {
      const checked = Array.from(document.querySelectorAll(`#checkbox-group-${key} input:checked`)).map(c => c.value);
      formData[key] = checked;
      checkCompletion();
    };
    
    const lbl = document.createElement('label');
    lbl.textContent = opt;
    
    item.appendChild(cb);
    item.appendChild(lbl);
    group.appendChild(item);
  });
  
  container.appendChild(group);
}

function addRadioGroup(container, key, options) {
  const group = document.createElement('div');
  group.className = 'checkbox-group';
  
  options.forEach(opt => {
    const item = document.createElement('div');
    item.className = 'checkbox-item';
    
    const rb = document.createElement('input');
    rb.type = 'radio';
    rb.name = key;
    rb.value = opt;
    rb.onchange = (e) => {
      formData[key] = e.target.value;
      checkCompletion();
    };
    
    const lbl = document.createElement('label');
    lbl.textContent = opt;
    
    item.appendChild(rb);
    item.appendChild(lbl);
    group.appendChild(item);
  });
  
  container.appendChild(group);
}

function addTextareaField(container, labelText, key, placeholder) {
  const label = document.createElement('label');
  label.textContent = labelText;
  const textarea = document.createElement('textarea');
  textarea.rows = 4;
  textarea.placeholder = placeholder || '';
  textarea.oninput = (e) => {
    formData[key] = e.target.value;
    checkCompletion();
  };
  container.appendChild(label);
  container.appendChild(textarea);
}

function addNoteField(container, key) {
  const label = document.createElement('label');
  label.textContent = '注記';
  label.style.fontSize = '0.85rem';
  const textarea = document.createElement('textarea');
  textarea.rows = 2;
  textarea.placeholder = '補足事項があれば記入';
  textarea.oninput = (e) => {
    formData[key] = e.target.value;
    checkCompletion();
  };
  container.appendChild(label);
  container.appendChild(textarea);
}

function createMatchRow(idx) {
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  
  const header = document.createElement('div');
  header.className = 'dynamic-row-header';
  header.textContent = `試合 ${idx + 1}`;
  row.appendChild(header);
  
  const fieldRow1 = document.createElement('div');
  fieldRow1.className = 'field-row';
  
  const timeGroup = createFieldGroup('時間', 'time', null, (e) => {
    if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
    formData.matchRows[idx].time = e.target.value;
    checkCompletion();
  });
  
  const opponentGroup = createFieldGroup('対戦相手', 'text', null, (e) => {
    if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
    formData.matchRows[idx].opponent = e.target.value;
    checkCompletion();
  });
  
  fieldRow1.appendChild(timeGroup);
  fieldRow1.appendChild(opponentGroup);
  row.appendChild(fieldRow1);
  
  const fieldRow2 = document.createElement('div');
  fieldRow2.className = 'field-row';
  
  const durationGroup = createFieldGroup('試合時間', 'select', 
    ['', '15-5-15', '20-5-20', '15分1本', '20分1本', '25分1本', 'その他'], (e) => {
    if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
    formData.matchRows[idx].duration = e.target.value;
    checkCompletion();
  });
  
  const courtGroup = createFieldGroup('コート', 'select',
    ['', 'Aコート', 'Bコート', 'Cコート', 'Dコート', 'その他'], (e) => {
    if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
    formData.matchRows[idx].court = e.target.value;
    checkCompletion();
  });
  
  fieldRow2.appendChild(durationGroup);
  fieldRow2.appendChild(courtGroup);
  row.appendChild(fieldRow2);
  
  const specialRow = document.createElement('div');
  specialRow.style.marginTop = '12px';
  specialRow.style.display = 'flex';
  specialRow.style.gap = '12px';
  
  ['現地調整', '未定'].forEach(sp => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `match${idx}-${sp}`;
    cb.style.width = '20px';
    cb.style.height = '20px';
    cb.onchange = (e) => {
      if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
      formData.matchRows[idx][sp] = e.target.checked;
      checkCompletion();
    };
    const lbl = document.createElement('label');
    lbl.htmlFor = `match${idx}-${sp}`;
    lbl.textContent = sp;
    lbl.style.margin = '0';
    lbl.style.fontWeight = '500';
    wrap.appendChild(cb);
    wrap.appendChild(lbl);
    specialRow.appendChild(wrap);
  });
  row.appendChild(specialRow);
  
  const noteLabel = document.createElement('label');
  noteLabel.textContent = '注記';
  noteLabel.style.fontSize = '0.85rem';
  noteLabel.style.marginTop = '12px';
  const noteArea = document.createElement('textarea');
  noteArea.rows = 2;
  noteArea.placeholder = '補足事項';
  noteArea.oninput = (e) => {
    if (!formData.matchRows[idx]) formData.matchRows[idx] = {};
    formData.matchRows[idx].note = e.target.value;
    checkCompletion();
  };
  row.appendChild(noteLabel);
  row.appendChild(noteArea);
  
  return row;
}

function createRefereeRow(idx) {
  const row = document.createElement('div');
  row.className = 'dynamic-row';
  
  const header = document.createElement('div');
  header.className = 'dynamic-row-header';
  header.textContent = `審判 ${idx + 1}`;
  row.appendChild(header);
  
  const fieldRow1 = document.createElement('div');
  fieldRow1.className = 'field-row';
  
  const timeGroup = createFieldGroup('時間', 'time', null, (e) => {
    if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
    formData.refereeRows[idx].time = e.target.value;
    checkCompletion();
  });
  
  const opponentGroup = createFieldGroup('対戦相手', 'text', null, (e) => {
    if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
    formData.refereeRows[idx].opponent = e.target.value;
    checkCompletion();
  });
  
  fieldRow1.appendChild(timeGroup);
  fieldRow1.appendChild(opponentGroup);
  row.appendChild(fieldRow1);
  
  const fieldRow2 = document.createElement('div');
  fieldRow2.className = 'field-row';
  
  const durationGroup = createFieldGroup('試合時間', 'select', 
    ['', '15-5-15', '20-5-20', '15分1本', '20分1本', '25分1本', 'その他'], (e) => {
    if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
    formData.refereeRows[idx].duration = e.target.value;
    checkCompletion();
  });
  
  const courtGroup = createFieldGroup('コート', 'select',
    ['', 'Aコート', 'Bコート', 'Cコート', 'Dコート', 'その他'], (e) => {
    if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
    formData.refereeRows[idx].court = e.target.value;
    checkCompletion();
  });
  
  fieldRow2.appendChild(durationGroup);
  fieldRow2.appendChild(courtGroup);
  row.appendChild(fieldRow2);
  
  const specialRow = document.createElement('div');
  specialRow.style.marginTop = '12px';
  specialRow.style.display = 'flex';
  specialRow.style.gap = '12px';
  specialRow.style.flexWrap = 'wrap';
  
  ['現地調整', '未定', '当該'].forEach(sp => {
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '6px';
    
    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `referee${idx}-${sp}`;
    cb.style.width = '20px';
    cb.style.height = '20px';
    cb.onchange = (e) => {
      if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
      formData.refereeRows[idx][sp] = e.target.checked;
      checkCompletion();
    };
    const lbl = document.createElement('label');
    lbl.htmlFor = `referee${idx}-${sp}`;
    lbl.textContent = sp;
    lbl.style.margin = '0';
    lbl.style.fontWeight = '500';
    wrap.appendChild(cb);
    wrap.appendChild(lbl);
    specialRow.appendChild(wrap);
  });
  row.appendChild(specialRow);
  
  const noteLabel = document.createElement('label');
  noteLabel.textContent = '注記';
  noteLabel.style.fontSize = '0.85rem';
  noteLabel.style.marginTop = '12px';
  const noteArea = document.createElement('textarea');
  noteArea.rows = 2;
  noteArea.placeholder = '補足事項';
  noteArea.oninput = (e) => {
    if (!formData.refereeRows[idx]) formData.refereeRows[idx] = {};
    formData.refereeRows[idx].note = e.target.value;
    checkCompletion();
  };
  row.appendChild(noteLabel);
  row.appendChild(noteArea);
  
  return row;
}

function createFieldGroup(label, type, options, callback) {
  const group = document.createElement('div');
  group.className = 'field-group';
  
  const lbl = document.createElement('label');
  lbl.textContent = label;
  group.appendChild(lbl);
  
  let input;
  if (type === 'select') {
    input = document.createElement('select');
    options.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt;
      optEl.textContent = opt || '選択してください';
      input.appendChild(optEl);
    });
    input.onchange = callback;
  } else {
    input = document.createElement('input');
    input.type = type;
    if (type === 'time') input.placeholder = '例: 09:00';
    input.oninput = callback;
  }
  
  group.appendChild(input);
  return group;
}

function checkCompletion() {
  if ((formData.event || formData.eventOther) && formData.date && (formData.venue || formData.venueOther)) {
    markSectionCompleted('basic');
  }
  
  if (formData.meetingRows.some(m => m && (m.time || m.type || m.place))) {
    markSectionCompleted('meeting');
  }
  
  if (formData.useHighway && formData.highway) {
    markSectionCompleted('highway');
  }
  
  if (formData.matchRows.some(m => m && (m.time || m.opponent))) {
    markSectionCompleted('match');
  }
  
  if (formData.refereeRows.some(r => r && (r.time || r.opponent))) {
    markSectionCompleted('referee');
  }
  
  if (formData.staff && formData.staff.length > 0) {
    markSectionCompleted('staff');
  }
  
  if (formData.refereeStaff && formData.refereeStaff.length > 0) {
    markSectionCompleted('refereeStaff');
  }
  
  if (formData.uniform) {
    markSectionCompleted('uniform');
  }
  
  if (formData.items && formData.items.length > 0) {
    markSectionCompleted('items');
  }
  
  if (formData.carpool) {
    markSectionCompleted('carpool');
  }
}

function renderOutput() {
  const parts = [];
  
  parts.push('お疲れ様です!');
  
  const eventName = formData.eventOther || formData.event;
  if (eventName) {
    const fullEventName = eventName + (formData.eventDay || '');
    parts.push(`${fullEventName}のご連絡です。`);
    parts.push('');
  }
  
  if (formData.date) {
    parts.push(formatDateJp(formData.date));
  }
  
  const venueName = formData.venueOther || formData.venue;
  if (venueName) {
    parts.push(`🥅${venueName}`);
    parts.push('');
  }
  
  const meetings = formData.meetingRows.filter(m => m && (m.time || m.type || m.place));
  if (meetings.length > 0) {
    parts.push('⏰集合');
    meetings.forEach(m => {
      let line = '';
      if (m.time) line += m.time;
      if (m.type) line += (line ? ' ' : '') + m.type;
      if (m.place) line += (line ? ' ' : '') + m.place;
      if (line) parts.push(line);
    });
    if (formData.meetingNote) parts.push(`※${formData.meetingNote}`);
    parts.push('');
  }
  
  if (formData.useHighway && formData.highway) {
    parts.push(`※高速道路(${formData.highway})使用します`);
    if (formData.highwayNote) parts.push(`※${formData.highwayNote}`);
    parts.push('');
  }
  
  const matches = formData.matchRows.filter(m => m && (m.time || m.opponent || m['現地調整'] || m['未定']));
  if (matches.length > 0) {
    parts.push('⚽️試合日程');
    matches.forEach(m => {
      if (m['現地調整']) {
        parts.push('現地調整');
      } else if (m['未定']) {
        parts.push('未定');
      } else {
        let line = m.time || '';
        if (m.opponent) line += ` vs ${m.opponent}`;
        if (m.duration) line += ` / ${m.duration}`;
        if (m.court) line += ` / ${m.court}`;
        if (line) parts.push(line);
      }
      if (m.note) parts.push(`※${m.note}`);
    });
    parts.push('');
  }
  
  const referees = formData.refereeRows.filter(r => r && (r.time || r.opponent || r['現地調整'] || r['未定'] || r['当該']));
  if (referees.length > 0) {
    parts.push('⌚審判');
    referees.forEach(r => {
      if (r['現地調整']) {
        parts.push('現地調整');
      } else if (r['未定']) {
        parts.push('未定');
      } else if (r['当該']) {
        parts.push('当該');
      } else {
        let line = r.time || '';
        if (r.opponent) line += ` ${r.opponent}`;
        if (r.duration) line += ` / ${r.duration}`;
        if (r.court) line += ` / ${r.court}`;
        if (line) parts.push(line);
      }
      if (r.note) parts.push(`※${r.note}`);
    });
    parts.push('');
  }
  
  if (formData.staff && formData.staff.length > 0) {
    parts.push('♦️スタッフ');
    parts.push(formData.staff.join('、'));
    if (formData.staffNote) parts.push(`※${formData.staffNote}`);
    parts.push('');
  }
  
  if (formData.refereeStaff && formData.refereeStaff.length > 0) {
    parts.push('♦️審判');
    parts.push(formData.refereeStaff.join('、'));
    if (formData.refereeNote) parts.push(`※${formData.refereeNote}`);
    parts.push('');
  }
  
  if (formData.uniform) {
    parts.push('⚽ユニフォーム');
    parts.push(formData.uniform);
    if (formData.uniformNote) parts.push(`※${formData.uniformNote}`);
    parts.push('');
  }
  
  if (formData.items && formData.items.length > 0) {
    parts.push('⚽持ち物');
    parts.push(formData.items.join('、'));
    if (formData.itemsNote) parts.push(`※${formData.itemsNote}`);
    parts.push('');
  }
  
  if (formData.carpool) {
    parts.push('■配車');
    parts.push(formData.carpool);
    parts.push('');
  }
  
  parts.push('以上、よろしくお願いいたします');
  
  document.getElementById('output').textContent = parts.join('\n');
}

async function copyOutput() {
  const text = document.getElementById('output').textContent || '';
  if (!text.trim()) {
    showToast('コピーする文章がありません');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('コピーしました');
  } catch (e) {
    showToast('コピーに失敗しました');
  }
}

function saveToHistory() {
  const text = document.getElementById('output').textContent || '';
  if (!text.trim()) {
    showToast('保存する文章がありません');
    return;
  }
  const hist = loadHistory();
  hist.push({ ts: Date.now(), text });
  saveHistory(hist);
  showToast('履歴に保存しました');
}

function renderHistory() {
  const hist = loadHistory();
  const container = document.getElementById('history-content');
  container.innerHTML = '';
  
  if (!hist.length) {
    container.innerHTML = '<div class="empty-state">履歴はまだありません</div>';
    return;
  }
  
  hist.slice().reverse().forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    const dt = new Date(item.ts);
    const when = `${dt.getFullYear()}/${String(dt.getMonth()+1).padStart(2,'0')}/${String(dt.getDate()).padStart(2,'0')} ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
    
    const header = document.createElement('div');
    header.className = 'history-header';
    header.textContent = when;
    
    const text = document.createElement('div');
    text.className = 'history-text';
    text.textContent = item.text;
    
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '8px';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn primary';
    copyBtn.textContent = 'コピー';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(item.text).then(() => showToast('コピーしました'));
    };
    
    const delBtn = document.createElement('button');
    delBtn.className = 'btn';
    delBtn.textContent = '削除';
    delBtn.onclick = () => {
      if (confirm('この履歴を削除しますか?')) {
        const newHist = loadHistory().filter((_, i) => i !== (hist.length - 1 - idx));
        saveHistory(newHist);
        renderHistory();
        showToast('削除しました');
      }
    };
    
    btnRow.appendChild(copyBtn);
    btnRow.appendChild(delBtn);
    
    div.appendChild(header);
    div.appendChild(text);
    div.appendChild(btnRow);
    container.appendChild(div);
  });
}

document.getElementById('copyBtn').addEventListener('click', copyOutput);
document.getElementById('saveBtn').addEventListener('click', saveToHistory);

renderInputForm();
renderOutput();
