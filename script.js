const STORAGE_KEYS = {
    ADS: "osh_ads",
    USERS: "osh_users",
    CURRENT_USER: "osh_current_user",
    FAVORITES: "osh_favorites",
    REPORTS: "osh_reports",
    BLOCKED_USERS: "osh_blocked_users",
    CHATS: "osh_chats",
    FILTERS: "osh_saved_filters",
    SUPPORT_REQUESTS: "osh_support_requests",
    REVIEWS: "osh_reviews"
};

// ============================================================
// ГЕОГРАФИЯ: г. Ош + Ошская область (регионы и районы/сёла/мкр)
// ============================================================
const OSH_REGIONS = [
    {
        id: 'osh_city',
        name: 'г. Ош',
        districts: [
            // Центральные районы
            'Центр', 'Старый город', 'Сулейман-Тоо',
            // Микрорайоны
            'Мкр. Амир-Темур', 'Мкр. Анар', 'Мкр. Ак-Тилек', 'Мкр. Арашан',
            'Мкр. Бешик-Жон', 'Мкр. Достук', 'Мкр. Кыргызстан', 'Мкр. Он-Адыр',
            'Мкр. Папан', 'Мкр. Туран', 'Мкр. Черёмушки', 'Мкр. Юго-Восток',
            'Мкр. Фуркат', 'Мкр. Маданият', 'Мкр. Маяк', 'Мкр. Ак-Буура',
            'Мкр. Южный', 'Мкр. Северный', 'Мкр. Восточный', 'Мкр. Западный',
            '35-й микрорайон',
            // Жилмассивы / сёла в городской черте
            'ХБК', 'Жапалак', 'Тулейкен', 'Кенеш', 'Турусбеково', 'Кызыл-Кыштак',
            'Ак-Жар', 'Калинин айылы', 'Кызыл-Жар', 'Шейит-Дөбө',
            'Жаңы-Турмуш', 'Өзгүр', 'Манас айылы', 'Ак-Күч', 'Бугу-Таш',
            'Кулатов', 'Кара-Суу айылы', 'Аэропорт'
        ]
    },
    {
        id: 'alay',
        name: 'Алайский район',
        districts: [
            'Гүлчө', 'Сары-Таш', 'Сары-Могол', 'Кашка-Суу', 'Кең-Жылга',
            'Жошолу', 'Талдуу-Булак', 'Жекенди', 'Жылга', 'Кара-Мык',
            'Будалык', 'Кызыл-Эшме', 'Конур-Дөбө', 'Таш-Булак', 'Кулчу',
            'Ачык-Суу', 'Иркештам', 'Талдык', 'Ак-Босого', 'Кызыл-Шарк',
            'Арчалуу', 'Төлөйкөн', 'Кара-Кабак', 'Кара-Тейит',
            'Мырзаке', 'Айдар-Кен', 'Жаңы-Алай'
        ]
    },
    {
        id: 'aravan',
        name: 'Араванский район',
        districts: [
            'Араван', 'Кара-Тоо', 'Чек-Абад', 'Мангыт', 'Ак-Таш',
            'Нурабад', 'Таш-Булак', 'Керме-Тоо', 'Жаңы-Араван',
            'Мырза-Аке', 'Мадыкөз', 'Карабагыш', 'Жаңы-Айыл', 'Күлбала',
            'Бек-Абад', 'Шур-Абад', 'Жаңы-Жол', 'Бүргөндү', 'Төө-Моюн',
            'Жаш-Тилек', 'Кыргыз-Кыштак', 'Ак-Жар', 'Достук',
            'Шаркыратма', 'Жалпак-Таш', 'Күлбала-Сай'
        ]
    },
    {
        id: 'kara_kuldja',
        name: 'Кара-Кульджинский район',
        districts: [
            'Кара-Кульджа', 'Көлдүк', 'Эркин-Тоо', 'Кашкар-Кыштак',
            'Алай-Куу', 'Сары-Булак', 'Кара-Коо', 'Ылай-Талаа',
            'Сопу-Коргон', 'Арпалык', 'Мырза-Ата', 'Карыпсалды',
            'Кош-Булак', 'Капчыгай', 'Ылай-Саз', 'Жаңы-Жол',
            'Кылжыр', 'Каранды', 'Кара-Бак', 'Эгиз-Тал',
            'Каракулжа-Ата', 'Ак-Татыр', 'Жекенди', 'Ачы-Таш',
            'Бел-Алды', 'Чалма', 'Кара-Шоро'
        ]
    },
    {
        id: 'kara_suu',
        name: 'Кара-Суйский район',
        districts: [
            'Кара-Суу', 'Нариман', 'Мады', 'Жоош', 'Шарк', 'Папан',
            'Отуз-Адыр', 'Савай', 'Төлөйкөн', 'Катта-Талдык',
            'Кызыл-Кыштак', 'Кашкар-Кыштак', 'Мырза-Аке', 'Жийде',
            'Кызыл-Суу', 'Достук', 'Ак-Таш', 'Кызыл-Шарк',
            'Жаңы-Арык', 'Ак-Жар', 'Куршаб', 'Ак-Кыя', 'Жаңы-Жол',
            'Бейшеке', 'Ленин айылы', 'Озгор', 'Чек', 'Мады-Ордо',
            'Кулунду', 'Кара-Таш', 'Жапалак', 'Кызыл-Жар', 'Фуркат',
            'Ылайлуу-Талаа', 'Жаңы-Турмуш', 'Ак-Буура', 'Найман',
            'Кыргыз-Чек', 'Кара-Жыгач', 'Төө-Моюн', 'Төлөйкөн'
        ]
    },
    {
        id: 'nookat',
        name: 'Ноокатский район',
        districts: [
            'Ноокат', 'Эски-Ноокат', 'Жаңы-Ноокат', 'Гүлбаар',
            'Кыргыз-Ата', 'Жийде', 'Көк-Жар', 'Кулатов', 'Төөлөс',
            'Он-Экин', 'Исанов', 'Кызыл-Октябрь', 'Бүргөндү',
            'Зулпуев', 'Мырза-Аке', 'Ак-Жаңы', 'Кайрагач', 'Күлкөл',
            'Сасык-Үңкүр', 'Көк-Бел', 'Ак-Кыя', 'Ничке-Сай',
            'Мырза-Арык', 'Тон-Моюн', 'Чапаев', 'Жыйыр-Маа',
            'Он-Төрт', 'Кыргыз-Ата-Арык', 'Кум-Бел', 'Ак-Таш',
            'Ленин айылы', 'Көк-Арт', 'Кашка-Жол', 'Жаңы-Жол',
            'Аркыт', 'Жооку', 'Сары-Булак'
        ]
    },
    {
        id: 'uzgen',
        name: 'Узгенский район',
        districts: [
            'Узген', 'Мырза-Аке', 'Жазы', 'Кара-Таш', 'Заргер',
            'Көлдүк', 'Кара-Даңкы', 'Куршаб', 'Салам-Алик', 'Жийде',
            'Ден-Булак', 'Ден-Сай', 'Ылай-Талаа', 'Алтын-Булак',
            'Ак-Терек', 'Кыргыз-Кыштак', 'Улуу-Тоо', 'Көк-Жар',
            'Чанач', 'Боз-Жар', 'Мырза-Ата', 'Кызыл-Октябрь',
            'Жигуль', 'Көк-Арт', 'Көк-Таш', 'Нариман', 'Ийри-Суу',
            'Кара-Гуз', 'Жалгыз-Өрүк', 'Кашкалдак', 'Жаңы-Заман',
            'Ак-Жар', 'Жаңы-Турмуш', 'Бөрү-Тал', 'Кызыл-Тоо',
            'Чолпон', 'Жаңы-Арык'
        ]
    },
    {
        id: 'chon_alay',
        name: 'Чон-Алайский район',
        districts: [
            'Дароот-Коргон', 'Жекенди', 'Кабык', 'Кызыл-Эшме',
            'Сары-Могол', 'Жаш-Тилек', 'Кашка-Суу', 'Чак',
            'Жылуу-Суу', 'Карамык', 'Кара-Теит', 'Ачык-Алма',
            'Ылай-Суу', 'Кашкар-Көл', 'Кызыл-Алай'
        ]
    }
];

// Глобальный стейт выбранного региона/района
window.__regionDistrictFilter = { region: '', district: '' };

// Нормализация для сравнения адресов
function _normLoc(s) {
    return String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[^\wа-яңөү\s-]/gi, ' ').replace(/\s+/g, ' ').trim();
}

// ============================================================
// UPGRADE фильтров listing-страниц: segmented rooms, валюта,
// документы, context-aware поля участков/коммерции
// ============================================================
const DOCUMENT_TYPES = [
    { value: '', label: 'Любые' },
    { value: 'red_book', label: 'Красная книга' },
    { value: 'tech_passport', label: 'Техпаспорт' },
    { value: 'dkp', label: 'ДКП' }
];

const LAND_PURPOSES = [
    { value: '', label: 'Любое' },
    { value: 'residential', label: 'ИЖС (жилое)' },
    { value: 'agricultural', label: 'С/х назначение' },
    { value: 'garden', label: 'Садовый участок' },
    { value: 'commercial', label: 'Коммерческое' },
    { value: 'industrial', label: 'Промышленное' }
];

const UTILITIES_OPTIONS = [
    { value: '', label: 'Любые' },
    { value: 'water', label: 'Вода' },
    { value: 'electricity', label: 'Электричество' },
    { value: 'gas', label: 'Газ' },
    { value: 'sewage', label: 'Канализация' },
    { value: 'all', label: 'Все коммуникации' }
];

const COMMERCE_TYPES = [
    { value: '', label: 'Любой' },
    { value: 'office', label: 'Офис' },
    { value: 'shop', label: 'Магазин' },
    { value: 'warehouse', label: 'Склад' },
    { value: 'restaurant', label: 'Кафе/ресторан' },
    { value: 'salon', label: 'Салон/услуги' },
    { value: 'production', label: 'Производство' }
];

// Глобальное состояние валюты фильтра цены (UI-only)
window.__priceCurrency = localStorage.getItem('osh_price_currency') || 'KGS';

function upgradeListingFilters() {
    const page = document.body?.getAttribute('data-page');
    if (!['sale', 'rent', 'land', 'commerce'].includes(page)) return;
    const grid = document.querySelector('.fbar-grid');
    if (!grid || grid.dataset.upgraded === '1') return;
    grid.dataset.upgraded = '1';

    // --- 1. Segmented control для комнат (sale/rent) ---
    const roomsSelect = document.getElementById('roomsFilter');
    if (roomsSelect) {
        const wrap = roomsSelect.closest('.fbar-field');
        if (wrap) {
            wrap.id = 'roomsSegField';
            const currentVal = roomsSelect.value || '';
            roomsSelect.style.display = 'none';
            // Удалим возможную существующую segmented-группу
            wrap.querySelector('.fbar-segmented')?.remove();
            const seg = document.createElement('div');
            seg.className = 'fbar-segmented';
            seg.setAttribute('role', 'group');
            const opts = [
                { v: '', t: 'Любое' },
                { v: '1', t: '1' },
                { v: '2', t: '2' },
                { v: '3', t: '3' },
                { v: '4+', t: '4+' }
            ];
            seg.innerHTML = opts.map(o =>
                `<button type="button" class="fbar-seg-btn ${o.v === currentVal ? 'active' : ''}" data-val="${o.v}">${o.t}</button>`
            ).join('');
            seg.addEventListener('click', (e) => {
                const btn = e.target.closest('.fbar-seg-btn');
                if (!btn) return;
                seg.querySelectorAll('.fbar-seg-btn').forEach(b => b.classList.toggle('active', b === btn));
                roomsSelect.value = btn.dataset.val;
                roomsSelect.dispatchEvent(new Event('input', { bubbles: true }));
                roomsSelect.dispatchEvent(new Event('change', { bubbles: true }));
            });
            wrap.appendChild(seg);
        }
    }

    // --- 2. Переключатель валюты KGS/USD рядом с ценой ---
    const priceField = grid.querySelector('.fbar-field--wide') ||
                       Array.from(grid.querySelectorAll('.fbar-field')).find(f => f.querySelector('#priceMin, #minPriceFilter'));
    if (priceField && !priceField.querySelector('.fbar-currency-toggle')) {
        const label = priceField.querySelector('.fbar-label');
        if (label) {
            const cur = window.__priceCurrency;
            const toggle = document.createElement('div');
            toggle.className = 'fbar-currency-toggle';
            toggle.innerHTML = `
                <button type="button" class="fbar-cur-btn ${cur === 'KGS' ? 'active' : ''}" data-cur="KGS">сом</button>
                <button type="button" class="fbar-cur-btn ${cur === 'USD' ? 'active' : ''}" data-cur="USD">$</button>
            `;
            toggle.addEventListener('click', (e) => {
                const b = e.target.closest('.fbar-cur-btn');
                if (!b) return;
                const newCur = b.dataset.cur;
                window.__priceCurrency = newCur;
                localStorage.setItem('osh_price_currency', newCur);
                toggle.querySelectorAll('.fbar-cur-btn').forEach(x => x.classList.toggle('active', x === b));
                updateCurrencyUI();
            });
            // Обернуть label + toggle в flex
            const wrap = document.createElement('div');
            wrap.className = 'fbar-label-row';
            label.after(wrap);
            wrap.appendChild(label);
            wrap.appendChild(toggle);
        }
    }

    // --- 3. Фильтр "Документы" ---
    if (!document.getElementById('documentsFilter')) {
        const field = document.createElement('div');
        field.className = 'fbar-field';
        field.id = 'documentsField';
        field.innerHTML = `
            <label class="fbar-label">Документы</label>
            <select id="documentsFilter" class="fbar-select">
                ${DOCUMENT_TYPES.map(d => `<option value="${d.value}">${d.label}</option>`).join('')}
            </select>
        `;
        grid.appendChild(field);
    }

    // --- 4. Land-specific поля (назначение + коммуникации) ---
    if (!document.getElementById('landPurposeFilter')) {
        const lpField = document.createElement('div');
        lpField.className = 'fbar-field fbar-land-only';
        lpField.id = 'landPurposeField';
        lpField.innerHTML = `
            <label class="fbar-label">Назначение земли</label>
            <select id="landPurposeFilter" class="fbar-select">
                ${LAND_PURPOSES.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
            </select>
        `;
        grid.appendChild(lpField);

        const utField = document.createElement('div');
        utField.className = 'fbar-field fbar-land-only';
        utField.id = 'utilitiesField';
        utField.innerHTML = `
            <label class="fbar-label">Коммуникации</label>
            <select id="utilitiesFilter" class="fbar-select">
                ${UTILITIES_OPTIONS.map(u => `<option value="${u.value}">${u.label}</option>`).join('')}
            </select>
        `;
        grid.appendChild(utField);
    }

    // --- 5. Commerce-specific: тип коммерции ---
    if (!document.getElementById('commerceTypeFilter')) {
        const ctField = document.createElement('div');
        ctField.className = 'fbar-field fbar-commerce-only';
        ctField.id = 'commerceTypeField';
        ctField.innerHTML = `
            <label class="fbar-label">Тип коммерции</label>
            <select id="commerceTypeFilter" class="fbar-select">
                ${COMMERCE_TYPES.map(c => `<option value="${c.value}">${c.label}</option>`).join('')}
            </select>
        `;
        grid.appendChild(ctField);
    }

    // --- 6. Контекстная видимость + реакция на смену категории ---
    applyContextVisibility();
    const catSel = document.getElementById('categorySelect') || document.getElementById('categoryFilter');
    catSel?.addEventListener('change', applyContextVisibility);

    // --- 7. Подписка новых полей на применение фильтра ---
    ['documentsFilter', 'landPurposeFilter', 'utilitiesFilter', 'commerceTypeFilter']
        .forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', () => {
                if (typeof window.__applyListingFilter === 'function') window.__applyListingFilter();
                else if (typeof applyFilters === 'function') applyFilters();
            });
        });

    updateCurrencyUI();
}

// Обновить placeholder/символы в зависимости от валюты
function updateCurrencyUI() {
    const cur = window.__priceCurrency || 'KGS';
    const sym = cur === 'USD' ? '$' : 'сом';
    // Обновить label цены
    document.querySelectorAll('.fbar-field--wide .fbar-label, .fbar-field .fbar-label').forEach(l => {
        const t = l.textContent || '';
        if (/^цена/i.test(t.trim())) {
            l.textContent = t.replace(/\((сом|\$|USD|KGS)\)/i, '').trim()
                            .replace(/цена.*$/i, `Цена (${sym})`)
                            || `Цена (${sym})`;
        }
    });
    // Обновить плейсхолдеры
    document.querySelectorAll('#priceMin, #minPriceFilter').forEach(el => { el.dataset.currency = cur; el.placeholder = `от, ${sym}`; });
    document.querySelectorAll('#priceMax, #maxPriceFilter').forEach(el => { el.dataset.currency = cur; el.placeholder = `до, ${sym}`; });
}

// Context-aware видимость полей по категории / типу страницы
function applyContextVisibility() {
    const page = document.body?.getAttribute('data-page');
    const catSel = document.getElementById('categorySelect') || document.getElementById('categoryFilter');
    const cat = (catSel?.value || '').toLowerCase();

    const isLandPage = page === 'land';
    const isCommercePage = page === 'commerce';
    const isLandCat = cat === 'land' || isLandPage;
    const isCommerceCat = cat === 'commerce' || isCommercePage;
    const isResidential = !isLandCat && !isCommercePage && (cat === 'flat' || cat === 'house' || cat === '' || cat === 'all' || page === 'sale' || page === 'rent');

    const toggle = (el, show) => { if (el) el.style.display = show ? '' : 'none'; };

    toggle(document.getElementById('roomsSegField'), isResidential && !isLandCat);
    const furnField = document.getElementById('furnitureFilter')?.closest('.fbar-field');
    toggle(furnField, isResidential && !isLandCat);

    document.querySelectorAll('.fbar-land-only').forEach(el => {
        el.style.display = isLandCat ? '' : 'none';
    });
    document.querySelectorAll('.fbar-commerce-only').forEach(el => {
        el.style.display = isCommerceCat ? '' : 'none';
    });
}

// Инициализация модалки "Регион/район" (лалафо-стиль)
function initRegionFilterUI() {
    const select = document.getElementById('districtFilter');
    if (!select || select.dataset.rdUpgraded === '1') return;
    select.dataset.rdUpgraded = '1';
    select.style.display = 'none';

    // Кнопка-триггер
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'regionFilterBtn';
    btn.className = 'fbar-select region-filter-btn';
    btn.style.cssText = 'cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;justify-content:space-between;';
    btn.innerHTML = '<span class="rf-btn-label"><i class="fas fa-map-marker-alt" style="color:#ff6b35;margin-right:6px;"></i>Все регионы</span><i class="fas fa-chevron-down" style="opacity:.6;"></i>';
    btn.addEventListener('click', openRegionModal);
    select.parentElement.appendChild(btn);

    // Модалка (один раз на страницу)
    if (!document.getElementById('regionModal')) buildRegionModal();

    // Восстановление из URL / сохранённого фильтра
    const sp = new URLSearchParams(window.location.search);
    const savedRegion = sp.get('region') || '';
    const savedDistrict = sp.get('district') || '';
    if (savedRegion || savedDistrict) {
        setRegionDistrict(savedRegion, savedDistrict, false);
    }
}

function buildRegionModal() {
    const modal = document.createElement('div');
    modal.id = 'regionModal';
    modal.className = 'rd-modal';
    modal.innerHTML = `
        <div class="rd-modal-backdrop"></div>
        <div class="rd-modal-box">
            <div class="rd-modal-head">
                <h3><i class="fas fa-map-marker-alt"></i> Выберите регион и район</h3>
                <button class="rd-close" type="button" aria-label="Закрыть">&times;</button>
            </div>
            <div class="rd-modal-body">
                <div class="rd-col rd-regions">
                    <div class="rd-col-title">Регионы</div>
                    <div class="rd-search"><input type="text" id="rdRegionSearch" placeholder="Поиск региона..."></div>
                    <div class="rd-list" id="rdRegionsList"></div>
                </div>
                <div class="rd-col rd-districts">
                    <div class="rd-col-title">Районы / сёла / мкр</div>
                    <div class="rd-search"><input type="text" id="rdDistrictSearch" placeholder="Поиск места..."></div>
                    <div class="rd-list" id="rdDistrictsList">
                        <div class="rd-empty">Сначала выберите регион слева</div>
                    </div>
                </div>
            </div>
            <div class="rd-modal-foot">
                <button type="button" class="rd-btn-reset">Сбросить</button>
                <button type="button" class="rd-btn-apply">Применить</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    const regionsList = modal.querySelector('#rdRegionsList');
    const regionSearchInput = modal.querySelector('#rdRegionSearch');
    const districtSearchInput = modal.querySelector('#rdDistrictSearch');

    let tempRegion = window.__regionDistrictFilter.region || '';
    let tempDistrict = window.__regionDistrictFilter.district || '';

    const renderRegions = () => {
        const q = _normLoc(regionSearchInput?.value || '');
        const filtered = OSH_REGIONS.filter(r => !q || _normLoc(r.name).includes(q));
        regionsList.innerHTML = (!q ? `<div class="rd-item rd-item-all ${!tempRegion ? 'active' : ''}" data-region="">Все регионы</div>` : '') +
            filtered.map(r => `<div class="rd-item ${tempRegion === r.name ? 'active' : ''}" data-region="${r.name}">${r.name}</div>`).join('');
        if (!filtered.length && q) regionsList.innerHTML = '<div class="rd-empty">Ничего не найдено</div>';
    };

    const renderDistricts = () => {
        const listEl = modal.querySelector('#rdDistrictsList');
        if (!tempRegion) {
            listEl.innerHTML = `<div class="rd-empty">Сначала выберите регион слева</div>`;
            return;
        }
        const region = OSH_REGIONS.find(r => r.name === tempRegion);
        if (!region) { listEl.innerHTML = ''; return; }
        const q = _normLoc(districtSearchInput?.value || '');
        const filtered = region.districts.filter(d => !q || _normLoc(d).includes(q));
        listEl.innerHTML = (!q ? `<div class="rd-item rd-item-all ${!tempDistrict ? 'active' : ''}" data-district="">Весь ${region.name}</div>` : '') +
            filtered.map(d => `<div class="rd-item ${tempDistrict === d ? 'active' : ''}" data-district="${d}">${d}</div>`).join('');
        if (!filtered.length && q) listEl.innerHTML = '<div class="rd-empty">Ничего не найдено</div>';
    };

    renderRegions();
    regionSearchInput?.addEventListener('input', renderRegions);
    districtSearchInput?.addEventListener('input', renderDistricts);

    regionsList.addEventListener('click', (e) => {
        const item = e.target.closest('.rd-item');
        if (!item) return;
        tempRegion = item.dataset.region || '';
        tempDistrict = '';
        regionsList.querySelectorAll('.rd-item').forEach(el => el.classList.toggle('active', el === item));
        renderDistricts();
    });

    modal.querySelector('#rdDistrictsList').addEventListener('click', (e) => {
        const item = e.target.closest('.rd-item');
        if (!item) return;
        tempDistrict = item.dataset.district || '';
        item.parentElement.querySelectorAll('.rd-item').forEach(el => el.classList.toggle('active', el === item));
    });

    modal.querySelector('.rd-close').addEventListener('click', closeRegionModal);
    modal.querySelector('.rd-modal-backdrop').addEventListener('click', closeRegionModal);
    modal._applyHandler = (r, d) => setRegionDistrict(r, d, true);
    modal.querySelector('.rd-btn-reset').addEventListener('click', () => {
        tempRegion = ''; tempDistrict = '';
        modal._applyHandler('', '');
        closeRegionModal();
    });
    modal.querySelector('.rd-btn-apply').addEventListener('click', () => {
        modal._applyHandler(tempRegion, tempDistrict);
        closeRegionModal();
    });
    // Экспонируем установку временного состояния извне
    modal._setTemp = (r, d) => { tempRegion = r || ''; tempDistrict = d || ''; };

    // Экспонируем для пересинхронизации при открытии
    modal._syncFromState = (override) => {
        const src = override || window.__regionDistrictFilter;
        tempRegion = src.region || '';
        tempDistrict = src.district || '';
        if (regionSearchInput) regionSearchInput.value = '';
        if (districtSearchInput) districtSearchInput.value = '';
        renderRegions();
        renderDistricts();
    };
}

function openRegionModal(opts) {
    const modal = document.getElementById('regionModal') || (buildRegionModal(), document.getElementById('regionModal'));
    if (!modal) return;
    // Восстановить дефолтный обработчик или заменить
    if (opts && typeof opts.onApply === 'function') {
        modal._applyHandler = opts.onApply;
    } else {
        modal._applyHandler = (r, d) => setRegionDistrict(r, d, true);
    }
    const initial = opts?.initial || null;
    if (typeof modal._syncFromState === 'function') modal._syncFromState(initial);
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
}

function closeRegionModal() {
    const modal = document.getElementById('regionModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
}

function setRegionDistrict(region, district, triggerApply) {
    window.__regionDistrictFilter = { region: region || '', district: district || '' };
    // Обновить кнопку
    const btn = document.getElementById('regionFilterBtn');
    if (btn) {
        const labelEl = btn.querySelector('.rf-btn-label');
        let text = 'Все регионы';
        if (region && district) text = `${district}, ${region}`;
        else if (region) text = region;
        if (labelEl) labelEl.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#ff6b35;margin-right:6px;"></i>${text}`;
    }
    // Сохранить в URL
    try {
        const url = new URL(window.location.href);
        if (region) url.searchParams.set('region', region); else url.searchParams.delete('region');
        if (district) url.searchParams.set('district', district); else url.searchParams.delete('district');
        history.replaceState({}, '', url.toString());
    } catch (e) {}
    // Триггер применения
    if (triggerApply) {
        if (typeof window.__applyListingFilter === 'function') window.__applyListingFilter();
        else if (typeof applyFilters === 'function') applyFilters();
    }
}

// Совпадает ли адрес объявления с выбранным регионом/районом
function adMatchesRegionDistrict(ad) {
    const sel = window.__regionDistrictFilter || {};
    if (!sel.region && !sel.district) return true;
    const addr = _normLoc(ad.address);
    if (sel.district) {
        return addr.includes(_normLoc(sel.district));
    }
    const region = OSH_REGIONS.find(r => r.name === sel.region);
    if (!region) return addr.includes(_normLoc(sel.region));
    if (addr.includes(_normLoc(sel.region))) return true;
    // Для г. Ош сопоставляем также по "ош"
    if (region.id === 'osh_city' && /\bош\b/.test(addr)) return true;
    return region.districts.some(d => addr.includes(_normLoc(d)));
}

const firebaseConfig = {
    apiKey: "AIzaSyAjrfHv7FAIMrRFUYOYYzGghgSyc5TARr8",
    authDomain: "oshestate-23796.firebaseapp.com",
    projectId: "oshestate-23796",
    storageBucket: "oshestate-23796.firebasestorage.app",
    messagingSenderId: "195522528887",
    appId: "1:195522528887:web:ceeb87b96869571dfea872",
    measurementId: "G-1E3YF3PTB1"
};

function getFirebaseServices() {
    if (!window.firebase) {
        return null;
    }
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    return {
        auth: firebase.auth(),
        db: firebase.firestore()
    };
}

async function upsertLocalUserProfile(profile) {
    const users = storage.getUsers();
    const idx = users.findIndex((u) => u.id === profile.id);
    if (idx >= 0) {
        users[idx] = { ...users[idx], ...profile };
    } else {
        users.push(profile);
    }
    storage.setUsers(users);
}

async function syncCurrentUserFromFirebase() {
    const services = getFirebaseServices();
    if (!services) {
        return;
    }

    const { auth, db } = services;

    // auth.currentUser is always null synchronously on page load — Firebase restores
    // the session asynchronously. We must wait for onAuthStateChanged to resolve.
    return new Promise((resolve) => {
        const unsub = auth.onAuthStateChanged(async (fbUser) => {
            unsub(); // unsubscribe after first callback
            if (!fbUser) {
                storage.clearCurrentUser();
                resolve();
                return;
            }
            if (!fbUser.emailVerified) {
                storage.clearCurrentUser();
                resolve();
                return;
            }

            try {
                const snap = await db.collection("users").doc(fbUser.uid).get();
                const data = snap.exists ? snap.data() : {};
                const profile = {
                    id: fbUser.uid,
                    name: data?.name || fbUser.displayName || "Пользователь",
                    email: fbUser.email || "",
                    phone: data?.phone || "",
                    verified: true
                };
                await upsertLocalUserProfile(profile);
                storage.setCurrentUser(profile);
            } catch (e) {
                storage.setCurrentUser({
                    id: fbUser.uid,
                    name: fbUser.displayName || "Пользователь",
                    email: fbUser.email || "",
                    phone: "",
                    verified: fbUser.emailVerified
                });
            }
            resolve();
        });
    });
}

const ANTI_SPAM = {
    MAX_PENDING_PER_USER: 3,
    MAX_DAILY_POSTS: 5,
    MIN_INTERVAL_MS: 2 * 60 * 1000,
    DUPLICATE_WINDOW_MS: 12 * 60 * 60 * 1000
};

const storage = {
    getAds() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADS) || "[]"); },
    setAds(ads) { localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads)); },
    getUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]"); },
    setUsers(users) { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); },
    getCurrentUser() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || "null"); },
    setCurrentUser(user) { localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user)); },
    clearCurrentUser() { localStorage.removeItem(STORAGE_KEYS.CURRENT_USER); },
    getFavorites() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || "[]"); },
    setFavorites(favs) { localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs)); },
    getReports() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || "[]"); },
    setReports(reports) { localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports)); },
    getBlockedUsers() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.BLOCKED_USERS) || "[]"); },
    setBlockedUsers(ids) { localStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(ids)); },
    getChats() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS) || "[]"); },
    setChats(chats) { localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats)); },
    getFilters() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.FILTERS) || "{}"); },
    setFilters(map) { localStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(map)); },
    getSupportRequests() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPPORT_REQUESTS) || "[]"); },
    setSupportRequests(items) { localStorage.setItem(STORAGE_KEYS.SUPPORT_REQUESTS, JSON.stringify(items)); },
    getReviews() { return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || "[]"); },
    setReviews(reviews) { localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews)); }
};

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) {
        return;
    }
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        margin-bottom: 10px;
        padding: 12px 16px;
        border-radius: 10px;
        color: #fff;
        font-weight: 600;
        box-shadow: 0 8px 20px rgba(0,0,0,.15);
        background: ${type === "error" ? "#e74c3c" : type === "success" ? "#27ae60" : "#34495e"};
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 2800);
}

function setButtonLoading(button, isLoading, loadingText = "Загрузка...") {
    if (!button) return;
    if (isLoading) {
        button.dataset.originalText = button.textContent;
        button.textContent = loadingText;
        button.disabled = true;
        button.style.opacity = "0.7";
    } else {
        button.textContent = button.dataset.originalText || button.textContent;
        button.disabled = false;
        button.style.opacity = "1";
    }
}

function mountLayout() {
    const navList = document.getElementById("nav-links-container");
    if (navList) {
        const currentUser = storage.getCurrentUser();
        if (currentUser) {
            navList.innerHTML = `
                <li><a href="index.html">Главная</a></li>
                <li><a href="buy.html">Купить</a></li>
                <li><a href="rent.html">Снять</a></li>
                <li><a href="land.html">Участки</a></li>
                <li><a href="commerce.html">Коммерция</a></li>
                <li><a href="chat.html" class="chat-nav-link">
                    <i class="fas fa-comments"></i> Сообщения
                    <span class="unread-badge" id="unreadBadge" style="display: none;">0</span>
                </a></li>
                <li><a href="favorites.html">Избранное</a></li>
                <li><a href="profile.html">Профиль</a></li>
                <li><a href="#" id="logout-link" class="btn-login">Выйти</a></li>
            `;
        } else {
            navList.innerHTML = `
                <li><a href="index.html">Главная</a></li>
                <li><a href="buy.html">Купить</a></li>
                <li><a href="rent.html">Снять</a></li>
                <li><a href="land.html">Участки</a></li>
                <li><a href="commerce.html">Коммерция</a></li>
                <li><a href="register.html" class="btn-login">Регистрация</a></li>
            `;
        }
    }
    const hasFooter = document.querySelector("footer");
    if (!hasFooter) {
        const footer = document.createElement("footer");
        footer.innerHTML = `
            <div class="container footer-content">
                <div class="footer-col">
                    <h3>OshEstate</h3>
                    <p>Платформа объявлений недвижимости в Оше.</p>
                </div>
                <div class="footer-col">
                    <h4>Клиентам</h4>
                    <ul class="footer-links-list">
                        <li><a href="buy.html">Купить</a></li>
                        <li><a href="rent.html">Снять</a></li>
                        <li><a href="add.html">Подать объявление</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h4>Контакты</h4>
                    <p>+996 555 00 00 00</p>
                    <p>support@oshestate.kg</p>
                </div>
                <div class="footer-bottom">&copy; 2026 OshEstate</div>
            </div>`;
        document.body.appendChild(footer);
    }

    if (!document.getElementById("menuOverlay")) {
        const overlay = document.createElement("div");
        overlay.id = "menuOverlay";
        overlay.className = "menu-overlay";
        document.body.appendChild(overlay);
    }

    const isAuthPage = document.body?.classList.contains('auth-page');
    if (!isAuthPage && !document.getElementById("mobileBottomNav")) {
        const page = document.body?.getAttribute("data-page") || "";
        const path = window.location.pathname;
        const isHome = path.endsWith("index.html") || path.endsWith("/") || page === "home";
        const isSearch = ["buy","rent","land","commerce"].includes(page);
        const isChat = page === "chat";
        const isProfile = page === "profile";
        const currentUser = storage.getCurrentUser();
        const nav = document.createElement("nav");
        nav.id = "mobileBottomNav";
        nav.className = "mobile-bottom-nav";
        nav.innerHTML = `
            <a href="index.html" class="mob-nav-item${isHome ? " active" : ""}">
                <i class="fas fa-home"></i><span>Главная</span>
            </a>
            <a href="buy.html" class="mob-nav-item${isSearch ? " active" : ""}">
                <i class="fas fa-search"></i><span>Поиск</span>
            </a>
            <a href="add.html" class="mob-nav-add">
                <div class="mob-nav-add-circle"><i class="fas fa-plus"></i></div>
                <span>Подать</span>
            </a>
            <a href="${currentUser ? "chat.html" : "login.html"}" class="mob-nav-item${isChat ? " active" : ""}" style="position:relative">
                <i class="fas fa-comments"></i>
                <span id="mobNavUnread" style="display:none;position:absolute;top:4px;right:12px;background:#e74c3c;color:#fff;font-size:0.55rem;padding:1px 4px;border-radius:8px;font-weight:700;">0</span>
                <span>Чаты</span>
            </a>
            <a href="${currentUser ? "profile.html" : "login.html"}" class="mob-nav-item${isProfile ? " active" : ""}">
                <i class="fas fa-user"></i><span>Профиль</span>
            </a>
        `;
        document.body.appendChild(nav);
    }

    if (isAuthPage) {
        document.body.style.overflowX = 'hidden';
        const aw = document.querySelector('.auth-wrapper');
        if (aw) aw.style.overflow = 'visible';
    }
}

function clearFieldErrors(form) {
    form?.querySelectorAll(".field-error").forEach((el) => el.remove());
    form?.querySelectorAll(".input-error").forEach((el) => el.classList.remove("input-error"));
}

function setFieldError(input, message) {
    if (!input) return;
    input.classList.add("input-error");
    const old = input.parentElement?.querySelector(".field-error");
    if (old) old.remove();
    const err = document.createElement("small");
    err.className = "field-error";
    err.textContent = message;
    input.parentElement?.appendChild(err);
}

function formatPrice(price) {
    return `${new Intl.NumberFormat("ru-RU").format(Number(price || 0))} сом`;
}

function getMainImage(ad) {
    return ad?.images?.[0] || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80";
}

function getCatName(category) {
    const map = { flat: "Квартира", house: "Дом", land: "Участок", commerce: "Коммерция" };
    return map[category] || "Недвижимость";
}

function getPriorityScore(ad) {
    let base = 0;
    if (ad.vip) base = 80;
    else if (ad.paidPlacement) base = 40;
    else if (ad.urgent) base = 15;
    if (ad.boostedUntil && new Date(ad.boostedUntil).getTime() > Date.now()) base += 50;
    const ageHours = (Date.now() - new Date(ad.date || ad.createdAt || 0).getTime()) / 3600000;
    return base - ageHours * 0.5;
}

async function syncAdsFromFirestore() {
    const services = getFirebaseServices();
    if (!services) return;
    const { db } = services;

    try {
        const snap = await db.collection('ads').get();
        const ads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (ads.length > 0) {
            storage.setAds(ads);
        }
    } catch (e) {
    }
}

async function createAdInFirestore(ad) {
    const services = getFirebaseServices();
    if (!services) throw new Error('firebase-not-initialized');
    const { auth, db } = services;
    const user = auth.currentUser;
    if (!user) {
        const err = new Error('not-authenticated');
        err.code = 'not-authenticated';
        throw err;
    }
    const ref = await db.collection('ads').add({
        ...ad,
        authorUid: user.uid,
        createdAt: new Date().toISOString()
    });
    return ref.id;
}

function seedAdsIfEmpty() {
    const ads = storage.getAds();
    if (ads.length > 0) return;
    const demoAds = [
        { id: "a1", type: "sale", category: "flat", address: "Ош, мкр. Анар, 15", price: 5200000, area: 68, rooms: 3, description: "Светлая квартира с ремонтом.", status: "active", date: new Date().toISOString(), images: [], views: 42, authorId: null, authorName: "Администратор", phone: "+996555000111", paidPlacement: true, featuredOnHome: true },
        { id: "a2", type: "sale", category: "house", address: "Ош, ул. Масалиева, 101", price: 8900000, area: 145, rooms: 5, description: "Дом с участком и навесом.", status: "active", date: new Date().toISOString(), images: [], views: 16, authorId: null, authorName: "Администратор", phone: "+996555000222", paidPlacement: false, featuredOnHome: false },
        { id: "a3", type: "rent", category: "flat", address: "Ош, ул. Курманжан Датка, 9", price: 28000, area: 42, rooms: 2, description: "Уютная квартира на длительный срок.", status: "active", date: new Date().toISOString(), images: [], views: 20, authorId: null, authorName: "Администратор", phone: "+996555000333", paidPlacement: true, featuredOnHome: true },
        { id: "a4", type: "land", category: "land", address: "Ош, район Ак-Буура", price: 1400000, area: 600, rooms: 0, description: "Участок под строительство.", status: "active", date: new Date().toISOString(), images: [], views: 11, authorId: null, authorName: "Администратор", phone: "+996555000444", paidPlacement: false, featuredOnHome: false },
        { id: "a5", type: "sale", category: "commerce", address: "Ош, пр. Ленина, 33", price: 7600000, area: 120, rooms: 0, description: "Коммерческое помещение под офис.", status: "active", date: new Date().toISOString(), images: [], views: 8, authorId: null, authorName: "Администратор", phone: "+996555000555", paidPlacement: false, featuredOnHome: false }
    ];
    storage.setAds(demoAds);
}

function normalizeText(text) {
    return String(text || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function canSubmitAd(user, draft) {
    const ads = storage.getAds();
    const now = Date.now();
    const myAds = ads.filter((ad) => ad.authorId === user.id);
    const myPending = myAds.filter((ad) => ad.status === "pending").length;
    if (myPending >= ANTI_SPAM.MAX_PENDING_PER_USER) {
        return { ok: false, message: "Слишком много объявлений на проверке. Дождитесь модерации." };
    }

    const dayAgo = now - 24 * 60 * 60 * 1000;
    const todayPosts = myAds.filter((ad) => new Date(ad.date).getTime() >= dayAgo).length;
    if (todayPosts >= ANTI_SPAM.MAX_DAILY_POSTS) {
        return { ok: false, message: "Лимит публикаций на сутки исчерпан." };
    }

    const lastPost = myAds.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    if (lastPost && now - new Date(lastPost.date).getTime() < ANTI_SPAM.MIN_INTERVAL_MS) {
        return { ok: false, message: "Слишком частые публикации. Попробуйте чуть позже." };
    }

    const dupWindow = now - ANTI_SPAM.DUPLICATE_WINDOW_MS;
    const duplicate = myAds.find((ad) =>
        new Date(ad.date).getTime() >= dupWindow &&
        normalizeText(ad.address) === normalizeText(draft.address) &&
        Number(ad.price) === Number(draft.price) &&
        ad.category === draft.category
    );
    if (duplicate) {
        return { ok: false, message: "Похожее объявление уже отправлено. Измените данные." };
    }

    return { ok: true };
}

function normalizePhone(phoneRaw) {
    const digits = phoneRaw.replace(/\D/g, "");
    if (digits.length === 10 && digits.startsWith("0")) {
        return `+996${digits.slice(1)}`;
    }
    if (digits.length === 12 && digits.startsWith("996")) {
        return `+${digits}`;
    }
    if (digits.length === 9) {
        return `+996${digits}`;
    }
    return null;
}

function validatePassword(pass) {
    return typeof pass === "string" && pass.length >= 6;
}

function updateAuthNav() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return;
    const logoutLink = document.getElementById("logout-link");
    logoutLink?.addEventListener("click", (event) => {
        event.preventDefault();
        const services = getFirebaseServices();
        const finalizeLogout = () => {
            storage.clearCurrentUser();
            showToast("Вы вышли из аккаунта", "success");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 500);
        };
        if (!services) {
            finalizeLogout();
            return;
        }
        services.auth.signOut().then(finalizeLogout).catch(finalizeLogout);
    });
}

function initMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.getElementById("nav-links-container");
    const overlay = document.getElementById("menuOverlay");
    if (!menuToggle || !navLinks) return;

    const openMenu = () => {
        navLinks.classList.add("mobile-active");
        overlay?.classList.add("active");
        menuToggle.innerHTML = '<i class="fas fa-times"></i>';
    };
    const closeMenu = () => {
        navLinks.classList.remove("mobile-active");
        overlay?.classList.remove("active");
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    };

    menuToggle.addEventListener("click", () => {
        navLinks.classList.contains("mobile-active") ? closeMenu() : openMenu();
    });
    overlay?.addEventListener("click", closeMenu);
    navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
}

function createListingCard(ad) {
    const favs = storage.getFavorites();
    const isFav = favs.includes(ad.id);
    const cardCls = ad.vip ? "listing-card vip-card" : ad.paidPlacement ? "listing-card featured-card" : "listing-card";
    return `
        <article class="${cardCls}">
            ${ad.vip ? `<div class="vip-strip"><i class="fas fa-gem"></i> VIP</div>` : ad.paidPlacement ? `<div class="featured-strip"><i class="fas fa-star"></i> Топ</div>` : ""}
            <div class="card-image">
                <img src="${getMainImage(ad)}" alt="${ad.address}" loading="lazy" decoding="async">
                <span class="badge ${ad.type === "rent" ? "rent" : "sale"}">${ad.type === "rent" ? "Аренда" : "Продажа"}</span>
                ${ad.vip ? `<span class="badge badge-vip">💎 VIP</span>` : ""}
                ${!ad.vip && ad.paidPlacement ? `<span class="badge badge-featured">⭐ Топ</span>` : ""}
                ${ad.urgent && !ad.vip ? `<span class="badge urgent">Срочно</span>` : ""}
                <button class="card-fav-btn ${isFav ? "active" : ""}" data-fav-id="${ad.id}">
                    <i class="${isFav ? "fas" : "far"} fa-heart"></i>
                </button>
            </div>
            <div class="card-details">
                <div class="price">${formatPrice(ad.price)}</div>
                <h3 class="card-title">${getCatName(ad.category)}</h3>
                <p class="card-address"><i class="fas fa-map-marker-alt"></i>${ad.address}</p>
                <a href="details.html?id=${ad.id}" class="btn-submit" style="margin-top:auto;text-align:center;">Подробнее</a>
            </div>
        </article>
    `;
}

function bindFavoriteButtons(root = document) {
    root.querySelectorAll("[data-fav-id]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const user = storage.getCurrentUser();
            if (!user) {
                showToast("Сначала войдите в аккаунт", "error");
                return;
            }
            const id = btn.getAttribute("data-fav-id");
            const favs = storage.getFavorites();
            const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
            storage.setFavorites(next);
            btn.classList.toggle("active");
            const icon = btn.querySelector("i");
            if (icon) icon.className = `${next.includes(id) ? "fas" : "far"} fa-heart`;
        });
    });
}

function heroSearchGo() {
    const q = document.getElementById('heroSearch')?.value.trim();
    const url = q ? `buy.html?q=${encodeURIComponent(q)}` : 'buy.html';
    window.location.href = url;
}

const SEARCH_SUGGESTIONS = [
    { label: '📍 Центр', value: 'Центр', type: 'район' },
    { label: '📍 Масса', value: 'Масса', type: 'район' },
    { label: '📍 Кенеш', value: 'Кенеш', type: 'район' },
    { label: '📍 Тунгуч', value: 'Тунгуч', type: 'район' },
    { label: '📍 Жибек Жолу', value: 'Жибек Жолу', type: 'район' },
    { label: '📍 Батыра', value: 'Батыра', type: 'район' },
    { label: '📍 Курманжан Датка', value: 'Курманжан Датка', type: 'район' },
    { label: '📍 Площадь Ленина', value: 'Площадь Ленина', type: 'район' },
    { label: '📍 Шахристан', value: 'Шахристан', type: 'район' },
    { label: '📍 Нариман', value: 'Нариман', type: 'район' },
    { label: '📍 Ак-Босого', value: 'Ак-Босого', type: 'район' },
    { label: '📍 Достук', value: 'Достук', type: 'район' },
    { label: '📍 Мирный', value: 'Мирный', type: 'район' },
    { label: '📍 Черемушки', value: 'Черемушки', type: 'район' },
    { label: '📍 Фуркат', value: 'Фуркат', type: 'район' },
    { label: '📍 Пахтаабад', value: 'Пахтаабад', type: 'район' },
    { label: '📍 Ташкентский', value: 'Ташкентский', type: 'район' },
    { label: '📍 4-й микрорайон', value: '4 микрорайон', type: 'мкр' },
    { label: '📍 5-й микрорайон', value: '5 микрорайон', type: 'мкр' },
    { label: '📍 14-й микрорайон', value: '14 микрорайон', type: 'мкр' },
    { label: '🛣 ул. Ленина', value: 'ул. Ленина', type: 'улица' },
    { label: '🛣 ул. Масалиева', value: 'ул. Масалиева', type: 'улица' },
    { label: '🛣 ул. Токтогула', value: 'ул. Токтогула', type: 'улица' },
    { label: '🛣 ул. Карасуйская', value: 'ул. Карасуйская', type: 'улица' },
    { label: '🛣 ул. Рыскулова', value: 'ул. Рыскулова', type: 'улица' },
    { label: '🛣 ул. Навои', value: 'ул. Навои', type: 'улица' },
    { label: '🛣 пр. Масалиева', value: 'пр. Масалиева', type: 'улица' },
    { label: '🛣 ул. Курманбекова', value: 'ул. Курманбекова', type: 'улица' },
    { label: '🛣 ул. Абдыкадырова', value: 'ул. Абдыкадырова', type: 'улица' },
    { label: '🛣 ул. Горького', value: 'ул. Горького', type: 'улица' },
    { label: '🛣 ул. Куйбышева', value: 'ул. Куйбышева', type: 'улица' },
    { label: '🛣 ул. Фрунзе', value: 'ул. Фрунзе', type: 'улица' },
    { label: '🛣 ул. Нариманова', value: 'ул. Нариманова', type: 'улица' },
    { label: '🛣 ул. Советская', value: 'ул. Советская', type: 'улица' },
    { label: '🛣 ул. Заводская', value: 'ул. Заводская', type: 'улица' },
    { label: '🛣 ул. Матери', value: 'ул. Матери', type: 'улица' },
    { label: '🛣 ул. Жамгыршиева', value: 'ул. Жамгыршиева', type: 'улица' },
    { label: '🛣 ул. Жукеева-Пудовкина', value: 'ул. Жукеева-Пудовкина', type: 'улица' },
    { label: '🏢 Квартиры', value: 'квартира', type: 'тип' },
    { label: '🏠 Дома', value: 'дом', type: 'тип' },
    { label: '🌿 Участки', value: 'участок', type: 'тип' },
    { label: '🏪 Коммерция', value: 'коммерция', type: 'тип' },
    { label: '🛏 1-комнатная квартира', value: '1-комнатная', type: 'тип' },
    { label: '🛏 2-комнатная квартира', value: '2-комнатная', type: 'тип' },
    { label: '🛏 3-комнатная квартира', value: '3-комнатная', type: 'тип' },
    { label: '🛏 4-комнатная квартира', value: '4-комнатная', type: 'тип' },
];

function initSearchSuggestions(inputId, onSelect) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const dropId = 'sug-drop-' + inputId;
    let dropdown = document.getElementById(dropId);
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.className = 'search-dropdown';
        dropdown.id = dropId;
        document.body.appendChild(dropdown);
    }

    const posDropdown = () => {
        const r = input.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (r.bottom + 4) + 'px';
        dropdown.style.left = r.left + 'px';
        dropdown.style.width = r.width + 'px';
        dropdown.style.zIndex = '9999';
        dropdown.style.margin = '0';
    };

    const show = (items) => {
        if (!items.length) { dropdown.classList.remove('open'); return; }
        posDropdown();
        dropdown.innerHTML = items.map(s =>
            `<div class="search-dropdown-item" data-value="${s.value}">
                <span class="sd-label">${s.label}</span>
                <span class="sd-type">${s.type}</span>
            </div>`
        ).join('');
        dropdown.classList.add('open');
        dropdown.querySelectorAll('.search-dropdown-item').forEach(el => {
            const pick = (e) => {
                e.preventDefault();
                input.value = el.dataset.value;
                dropdown.classList.remove('open');
                if (onSelect) {
                    onSelect(el.dataset.value);
                } else {
                    if (typeof window.__applyListingFilter === 'function') {
                        window.__applyListingFilter();
                    } else if (typeof applyFilters === 'function') {
                        setTimeout(() => applyFilters(), 0);
                    }
                }
            };
            el.addEventListener('pointerdown', pick);
        });
    };

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (q.length < 1) { dropdown.classList.remove('open'); return; }
        const adSuggestions = storage.getAds()
            .filter(a => a.status === 'active' && a.address)
            .slice(0, 50)
            .filter(a => a.address.toLowerCase().includes(q))
            .slice(0, 3)
            .map(a => ({ label: `🏠 ${a.address}`, value: a.address, type: 'адрес' }));
        const staticMatches = SEARCH_SUGGESTIONS.filter(s =>
            s.value.toLowerCase().includes(q) || s.label.toLowerCase().includes(q)
        ).slice(0, 5);
        show([...staticMatches, ...adSuggestions].slice(0, 7));
    });
    input.addEventListener('focus', () => {
        posDropdown();
        show(input.value.trim()
            ? SEARCH_SUGGESTIONS.filter(s => s.value.toLowerCase().includes(input.value.trim().toLowerCase())).slice(0, 7)
            : SEARCH_SUGGESTIONS.slice(0, 6));
    });
    input.addEventListener('blur', () => setTimeout(() => dropdown.classList.remove('open'), 300));
    window.addEventListener('scroll', () => { if (dropdown.classList.contains('open')) posDropdown(); }, { passive: true });
    window.addEventListener('resize', () => { if (dropdown.classList.contains('open')) posDropdown(); }, { passive: true });
    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.search-dropdown-item');
        const active = dropdown.querySelector('.search-dropdown-item.active');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = active ? active.nextElementSibling : items[0];
            if (next) { active?.classList.remove('active'); next.classList.add('active'); }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = active ? active.previousElementSibling : items[items.length - 1];
            if (prev) { active?.classList.remove('active'); prev.classList.add('active'); }
        } else if (e.key === 'Enter' && active) {
            e.preventDefault();
            input.value = active.dataset.value;
            dropdown.classList.remove('open');
            if (onSelect) onSelect(active.dataset.value);
            else input.dispatchEvent(new Event('input'));
        } else if (e.key === 'Escape') {
            dropdown.classList.remove('open');
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement?.id === 'heroSearch') heroSearchGo();
});

function animateCounters() {
    document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1800;
        const step = Math.ceil(target / (duration / 16));
        let current = 0;
        const timer = setInterval(() => {
            current = Math.min(current + step, target);
            el.textContent = current.toLocaleString('ru');
            if (current >= target) clearInterval(timer);
        }, 16);
    });
}

function renderHome() {
    const container = document.getElementById("featured-listings");
    if (!container) return;
    const all = storage.getAds().filter((ad) => ad.status === "active");
    // Сначала — оплаченные на главной, отсортированные по приоритету
    let ads = all.filter((ad) => ad.featuredOnHome === true || ad.vip === true)
                 .sort((a, b) => getPriorityScore(b) - getPriorityScore(a))
                 .slice(0, 6);
    // Fallback: если оплаченных мало, добираем свежими
    if (ads.length < 6) {
        const ids = new Set(ads.map(a => a.id));
        const fresh = all
            .filter(ad => !ids.has(ad.id))
            .sort((a, b) => new Date(b.date || b.createdAt || 0) - new Date(a.date || a.createdAt || 0))
            .slice(0, 6 - ads.length);
        ads = ads.concat(fresh);
    }
    container.innerHTML = ads.length
        ? ads.map(createListingCard).join("")
        : "<p>Пока нет активных объявлений.</p>";
    bindFavoriteButtons(container);

    if (document.querySelector('.stat-number')) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { animateCounters(); observer.disconnect(); }
        }, { threshold: 0.3 });
        observer.observe(document.querySelector('.stats-section') || document.body);
    }

    initScrollReveal();
    initHeroTyping();
    initMortgageCalc();
    loadRealStats();
}

async function loadRealStats() {
    const totalEl = document.getElementById('statTotalAds');
    const activeEl = document.getElementById('statActiveAds');
    if (!totalEl || !activeEl) return;

    let ads = storage.getAds();
    const services = getFirebaseServices();
    if (services) {
        try {
            const snap = await services.db.collection('ads').get();
            ads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch (e) {}
    }

    const total = ads.length;
    const active = ads.filter((a) => a.status === 'active').length;

    function animateNum(el, target) {
        if (target === 0) { el.textContent = '0'; return; }
        let cur = 0;
        const step = Math.max(1, Math.ceil(target / 60));
        const t = setInterval(() => {
            cur = Math.min(cur + step, target);
            el.textContent = cur.toLocaleString('ru');
            if (cur >= target) clearInterval(t);
        }, 20);
    }

    const obs = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            animateNum(totalEl, total);
            animateNum(activeEl, active);
            obs.disconnect();
        }
    }, { threshold: 0.3 });
    obs.observe(totalEl.closest('.stats-section') || document.body);
}

function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
}

function initHeroTyping() {
    const el = document.getElementById('heroTyping');
    if (!el) return;
    const phrases = [
        '\u0422\u044b\u0441\u044f\u0447\u0438 \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u0439 \u043e \u043f\u0440\u043e\u0434\u0430\u0436\u0435 \u0438 \u0430\u0440\u0435\u043d\u0434\u0435 \u0432 \u041e\u0448\u0435',
        '\u041d\u0430\u0439\u0434\u0438\u0442\u0435 \u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0443, \u0434\u043e\u043c \u0438\u043b\u0438 \u0443\u0447\u0430\u0441\u0442\u043e\u043a \u0437\u0430 \u043c\u0438\u043d\u0443\u0442\u044b',
        '\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0435 \u0440\u0430\u0437\u043c\u0435\u0449\u0435\u043d\u0438\u0435 \u0432\u0430\u0448\u0435\u0433\u043e \u043e\u0431\u044a\u044f\u0432\u043b\u0435\u043d\u0438\u044f',
        '\u0412\u0435\u0441\u044c \u041e\u0448 \u0432 \u043e\u0434\u043d\u043e\u043c \u043f\u043e\u0440\u0442\u0430\u043b\u0435',
    ];
    let pi = 0, ci = 0, deleting = false;
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    el.appendChild(cursor);
    function tick() {
        const phrase = phrases[pi];
        if (!deleting) {
            el.firstChild ? el.firstChild.textContent = phrase.slice(0, ci++) : el.insertBefore(document.createTextNode(''), cursor);
            if (el.firstChild.nodeType === Node.TEXT_NODE) el.firstChild.textContent = phrase.slice(0, ci++);
            if (ci > phrase.length) { deleting = true; setTimeout(tick, 1800); return; }
        } else {
            if (el.firstChild && el.firstChild.nodeType === Node.TEXT_NODE) el.firstChild.textContent = phrase.slice(0, --ci);
            if (ci <= 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; setTimeout(tick, 400); return; }
        }
        setTimeout(tick, deleting ? 40 : 75);
    }
    el.insertBefore(document.createTextNode(''), cursor);
    setTimeout(tick, 800);
}

function initMortgageCalc() {
    const priceEl = document.getElementById('calcPrice');
    if (!priceEl) return;
    const downEl = document.getElementById('calcDown');
    const yearsEl = document.getElementById('calcYears');
    const rateEl = document.getElementById('calcRate');

    function fmt(n) { return Math.round(n).toLocaleString('ru') + ' \u0441\u043e\u043c'; }
    function updateSliderFill(el) {
        const min = +el.min, max = +el.max, val = +el.value;
        const pct = ((val - min) / (max - min) * 100).toFixed(1) + '%';
        el.style.setProperty('--val', pct);
    }
    function calc() {
        const price = +priceEl.value;
        const down = +downEl.value / 100;
        const years = +yearsEl.value;
        const rate = +rateEl.value / 100 / 12;
        const n = years * 12;
        const loan = price * (1 - down);
        const monthly = rate === 0 ? loan / n : loan * rate * Math.pow(1 + rate, n) / (Math.pow(1 + rate, n) - 1);
        const total = monthly * n;
        const overpay = total - loan;

        document.getElementById('calcPriceVal').textContent = fmt(price);
        document.getElementById('calcDownVal').textContent = downEl.value + '%';
        document.getElementById('calcYearsVal').textContent = years + ' \u043b\u0435\u0442';
        document.getElementById('calcRateVal').textContent = rateEl.value + '%';
        document.getElementById('calcMonthly').textContent = fmt(monthly);
        document.getElementById('calcLoan').textContent = fmt(loan);
        document.getElementById('calcTotal').textContent = fmt(total);
        document.getElementById('calcOverpay').textContent = fmt(overpay);

        [priceEl, downEl, yearsEl, rateEl].forEach(updateSliderFill);
    }
    [priceEl, downEl, yearsEl, rateEl].forEach((el) => el.addEventListener('input', calc));
    calc();
}

function renderBuy() {
    const ads = storage.getAds()
        .filter((ad) => ad.status === "active" && ad.type === "sale")
        .sort((a, b) => getPriorityScore(b) - getPriorityScore(a) || new Date(b.date) - new Date(a.date));
    const flats = document.getElementById("listings-flat");
    const houses = document.getElementById("listings-house");
    if (flats) flats.innerHTML = ads.filter((a) => a.category === "flat").map(createListingCard).join("") || "<p>Нет квартир.</p>";
    if (houses) houses.innerHTML = ads.filter((a) => a.category === "house").map(createListingCard).join("") || "<p>Нет домов.</p>";
    bindFavoriteButtons(document);
}

function renderFilteredList(categories, mode) {
    const container = document.getElementById("listings-container");
    if (!container) return;
    const searchInput = document.getElementById("searchInput");
    const section = searchInput?.closest("form") || document.querySelector(".search-grid");
    const priceMax = document.getElementById("priceMax");
    const priceMin = document.getElementById("priceMin");
    const areaMin = document.getElementById("areaMin");
    const areaMax = document.getElementById("areaMax");
    const roomsFilter = document.getElementById("roomsFilter");
    const districtFilter = document.getElementById("districtFilter");
    const sortSelect = document.getElementById("sortSelect");
    const categorySelect = document.getElementById("categorySelect");
    const countBadge = document.getElementById("count-badge");
    const resetBtn = document.getElementById("resetFiltersBtn");
    const geoBtn = document.getElementById("nearMeBtn");

    if (section && !document.getElementById("priceMin")) {
        const extra = document.createElement("div");
        extra.className = "input-group";
        extra.innerHTML = `<i class="fas fa-money-bill-wave"></i><input type="number" id="priceMin" placeholder="Мин цена">`;
        section.appendChild(extra);
        const extra2 = document.createElement("div");
        extra2.className = "input-group";
        extra2.innerHTML = `<i class="fas fa-ruler-combined"></i><input type="number" id="areaMin" placeholder="Площадь от">`;
        section.appendChild(extra2);
        const extra3 = document.createElement("div");
        extra3.className = "input-group";
        extra3.innerHTML = `<i class="fas fa-ruler-combined"></i><input type="number" id="areaMax" placeholder="Площадь до">`;
        section.appendChild(extra3);
        const extra4 = document.createElement("div");
        extra4.className = "input-group";
        extra4.innerHTML = `<i class="fas fa-bed"></i><input type="number" id="roomsFilter" placeholder="Комнат от">`;
        section.appendChild(extra4);
        const extra5 = document.createElement("div");
        extra5.className = "input-group";
        extra5.innerHTML = `<i class="fas fa-map-marker-alt"></i><input type="text" id="districtFilter" placeholder="Район">`;
        section.appendChild(extra5);
        const actions = document.createElement("div");
        actions.className = "input-group full-width";
        actions.innerHTML = `<button id="nearMeBtn" type="button" class="btn-filter" style="width:auto; margin-right:8px;">Искать рядом</button><button id="resetFiltersBtn" type="button" class="btn-reset" style="width:auto;">Сбросить</button>`;
        section.appendChild(actions);
    }

    const sp = new URLSearchParams(window.location.search);
    const pageKey = `page_${document.body?.getAttribute("data-page") || "list"}`;
    const savedFilters = storage.getFilters()[pageKey] || {};
    const initial = { ...savedFilters, ...Object.fromEntries(sp.entries()) };

    const apply = () => {
        let ads = storage.getAds().filter((a) => a.status === "active");
        if (mode === "rent") ads = ads.filter((a) => a.type === "rent");
        if (mode === "sale-category") ads = ads.filter((a) => a.type === "sale" && categories.includes(a.category));
        if (mode === "category-only") ads = ads.filter((a) => categories.includes(a.category));

        const query = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
        const maxPrice = Number((document.getElementById("priceMax") || document.getElementById("maxPriceFilter"))?.value || 0);
        const minPrice = Number((document.getElementById("priceMin") || document.getElementById("minPriceFilter"))?.value || 0);
        const minArea = Number(document.getElementById("areaMin")?.value || 0);
        const maxArea = Number(document.getElementById("areaMax")?.value || 0);
        const minRooms = Number(document.getElementById("roomsFilter")?.value || 0);
        const district = ''; // legacy — теперь используется adMatchesRegionDistrict
        const chosenCat = (document.getElementById("categorySelect") || document.getElementById("categoryFilter"))?.value || "all";
        const nearMeCoords = document.body.dataset.nearMe ? JSON.parse(document.body.dataset.nearMe) : null;

        if (query) ads = ads.filter((a) => `${a.address} ${a.description}`.toLowerCase().includes(query));
        if (maxPrice > 0) ads = ads.filter((a) => Number(a.price) <= maxPrice);
        if (minPrice > 0) ads = ads.filter((a) => Number(a.price) >= minPrice);
        if (minArea > 0) ads = ads.filter((a) => Number(a.area || 0) >= minArea);
        if (maxArea > 0) ads = ads.filter((a) => Number(a.area || 0) <= maxArea);
        if (minRooms > 0) ads = ads.filter((a) => Number(a.rooms || 0) >= minRooms);
        ads = ads.filter(adMatchesRegionDistrict);
        if (chosenCat !== "all") ads = ads.filter((a) => a.category === chosenCat);

        // Новые умные фильтры
        const docsSel = document.getElementById('documentsFilter')?.value || '';
        const landSel = document.getElementById('landPurposeFilter')?.value || '';
        const utilSel = document.getElementById('utilitiesFilter')?.value || '';
        const commSel = document.getElementById('commerceTypeFilter')?.value || '';
        if (docsSel) {
            ads = ads.filter(a => {
                const d = a.documents;
                if (!d) return false;
                if (Array.isArray(d)) return d.includes(docsSel);
                return String(d) === docsSel;
            });
        }
        if (landSel) ads = ads.filter(a => a.landPurpose === landSel);
        if (utilSel) {
            ads = ads.filter(a => {
                const u = a.utilities;
                if (!u) return false;
                if (Array.isArray(u)) return utilSel === 'all' ? ['water','electricity','gas','sewage'].every(k => u.includes(k)) : u.includes(utilSel);
                return utilSel === 'all' ? String(u) === 'all' : String(u).includes(utilSel);
            });
        }
        if (commSel) ads = ads.filter(a => a.commerceType === commSel);
        if (nearMeCoords) {
            const toRad = (deg) => deg * (Math.PI / 180);
            const distKm = (a, b, c, d) => {
                const R = 6371;
                const dLat = toRad(c - a);
                const dLon = toRad(d - b);
                const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(dLon / 2) ** 2;
                return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
            };
            ads = ads.filter((a) => a.lat && a.lng && distKm(nearMeCoords.lat, nearMeCoords.lng, Number(a.lat), Number(a.lng)) <= 5);
        }

        const sort = (document.getElementById("sortSelect") || document.getElementById("sortFilter"))?.value || "new";
        if (sort === "cheap" || sort === "price-low") ads.sort((a, b) => a.price - b.price);
        else if (sort === "expensive" || sort === "price-high") ads.sort((a, b) => b.price - a.price);
        else if (sort === "size-large") ads.sort((a, b) => Number(b.area || 0) - Number(a.area || 0));
        else if (sort === "size-small") ads.sort((a, b) => Number(a.area || 0) - Number(b.area || 0));
        else ads.sort((a, b) => getPriorityScore(b) - getPriorityScore(a) || new Date(b.date) - new Date(a.date));

        container.innerHTML = ads.length ? ads.map(createListingCard).join("") : "<p>По вашему фильтру ничего не найдено.</p>";
        if (countBadge) countBadge.textContent = String(ads.length);
        bindFavoriteButtons(container);

        const params = new URLSearchParams();
        [["q", query], ["max", maxPrice], ["min", minPrice], ["amin", minArea], ["amax", maxArea], ["rooms", minRooms], ["district", district], ["cat", chosenCat], ["sort", sort]].forEach(([k, v]) => {
            if (v && v !== "all") params.set(k, String(v));
        });
        history.replaceState({}, "", `${location.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
        const allSaved = storage.getFilters();
        allSaved[pageKey] = Object.fromEntries(params.entries());
        storage.setFilters(allSaved);
    };

    window.__applyListingFilter = apply;

    const fields = ["searchInput", "priceMax", "priceMin", "areaMin", "areaMax", "roomsFilter", "districtFilter", "sortSelect", "categorySelect", "sortFilter", "categoryFilter", "minPriceFilter", "maxPriceFilter", "furnitureFilter", "documentsFilter", "landPurposeFilter", "utilitiesFilter", "commerceTypeFilter"];
    fields.forEach((id) => document.getElementById(id)?.addEventListener("input", apply));
    ["sortSelect", "categorySelect", "sortFilter", "categoryFilter", "furnitureFilter", "documentsFilter", "landPurposeFilter", "utilitiesFilter", "commerceTypeFilter"].forEach(id => document.getElementById(id)?.addEventListener("change", apply));
    document.getElementById("resetFiltersBtn")?.addEventListener("click", () => {
        fields.forEach((id) => { const el = document.getElementById(id); if (el) el.value = id === "categorySelect" ? "all" : ""; });
        // Сброс региона/района и segmented control комнат
        if (typeof setRegionDistrict === 'function') setRegionDistrict('', '', false);
        document.querySelectorAll('.fbar-seg-btn').forEach(b => b.classList.toggle('active', b.dataset.val === ''));
        delete document.body.dataset.nearMe;
        apply();
    });
    document.getElementById("nearMeBtn")?.addEventListener("click", () => {
        if (!navigator.geolocation) return showToast("Геолокация недоступна", "error");
        navigator.geolocation.getCurrentPosition((pos) => {
            document.body.dataset.nearMe = JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            apply();
        }, () => showToast("Не удалось получить геопозицию", "error"));
    });

    Object.entries(initial).forEach(([k, v]) => {
        const map = { q: "searchInput", max: "priceMax", min: "priceMin", amin: "areaMin", amax: "areaMax", rooms: "roomsFilter", district: "districtFilter", cat: "categorySelect", sort: "sortSelect" };
        const id = map[k];
        const el = id ? document.getElementById(id) : null;
        if (el) el.value = v;
    });
    apply();
}

function renderFavorites() {
    const container = document.getElementById("listings-container");
    if (!container) return;
    const favIds = storage.getFavorites();
    const ads = storage.getAds().filter((ad) => favIds.includes(ad.id));
    container.innerHTML = ads.length ? ads.map(createListingCard).join("") : "<p>Избранных объявлений пока нет.</p>";
    bindFavoriteButtons(container);
}

function renderDetails() {
    const title = document.getElementById("detail-title");
    if (!title) return;
    const adId = new URLSearchParams(window.location.search).get("id");
    const ad = storage.getAds().find((x) => x.id === adId);
    if (!ad) {
        document.getElementById("property-content").innerHTML = "<h2>Объявление не найдено</h2>";
        return;
    }

    document.getElementById("detail-badge").textContent = ad.type === "rent" ? "Аренда" : "Продажа";
    title.textContent = `${getCatName(ad.category)} - ${ad.address}`;
    document.getElementById("detail-address").textContent = ad.address;
    document.getElementById("detail-price").textContent = formatPrice(ad.price);
    document.getElementById("detail-desc").textContent = ad.description || "Описание отсутствует.";
    document.getElementById("detail-author").textContent = ad.authorName || "Пользователь";

    const specs = document.getElementById("detail-specs");
    const furnitureLabel = { yes: "С мебелью", no: "Без мебели", partial: "Частично" };
    const landLabel = { izhs: "ИЖС (под жилой дом)", dacha: "Дача / садоводство", selhoz: "Сельхозназначение", commerce: "Коммерческое" };
    const commerceLabel = { office: "Офис", shop: "Магазин / торговая точка", warehouse: "Склад", production: "Производство", restaurant: "Ресторан / кафе" };
    specs.innerHTML = `
        <li><strong>Категория</strong>${getCatName(ad.category)}</li>
        <li><strong>Тип сделки</strong>${ad.type === "rent" ? "Аренда" : "Продажа"}</li>
        <li><strong>Площадь</strong>${ad.area || "—"} ${ad.category === "land" ? "сотых" : "м²"}</li>
        ${ad.rooms ? `<li><strong>Комнат</strong>${ad.rooms}</li>` : ""}
        ${ad.floor ? `<li><strong>Этаж</strong>${ad.floor}${ad.totalFloors ? " из " + ad.totalFloors : ""}</li>` : ""}
        ${ad.furniture ? `<li><strong>Мебель</strong>${furnitureLabel[ad.furniture] || ad.furniture}</li>` : ""}
        ${ad.landPurpose ? `<li><strong>Назначение</strong>${landLabel[ad.landPurpose] || ad.landPurpose}</li>` : ""}
        ${ad.commerceType ? `<li><strong>Тип помещения</strong>${commerceLabel[ad.commerceType] || ad.commerceType}</li>` : ""}
    `;

    const images = ad.images?.length ? ad.images : [getMainImage(ad)];
    const mainImg = document.getElementById("sliderMainImg");
    const thumbs = document.getElementById("sliderThumbs");
    let idx = 0;
    const draw = () => { mainImg.src = images[idx]; };
    thumbs.innerHTML = images.map((src, i) => `<img src="${src}" class="slider-thumb-img" data-thumb="${i}" alt="">`).join("");
    draw();
    document.getElementById("sliderPrevBtn")?.addEventListener("click", () => { idx = (idx - 1 + images.length) % images.length; draw(); });
    document.getElementById("sliderNextBtn")?.addEventListener("click", () => { idx = (idx + 1) % images.length; draw(); });
    thumbs.querySelectorAll("[data-thumb]").forEach((el) => el.addEventListener("click", () => { idx = Number(el.getAttribute("data-thumb")); draw(); }));

    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        document.getElementById("contact-placeholder").style.display = "none";
        document.getElementById("contact-real").style.display = "block";

        const phonesContainer = document.getElementById("phones-container");
        if (phonesContainer) {
            const makePhoneBlock = (phone, type, label) => {
                if (!phone) return "";
                const raw = phone.replace(/\D/g, "");
                const showCall = !type || type === "call" || type === "both";
                const showWA = !type || type === "whatsapp" || type === "both";
                return `
                    <p style="font-weight:600;font-size:0.82rem;color:#999;margin:10px 0 4px;">${label}</p>
                    ${showCall ? `<a href="tel:${phone}" class="btn-phone copy-phone-trigger" data-phone="${phone}" style="display:flex;align-items:center;gap:8px;">
                        <i class="fas fa-phone"></i> ${phone}
                        <i class="fas fa-copy" style="margin-left:auto;font-size:0.8em;opacity:0.45;" title="Копировать"></i>
                    </a>` : ""}
                    ${showWA ? `<a href="https://wa.me/${raw}" target="_blank" class="btn-whatsapp"><i class="fab fa-whatsapp"></i> WhatsApp</a>` : ""}
                `;
            };
            phonesContainer.innerHTML =
                makePhoneBlock(ad.phone, ad.phoneType, "Контакт продавца") +
                (ad.phone2 ? makePhoneBlock(ad.phone2, ad.phone2Type, "Дополнительный номер") : "");

            phonesContainer.querySelectorAll(".copy-phone-trigger").forEach((btn) => {
                btn.addEventListener("click", (e) => {
                    const ph = btn.getAttribute("data-phone");
                    if (navigator.clipboard) {
                        e.preventDefault();
                        navigator.clipboard.writeText(ph).then(() => showToast("Номер скопирован 📋", "success"));
                    }
                });
            });
        }
    }

    const mapSection = document.getElementById("map-section");
    const mapView = document.getElementById("map-view");
    if (mapSection && mapView && typeof window.L !== "undefined" && ad.lat && ad.lng) {
        mapSection.style.display = "block";
        const lat = Number(ad.lat);
        const lng = Number(ad.lng);
        const map = L.map("map-view").setView([lat, lng], 14);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        L.marker([lat, lng]).addTo(map);
    }

    const reportBtn = document.getElementById("reportAdBtn");
    reportBtn?.addEventListener("click", () => {
        const user = storage.getCurrentUser();
        if (!user) {
            showToast("Нужно войти, чтобы отправить жалобу", "error");
            return;
        }
        const reports = storage.getReports();
        const recentDup = reports.find((r) => r.adId === ad.id && r.reporterId === user.id && Date.now() - new Date(r.createdAt).getTime() < 12 * 60 * 60 * 1000);
        if (recentDup) {
            showToast("Вы уже отправляли жалобу недавно", "error");
            return;
        }
        const reason = prompt("Причина жалобы:", "Подозрение на недостоверную информацию");
        if (!reason) return;
        reports.push({
            id: `rep_${Date.now()}`,
            adId: ad.id,
            reporterId: user.id,
            reporterName: user.name,
            targetAuthorId: ad.authorId || null,
            reason: reason.trim(),
            createdAt: new Date().toISOString(),
            status: "open"
        });
        storage.setReports(reports);
        showToast("Жалоба отправлена модератору", "success");
    });

    const chatModal = document.getElementById("chatModal");
    const chatMessages = document.getElementById("chatMessages");
    const chatInput = document.getElementById("chatInput");
    const chatSendBtn = document.getElementById("chatSendBtn");
    const openChatBtn = document.getElementById("openChatBtn");

    const getOrCreateChat = (buyerId) => {
        const sellerId = ad.authorId || "admin";
        const chats = storage.getChats();
        let chat = chats.find((c) => c.adId === ad.id && c.participants.includes(buyerId) && c.participants.includes(sellerId));
        if (!chat) {
            chat = { id: `chat_${Date.now()}`, adId: ad.id, participants: [buyerId, sellerId], messages: [] };
            chats.push(chat);
            storage.setChats(chats);
        }
        return chat;
    };

    const renderChat = (chat, currentUserId) => {
        chatMessages.innerHTML = chat.messages.length
            ? chat.messages.map((m) => `<div style="margin:6px 0; text-align:${m.from === currentUserId ? "right" : "left"};"><span style="display:inline-block; background:${m.from === currentUserId ? "#ffe7df" : "#eef2f7"}; padding:8px 10px; border-radius:10px; max-width:85%;">${m.text}</span></div>`).join("")
            : "<p style='color:#999;'>Пока нет сообщений</p>";
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    openChatBtn?.addEventListener("click", () => {
        const current = storage.getCurrentUser();
        if (!current) {
            showToast("Войдите, чтобы написать продавцу", "error");
            return;
        }
        if (ad.authorId && ad.authorId === current.id) {
            showToast("Это ваше объявление", "error");
            return;
        }

        const sellerUid = ad.authorId;
        if (!sellerUid) {
            showToast("У объявления нет автора (authorId)", "error");
            return;
        }

        // Переходим в реальный чат (Firestore)
        createChatWithUser(sellerUid, ad.id);
    });
}

function initLogin() {
    const form = document.getElementById("loginForm");
    if (!form) {
        return;
    }

    const currentUser = storage.getCurrentUser();
    if (currentUser) {
        window.location.href = "profile.html";
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector("button[type='submit']");
        setButtonLoading(submitBtn, true, "Вход...");
        clearFieldErrors(form);
        const email = document.getElementById("loginEmail")?.value.trim().toLowerCase();
        const password = document.getElementById("loginPass")?.value;
        const users = storage.getUsers();

        if (!email) {
            setFieldError(document.getElementById("loginEmail"), "Введите email");
            setButtonLoading(submitBtn, false);
            return;
        }
        if (!password) {
            setFieldError(document.getElementById("loginPass"), "Введите пароль");
            setButtonLoading(submitBtn, false);
            return;
        }

        const foundUser = users.find((user) => user.email === email && user.password === password);
        if (!foundUser) {
            showToast("Неверный email или пароль", "error");
            setButtonLoading(submitBtn, false);
            return;
        }

        storage.setCurrentUser({
            id: foundUser.id,
            name: foundUser.name,
            email: foundUser.email,
            phone: foundUser.phone
        });
        showToast("Вход выполнен успешно", "success");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 700);
    });
}

function initRegister() {
    const form = document.getElementById("registerForm");
    if (!form) {
        return;
    }

    const step1 = document.getElementById("step-1");
    const step2 = document.getElementById("step-2");
    const btnGetCode = document.getElementById("btnGetCode");
    const btnBack = document.getElementById("btnBack");
    const displayEmail = document.getElementById("displayEmail");
    const verifyCodeInput = document.getElementById("verifyCode");
    let generatedCode = null;

    btnGetCode?.addEventListener("click", () => {
        clearFieldErrors(form);
        const name = document.getElementById("regName")?.value.trim();
        const phoneRaw = document.getElementById("regPhone")?.value.trim() || "";
        const email = document.getElementById("regEmail")?.value.trim().toLowerCase();
        const pass = document.getElementById("regPass")?.value || "";
        const passConfirm = document.getElementById("regPassConfirm")?.value || "";
        const phone = normalizePhone(phoneRaw);

        if (!name) {
            setFieldError(document.getElementById("regName"), "Введите имя");
            showToast("Проверьте поля формы", "error");
            return;
        }
        if (!email) {
            setFieldError(document.getElementById("regEmail"), "Введите email");
            showToast("Проверьте поля формы", "error");
            return;
        }
        if (!phone) {
            setFieldError(document.getElementById("regPhone"), "Формат: 0555 12-34-56");
            showToast("Введите корректный номер телефона KG", "error");
            return;
        }
        if (!validatePassword(pass)) {
            setFieldError(document.getElementById("regPass"), "Минимум 6 символов");
            showToast("Пароль должен быть не короче 6 символов", "error");
            return;
        }
        if (pass !== passConfirm) {
            setFieldError(document.getElementById("regPassConfirm"), "Пароли не совпадают");
            showToast("Пароли не совпадают", "error");
            return;
        }
        if (storage.getUsers().some((user) => user.email === email)) {
            setFieldError(document.getElementById("regEmail"), "Email уже зарегистрирован");
            showToast("Пользователь с таким email уже существует", "error");
            return;
        }

        generatedCode = String(Math.floor(1000 + Math.random() * 9000));
        sessionStorage.setItem("osh_verify_code", generatedCode);
        displayEmail.textContent = email;
        showToast(`Код подтверждения: ${generatedCode}`, "success");
        step1.style.display = "none";
        step2.style.display = "block";
    });

    btnBack?.addEventListener("click", () => {
        step2.style.display = "none";
        step1.style.display = "block";
        verifyCodeInput.value = "";
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector("#step-2 button[type='submit']");
        setButtonLoading(submitBtn, true, "Проверка...");
        clearFieldErrors(form);
        if (step2.style.display === "none") {
            setButtonLoading(submitBtn, false);
            return;
        }
        const enteredCode = (verifyCodeInput.value || "").trim();
        if (!generatedCode || enteredCode !== generatedCode) {
            setFieldError(verifyCodeInput, "Неверный код");
            showToast("Неверный код подтверждения", "error");
            setButtonLoading(submitBtn, false);
            return;
        }

        const name = document.getElementById("regName").value.trim();
        const phone = normalizePhone(document.getElementById("regPhone").value.trim());
        const email = document.getElementById("regEmail").value.trim().toLowerCase();
        const password = document.getElementById("regPass").value;

        const users = storage.getUsers();
        const newUser = {
            id: `u_${Date.now()}`,
            name,
            phone,
            email,
            password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        storage.setUsers(users);
        storage.setCurrentUser({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone
        });

        showToast("Регистрация успешно завершена", "success");
        setTimeout(() => {
            window.location.href = "profile.html";
        }, 800);
    });
}

function initAddPageAuthState() {
    const notAuthBlock = document.getElementById("notAuthBlock");
    const authBlock = document.getElementById("authBlock");
    if (!notAuthBlock || !authBlock) {
        return;
    }
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
        notAuthBlock.style.display = "block";
        authBlock.style.display = "none";
        return;
    }
    notAuthBlock.style.display = "none";
    authBlock.style.display = "block";
    const phoneInput = document.getElementById("inputPhone");
    if (phoneInput) {
        phoneInput.value = currentUser.phone || "";
    }
}

function initAddPageForm() {
    const form = document.getElementById("createAdForm");
    if (!form) return;

    const fileInput = document.getElementById("inputImageFile");
    const preview = document.getElementById("imagePreviewContainer");
    const latInput = document.getElementById("inputLat");
    const lngInput = document.getElementById("inputLng");
    const addressInput = document.getElementById("inputAddress");
    let uploaded = [];

    const typeSelect = document.getElementById("inputType");
    const roomsGroup = document.getElementById("roomsGroup");
    const flatHouseFields = document.getElementById("flatHouseFields");
    const landFields = document.getElementById("landFields");
    const commerceFields = document.getElementById("commerceFields");
    const areaLabel = document.querySelector("#inputArea")?.closest(".form-group")?.querySelector("label");

    const updateCategoryFields = () => {
        const cat = typeSelect?.value;
        const isFlat = cat === "flat" || cat === "house";
        const isLand = cat === "land";
        const isCommerce = cat === "commerce";
        if (roomsGroup) roomsGroup.style.display = isFlat ? "" : "none";
        if (flatHouseFields) flatHouseFields.style.display = isFlat ? "" : "none";
        if (landFields) landFields.style.display = isLand ? "" : "none";
        if (commerceFields) commerceFields.style.display = isCommerce ? "" : "none";
        if (areaLabel) areaLabel.textContent = isLand ? "Площадь (сотых)" : "Площадь (м²)";
    };

    typeSelect?.addEventListener("change", updateCategoryFields);
    updateCategoryFields();

    // --- Авто-формат и валидация телефона ---
    const phoneInputEl = document.getElementById('inputPhone');
    if (phoneInputEl) {
        const formatKgPhone = (raw) => {
            let d = (raw || '').replace(/\D/g, '');
            // Если начинается с 996 — оставляем; если с 0 — заменяем на 996; иначе допишем 996
            if (d.startsWith('996')) d = d.slice(0, 12);
            else if (d.startsWith('0')) d = '996' + d.slice(1, 10);
            else if (d.length > 0) d = '996' + d.slice(0, 9);
            if (!d) return '';
            // +996 XXX XXX XXX
            const p = d.slice(3);
            let out = '+996';
            if (p.length) out += ' ' + p.slice(0, 3);
            if (p.length > 3) out += ' ' + p.slice(3, 6);
            if (p.length > 6) out += ' ' + p.slice(6, 9);
            return out;
        };
        phoneInputEl.addEventListener('input', () => {
            const cursorAtEnd = phoneInputEl.selectionStart === phoneInputEl.value.length;
            phoneInputEl.value = formatKgPhone(phoneInputEl.value);
            if (cursorAtEnd) phoneInputEl.setSelectionRange(phoneInputEl.value.length, phoneInputEl.value.length);
            phoneInputEl.classList.remove('pay-err');
        });
        phoneInputEl.addEventListener('blur', () => {
            const digits = phoneInputEl.value.replace(/\D/g, '');
            if (phoneInputEl.value && digits.length !== 12) {
                phoneInputEl.classList.add('pay-err');
            }
        });
        // Нормализуем предзаполненный номер из профиля
        if (phoneInputEl.value) phoneInputEl.value = formatKgPhone(phoneInputEl.value);
    }

    // --- Segmented control: количество комнат ---
    const roomsSeg = document.getElementById('roomsSegControl');
    const roomsHidden = document.getElementById('inputRooms');
    roomsSeg?.addEventListener('click', (e) => {
        const btn = e.target.closest('.fbar-seg-btn');
        if (!btn) return;
        roomsSeg.querySelectorAll('.fbar-seg-btn').forEach(b => b.classList.toggle('active', b === btn));
        if (roomsHidden) roomsHidden.value = btn.dataset.val;
    });

    // --- Переключатель валюты рядом с ценой ---
    const curToggle = document.getElementById('inputCurrencyToggle');
    const curHidden = document.getElementById('inputCurrency');
    const curLabel = document.getElementById('inputPriceCurLabel');
    const priceInputEl = document.getElementById('inputPrice');
    curToggle?.addEventListener('click', (e) => {
        const b = e.target.closest('.fbar-cur-btn');
        if (!b) return;
        const cur = b.dataset.cur;
        curToggle.querySelectorAll('.fbar-cur-btn').forEach(x => x.classList.toggle('active', x === b));
        if (curHidden) curHidden.value = cur;
        if (curLabel) curLabel.textContent = cur === 'USD' ? '($)' : '(сом)';
        if (priceInputEl) priceInputEl.placeholder = cur === 'USD' ? '0 $' : '0 сом';
    });

    // --- Кнопка "Регион и населённый пункт" ---
    const regionBtn = document.getElementById('addRegionBtn');
    const regionHidden = document.getElementById('inputRegion');
    const districtHidden = document.getElementById('inputDistrict');
    regionBtn?.addEventListener('click', () => {
        openRegionModal({
            initial: { region: regionHidden?.value || '', district: districtHidden?.value || '' },
            onApply: (region, district) => {
                if (regionHidden) regionHidden.value = region || '';
                if (districtHidden) districtHidden.value = district || '';
                const labelEl = regionBtn.querySelector('.rf-btn-label');
                let text = 'Выбрать регион и район';
                if (region && district) text = `${district}, ${region}`;
                else if (region) text = region;
                if (labelEl) labelEl.innerHTML = `<i class="fas fa-map-marker-alt" style="color:#ff6b35;margin-right:6px;"></i>${text}`;
                // Если адрес пустой — предзаполнить комбинацией
                if (addressInput && !addressInput.value.trim() && (region || district)) {
                    addressInput.value = [district, region].filter(Boolean).join(', ');
                }
            }
        });
    });

    if (document.getElementById("map-picker") && typeof window.L !== "undefined") {
        const map = L.map("map-picker").setView([40.5283, 72.7985], 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        let marker = null;
        map.on("click", async (e) => {
            const { lat, lng } = e.latlng;
            latInput.value = lat.toFixed(6);
            lngInput.value = lng.toFixed(6);
            if (marker) map.removeLayer(marker);
            marker = L.marker([lat, lng]).addTo(map);
            showToast("Определяем адрес...", "info");
            try {
                const resp = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ru`,
                    { headers: { "User-Agent": "OshEstate/1.0" } }
                );
                const data = await resp.json();
                const a = data.address || {};
                let parts = [];
                if (a.road) {
                    parts.push(a.road);
                    if (a.house_number) parts.push(a.house_number);
                }
                if (!parts.length && a.suburb) parts.push(a.suburb);
                if (!parts.length) parts.push(a.quarter || a.neighbourhood || a.city_district || "");
                if (!parts.length) parts.push(a.city || a.town || a.village || a.county || "");
                if (!parts.filter(Boolean).length && data.display_name) {
                    parts = data.display_name.split(",").slice(0, 3);
                }
                addressInput.value = parts.filter(Boolean).map(s => s.trim()).join(", ") || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                showToast("Адрес определён по карте ✓", "success");
            } catch (err) {
                if (!addressInput.value.trim()) addressInput.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                showToast("Точка на карте установлена", "success");
            }
        });
    }

    fileInput?.addEventListener("change", (e) => {
        uploaded = [];
        preview.innerHTML = "";
        Array.from(e.target.files || []).slice(0, 5).forEach((file) => {
            const reader = new FileReader();
            reader.onload = (evt) => {
                uploaded.push(evt.target.result);
                preview.innerHTML += `<img src="${evt.target.result}" style="width:80px;height:60px;object-fit:cover;border-radius:6px;">`;
            };
            reader.readAsDataURL(file);
        });
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector("button[type='submit']");
        setButtonLoading(submitBtn, true, "Публикация...");
        clearFieldErrors(form);
        const user = storage.getCurrentUser();
        if (!user) { setButtonLoading(submitBtn, false); return showToast("Нужно войти в аккаунт", "error"); }
        const blocked = storage.getBlockedUsers();
        if (blocked.includes(user.id)) {
            setButtonLoading(submitBtn, false);
            return showToast("Ваш аккаунт ограничен. Публикация временно недоступна.", "error");
        }
        const priceInput = document.getElementById("inputPrice");
        const areaInput = document.getElementById("inputArea");
        const addrInput = document.getElementById("inputAddress");
        const descInput = document.getElementById("inputDesc");
        const price = Number(priceInput.value || 0);
        const area = Number(areaInput.value || 0);
        const address = addrInput.value.trim();
        const description = descInput.value.trim();

        if (price <= 0) {
            setFieldError(priceInput, "Укажите корректную цену");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте поля формы", "error");
        }
        if (area <= 0) {
            setFieldError(areaInput, "Укажите площадь");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте поля формы", "error");
        }
        if (address.length < 5) {
            setFieldError(addrInput, "Введите полный адрес");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте поля формы", "error");
        }
        if (description.length < 10) {
            setFieldError(descInput, "Описание минимум 10 символов");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте поля формы", "error");
        }
        if (!uploaded.length) {
            setFieldError(fileInput, "Добавьте хотя бы одно фото объекта");
            setButtonLoading(submitBtn, false);
            return showToast("Загрузите хотя бы одно фото", "error");
        }

        const cat = document.getElementById("inputType").value;
        const maxAreaMap = { flat: 1000, house: 5000, land: 100000, commerce: 10000 };
        const maxArea = maxAreaMap[cat] || 50000;
        if (area > maxArea) {
            setFieldError(areaInput, `Нереальное значение. Максимум для "${getCatName(cat)}": ${maxArea.toLocaleString("ru")} м²`);
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте площадь — значение нереальное", "error");
        }
        if (price < 1000) {
            setFieldError(priceInput, "Минимальная цена 1 000 сом");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте цену", "error");
        }
        if (price > 5000000000) {
            setFieldError(priceInput, "Максимальная цена 5 000 000 000 сом");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте цену", "error");
        }
        const roomsVal = Number(document.getElementById("inputRooms")?.value || 0);
        if ((cat === "flat" || cat === "house") && roomsVal > 50) {
            setFieldError(document.getElementById("inputRooms"), "Максимум 50 комнат");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте количество комнат", "error");
        }

        // Проверка телефона
        const phoneEl = document.getElementById("inputPhone");
        const phoneDigits = (phoneEl?.value || "").replace(/\D/g, "");
        if (phoneDigits.length !== 12 || !phoneDigits.startsWith("996")) {
            setFieldError(phoneEl, "Введите номер в формате +996 XXX XXX XXX");
            setButtonLoading(submitBtn, false);
            return showToast("Проверьте контактный номер", "error");
        }

        const submissionCheck = canSubmitAd(user, {
            address,
            price,
            category: document.getElementById("inputType").value
        });
        if (!submissionCheck.ok) {
            setButtonLoading(submitBtn, false);
            return showToast(submissionCheck.message, "error");
        }

        // Парсинг "4+" в число — храним как 4
        const roomsRaw = document.getElementById("inputRooms")?.value || '';
        const roomsNum = roomsRaw === '4+' ? 4 : Number(roomsRaw) || 0;
        const roomsTag = roomsRaw === '4+' ? '4+' : (roomsNum ? String(roomsNum) : '');
        // Документы — чекбоксы
        const documents = Array.from(document.querySelectorAll('#inputDocumentsGroup input[type=checkbox]:checked'))
            .map(c => c.value);
        // Коммуникации (для участков)
        const utilities = cat === 'land'
            ? Array.from(document.querySelectorAll('#inputUtilitiesGroup input[type=checkbox]:checked')).map(c => c.value)
            : [];
        const currency = document.getElementById('inputCurrency')?.value || 'KGS';
        const region = document.getElementById('inputRegion')?.value || '';
        const district = document.getElementById('inputDistrict')?.value || '';

        const adDraft = {
            type: document.querySelector('input[name="dealType"]:checked')?.value || "sale",
            category: cat,
            rooms: (cat === "flat" || cat === "house") ? roomsNum : 0,
            roomsLabel: (cat === "flat" || cat === "house") ? roomsTag : '',
            floor: (cat === "flat" || cat === "house") ? Number(document.getElementById("inputFloor")?.value || 0) || null : null,
            totalFloors: (cat === "flat" || cat === "house") ? Number(document.getElementById("inputTotalFloors")?.value || 0) || null : null,
            furniture: (cat === "flat" || cat === "house") ? (document.getElementById("inputFurniture")?.value || "") : "",
            landPurpose: cat === "land" ? (document.getElementById("inputLandPurpose")?.value || "") : "",
            utilities,
            commerceType: cat === "commerce" ? (document.getElementById("inputCommerceType")?.value || "") : "",
            documents,
            currency,
            region,
            district,
            price,
            area,
            address,
            description,
            phone: document.getElementById("inputPhone").value.trim(),
            phoneType: document.getElementById("inputPhoneType")?.value || "both",
            images: uploaded,
            status: "pending",
            typeLabel: "user",
            authorId: user.id,
            authorName: user.name,
            date: new Date().toISOString(),
            paidPlacement: false,
            featuredOnHome: false,
            vip: false,
            urgent: false,
            boostedUntil: null,
            lat: latInput.value || null,
            lng: lngInput.value || null
        };

        setButtonLoading(submitBtn, false);
        showPackageModal(adDraft);
    });
}

// ============================================================
// Лалафо-стиль: пакеты продвижения и оплата
// ============================================================
const PROMO_PACKAGES = [
    {
        id: 'free', icon: '🆓', name: 'Стандарт',
        tagline: 'Базовое размещение',
        gradient: 'linear-gradient(135deg,#a3b1c2,#7f8c8d)',
        durations: [{ days: 30, price: 0, label: '30 дней' }],
        features: ['Размещение в категории', 'Стандартный показ', 'Публикация после модерации']
    },
    {
        id: 'featured', icon: '⭐', name: 'ТОП', badge: 'ПОПУЛЯРНО',
        tagline: 'На главной странице',
        gradient: 'linear-gradient(135deg,#3498db,#2980b9)',
        durations: [
            { days: 3, price: 199, label: '3 дня' },
            { days: 7, price: 499, label: '7 дней', recommended: true },
            { days: 30, price: 1499, oldPrice: 1990, label: '30 дней', discount: '-25%' }
        ],
        features: ['×3 больше просмотров', 'Показ на главной', 'Выше в результатах поиска']
    },
    {
        id: 'vip', icon: '💎', name: 'VIP', badge: 'МАКСИМУМ',
        tagline: 'Золотая рамка + VIP-значок',
        gradient: 'linear-gradient(135deg,#f39c12,#e67e22)',
        durations: [
            { days: 7, price: 499, label: '7 дней' },
            { days: 14, price: 899, label: '14 дней', recommended: true },
            { days: 30, price: 1599, oldPrice: 1999, label: '30 дней', discount: '-20%' }
        ],
        features: ['💎 Золотая рамка VIP', 'VIP-значок на карточке', 'Подъём в поиске', 'Приоритетный показ']
    },
    {
        id: 'urgent', icon: '🔥', name: 'Срочно',
        tagline: 'Красный бейдж «Срочно»',
        gradient: 'linear-gradient(135deg,#e74c3c,#c0392b)',
        durations: [
            { days: 3, price: 99, label: '3 дня' },
            { days: 7, price: 199, label: '7 дней', recommended: true }
        ],
        features: ['🔥 Бейдж «Срочно»', 'Выделение красным', 'Привлекает внимание']
    }
];

const PAY_METHODS = [
    { id: 'card',     icon: '💳', name: 'Карта',     desc: 'Visa / MasterCard / Эл-карт' },
    { id: 'odengi',   icon: '📱', name: 'O!Деньги',  desc: 'Кошелёк O!' },
    { id: 'mbank',    icon: '🏦', name: 'MBank',     desc: 'Перевод по номеру' }
];

function showPackageModal(draft) {
    const modal = document.getElementById("packageModal");
    if (!modal) { submitAdWithPackage(draft, "free"); return; }
    const sheet = modal.querySelector('.pkg-sheet');

    // Рендерим карточки тарифов
    sheet.innerHTML = `
        <button type="button" class="pkg-x" aria-label="Закрыть">&times;</button>
        <div class="pkg-head">
            <div class="pkg-head-icon">🚀</div>
            <h3>Сделайте объявление заметнее</h3>
            <p>Платные тарифы продают объявления <b>в 3–5 раз быстрее</b></p>
        </div>
        <div class="pkg-tiers">
            ${PROMO_PACKAGES.map(p => renderPackageCard(p)).join('')}
        </div>
        <div class="pkg-foot">
            <i class="fas fa-shield-alt"></i> Безопасная оплата · Отмена в любой момент
        </div>
    `;

    // Состояние выбранной длительности на карточку
    sheet.querySelectorAll('.pkg-tier').forEach(card => {
        const pkgId = card.dataset.pkg;
        card.querySelectorAll('.pkg-dur').forEach(durBtn => {
            durBtn.addEventListener('click', () => {
                card.querySelectorAll('.pkg-dur').forEach(b => b.classList.toggle('active', b === durBtn));
                const price = Number(durBtn.dataset.price || 0);
                const days = Number(durBtn.dataset.days || 0);
                card.querySelector('.pkg-cta-price').textContent = price > 0 ? `${price.toLocaleString('ru-RU')} сом` : 'Бесплатно';
                card.querySelector('.pkg-cta')?.setAttribute('data-days', days);
                card.querySelector('.pkg-cta')?.setAttribute('data-price', price);
            });
        });
        card.querySelector('.pkg-cta')?.addEventListener('click', () => {
            const days = Number(card.querySelector('.pkg-cta').dataset.days || 0);
            const price = Number(card.querySelector('.pkg-cta').dataset.price || 0);
            closePackageModal();
            if (pkgId === 'free' || price === 0) {
                submitAdWithPackage(draft, pkgId, { days, price });
            } else {
                showPaymentModal(draft, pkgId, { days, price });
            }
        });
    });

    sheet.querySelector('.pkg-x').addEventListener('click', closePackageModal);
    modal.querySelector('.pkg-backdrop').addEventListener('click', closePackageModal);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

function renderPackageCard(p) {
    const recommended = p.durations.find(d => d.recommended) || p.durations[0];
    return `
        <article class="pkg-tier ${p.id === 'free' ? 'pkg-tier--free' : ''}" data-pkg="${p.id}" style="--pkg-grad:${p.gradient};">
            ${p.badge ? `<div class="pkg-badge">${p.badge}</div>` : ''}
            <div class="pkg-tier-head">
                <div class="pkg-tier-icon">${p.icon}</div>
                <div>
                    <div class="pkg-tier-name">${p.name}</div>
                    <div class="pkg-tier-tagline">${p.tagline}</div>
                </div>
            </div>
            <ul class="pkg-features">
                ${p.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
            </ul>
            ${p.durations.length > 1 ? `
                <div class="pkg-durations">
                    ${p.durations.map(d => `
                        <button type="button" class="pkg-dur ${d === recommended ? 'active' : ''}" data-days="${d.days}" data-price="${d.price}">
                            <span class="pkg-dur-label">${d.label}</span>
                            <span class="pkg-dur-price">
                                ${d.oldPrice ? `<s>${d.oldPrice}</s>` : ''}
                                <b>${d.price} c</b>
                            </span>
                            ${d.discount ? `<span class="pkg-dur-discount">${d.discount}</span>` : ''}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
            <button type="button" class="pkg-cta" data-days="${recommended.days}" data-price="${recommended.price}">
                ${p.id === 'free'
                    ? `<span>Опубликовать бесплатно</span>`
                    : `<span>Выбрать</span><span class="pkg-cta-price">${recommended.price.toLocaleString('ru-RU')} сом</span>`}
            </button>
        </article>
    `;
}

function closePackageModal() {
    const modal = document.getElementById('packageModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
    document.body.style.overflow = '';
}

function showPaymentModal(draft, pkg, opts = {}) {
    const modal = document.getElementById('paymentModal');
    if (!modal) { submitAdWithPackage(draft, pkg, opts); return; }
    const sheet = modal.querySelector('.pay-sheet');
    const pkgInfo = PROMO_PACKAGES.find(p => p.id === pkg);
    const days = opts.days || (pkgInfo?.durations[0].days || 0);
    const price = opts.price || (pkgInfo?.durations[0].price || 0);

    sheet.innerHTML = `
        <button type="button" class="pay-x" aria-label="Закрыть">&times;</button>
        <div class="pay-step" data-step="1">
            <div class="pay-summary" style="--pkg-grad:${pkgInfo?.gradient || ''};">
                <div class="pay-summary-icon">${pkgInfo?.icon || '💳'}</div>
                <div>
                    <div class="pay-summary-name">${pkgInfo?.name || 'Пакет'} · ${days} дн.</div>
                    <div class="pay-summary-tagline">${pkgInfo?.tagline || ''}</div>
                </div>
                <div class="pay-summary-price">${price.toLocaleString('ru-RU')} <span>сом</span></div>
            </div>

            <div class="pay-methods">
                ${PAY_METHODS.map((m, i) => `
                    <label class="pay-method ${i === 0 ? 'active' : ''}">
                        <input type="radio" name="payMethod" value="${m.id}" ${i === 0 ? 'checked' : ''}>
                        <div class="pay-method-icon">${m.icon}</div>
                        <div class="pay-method-info">
                            <div class="pay-method-name">${m.name}</div>
                            <div class="pay-method-desc">${m.desc}</div>
                        </div>
                        <i class="fas fa-check pay-method-check"></i>
                    </label>
                `).join('')}
            </div>

            <div class="pay-form" data-method="card">
                <div class="pay-field">
                    <label>Номер карты</label>
                    <div class="pay-card-input">
                        <i class="far fa-credit-card pay-card-brand"></i>
                        <input type="text" id="payCardNum" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000">
                    </div>
                </div>
                <div class="pay-row">
                    <div class="pay-field">
                        <label>Срок</label>
                        <input type="text" id="payCardExp" inputmode="numeric" maxlength="5" placeholder="MM/ГГ">
                    </div>
                    <div class="pay-field">
                        <label>CVC</label>
                        <input type="password" id="payCardCvv" inputmode="numeric" maxlength="3" placeholder="•••">
                    </div>
                </div>
                <div class="pay-field">
                    <label>Имя владельца</label>
                    <input type="text" id="payCardName" placeholder="IVAN IVANOV" autocomplete="cc-name">
                </div>
            </div>

            <div class="pay-form pay-form-wallet" data-method="wallet" style="display:none;">
                <div class="pay-field">
                    <label>Номер телефона кошелька</label>
                    <input type="tel" id="payWalletPhone" placeholder="+996 555 123 456">
                </div>
                <p class="pay-hint"><i class="fas fa-info-circle"></i> Подтвердите оплату в приложении</p>
            </div>

            <button type="button" class="pay-submit">
                <i class="fas fa-lock"></i>
                <span>Оплатить ${price.toLocaleString('ru-RU')} сом</span>
            </button>
            <p class="pay-secure">🔒 Демо-режим · Реальные деньги не списываются</p>
        </div>

        <div class="pay-step" data-step="2" style="display:none;">
            <div class="pay-spinner"></div>
            <h4>Обработка платежа...</h4>
            <p>Не закрывайте окно</p>
        </div>

        <div class="pay-step" data-step="3" style="display:none;">
            <div class="pay-success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h4>Оплата прошла успешно!</h4>
            <p>Публикуем ваше объявление...</p>
        </div>
    `;

    // Закрытие
    sheet.querySelector('.pay-x').addEventListener('click', closePaymentModal);
    modal.querySelector('.pay-backdrop').addEventListener('click', closePaymentModal);

    // Переключение методов оплаты
    const methodLabels = sheet.querySelectorAll('.pay-method');
    const cardForm = sheet.querySelector('[data-method="card"]');
    const walletForm = sheet.querySelector('[data-method="wallet"]');
    methodLabels.forEach(lbl => {
        lbl.addEventListener('click', () => {
            methodLabels.forEach(l => l.classList.remove('active'));
            lbl.classList.add('active');
            const method = lbl.querySelector('input').value;
            const isCard = method === 'card';
            cardForm.style.display = isCard ? '' : 'none';
            walletForm.style.display = isCard ? 'none' : '';
        });
    });

    // Маска карты
    const cardNum = sheet.querySelector('#payCardNum');
    const cardExp = sheet.querySelector('#payCardExp');
    const cardCvv = sheet.querySelector('#payCardCvv');
    const brandIcon = sheet.querySelector('.pay-card-brand');
    cardNum?.addEventListener('input', () => {
        let v = cardNum.value.replace(/\D/g, '').slice(0, 16);
        cardNum.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Brand detection
        const first = v[0];
        brandIcon.className = 'fab pay-card-brand ' + (
            first === '4' ? 'fa-cc-visa' :
            first === '5' ? 'fa-cc-mastercard' :
            first === '3' ? 'fa-cc-amex' : ''
        );
        if (!first) brandIcon.className = 'far fa-credit-card pay-card-brand';
    });
    cardExp?.addEventListener('input', () => {
        let v = cardExp.value.replace(/\D/g, '').slice(0, 4);
        if (v.length >= 3) v = v.slice(0, 2) + '/' + v.slice(2);
        cardExp.value = v;
    });
    cardCvv?.addEventListener('input', () => { cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 3); });

    // Сабмит
    sheet.querySelector('.pay-submit').addEventListener('click', () => {
        const method = sheet.querySelector('input[name=payMethod]:checked').value;
        let valid = true;
        if (method === 'card') {
            const num = (cardNum?.value || '').replace(/\s/g, '');
            if (num.length < 16) { cardNum.classList.add('pay-err'); valid = false; } else cardNum.classList.remove('pay-err');
            if ((cardExp?.value || '').length < 5) { cardExp.classList.add('pay-err'); valid = false; } else cardExp.classList.remove('pay-err');
            if ((cardCvv?.value || '').length < 3) { cardCvv.classList.add('pay-err'); valid = false; } else cardCvv.classList.remove('pay-err');
        } else {
            const phone = sheet.querySelector('#payWalletPhone');
            if ((phone?.value || '').replace(/\D/g, '').length < 9) { phone.classList.add('pay-err'); valid = false; } else phone.classList.remove('pay-err');
        }
        if (!valid) return;

        // Анимация: шаги 2 → 3
        const s1 = sheet.querySelector('[data-step="1"]');
        const s2 = sheet.querySelector('[data-step="2"]');
        const s3 = sheet.querySelector('[data-step="3"]');
        s1.style.display = 'none'; s2.style.display = '';
        setTimeout(() => {
            s2.style.display = 'none'; s3.style.display = '';
            setTimeout(() => {
                closePaymentModal();
                submitAdWithPackage(draft, pkg, { days, price, paymentMethod: method });
            }, 1400);
        }, 1800);
    });

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (!modal) return;
    modal.classList.remove('is-open');
    setTimeout(() => { modal.style.display = 'none'; }, 200);
    document.body.style.overflow = '';
}

async function submitAdWithPackage(draft, pkg, opts = {}) {
    const submitBtn = document.querySelector("#createAdForm button[type='submit']");
    if (submitBtn) setButtonLoading(submitBtn, true, "Публикация...");

    if (pkg && pkg !== 'free') {
        draft.packageRequested = pkg;
        draft.packageDays = opts.days || 0;
        draft.packagePrice = opts.price || 0;
        if (opts.paymentMethod) draft.paymentMethod = opts.paymentMethod;
        if (opts.days) {
            draft.boostedUntil = new Date(Date.now() + opts.days * 86400000).toISOString();
        }
        // Проставляем флаги пакета сразу, чтобы после одобрения модерацией
        // объявление появилось на главной/с VIP-значком автоматически
        draft.paidPlacement = true;
        if (pkg === 'featured') {
            draft.featuredOnHome = true;
        } else if (pkg === 'vip') {
            draft.vip = true;
            draft.featuredOnHome = true;
        } else if (pkg === 'urgent') {
            draft.urgent = true;
        }
    }

    try {
        const docId = await createAdInFirestore(draft);
        try {
            const localAds = storage.getAds();
            localAds.push({ id: docId, ...draft });
            storage.setAds(localAds);
        } catch (e) {}

        const pkgInfo = (typeof PROMO_PACKAGES !== 'undefined') ? PROMO_PACKAGES.find(p => p.id === pkg) : null;
        if (pkg === "free") {
            showToast("Объявление отправлено на модерацию", "success");
        } else if (pkgInfo) {
            showToast(`Объявление отправлено! Пакет «${pkgInfo.name}» активируется после подтверждения оплаты.`, "success");
        }
        showConfetti();
        setTimeout(() => { window.location.href = "profile.html"; }, 1800);
    } catch (err) {
        const code = err?.code || "";
        if (code.includes("permission-denied")) {
            showToast("Firestore закрыт правилами. Разреши запись (Rules).", "error");
        } else if (code.includes("unauthorized-domain")) {
            showToast("Домен не разрешён в Firebase. Добавь его в Authorized domains.", "error");
        } else {
            showToast("Не удалось отправить объявление. Попробуй позже.", "error");
        }
    } finally {
        if (submitBtn) setButtonLoading(submitBtn, false);
    }
}

function initProfile() {
    const page = document.body?.getAttribute("data-page");
    if (page !== "profile") return;
    const user = storage.getCurrentUser();
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const renderHeader = () => {
        const header = document.getElementById("profileHeader");
        header.innerHTML = `
            <div class="profile-card">
                <button class="btn-settings-icon" onclick="openSettings()"><i class="fas fa-cog"></i></button>
                <div class="user-avatar-container"><div class="user-avatar">${(user.name || "U")[0].toUpperCase()}</div></div>
                <div class="user-info"><h2 class="user-name">${user.name || "User"}</h2><p class="user-contact">${user.email}</p></div>
                <div style="margin-top:16px;"><a href="add.html" class="btn-submit" style="display:inline-block; width:auto; padding:10px 18px;">Подать объявление</a></div>
            </div>`;
    };

    const statusText = { active: "Опубликовано", pending: "На модерации", rejected: "Отклонено" };
    const statusClass = { active: "status-active", pending: "status-pending", rejected: "status-rejected" };

    const renderAds = (tab = "active") => {
        const list = document.getElementById("myAdsList");
        const myAds = storage.getAds().filter((ad) => ad.authorId === user.id && ad.status === tab);
        list.innerHTML = myAds.length ? myAds.map((ad) => `
            <div class="my-ad-card">
                <img src="${getMainImage(ad)}" class="my-ad-img" alt="">
                <div class="my-ad-content">
                    <div class="my-ad-price">${formatPrice(ad.price)}</div>
                    <div class="my-ad-title">${getCatName(ad.category)} - ${ad.address}</div>
                    <div class="status-badge ${statusClass[ad.status] || "status-pending"}">${statusText[ad.status] || ad.status}</div>
                    ${ad.status === "rejected" && ad.moderationComment ? `<div class="field-error" style="margin-top:8px;">Причина: ${ad.moderationComment}</div>` : ""}
                </div>
                <div class="ad-actions-row">
                    <button class="btn-mini-action btn-edit" onclick="openEditModal('${ad.id}')"><i class="fas fa-pen"></i></button>
                    <button class="btn-mini-action btn-del" onclick="deleteMyAd('${ad.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </div>`).join("") : "<p>У вас пока нет объявлений в этом разделе.</p>";
    };

    let currentProfileChatId = null;

    const renderChatThread = (chatId) => {
        const chat = storage.getChats().find((c) => c.id === chatId);
        const thread = document.getElementById("profileChatThread");
        if (!thread || !chat) return;
        thread.innerHTML = `
            <div id="profileChatMessages" style="max-height:260px; overflow:auto; background:#f8f9fb; border-radius:10px; padding:10px; margin-bottom:10px;">
                ${(chat.messages || []).map((m) => `<div style="margin:6px 0; text-align:${m.from === user.id ? "right" : "left"};"><span style="display:inline-block; background:${m.from === user.id ? "#ffe7df" : "#eef2f7"}; padding:8px 10px; border-radius:10px;">${m.text}<br><small style="opacity:.7;">${new Date(m.at).toLocaleString("ru-RU")}</small></span></div>`).join("") || "<p>Пока нет сообщений.</p>"}
            </div>
            <div style="display:flex; gap:8px;">
                <input id="profileChatInput" class="modal-input" placeholder="Введите сообщение..." style="margin:0;">
                <button id="profileChatSendBtn" class="btn-submit" style="width:auto; margin:0; padding:10px 14px;">Отправить</button>
            </div>
        `;
        const box = document.getElementById("profileChatMessages");
        if (box) box.scrollTop = box.scrollHeight;
        document.getElementById("profileChatSendBtn")?.addEventListener("click", () => {
            const input = document.getElementById("profileChatInput");
            const text = input.value.trim();
            if (!text) return;
            const chats = storage.getChats();
            const idx = chats.findIndex((c) => c.id === chatId);
            if (idx < 0) return;
            chats[idx].messages.push({ from: user.id, text, at: new Date().toISOString() });
            storage.setChats(chats);
            input.value = "";
            renderChatThread(chatId);
        });
    };

    const renderChats = () => {
        const list = document.getElementById("myAdsList");
        const chats = storage.getChats().filter((c) => c.participants.includes(user.id));
        const unreadCount = chats.reduce((acc, c) => acc + (c.messages || []).filter((m) => m.from !== user.id && !m.readBy?.includes(user.id)).length, 0);
        list.innerHTML = chats.length ? `
            <div class="card-style"><h3>Диалоги <span class="count-badge">${unreadCount}</span></h3></div>
            ${chats.map((c) => {
            const ad = storage.getAds().find((a) => a.id === c.adId);
            const last = c.messages[c.messages.length - 1];
            return `<div class="my-ad-card">
                <div class="my-ad-content">
                    <div class="my-ad-price">Чат: ${ad ? `${getCatName(ad.category)} - ${ad.address}` : c.adId}</div>
                    <div class="my-ad-title">${last ? `${new Date(last.at).toLocaleString("ru-RU")} - ${last.text}` : "Без сообщений"}</div>
                </div>
                <div class="ad-actions-row">
                    <button class="btn-mini-action btn-edit" onclick="openChatFromProfile('${c.id}')"><i class="fas fa-comments"></i></button>
                </div>
            </div>`;
        }).join("")}
            <div id="profileChatThread" class="card-style"></div>
        ` : "<p>У вас пока нет чатов.</p>";
        if (chats.length) {
            currentProfileChatId = chats[0].id;
            renderChatThread(currentProfileChatId);
        }
    };

    let pendingPayment = null;
    let threeDsExpectedCode = null;

    const luhnCheck = (digits) => {
        let sum = 0;
        let shouldDouble = false;
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = Number(digits[i]);
            if (shouldDouble) {
                digit *= 2;
                if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
    };

    const formatCardInput = (value) => value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();

    const validatePaymentForm = () => {
        const cardEl = document.getElementById("payCardNumber");
        const expEl = document.getElementById("payCardExp");
        const cvvEl = document.getElementById("payCardCvv");
        const holderEl = document.getElementById("payCardHolder");
        const modal = document.getElementById("paymentModal");
        clearFieldErrors(modal);

        const cardDigits = cardEl.value.replace(/\D/g, "");
        const exp = expEl.value.trim();
        const cvv = cvvEl.value.trim();
        const holder = holderEl.value.trim();

        if (cardDigits.length !== 16 || !luhnCheck(cardDigits)) {
            setFieldError(cardEl, "Неверный номер карты");
            return false;
        }
        if (!/^\d{2}\/\d{2}$/.test(exp)) {
            setFieldError(expEl, "Формат MM/YY");
            return false;
        }
        const [mm, yy] = exp.split("/").map(Number);
        if (mm < 1 || mm > 12) {
            setFieldError(expEl, "Месяц 01-12");
            return false;
        }
        const now = new Date();
        const expDate = new Date(2000 + yy, mm, 0, 23, 59, 59);
        if (expDate < now) {
            setFieldError(expEl, "Срок карты истек");
            return false;
        }
        if (!/^\d{3}$/.test(cvv)) {
            setFieldError(cvvEl, "CVV из 3 цифр");
            return false;
        }
        if (holder.length < 3) {
            setFieldError(holderEl, "Введите имя держателя");
            return false;
        }
        return true;
    };

    const applyPackage = (adId, pack) => {
        const ads = storage.getAds();
        const ad = ads.find((x) => x.id === adId && x.authorId === user.id);
        if (!ad) return;
        if (pack === "vip") ad.vip = true;
        if (pack === "urgent") ad.urgent = true;
        if (pack === "boost") {
            ad.boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            ad.date = new Date().toISOString();
        }
        ad.paidPlacement = true;
        storage.setAds(ads);
    };

    const openPaymentModal = (adId, pack) => {
        const prices = { vip: 300, urgent: 150, boost: 100 };
        const labels = { vip: "VIP", urgent: "Срочно", boost: "Поднять на 7 дней" };
        pendingPayment = { adId, pack, price: prices[pack] };

        document.getElementById("paymentPackageTitle").textContent = `Пакет: ${labels[pack]}`;
        document.getElementById("paymentAmount").textContent = `Сумма: ${prices[pack]} сом`;
        document.getElementById("payCardNumber").value = "";
        document.getElementById("payCardExp").value = "";
        document.getElementById("payCardCvv").value = "";
        document.getElementById("payCardHolder").value = "";
        document.getElementById("paymentModal").style.display = "flex";
        document.getElementById("payCardNumber").focus();
    };

    const closePaymentModal = () => {
        const modal = document.getElementById("paymentModal");
        modal.style.display = "none";
        clearFieldErrors(modal);
        pendingPayment = null;
    };

    const closeThreeDsModal = () => {
        const modal = document.getElementById("threeDsModal");
        if (!modal) return;
        modal.style.display = "none";
        const codeInput = document.getElementById("threeDsCode");
        if (codeInput) codeInput.value = "";
    };

    const initPaymentModal = () => {
        const cardInput = document.getElementById("payCardNumber");
        const expInput = document.getElementById("payCardExp");
        const cvvInput = document.getElementById("payCardCvv");
        const holderInput = document.getElementById("payCardHolder");
        const confirmBtn = document.getElementById("confirmPaymentBtn");
        const threeDsConfirmBtn = document.getElementById("threeDsConfirmBtn");
        const threeDsCodeInput = document.getElementById("threeDsCode");
        if (!cardInput || !expInput || !cvvInput || !confirmBtn) return;

        cardInput.addEventListener("input", () => {
            cardInput.value = formatCardInput(cardInput.value);
            if (cardInput.value.replace(/\D/g, "").length === 16) expInput.focus();
        });
        expInput.addEventListener("input", () => {
            const digits = expInput.value.replace(/\D/g, "").slice(0, 4);
            expInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
            if (digits.length === 4) cvvInput.focus();
        });
        cvvInput.addEventListener("input", () => {
            cvvInput.value = cvvInput.value.replace(/\D/g, "").slice(0, 3);
            if (cvvInput.value.length === 3) holderInput.focus();
        });
        holderInput.addEventListener("input", () => {
            holderInput.value = holderInput.value.toUpperCase().replace(/[^A-ZА-ЯЁ\s]/g, "").replace(/\s{2,}/g, " ");
        });

        confirmBtn.addEventListener("click", () => {
            if (!pendingPayment) return;
            if (!validatePaymentForm()) return;
            threeDsExpectedCode = String(Math.floor(100000 + Math.random() * 900000));
            showToast(`Демо 3DS-код: ${threeDsExpectedCode}`, "info");
            document.getElementById("threeDsModal").style.display = "flex";
            threeDsCodeInput?.focus();
        });

        threeDsCodeInput?.addEventListener("input", () => {
            threeDsCodeInput.value = threeDsCodeInput.value.replace(/\D/g, "").slice(0, 6);
        });

        threeDsConfirmBtn?.addEventListener("click", () => {
            if (!pendingPayment) return;
            const entered = (threeDsCodeInput?.value || "").trim();
            if (entered !== threeDsExpectedCode) {
                setFieldError(threeDsCodeInput, "Неверный код подтверждения");
                return;
            }
            applyPackage(pendingPayment.adId, pendingPayment.pack);
            showToast("Оплата прошла успешно", "success");
            closeThreeDsModal();
            closePaymentModal();
            renderServices();
        });
    };

    const renderServices = () => {
        const list = document.getElementById("myAdsList");
        const myActiveAds = storage.getAds().filter((ad) => ad.authorId === user.id && ad.status === "active");
        list.innerHTML = `
            <div class="card-style">
                <h3 style="margin-bottom:10px;">Продвижение объявлений</h3>
                <p style="margin-top:10px;color:#777;">Оплата только картой. Пакеты: VIP (300), Срочно (150), Поднять (100)</p>
            </div>
            ${myActiveAds.map((ad) => `
                <div class="my-ad-card">
                    <img src="${getMainImage(ad)}" class="my-ad-img" alt="">
                    <div class="my-ad-content">
                        <div class="my-ad-price">${getCatName(ad.category)} - ${ad.address}</div>
                        <div class="my-ad-title">VIP: ${ad.vip ? "Да" : "Нет"}, Срочно: ${ad.urgent ? "Да" : "Нет"}</div>
                    </div>
                    <div class="ad-actions-row">
                        <button class="btn-mini-action btn-edit" onclick="startPackagePayment('${ad.id}','vip')">VIP</button>
                        <button class="btn-mini-action btn-edit" onclick="startPackagePayment('${ad.id}','urgent')">!</button>
                        <button class="btn-mini-action btn-edit" onclick="startPackagePayment('${ad.id}','boost')">UP</button>
                    </div>
                </div>`).join("")}
        `;
    };

    const renderSupport = () => {
        const list = document.getElementById("myAdsList");
        const myRequests = storage.getSupportRequests().filter((x) => x.userId === user.id);
        list.innerHTML = `
            <div class="card-style">
                <h3 style="margin-bottom:10px;">Обращение в поддержку</h3>
                <p style="margin-bottom:10px; color:#666;">Если есть проблема с объявлением, оплатой или модерацией — отправьте обращение.</p>
                <input id="supportSubject" class="modal-input" placeholder="Тема обращения">
                <textarea id="supportText" class="modal-input" rows="4" placeholder="Опишите вопрос подробнее"></textarea>
                <button class="btn-submit" onclick="sendSupportRequest()">Отправить обращение</button>
            </div>
            <div class="card-style">
                <h3>История обращений</h3>
                ${myRequests.length ? myRequests.map((r) => `<p><strong>${new Date(r.createdAt).toLocaleString("ru-RU")}</strong> — ${r.subject} (${r.status})</p>`).join("") : "<p>Пока нет обращений.</p>"}
            </div>
        `;
    };

    window.switchTab = (tab) => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        const activeBtn = tab === "active" ? 0 : tab === "pending" ? 1 : tab === "rejected" ? 2 : tab === "chats" ? 3 : tab === "services" ? 4 : 5;
        document.querySelectorAll(".tab-btn")[activeBtn]?.classList.add("active");
        
        // Update mobile dropdown
        document.querySelectorAll(".mobile-tab-item").forEach((b) => b.classList.remove("active"));
        const mobileActiveBtn = tab === "active" ? 0 : tab === "pending" ? 1 : tab === "rejected" ? 2 : tab === "chats" ? 3 : tab === "services" ? 4 : 5;
        document.querySelectorAll(".mobile-tab-item")[mobileActiveBtn]?.classList.add("active");
        
        // Update dropdown button label
        const tabLabels = {
            'active': 'Активные',
            'pending': 'На проверке',
            'rejected': 'Отклоненные',
            'chats': 'Чаты',
            'services': 'Продвижение',
            'support': 'Обращение'
        };
        const labelEl = document.getElementById('currentTabLabel');
        if (labelEl) labelEl.textContent = tabLabels[tab] || 'Активные';
        
        if (tab === "chats") return renderChats();
        if (tab === "services") return renderServices();
        if (tab === "support") return renderSupport();
        renderAds(tab);
    };
    
    window.toggleMobileTabs = () => {
        const dropdown = document.getElementById('mobileTabsDropdown');
        const menu = document.getElementById('mobileTabsMenu');
        if (dropdown && menu) {
            dropdown.classList.toggle('open');
            menu.classList.toggle('open');
        }
    };
    window.openEditModal = (id) => {
        const ad = storage.getAds().find((x) => x.id === id);
        if (!ad) return;
        document.getElementById("editAdId").value = id;
        document.getElementById("editPrice").value = ad.price || "";
        document.getElementById("editAddress").value = ad.address || "";
        document.getElementById("editDesc").value = ad.description || "";
        document.getElementById("editModal").style.display = "flex";
    };
    window.closeEditModal = () => { document.getElementById("editModal").style.display = "none"; };
    window.saveEditedAd = () => {
        const id = document.getElementById("editAdId").value;
        const ads = storage.getAds();
        const ad = ads.find((x) => x.id === id);
        if (!ad) return;
        ad.price = Number(document.getElementById("editPrice").value || ad.price);
        ad.address = document.getElementById("editAddress").value.trim();
        ad.description = document.getElementById("editDesc").value.trim();
        if (ad.status === "rejected") {
            ad.status = "pending";
            delete ad.moderationComment;
        }
        storage.setAds(ads);
        closeEditModal();
        switchTab("active");
    };
    window.deleteMyAd = (id) => {
        const ads = storage.getAds().filter((x) => x.id !== id);
        storage.setAds(ads);
        switchTab("active");
    };
    window.openSettings = () => {
        document.getElementById("editProfileName").value = user.name || "";
        document.getElementById("settingsModal").style.display = "flex";
    };
    window.saveProfileSettings = () => {
        const nextName = document.getElementById("editProfileName").value.trim();
        if (!nextName) return;
        const current = storage.getCurrentUser();
        current.name = nextName;
        storage.setCurrentUser(current);
        const users = storage.getUsers();
        const u = users.find((x) => x.id === current.id);
        if (u) u.name = nextName;
        storage.setUsers(users);
        window.location.reload();
    };
    window.logoutProfile = () => { storage.clearCurrentUser(); window.location.href = "index.html"; };
    window.openChatFromProfile = (chatId) => {
        currentProfileChatId = chatId;
        renderChatThread(chatId);
        const all = storage.getChats();
        const idx = all.findIndex((c) => c.id === chatId);
        if (idx >= 0) {
            all[idx].messages = (all[idx].messages || []).map((m) => m.from === user.id ? m : { ...m, readBy: [...new Set([...(m.readBy || []), user.id])] });
            storage.setChats(all);
        }
    };
    window.startPackagePayment = (adId, pack) => openPaymentModal(adId, pack);
    window.closePaymentModal = closePaymentModal;
    window.sendSupportRequest = () => {
        const subject = document.getElementById("supportSubject")?.value.trim();
        const text = document.getElementById("supportText")?.value.trim();
        if (!subject || !text) return showToast("Заполните тему и текст обращения", "error");
        const requests = storage.getSupportRequests();
        requests.push({ id: `sup_${Date.now()}`, userId: user.id, subject, text, status: "new", createdAt: new Date().toISOString() });
        storage.setSupportRequests(requests);
        showToast("Обращение отправлено. Мы свяжемся с вами.", "success");
        renderSupport();
    };

    renderHeader();
    initPaymentModal();
    renderAds("active");
}

let _adminCurrentAds = [];

function initAdminPages() {
    const path = window.location.pathname;
    const isAdminLogin = path.includes('/admin/login');
    const isAdminIndex = path.includes('/admin/') && !path.includes('/admin/login');
    if (isAdminLogin) {
        // Login is handled by inline script in admin/login.html
    }
    if (isAdminIndex) {
        document.getElementById("adminLogoutBtn")?.addEventListener("click", () => {
            localStorage.removeItem("oshAdminLoggedIn");
            const s = getFirebaseServices();
            if (s) s.auth.signOut().catch(() => {});
            window.location.href = "login.html";
        });
        document.querySelectorAll("[data-admin-slide]").forEach((btn) => btn.addEventListener("click", () => {
            document.querySelectorAll("[data-admin-slide]").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const slide = btn.getAttribute("data-admin-slide");
            document.querySelectorAll(".admin-slide").forEach((el) => { el.style.display = "none"; });
            const target = document.getElementById("adminSlide" + slide.charAt(0).toUpperCase() + slide.slice(1));
            if (target) target.style.display = "flex";
        }));
        loadAdminData();
    }
}

async function loadAdminData() {
    const services = getFirebaseServices();
    let ads = [];
    if (services) {
        // Wait for Firebase auth state to be restored (handles page reload)
        const user = await new Promise((resolve) => {
            const unsub = services.auth.onAuthStateChanged((u) => { unsub(); resolve(u); });
        });
        if (!user) {
            // Try signing in anonymously once more before giving up
            try { await services.auth.signInAnonymously(); } catch(e) {}
        }
        try {
            const snap = await services.db.collection("ads").orderBy("createdAt", "desc").get();
            ads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            storage.setAds(ads);
        } catch (e) {
            ads = storage.getAds();
        }
    } else {
        ads = storage.getAds();
    }
    _adminCurrentAds = ads;
    renderAdminAds(ads);
}

function renderAdminAds(ads) {
    const reports = storage.getReports().filter((r) => r.status === "open");
    document.getElementById("pendingCount").textContent = String(ads.filter((a) => a.status === "pending").length);
    document.getElementById("activeCount").textContent = String(ads.filter((a) => a.status === "active").length);
    document.getElementById("rejectedCount").textContent = String(ads.filter((a) => a.status === "rejected").length);
    document.getElementById("reportsCount").textContent = String(reports.length);

    const makeCard = (ad) => `
        <div class="admin-card">
            <img class="admin-img" src="${getMainImage(ad)}" alt="">
            <div class="admin-info">
                <h4>${getCatName(ad.category)} — ${ad.address || "—"}</h4>
                <p>${formatPrice(ad.price)} | ${ad.area || 0} м²${ad.rooms > 0 ? " | " + ad.rooms + " комн." : ""}</p>
                <p>Автор: ${ad.authorName || ad.authorId || "—"}</p>
                <p>Тип: ${ad.type === "rent" ? "Аренда" : "Продажа"} | <b>${ad.status}</b>${ad.packageRequested && ad.packageRequested !== "free" ? ` | <span style="background:${ad.packageRequested === "vip" ? "#f39c12" : "#3498db"};color:white;padding:2px 8px;border-radius:10px;font-size:0.78rem;">${ad.packageRequested === "vip" ? "💎 VIP" : "⭐ На главную"}</span>` : ""}</p>
                ${ad.moderationComment ? `<p style="color:#c0392b;">Причина: ${ad.moderationComment}</p>` : ""}
            </div>
            <div class="admin-actions">
                <button class="btn-mini btn-details" onclick="adminShowDetails('${ad.id}')" title="Подробнее"><i class="fas fa-eye"></i></button>
                ${ad.status === "pending" ? `
                    <button class="btn-mini btn-approve" data-approve="${ad.id}" title="Одобрить"><i class="fas fa-check"></i></button>
                    <button class="btn-mini btn-reject" data-reject="${ad.id}" title="Отклонить"><i class="fas fa-times"></i></button>
                ` : ""}
                ${ad.status === "active" ? `
                    <button class="btn-mini ${ad.paidPlacement ? "btn-approve" : "btn-mini-off"}" data-paid="${ad.id}" title="Оплата: ${ad.paidPlacement ? "Да" : "Нет"}"><i class="fas fa-money-bill"></i></button>
                    <button class="btn-mini ${ad.featuredOnHome ? "btn-approve" : "btn-mini-off"}" data-feature="${ad.id}" title="На главной: ${ad.featuredOnHome ? "Да" : "Нет"}"><i class="fas fa-star"></i></button>
                    <button class="btn-mini ${ad.vip ? "btn-approve" : "btn-mini-off"}" data-vip="${ad.id}" title="VIP: ${ad.vip ? "Да" : "Нет"}"><i class="fas fa-gem"></i></button>
                    <button class="btn-mini btn-approve" data-boost="${ad.id}" title="Поднять на 7 дней"><i class="fas fa-arrow-up"></i></button>
                    <button class="btn-mini btn-reject" data-reject="${ad.id}" title="Отклонить"><i class="fas fa-ban"></i></button>
                ` : ""}
                ${ad.status === "rejected" ? `
                    <button class="btn-mini btn-approve" data-approve="${ad.id}" title="Одобрить заново"><i class="fas fa-redo"></i></button>
                ` : ""}
                <button class="btn-mini" style="background:#f8d7da;color:#721c24;" data-delete="${ad.id}" title="Удалить"><i class="fas fa-trash"></i></button>
            </div>
        </div>`;

    const pending = ads.filter((a) => a.status === "pending");
    const active = ads.filter((a) => a.status === "active");
    const rejected = ads.filter((a) => a.status === "rejected");

    document.getElementById("adminSlidePending").innerHTML = pending.length ? pending.map(makeCard).join("") : '<p style="padding:30px;text-align:center;color:#999;">Нет объявлений на модерации</p>';
    document.getElementById("adminSlideActive").innerHTML = active.length ? active.map(makeCard).join("") : '<p style="padding:30px;text-align:center;color:#999;">Нет опубликованных объявлений</p>';
    document.getElementById("adminSlideRejected").innerHTML = rejected.length ? rejected.map(makeCard).join("") : '<p style="padding:30px;text-align:center;color:#999;">Нет отклоненных объявлений</p>';

    const reportsList = document.getElementById("adminReportsList");
    if (reportsList) {
        reportsList.innerHTML = reports.length
            ? reports.map((r) => `<div class="admin-card"><div class="admin-info"><h4>Жалоба на объявление #${r.adId}</h4><p>${r.reason || "—"}</p><p>${r.date || ""}</p></div></div>`).join("")
            : '<p style="padding:20px;text-align:center;color:#999;">Жалоб нет</p>';
    }

    bindAdminButtons();
}

function bindAdminButtons() {
    const services = getFirebaseServices();

    const updateAdInFirestore = async (id, data) => {
        if (services && services.auth.currentUser) {
            try {
                await services.db.collection("ads").doc(id).update(data);
            } catch (e) {
                showToast("Ошибка Firestore: " + (e.code || e.message), "error");
                return false;
            }
        }
        const local = storage.getAds();
        const idx = local.findIndex((a) => a.id === id);
        if (idx >= 0) Object.assign(local[idx], data);
        storage.setAds(local);
        const cidx = _adminCurrentAds.findIndex((a) => a.id === id);
        if (cidx >= 0) Object.assign(_adminCurrentAds[cidx], data);
        return true;
    };

    document.querySelectorAll("[data-approve]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-approve");
            const ok = await updateAdInFirestore(id, { status: "active", moderationComment: "", publishedAt: new Date().toISOString() });
            if (ok) { showToast("Объявление одобрено ✓", "success"); renderAdminAds(_adminCurrentAds); }
        });
    });

    document.querySelectorAll("[data-reject]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-reject");
            const reason = prompt("Причина отклонения:");
            if (reason === null) return;
            const ok = await updateAdInFirestore(id, { status: "rejected", moderationComment: reason.trim() });
            if (ok) { showToast("Объявление отклонено", "info"); renderAdminAds(_adminCurrentAds); }
        });
    });

    document.querySelectorAll("[data-paid]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-paid");
            const ad = _adminCurrentAds.find((a) => a.id === id);
            if (!ad) return;
            const newVal = !ad.paidPlacement;
            await updateAdInFirestore(id, { paidPlacement: newVal, featuredOnHome: newVal ? !!ad.featuredOnHome : false });
            renderAdminAds(_adminCurrentAds);
        });
    });

    document.querySelectorAll("[data-feature]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-feature");
            const ad = _adminCurrentAds.find((a) => a.id === id);
            if (!ad) return;
            if (!ad.paidPlacement) { showToast("Сначала отметьте как оплаченное", "error"); return; }
            await updateAdInFirestore(id, { featuredOnHome: !ad.featuredOnHome });
            renderAdminAds(_adminCurrentAds);
        });
    });

    document.querySelectorAll("[data-vip]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-vip");
            const ad = _adminCurrentAds.find((a) => a.id === id);
            if (!ad) return;
            await updateAdInFirestore(id, { vip: !ad.vip });
            renderAdminAds(_adminCurrentAds);
        });
    });

    document.querySelectorAll("[data-boost]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-boost");
            await updateAdInFirestore(id, {
                boostedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                date: new Date().toISOString()
            });
            showToast("Объявление поднято на 7 дней", "success");
            renderAdminAds(_adminCurrentAds);
        });
    });

    document.querySelectorAll("[data-delete]").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-delete");
            if (!confirm("Удалить это объявление навсегда?")) return;
            if (services && services.auth.currentUser) {
                try {
                    await services.db.collection("ads").doc(id).delete();
                } catch (e) {
                    showToast("Ошибка удаления: " + (e.code || e.message), "error");
                    return;
                }
            }
            const local = storage.getAds().filter((a) => a.id !== id);
            storage.setAds(local);
            _adminCurrentAds = _adminCurrentAds.filter((a) => a.id !== id);
            showToast("Объявление удалено", "success");
            renderAdminAds(_adminCurrentAds);
        });
    });
}

window.adminShowDetails = function(id) {
    const ad = _adminCurrentAds.find((a) => a.id === id);
    if (!ad) return;
    const modal = document.getElementById("adminDetailsModal");
    const content = document.getElementById("adminDetailsContent");
    if (!modal || !content) return;
    const labels = {
        id: "ID документа", type: "Тип сделки", category: "Категория", status: "Статус",
        address: "Адрес", price: "Цена", area: "Площадь (м²)", rooms: "Комнат",
        floor: "Этаж", totalFloors: "Этажей в доме", furniture: "Мебель",
        landPurpose: "Назначение участка", commerceType: "Тип коммерции",
        description: "Описание", phone: "Телефон", authorId: "ID автора",
        authorName: "Имя автора", authorUid: "UID Firebase", date: "Дата подачи",
        createdAt: "Создано (Firestore)", publishedAt: "Дата публикации",
        paidPlacement: "Оплачено", featuredOnHome: "На главной", vip: "VIP",
        urgent: "Срочно", boostedUntil: "Поднято до", moderationComment: "Причина отклонения",
        lat: "Широта", lng: "Долгота",
        packageRequested: "Запрошенный пакет"
    };
    const rows = Object.entries(ad)
        .filter(([k]) => k !== "images")
        .map(([k, v]) => {
            const label = labels[k] || k;
            let val = v === null || v === undefined ? "—" : typeof v === "boolean" ? (v ? "✅ Да" : "❌ Нет") : String(v).substring(0, 400);
            return `<tr><td>${label}</td><td>${val}</td></tr>`;
        }).join("");
    content.innerHTML = `
        <table class="details-table">
            ${rows}
            <tr><td>Фотографий</td><td>${(ad.images || []).length} шт.</td></tr>
        </table>
        <div style="margin-top:16px;display:flex;gap:10px;flex-wrap:wrap;">
            ${ad.status === "pending" ? `<button class="btn-submit" style="flex:1;" onclick="document.getElementById('adminDetailsModal').classList.remove('open'); setTimeout(()=>document.querySelector('[data-approve=\\'${ad.id}\\']')?.click(),100)">✓ Одобрить</button>` : ""}
            ${ad.status !== "rejected" ? `<button class="btn-reset" style="flex:1;padding:12px;" onclick="document.getElementById('adminDetailsModal').classList.remove('open'); setTimeout(()=>document.querySelector('[data-reject=\\'${ad.id}\\']')?.click(),100)">✗ Отклонить</button>` : ""}
        </div>`;
    modal.classList.add("open");
};

// ========================================================================
// РАСШИРЕННЫЕ ФИЛЬТРЫ ПОИСКА
// ========================================================================

let currentFilters = {
    search: '',
    district: '',
    category: '',
    rooms: '',
    maxPrice: '',
    furniture: '',
    sort: 'newest'
};

let currentPage = 1;
let itemsPerPage = 12;
let currentView = 'grid';

function toggleFbar() {
    const panel = document.getElementById('fbarPanel');
    const btn = document.getElementById('fbarToggleBtn');
    if (!panel) return;
    panel.classList.toggle('open');
    if (btn) btn.classList.toggle('active', panel.classList.contains('open'));
}

function triggerFilterApply() {
    document.getElementById('searchInput')?.dispatchEvent(new Event('input'));
}

function updateFbarBadge() {
    const badge = document.getElementById('fbarBadge');
    if (!badge) return;
    const ids = ['categoryFilter', 'districtFilter', 'roomsFilter', 'minPriceFilter', 'maxPriceFilter', 'furnitureFilter'];
    const count = ids.filter(id => {
        const el = document.getElementById(id);
        return el && el.value && el.value !== '' && el.value !== 'newest';
    }).length;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function applyFilters() {
    currentFilters = {
        search: document.getElementById('searchInput')?.value || '',
        district: document.getElementById('districtFilter')?.value || '',
        category: document.getElementById('categoryFilter')?.value || '',
        rooms: document.getElementById('roomsFilter')?.value || '',
        minPrice: document.getElementById('minPriceFilter')?.value || '',
        maxPrice: document.getElementById('maxPriceFilter')?.value || '',
        furniture: document.getElementById('furnitureFilter')?.value || '',
        sort: document.getElementById('sortFilter')?.value || 'newest'
    };
    updateFbarBadge();
    currentPage = 1;
    if (!window.__applyListingFilter) renderListings();
}

function resetFilters() {
    const _v = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
    _v('searchInput', ''); _v('districtFilter', ''); _v('categoryFilter', '');
    _v('roomsFilter', ''); _v('minPriceFilter', ''); _v('maxPriceFilter', ''); _v('furnitureFilter', ''); _v('sortFilter', 'newest');
    
    currentFilters = {
        search: '',
        district: '',
        category: '',
        rooms: '',
        minPrice: '',
        maxPrice: '',
        furniture: '',
        sort: 'newest'
    };
    // Сброс региона/района
    if (typeof setRegionDistrict === 'function') setRegionDistrict('', '', false);
    updateFbarBadge();
    currentPage = 1;
    renderListings();
    showToast('Фильтры сброшены', 'info');
}

function setView(view) {
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    renderListings();
}

function filterListings(listings) {
    return listings.filter(listing => {
        // Поиск по тексту
        if (currentFilters.search) {
            const searchText = currentFilters.search.toLowerCase();
            const title = (listing.title || '').toLowerCase();
            const address = (listing.address || '').toLowerCase();
            const description = (listing.description || '').toLowerCase();
            
            if (!title.includes(searchText) && 
                !address.includes(searchText) && 
                !description.includes(searchText)) {
                return false;
            }
        }
        
        // Фильтр по региону / району (новая лалафо-логика)
        if (!adMatchesRegionDistrict(listing)) {
            return false;
        }
        
        // Фильтр по категории
        if (currentFilters.category && listing.category !== currentFilters.category) {
            return false;
        }
        
        // Фильтр по комнатам
        if (currentFilters.rooms) {
            const rooms = listing.rooms || 0;
            if (currentFilters.rooms === '5+') {
                if (rooms < 5) return false;
            } else {
                if (rooms !== parseInt(currentFilters.rooms)) return false;
            }
        }
        
        // Фильтр по цене
        if (currentFilters.minPrice) {
            const price = parseInt(listing.price) || 0;
            if (price < parseInt(currentFilters.minPrice)) return false;
        }
        if (currentFilters.maxPrice) {
            const price = parseInt(listing.price) || 0;
            const maxPrice = parseInt(currentFilters.maxPrice);
            if (price > maxPrice) return false;
        }
        
        // Фильтр по мебели
        if (currentFilters.furniture && listing.furniture !== currentFilters.furniture) {
            return false;
        }
        
        return true;
    });
}

function sortListings(listings) {
    const sorted = [...listings];
    
    switch (currentFilters.sort) {
        case 'price-low':
            return sorted.sort((a, b) => (parseInt(a.price) || 0) - (parseInt(b.price) || 0));
        case 'price-high':
            return sorted.sort((a, b) => (parseInt(b.price) || 0) - (parseInt(a.price) || 0));
        case 'size-large':
            return sorted.sort((a, b) => (parseInt(b.area) || 0) - (parseInt(a.area) || 0));
        case 'size-small':
            return sorted.sort((a, b) => (parseInt(a.area) || 0) - (parseInt(b.area) || 0));
        case 'newest':
        default:
            return sorted.sort((a, b) => getPriorityScore(b) - getPriorityScore(a) || new Date(b.date || 0) - new Date(a.date || 0));
    }
}

function renderListings() {
    const container = document.getElementById('listings-container');
    if (!container) return;

    const page = document.body?.getAttribute('data-page') || '';
    let allListings = storage.getAds().filter(ad => ad.status === 'active');

    if (page === 'sale') {
        allListings = allListings.filter(ad => ad.type === 'sale' && ['flat', 'house'].includes(ad.category));
    } else if (page === 'rent') {
        allListings = allListings.filter(ad => ad.type === 'rent');
    } else if (page === 'land') {
        allListings = allListings.filter(ad => ad.category === 'land');
    } else if (page === 'commerce') {
        allListings = allListings.filter(ad => ad.category === 'commerce');
    }

    const filtered = filterListings(allListings);
    const sorted = sortListings(filtered);
    
    // Обновляем счетчик
    const countElement = document.getElementById('resultsCount');
    if (countElement) {
        countElement.textContent = sorted.length;
    }
    
    // Пагинация
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedListings = sorted.slice(startIndex, endIndex);
    
    // Рендеринг
    if (paginatedListings.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Объявления не найдены</h3>
                <p>Попробуйте изменить параметры фильтров</p>
            </div>
        `;
    } else {
        const viewClass = currentView === 'list' ? 'listings-list' : 'listings-grid';
        const cardClass = currentView === 'list' ? 'list-view' : '';
        
        container.className = viewClass;
        container.innerHTML = paginatedListings.map(listing => createListingCard(listing, cardClass)).join('');
        
        // Добавляем обработчики событий
        attachListingCardEvents();
    }
    
    // Рендеринг пагинации
    renderPagination(sorted.length);
}

function renderPagination(totalItems) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Предыдущая страница
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Номера страниц
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="page-info">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="page-info">...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // Следующая страница
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationContainer.innerHTML = paginationHTML;
}

function changePage(page) {
    const container = document.getElementById('listings-container');
    if (!container) return;
    
    const allListings = storage.getAds().filter(ad => ad.status === 'active');
    const filtered = filterListings(allListings);
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderListings();
    
    // Прокрутка к началу списка
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Стили для отсутствия результатов
const noResultsStyles = `
<style>
.no-results {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-light);
}
.no-results i {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.5;
}
.no-results h3 {
    color: var(--text-dark);
    margin-bottom: 10px;
}
.no-results p {
    font-size: 1rem;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', noResultsStyles);

// ========================================================================
// СИСТЕМА ЧАТОВ И СООБЩЕНИЙ
// ========================================================================

let currentChatId = null;
let chatMessages = {};

let chatListUnsub = null;
let chatThreadUnsub = null;

function getCurrentUid() {
    const currentUser = storage.getCurrentUser();
    return currentUser?.id || null;
}

function getDeterministicChatId(uidA, uidB, adId = null) {
    const a = String(uidA);
    const b = String(uidB);
    const [p1, p2] = a < b ? [a, b] : [b, a];
    const scope = adId ? String(adId) : 'direct';
    return `chat_${p1}_${p2}_${scope}`;
}

function normalizeFirestoreTs(ts) {
    if (!ts) return null;
    if (typeof ts.toDate === 'function') return ts.toDate();
    const date = new Date(ts);
    return Number.isNaN(date.getTime()) ? null : date;
}

async function ensureFirestoreChatExists(otherUid, adId = null) {
    const uid = getCurrentUid();
    if (!uid) throw new Error('no-auth');
    const db = getFirebaseServices()?.db;
    if (!db) throw new Error('no-firestore');

    const chatId = getDeterministicChatId(uid, otherUid, adId);
    const ref = db.collection('chats').doc(chatId);
    const snap = await ref.get();
    if (!snap.exists) {
        await ref.set({
            participants: [uid, otherUid],
            adId: adId || null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageText: '',
            lastMessageAt: null
        });
    }
    return chatId;
}

function cleanupChatSubscriptions() {
    if (typeof chatListUnsub === 'function') chatListUnsub();
    if (typeof chatThreadUnsub === 'function') chatThreadUnsub();
    chatListUnsub = null;
    chatThreadUnsub = null;
}

function initChatSystem() {
    cleanupChatSubscriptions();
    loadChatList();
    setupChatSearch();
    setupChatInput();
    window.addEventListener('beforeunload', cleanupChatSubscriptions);
}

function loadChatList() {
    const uid = getCurrentUid();
    if (!uid) return;
    const db = getFirebaseServices()?.db;
    if (!db) return;

    const chatList = document.getElementById('chatList');
    if (!chatList) return;

    chatList.innerHTML = `
        <div class="empty-chat">
            <i class="fas fa-comments"></i>
            <p>Загрузка...</p>
        </div>
    `;

    if (typeof chatListUnsub === 'function') chatListUnsub();
    chatListUnsub = db
        .collection('chats')
        .where('participants', 'array-contains', uid)
        .onSnapshot((snap) => {
            if (snap.empty) {
                chatList.innerHTML = `
                    <div class="empty-chat">
                        <i class="fas fa-comments"></i>
                        <p>Нет сообщений</p>
                    </div>
                `;
                return;
            }

            const chats = snap.docs
                .map((d) => ({ id: d.id, ...d.data() }))
                .sort((a, b) => {
                    const ta = normalizeFirestoreTs(a.lastActivity)?.getTime() || 0;
                    const tb = normalizeFirestoreTs(b.lastActivity)?.getTime() || 0;
                    return tb - ta;
                });
            chatList.innerHTML = chats.map((chat) => {
                const otherParticipantId = (chat.participants || []).find((id) => id !== uid);
                const otherParticipant = getUserById(otherParticipantId);
                const lastAt = normalizeFirestoreTs(chat.lastMessageAt || chat.lastActivity);

                return `
                    <div class="chat-item ${chat.id === currentChatId ? 'active' : ''}" data-chat-id="${chat.id}" data-other-uid="${otherParticipantId || ''}" onclick="openChat('${chat.id}', this)">
                        <div class="chat-avatar">
                            ${otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div class="chat-info">
                            <div class="chat-name">
                                ${otherParticipant?.name || 'Пользователь'}
                            </div>
                            <div class="chat-message">
                                ${chat.lastMessageText ? truncateMessage(chat.lastMessageText) : 'Нет сообщений'}
                            </div>
                        </div>
                        <div class="chat-time">
                            ${lastAt ? formatMessageTime(lastAt.toISOString()) : ''}
                        </div>
                    </div>
                `;
            }).join('');

            const openId = sessionStorage.getItem('OPEN_CHAT_ID');
            if (openId) {
                sessionStorage.removeItem('OPEN_CHAT_ID');
                const el = chatList.querySelector(`[data-chat-id="${openId}"]`);
                openChat(openId, el);
            }
        }, (err) => {
            console.error('loadChatList onSnapshot error:', err);
            chatList.innerHTML = `
                <div class="empty-chat">
                    <i class="fas fa-comments"></i>
                    <p>Не удалось загрузить чаты</p>
                </div>
            `;
        });
}

function openChat(chatId, el = null) {
    currentChatId = chatId;

    const uid = getCurrentUid();
    if (!uid) return;
    const db = getFirebaseServices()?.db;
    if (!db) return;

    document.querySelectorAll('.chat-item').forEach((item) => item.classList.remove('active'));
    if (el) el.classList.add('active');

    loadChatMessages({ id: chatId });
}

function loadChatMessages(chat) {
    const uid = getCurrentUid();
    if (!uid) return;
    const db = getFirebaseServices()?.db;
    if (!db) return;

    const chatContent = document.getElementById('chatContent');
    if (!chatContent) return;

    chatContent.innerHTML = `
        <div class="chat-conversation-header">
            <div class="chat-avatar">U</div>
            <div>
                <h3>Диалог</h3>
                <p style="margin: 0; font-size: 0.85rem; opacity: 0.7;"> </p>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages"></div>
        <div class="chat-input-container">
            <form class="chat-input-form" onsubmit="sendMessage(event, '${chat.id}')">
                <input type="text" class="chat-input" id="chatInput" placeholder="Написать сообщение..." required>
                <button type="submit" class="chat-send-btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </form>
        </div>
    `;

    const header = chatContent.querySelector('.chat-conversation-header');
    const avatar = header?.querySelector('.chat-avatar');
    const title = header?.querySelector('h3');

    db.collection('chats').doc(chat.id).get().then((snap) => {
        if (!snap.exists) return;
        const chatData = snap.data() || {};
        const otherParticipantId = (chatData.participants || []).find((id) => id !== uid);
        const otherParticipant = getUserById(otherParticipantId);
        const hdr = document.querySelector('.chat-conversation-header');
        if (hdr) hdr.dataset.otherUid = otherParticipantId || '';
        if (avatar) avatar.textContent = otherParticipant?.name?.charAt(0)?.toUpperCase() || 'U';
        if (title) title.textContent = otherParticipant?.name || 'Пользователь';
    }).catch(() => {});

    if (typeof chatThreadUnsub === 'function') chatThreadUnsub();
    const messagesRef = db.collection('chats').doc(chat.id).collection('messages').orderBy('timestamp', 'asc');
    chatThreadUnsub = messagesRef.onSnapshot(async (snap) => {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer) return;

        const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        messagesContainer.innerHTML = messages.map((m) => createMessageHTML(m, uid)).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Отмечаем входящие сообщения как прочитанные (readBy)
        const toMark = messages.filter((m) => {
            if (m.senderId === uid) return false;
            const readBy = Array.isArray(m.readBy) ? m.readBy : [];
            return !readBy.includes(uid);
        });
        if (!toMark.length) return;

        try {
            const batch = db.batch();
            toMark.forEach((m) => {
                const ref = db.collection('chats').doc(chat.id).collection('messages').doc(m.id);
                batch.update(ref, { readBy: firebase.firestore.FieldValue.arrayUnion(uid) });
            });
            await batch.commit();
        } catch (e) {
            // игнорируем (права/оффлайн)
        }
    }, (err) => {
        console.error('chat messages onSnapshot error:', err);
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) messagesContainer.innerHTML = '<p style="opacity:.7;">Не удалось загрузить сообщения</p>';
    });

    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.focus();
}

function createMessageHTML(message, currentUserId) {
    const isSent = message.senderId === currentUserId;
    const sender = getUserById(message.senderId);
    const ts = normalizeFirestoreTs(message.timestamp) || new Date(message.timestampMs || Date.now());
    const iso = ts ? ts.toISOString() : new Date().toISOString();
    const readBy = Array.isArray(message.readBy) ? message.readBy : (message.read ? [currentUserId] : []);
    const isRead = isSent ? readBy.length > 0 : true;
    
    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            <div class="message-bubble">
                <div>${message.text}</div>
                <div class="message-time">
                    ${formatMessageTime(iso)}
                    ${isSent && isRead ? ' ✓✓' : isSent ? ' ✓' : ''}
                </div>
            </div>
        </div>
    `;
}

async function sendMessage(event, chatId) {
    event.preventDefault();

    const uid = getCurrentUid();
    if (!uid) {
        showToast('Необходимо войти в аккаунт', 'error');
        return;
    }

    const db = getFirebaseServices()?.db;
    if (!db) {
        showToast('Чат недоступен (нет Firestore)', 'error');
        return;
    }

    const input = document.getElementById('chatInput');
    const text = input.value.trim();

    if (!text) return;

    // Оптимистичный UI: показываем сообщение СРАЗУ до Firestore
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
        const tempMsgId = 'temp-' + Date.now();
        const tempHTML = createMessageHTML({
            id: tempMsgId,
            senderId: uid,
            text: text,
            timestampMs: Date.now(),
            readBy: [uid]
        }, uid);
        messagesContainer.insertAdjacentHTML('beforeend', tempHTML);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Очищаем поле ввода СРАЗУ
    input.value = '';

    try {
        const msg = {
            senderId: uid,
            text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            timestampMs: Date.now(),
            readBy: [uid]
        };

        await db.collection('chats').doc(chatId).collection('messages').add(msg);
        await db.collection('chats').doc(chatId).set({
            lastActivity: firebase.firestore.FieldValue.serverTimestamp(),
            lastMessageText: text,
            lastMessageAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    } catch (e) {
        console.error('sendMessage error:', e);
        // Удаляем временное сообщение при ошибке
        const tempMsg = messagesContainer?.querySelector(`[data-temp-id="temp-${Date.now()}"]`);
        if (tempMsg) tempMsg.remove();
        input.value = text; // Восстанавливаем текст

        const code = String(e?.code || e?.message || '');
        if (code.includes('permission-denied')) {
            showToast('Нет прав на отправку. Проверь правила Firestore', 'error');
        } else if (code.includes('unauthenticated') || code.includes('not-authenticated')) {
            showToast('Сессия истекла — войди в аккаунт заново', 'error');
        } else {
            showToast('Ошибка отправки: ' + (e?.message || 'неизвестная ошибка'), 'error');
        }
    }
}

async function createChatWithUser(userId, adId = null) {
    const uid = getCurrentUid();
    if (!uid) {
        showToast('Необходимо войти в аккаунт', 'error');
        return;
    }

    try {
        const chatId = await ensureFirestoreChatExists(userId, adId);
        // Сначала записываем ID, потом переходим — иначе страница уходит раньше
        sessionStorage.setItem('OPEN_CHAT_ID', chatId);
        window.location.href = 'chat.html';
    } catch (e) {
        console.error('createChatWithUser error:', e);
        if (String(e?.code || '').includes('permission-denied')) {
            showToast('Нет доступа создать чат (permission-denied)', 'error');
        } else {
            showToast('Не удалось создать чат', 'error');
        }
    }
}

function setupChatSearch() {
    const searchInput = document.getElementById('chatSearch');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const chatItems = document.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const name = item.querySelector('.chat-name')?.textContent.toLowerCase() || '';
            const message = item.querySelector('.chat-message')?.textContent.toLowerCase() || '';
            
            if (name.includes(searchTerm) || message.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
}

function setupChatInput() {
    // Обработка ввода уже реализована в sendMessage
}

// Вспомогательные функции
function truncateMessage(text, maxLength = 30) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function formatMessageTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин назад`;
    if (diffHours < 24) return `${diffHours} ч назад`;
    if (diffDays < 7) return `${diffDays} д назад`;
    
    return date.toLocaleDateString('ru-RU');
}

// Кэш пользователей из Firestore (id -> {id, name, ...})
const remoteUserCache = {};
const pendingUserFetches = {};

function getUserById(userId) {
    if (!userId) return null;
    // Кэш Firestore
    if (remoteUserCache[userId]) return remoteUserCache[userId];
    // Локальное хранилище (текущий пользователь)
    const users = storage.getUsers();
    const local = users.find(u => u.id === userId);
    if (local) return local;
    // Запускаем асинхронную загрузку из Firestore (но не блокируем рендер)
    fetchRemoteUser(userId);
    return null;
}

async function fetchRemoteUser(userId) {
    if (!userId || remoteUserCache[userId] || pendingUserFetches[userId]) return;
    const db = getFirebaseServices()?.db;
    if (!db) return;
    pendingUserFetches[userId] = true;
    try {
        const snap = await db.collection('users').doc(userId).get();
        if (snap.exists) {
            remoteUserCache[userId] = { id: userId, ...snap.data() };
            refreshChatUIForUser(userId);
        }
    } catch (e) {
        // игнорируем
    } finally {
        delete pendingUserFetches[userId];
    }
}

// Перерисовывает видимые элементы чата, где упоминается этот пользователь
function refreshChatUIForUser(userId) {
    const user = remoteUserCache[userId];
    if (!user) return;
    const name = user.name || 'Пользователь';
    const initial = (user.name?.charAt(0) || 'U').toUpperCase();

    // Заголовок открытого чата
    const header = document.querySelector('.chat-conversation-header');
    if (header && header.dataset.otherUid === userId) {
        const titleEl = header.querySelector('h3');
        const avatarEl = header.querySelector('.chat-avatar');
        if (titleEl) titleEl.textContent = name;
        if (avatarEl) avatarEl.textContent = initial;
    }

    // Элементы списка чатов
    document.querySelectorAll(`.chat-item[data-other-uid="${userId}"]`).forEach(item => {
        const nameEl = item.querySelector('.chat-name');
        const avatarEl = item.querySelector('.chat-avatar');
        if (nameEl) nameEl.textContent = name;
        if (avatarEl) avatarEl.textContent = initial;
    });
}

function getUnreadMessageCount() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) return 0;
    const chats = storage.getChats();
    return chats
        .filter((c) => Array.isArray(c.participants) && c.participants.includes(currentUser.id))
        .reduce((acc, c) => {
            const messages = Array.isArray(c.messages) ? c.messages : [];
            const unread = messages.filter((m) => m.from !== currentUser.id && !m.readBy?.includes(currentUser.id)).length;
            return acc + unread;
        }, 0);
}

function updateUnreadBadge() {
    const unreadCount = getUnreadMessageCount();
    const badge = document.getElementById('unreadBadge');
    const mobBadge = document.getElementById('mobNavUnread');
    const val = unreadCount > 99 ? '99+' : unreadCount;
    if (badge) {
        badge.textContent = val;
        badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
    if (mobBadge) {
        mobBadge.textContent = val;
        mobBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
}

function createChatButton(userId, adId = null) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser || currentUser.id === userId) return '';
    
    return `
        <button class="chat-btn" onclick="createChatWithUser('${userId}', '${adId}')">
            <i class="fas fa-comment"></i> Написать сообщение
        </button>
    `;
}

// ========================================================================
// СИСТЕМА РЕЙТИНГОВ И ОТЗЫВОВ
// ========================================================================

let currentRating = 0;
let currentFilter = 'all';

function initReviewsSystem() {
    loadReviews();
    setupRatingInput();
    setupFilterTabs();
    setupReviewForm();
    updateReviewsStats();
}

function setupRatingInput() {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            currentRating = parseInt(star.dataset.rating);
            updateStarDisplay(currentRating);
            updateUserRatingText(currentRating);
        });
        
        star.addEventListener('mouseenter', () => {
            const hoverRating = parseInt(star.dataset.rating);
            updateStarDisplay(hoverRating);
        });
    });
    
    const ratingContainer = document.getElementById('userRating');
    if (ratingContainer) {
        ratingContainer.addEventListener('mouseleave', () => {
            updateStarDisplay(currentRating);
        });
    }
}

function updateStarDisplay(rating) {
    const stars = document.querySelectorAll('.star-input');
    stars.forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

function updateUserRatingText(rating) {
    const ratingTexts = [
        'Выберите оценку',
        'Ужасно',
        'Плохо',
        'Нормально',
        'Хорошо',
        'Отлично'
    ];
    
    const textElement = document.querySelector('.user-reviews-count');
    if (textElement) {
        textElement.textContent = ratingTexts[rating];
    }
}

function setupFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            filterReviews();
        });
    });
}

function setupReviewForm() {
    const form = document.getElementById('submitReviewForm');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitReview();
    });
}

function submitReview() {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
        showToast('Необходимо войти в аккаунт', 'error');
        return;
    }
    
    if (currentRating === 0) {
        showToast('Пожалуйста, выберите оценку', 'error');
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value.trim();
    if (!reviewText) {
        showToast('Напишите текст отзыва', 'error');
        return;
    }
    
    const reviews = storage.getReviews();
    const newReview = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        rating: currentRating,
        text: reviewText,
        date: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        verified: currentUser.verified || false
    };
    
    reviews.push(newReview);
    storage.setReviews(reviews);
    
    // Обновляем рейтинг пользователя
    updateUserRating(currentUser.id, currentRating);
    
    // Сброс формы
    document.getElementById('reviewText').value = '';
    currentRating = 0;
    updateStarDisplay(0);
    updateUserRatingText(0);
    
    // Обновляем отображение
    loadReviews();
    updateReviewsStats();
    
    showToast('Отзыв успешно опубликован!', 'success');
}

function loadReviews() {
    const reviews = storage.getReviews();
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-star"></i>
                <h3>Пока нет отзывов</h3>
                <p>Станьте первым, кто оставит отзыв!</p>
            </div>
        `;
        return;
    }
    
    // Сортируем отзывы по дате (новые первые)
    const sortedReviews = reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    reviewsList.innerHTML = sortedReviews.map(review => createReviewHTML(review)).join('');
    
    // Добавляем обработчики для кнопок "Полезно"
    setupHelpfulButtons();
}

function createReviewHTML(review) {
    const date = new Date(review.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    return `
        <div class="review-card" data-rating="${review.rating}">
            <div class="review-header">
                <div class="reviewer-info">
                    <div class="reviewer-avatar">
                        ${review.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div class="reviewer-details">
                        <h4>${review.userName || 'Аноним'}</h4>
                        <div class="review-date">${formattedDate}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${generateStars(review.rating)}
                    ${review.verified ? '<span class="verification-badge"><i class="fas fa-check"></i> Верифицирован</span>' : ''}
                </div>
            </div>
            <div class="review-content">
                <p>${review.text}</p>
            </div>
            <div class="review-actions">
                <button class="helpful-btn" onclick="markHelpful('${review.id}', true)">
                    <i class="fas fa-thumbs-up"></i>
                    <span>Полезно (${review.helpful || 0})</span>
                </button>
                <button class="helpful-btn" onclick="markHelpful('${review.id}', false)">
                    <i class="fas fa-thumbs-down"></i>
                    <span>Не полезно (${review.notHelpful || 0})</span>
                </button>
            </div>
        </div>
    `;
}

function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<i class="fas fa-star" ${i <= rating ? 'style="color: #ffd700"' : 'style="color: #ddd"'}></i>`;
    }
    return stars;
}

function markHelpful(reviewId, isHelpful) {
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
        showToast('Необходимо войти в аккаунт', 'error');
        return;
    }
    
    const reviews = storage.getReviews();
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    // Проверяем, голосовал ли пользователь ранее
    const voteKey = `review_vote_${reviewId}_${currentUser.id}`;
    const existingVote = localStorage.getItem(voteKey);
    
    if (existingVote) {
        showToast('Вы уже голосовали за этот отзыв', 'info');
        return;
    }
    
    // Сохраняем голос пользователя
    localStorage.setItem(voteKey, isHelpful ? 'helpful' : 'not-helpful');
    
    // Обновляем счетчики
    if (isHelpful) {
        review.helpful = (review.helpful || 0) + 1;
    } else {
        review.notHelpful = (review.notHelpful || 0) + 1;
    }
    
    storage.setReviews(reviews);
    
    // Обновляем отображение
    loadReviews();
    showToast(isHelpful ? 'Отмечено как полезное' : 'Отмечено как не полезное', 'success');
}

function filterReviews() {
    const reviewCards = document.querySelectorAll('.review-card');
    
    reviewCards.forEach(card => {
        const rating = parseInt(card.dataset.rating);
        const shouldShow = currentFilter === 'all' || rating === parseInt(currentFilter);
        card.style.display = shouldShow ? 'block' : 'none';
    });
}

function updateReviewsStats() {
    const reviews = storage.getReviews();
    const users = storage.getUsers();
    
    // Общее количество отзывов
    document.getElementById('totalReviews').textContent = reviews.length;
    
    // Средняя оценка
    if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
    } else {
        document.getElementById('avgRating').textContent = '0.0';
    }
    
    // Количество верифицированных пользователей
    const verifiedCount = users.filter(user => user.verified).length;
    document.getElementById('verifiedUsers').textContent = verifiedCount;
}

function updateUserRating(userId, newRating) {
    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return;
    
    // Инициализируем рейтинг если его нет
    if (!user.ratings) {
        user.ratings = [];
    }
    
    // Добавляем новый рейтинг
    user.ratings.push({
        rating: newRating,
        date: new Date().toISOString()
    });
    
    // Вычисляем средний рейтинг
    const totalRating = user.ratings.reduce((sum, r) => sum + r.rating, 0);
    user.avgRating = totalRating / user.ratings.length;
    user.totalReviews = user.ratings.length;
    
    storage.setUsers(users);
}

function setupHelpfulButtons() {
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
        // Обработчики уже установлены через onclick в HTML
    });
}

function getUserRating(userId) {
    const users = storage.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.avgRating) return null;
    
    return {
        avgRating: user.avgRating,
        totalReviews: user.totalReviews || 0,
        ratings: user.ratings || []
    };
}

// ========================================================================
// УЛУЧШЕННЫЕ ФУНКЦИИ ВХОДА И РЕГИСТРАЦИИ
// ========================================================================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.nextElementSibling;
    const icon = toggle.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function showPasswordReset() {
    const services = getFirebaseServices();
    if (!services) {
        showToast('Firebase не подключен', 'error');
        return false;
    }
    const email = prompt('Введите ваш email для восстановления пароля:');
    if (!email) return false;
    services.auth.sendPasswordResetEmail(String(email).trim())
        .then(() => showToast('Письмо для восстановления отправлено', 'success'))
        .catch(() => showToast('Не удалось отправить письмо. Проверь email.', 'error'));
    return false;
}

function socialLogin(provider) {
    showToast(`Вход через ${provider} будет доступен скоро`, 'info');
    return false;
}

function socialRegister(provider) {
    showToast(`Регистрация через ${provider} будет доступна скоро`, 'info');
    return false;
}

// Проверка силы пароля
function checkPasswordStrength(password) {
    let strength = 0;
    const requirements = {
        length: password.length >= 6,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
    
    // Обновляем индикаторы требований
    Object.keys(requirements).forEach(req => {
        const element = document.getElementById(`req-${req}`);
        if (element) {
            element.classList.toggle('valid', requirements[req]);
            element.classList.toggle('invalid', !requirements[req]);
        }
    });
    
    // Вычисляем общую силу
    strength = Object.values(requirements).filter(Boolean).length;
    
    // Обновляем индикатор силы
    const strengthBar = document.getElementById('passwordStrength');
    if (strengthBar) {
        strengthBar.className = 'password-strength-bar';
        if (strength <= 1) {
            strengthBar.classList.add('password-strength-weak');
        } else if (strength <= 2) {
            strengthBar.classList.add('password-strength-medium');
        } else {
            strengthBar.classList.add('password-strength-strong');
        }
    }
    
    return strength;
}

// Управление шагами регистрации
let registrationData = {};
let verificationCode = '';

function nextRegistrationStep() {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const password = document.getElementById('regPass').value;
    const passwordConfirm = document.getElementById('regPassConfirm').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Валидация
    if (!name || !email || !phone || !password || !passwordConfirm) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToast('Пароли не совпадают', 'error');
        return;
    }
    
    if (checkPasswordStrength(password) < 3) {
        showToast('Пароль слишком слабый', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Необходимо согласиться с условиями использования', 'error');
        return;
    }
    
    const services = getFirebaseServices();
    if (!services) {
        showToast('Firebase не подключен. Проверь подключение SDK на странице.', 'error');
        return;
    }

    const { auth, db } = services;
    const submitBtn = document.getElementById('btnNextStep');
    setButtonLoading(submitBtn, true, 'Создание...');

    auth.createUserWithEmailAndPassword(email, password)
        .then(async (cred) => {
            const uid = cred.user.uid;
            await db.collection('users').doc(uid).set({
                name,
                phone,
                email,
                verified: false,
                createdAt: new Date().toISOString()
            }, { merge: true });

            await cred.user.updateProfile({ displayName: name });
            await cred.user.sendEmailVerification();

            registrationData = { name, email, phone };

            // Показываем второй шаг
            document.getElementById('registration-step-1').style.display = 'none';
            document.getElementById('registration-step-2').style.display = 'block';

            // Обновляем индикаторы шагов
            document.getElementById('step1').classList.remove('active');
            document.getElementById('step1').classList.add('completed');
            document.getElementById('step2').classList.add('active');

            document.getElementById('displayEmail').textContent = email;

            // Запоминаем для кнопки "Открыть почту" и "Отправить повторно"
            window.__pendingVerifyEmail = email;
            // НЕ делаем signOut сразу — иначе resend не сможет получить currentUser.
            // Выход произойдёт автоматически при переходе на login.html (см. handleLogin).
            // Но блокируем доступ к профилю — флагом в localStorage
            sessionStorage.setItem('osh_pending_verify', '1');

            showToast('Мы отправили письмо для подтверждения. Проверь почту (включая «Спам»).', 'success');
        })
        .catch((err) => {
            const code = err?.code || '';
            if (code.includes('auth/email-already-in-use')) {
                showToast('Этот email уже зарегистрирован', 'error');
                return;
            }
            if (code.includes('auth/invalid-email')) {
                showToast('Неверный формат email', 'error');
                return;
            }
            if (code.includes('auth/weak-password')) {
                showToast('Слишком слабый пароль', 'error');
                return;
            }
            showToast('Ошибка регистрации. Попробуйте позже.', 'error');
        })
        .finally(() => {
            setButtonLoading(submitBtn, false);
        });
}

function backToStep1() {
    document.getElementById('registration-step-2').style.display = 'none';
    document.getElementById('registration-step-1').style.display = 'block';

    // Обновляем индикаторы шагов
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('step2').classList.remove('active');
}

function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }
    // Кнопка Google на странице логина
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) googleBtn.addEventListener('click', signInWithGoogle);
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value;
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    
    if (!email || !password) {
        showToast('Заполните все поля', 'error');
        return;
    }
    
    const services = getFirebaseServices();
    if (!services) {
        showToast('Firebase не подключен. Проверь подключение SDK на странице.', 'error');
        return;
    }

    const { auth } = services;
    const form = document.getElementById('loginForm');
    const submitBtn = form?.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true, 'Вход...');

    const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;
    auth.setPersistence(persistence)
        .then(() => auth.signInWithEmailAndPassword(email, password))
        .then(async (cred) => {
            if (!cred.user.emailVerified) {
                await auth.signOut();
                storage.clearCurrentUser();
                showToast('Подтверди email (письмо на почте) и попробуй снова', 'error');
                return;
            }

            await syncCurrentUserFromFirebase();
            showToast('Вход выполнен успешно!', 'success');
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 700);
        })
        .catch((err) => {
            const code = err?.code || '';
            if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
                showToast('Неверный email или пароль', 'error');
                return;
            }
            if (code.includes('auth/invalid-email')) {
                showToast('Неверный формат email', 'error');
                return;
            }
            if (code.includes('auth/network-request-failed')) {
                showToast('Нет соединения. Проверь интернет и попробуй снова.', 'error');
                return;
            }
            if (code.includes('auth/too-many-requests')) {
                showToast('Слишком много попыток. Подожди 10–30 минут и попробуй снова.', 'error');
                return;
            }
            if (code.includes('auth/unauthorized-domain')) {
                showToast('Домен не разрешен в Firebase. Открой сайт через localhost или добавь домен в Authorized domains.', 'error');
                return;
            }
            showToast('Ошибка входа. Попробуйте позже.', 'error');
        })
        .finally(() => setButtonLoading(submitBtn, false));
}

function initRegister() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    // Обработчик для поля пароля
    const regPass = document.getElementById('regPass');
    if (regPass) {
        regPass.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
        });
    }

    // Кнопка Google
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) googleBtn.addEventListener('click', signInWithGoogle);

    // Кнопка "Открыть почту"
    const openMailBtn = document.getElementById('btnOpenMail');
    if (openMailBtn) {
        openMailBtn.addEventListener('click', () => {
            const email = window.__pendingVerifyEmail || document.getElementById('displayEmail')?.textContent || '';
            const url = getMailProviderUrl(email);
            window.open(url, '_blank');
        });
    }

    // Кнопка "Отправить повторно"
    const resendLink = document.getElementById('resendVerifyLink');
    if (resendLink) resendLink.addEventListener('click', (e) => { e.preventDefault(); resendVerificationEmail(); });
}

// ====== Google Sign-In ======
async function signInWithGoogle() {
    const services = getFirebaseServices();
    if (!services) { showToast('Firebase не подключен', 'error'); return; }
    const { auth, db } = services;

    const btn = document.getElementById('googleSignInBtn');
    if (btn) { btn.disabled = true; btn.style.opacity = '0.7'; }

    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const cred = await auth.signInWithPopup(provider);
        const user = cred.user;

        // Создаём/обновляем профиль в Firestore
        const userRef = db.collection('users').doc(user.uid);
        const snap = await userRef.get();
        if (!snap.exists) {
            await userRef.set({
                name: user.displayName || 'Пользователь',
                email: user.email,
                phone: user.phoneNumber || '',
                photoURL: user.photoURL || '',
                provider: 'google',
                verified: true,
                createdAt: new Date().toISOString()
            });
        } else {
            await userRef.set({
                name: user.displayName || snap.data().name,
                photoURL: user.photoURL || snap.data().photoURL || '',
                provider: 'google'
            }, { merge: true });
        }

        await syncCurrentUserFromFirebase();
        sessionStorage.removeItem('osh_pending_verify');
        showToast('Вход выполнен через Google!', 'success');
        setTimeout(() => { window.location.href = 'profile.html'; }, 700);
    } catch (err) {
        const code = err?.code || '';
        if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
            // тихо игнорируем — пользователь сам закрыл
        } else if (code === 'auth/unauthorized-domain') {
            showToast('Домен не разрешён. Добавьте github.io в Firebase → Authentication → Settings → Authorized domains', 'error');
        } else if (code === 'auth/popup-blocked') {
            showToast('Браузер заблокировал всплывающее окно. Разрешите всплывающие окна и повторите.', 'error');
        } else if (code === 'auth/account-exists-with-different-credential') {
            showToast('Этот email уже зарегистрирован с другим способом входа', 'error');
        } else {
            showToast('Ошибка входа через Google. Попробуйте позже.', 'error');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = ''; }
    }
}

// ====== Повторная отправка письма верификации ======
async function resendVerificationEmail() {
    const services = getFirebaseServices();
    if (!services) { showToast('Firebase не подключен', 'error'); return; }
    const { auth } = services;
    const user = auth.currentUser;
    if (!user) {
        showToast('Сессия истекла. Зарегистрируйтесь снова.', 'error');
        return;
    }
    const link = document.getElementById('resendVerifyLink');
    const timer = document.getElementById('resendTimer');
    try {
        await user.sendEmailVerification();
        showToast('Письмо отправлено повторно ✓ Проверьте «Спам»', 'success');
        // Кулдаун 60 сек
        if (link) link.style.pointerEvents = 'none';
        if (link) link.style.opacity = '0.5';
        let left = 60;
        if (timer) { timer.style.display = 'inline'; timer.textContent = ` (через ${left} сек)`; }
        const t = setInterval(() => {
            left--;
            if (timer) timer.textContent = ` (через ${left} сек)`;
            if (left <= 0) {
                clearInterval(t);
                if (timer) timer.style.display = 'none';
                if (link) { link.style.pointerEvents = ''; link.style.opacity = ''; }
            }
        }, 1000);
    } catch (err) {
        const code = err?.code || '';
        if (code.includes('too-many-requests')) {
            showToast('Слишком много запросов. Подождите 1-2 минуты.', 'error');
        } else {
            showToast('Не удалось отправить. Попробуйте позже.', 'error');
        }
    }
}

// ====== Открыть почту: распознаём провайдера ======
function getMailProviderUrl(email) {
    const domain = (email || '').split('@')[1]?.toLowerCase() || '';
    if (domain.includes('gmail.') || domain.includes('googlemail.')) return 'https://mail.google.com';
    if (domain.includes('yandex.') || domain.includes('ya.ru')) return 'https://mail.yandex.ru';
    if (domain.includes('mail.ru') || domain.includes('inbox.ru') || domain.includes('list.ru') || domain.includes('bk.ru')) return 'https://mail.ru';
    if (domain.includes('outlook.') || domain.includes('hotmail.') || domain.includes('live.')) return 'https://outlook.live.com';
    if (domain.includes('icloud.') || domain.includes('me.com')) return 'https://www.icloud.com/mail';
    if (domain.includes('proton.') || domain.includes('protonmail.')) return 'https://mail.proton.me';
    return `https://${domain || 'gmail.com'}`;
}

window.togglePassword = function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const toggle = input.nextElementSibling;
    const icon = toggle?.querySelector?.('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon?.classList?.remove('fa-eye');
        icon?.classList?.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon?.classList?.remove('fa-eye-slash');
        icon?.classList?.add('fa-eye');
    }
};

window.checkPasswordStrength = function checkPasswordStrength(password) {
    const pwd = String(password || '');
    const requirements = {
        length: pwd.length >= 6,
        uppercase: /[A-Z]/.test(pwd),
        lowercase: /[a-z]/.test(pwd),
        number: /[0-9]/.test(pwd)
    };

    Object.keys(requirements).forEach((req) => {
        const element = document.getElementById(`req-${req}`);
        if (!element) return;
        element.classList.toggle('valid', requirements[req]);
        element.classList.toggle('invalid', !requirements[req]);
    });

    const strength = Object.values(requirements).filter(Boolean).length;
    const strengthBar = document.getElementById('passwordStrength');
    if (strengthBar) {
        strengthBar.className = 'password-strength-bar';
        if (strength <= 1) strengthBar.classList.add('password-strength-weak');
        else if (strength <= 2) strengthBar.classList.add('password-strength-medium');
        else strengthBar.classList.add('password-strength-strong');
    }
    return strength;
};

window.nextRegistrationStep = function nextRegistrationStep() {
    try {
        const name = document.getElementById('regName')?.value?.trim() || '';
        const email = document.getElementById('regEmail')?.value?.trim() || '';
        const phone = document.getElementById('regPhone')?.value?.trim() || '';
        const password = document.getElementById('regPass')?.value || '';
        const passwordConfirm = document.getElementById('regPassConfirm')?.value || '';
        const agreeTerms = !!document.getElementById('agreeTerms')?.checked;

        if (!name || !email || !phone || !password || !passwordConfirm) {
            showToast('Заполните все поля', 'error');
            return;
        }
        if (password !== passwordConfirm) {
            showToast('Пароли не совпадают', 'error');
            return;
        }
        if (window.checkPasswordStrength(password) < 3) {
            showToast('Пароль слишком слабый', 'error');
            return;
        }
        if (!agreeTerms) {
            showToast('Необходимо согласиться с условиями использования', 'error');
            return;
        }

        const services = getFirebaseServices();
        if (!services) {
            showToast('Firebase не подключен. Проверь подключение SDK на странице.', 'error');
            return;
        }

        const { auth, db } = services;
        const submitBtn = document.getElementById('btnNextStep');
        setButtonLoading(submitBtn, true, 'Создание...');

        auth.createUserWithEmailAndPassword(email, password)
            .then(async (cred) => {
                const uid = cred.user.uid;

                try {
                    await db.collection('users').doc(uid).set({
                        name,
                        phone,
                        email,
                        verified: false,
                        createdAt: new Date().toISOString()
                    }, { merge: true });
                } catch (e) {
                }

                await cred.user.updateProfile({ displayName: name });
                await cred.user.sendEmailVerification();

                window.registrationData = { name, email, phone };

                document.getElementById('registration-step-1').style.display = 'none';
                document.getElementById('registration-step-2').style.display = 'block';
                document.getElementById('step1').classList.remove('active');
                document.getElementById('step1').classList.add('completed');
                document.getElementById('step2').classList.add('active');
                document.getElementById('displayEmail').textContent = email;

                await auth.signOut();
                storage.clearCurrentUser();
                showToast('Мы отправили письмо для подтверждения. Подтверди email и войди.', 'success');
            })
            .catch((err) => {
                const code = err?.code || '';
                if (code.includes('auth/email-already-in-use')) return showToast('Этот email уже зарегистрирован', 'error');
                if (code.includes('auth/invalid-email')) return showToast('Неверный формат email', 'error');
                if (code.includes('auth/weak-password')) return showToast('Слишком слабый пароль', 'error');
                if (code.includes('auth/network-request-failed')) return showToast('Нет соединения. Проверь интернет и попробуй снова.', 'error');
                if (code.includes('auth/too-many-requests')) return showToast('Слишком много попыток. Подожди 10–30 минут и попробуй снова.', 'error');
                showToast('Ошибка регистрации. Попробуйте позже.', 'error');
            })
            .finally(() => setButtonLoading(submitBtn, false));
    } catch (e) {
        showToast('Ошибка на странице. Открой консоль (F12) и пришли текст ошибки.', 'error');
    }
};

window.backToStep1 = function backToStep1() {
    document.getElementById('registration-step-2').style.display = 'none';
    document.getElementById('registration-step-1').style.display = 'block';
    document.getElementById('step1').classList.add('active');
    document.getElementById('step1').classList.remove('completed');
    document.getElementById('step2').classList.remove('active');
};

window.resendCode = function resendCode() {
    try {
        const services = getFirebaseServices();
        if (!services) {
            showToast('Firebase не подключен. Проверь подключение SDK на странице.', 'error');
            return false;
        }

        const email = prompt('Введите email для повторной отправки письма:');
        if (!email) return false;
        const password = prompt('Введите пароль от этого аккаунта:');
        if (!password) return false;

        const { auth } = services;

        auth.signInWithEmailAndPassword(String(email).trim(), String(password))
            .then(async (cred) => {
                if (cred.user.emailVerified) {
                    showToast('Email уже подтвержден. Можешь войти.', 'success');
                    return;
                }
                await cred.user.sendEmailVerification();
                showToast('Письмо подтверждения отправлено повторно. Проверь Спам/Промоакции.', 'success');
            })
            .catch((err) => {
                const code = err?.code || '';
                if (code.includes('auth/wrong-password') || code.includes('auth/invalid-credential')) {
                    showToast('Неверный пароль', 'error');
                    return;
                }
                if (code.includes('auth/user-not-found')) {
                    showToast('Пользователь не найден. Проверь email.', 'error');
                    return;
                }
                if (code.includes('auth/network-request-failed')) {
                    showToast('Нет соединения. Проверь интернет и попробуй снова.', 'error');
                    return;
                }
                if (code.includes('auth/too-many-requests')) {
                    showToast('Слишком много попыток отправки. Подожди 10–30 минут и попробуй снова.', 'error');
                    return;
                }
                showToast('Не удалось переотправить письмо. Попробуй позже.', 'error');
            })
            .finally(() => {
                auth.signOut().catch(() => {});
                storage.clearCurrentUser();
            });
    } catch (e) {
        showToast('Ошибка при переотправке письма. Открой консоль (F12) и пришли текст ошибки.', 'error');
    }
    return false;
};

window.initRegister = function initRegister() {
    const regPass = document.getElementById('regPass');
    if (regPass) {
        regPass.addEventListener('input', (e) => {
            window.checkPasswordStrength(e.target.value);
        });
    }
};

/* ========================================================================
   WOW EFFECTS
   ======================================================================== */

function initScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    document.body.appendChild(bar);
    const update = () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
    };
    window.addEventListener('scroll', update, { passive: true });
}

function initCustomCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
    const ring = document.createElement('div'); ring.id = 'cursor-ring';
    document.body.append(dot, ring);
    let mx = -200, my = -200, rx = -200, ry = -200;
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
        rx = lerp(rx, mx, 0.11); ry = lerp(ry, my, 0.11);
        ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
        requestAnimationFrame(tick);
    };
    tick();
    const INTERACTIVE = 'a, button, [role="button"], .listing-card, .choice-card, .category-item, input, select, textarea';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(INTERACTIVE)) { dot.classList.add('hover'); ring.classList.add('hover'); }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(INTERACTIVE)) { dot.classList.remove('hover'); ring.classList.remove('hover'); }
    });
    document.addEventListener('mousedown', () => { dot.classList.add('click'); ring.classList.add('click'); });
    document.addEventListener('mouseup',   () => { dot.classList.remove('click'); ring.classList.remove('click'); });
    document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

function initCardTilt() {
    const apply = () => {
        document.querySelectorAll('.listing-card').forEach((card) => {
            if (card._tiltBound) return;
            card._tiltBound = true;
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const px = e.clientX - r.left, py = e.clientY - r.top;
                const x = px / r.width - 0.5, y = py / r.height - 0.5;
                card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-5px) scale(1.02)`;
                card.style.boxShadow = `${-x * 18}px ${y * 18}px 40px rgba(0,0,0,0.16)`;
                card.style.setProperty('--gx', px + 'px');
                card.style.setProperty('--gy', py + 'px');
                card.style.setProperty('--go', '1');
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
                card.style.boxShadow = '';
                card.style.setProperty('--go', '0');
            });
        });
    };
    apply();
    const obs = new MutationObserver(apply);
    obs.observe(document.body, { childList: true, subtree: true });
}

function initHeroOrbs() {
    const hero = document.querySelector('.home-hero');
    if (!hero) return;
    const orbs = [
        { color: 'rgba(255,127,80,0.22)', size: 420, top: '10%', left: '5%',  dur: 14 },
        { color: 'rgba(255,107,129,0.18)', size: 500, top: '30%', left: '60%', dur: 18 },
        { color: 'rgba(52,152,219,0.15)',  size: 380, top: '55%', left: '30%', dur: 12 },
        { color: 'rgba(155,89,182,0.12)',  size: 300, top: '5%',  left: '75%', dur: 20 },
    ];
    orbs.forEach((o, i) => {
        const el = document.createElement('div');
        el.className = 'hero-orb';
        el.style.cssText = `width:${o.size}px;height:${o.size}px;background:${o.color};top:${o.top};left:${o.left};animation-duration:${o.dur}s;animation-delay:${-i * 3}s;`;
        hero.appendChild(el);
    });
}

function initNavbarScroll() {
    const nav = document.querySelector('.navbar');
    if (!nav) return;
    let lastY = 0;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 60) {
            nav.classList.add('nav-scrolled');
            if (y > lastY + 8) nav.classList.add('nav-hidden');
            else nav.classList.remove('nav-hidden');
        } else {
            nav.classList.remove('nav-scrolled', 'nav-hidden');
        }
        lastY = y;
    }, { passive: true });
}

function initHeroParallax() {
    const hero = document.querySelector('.home-hero');
    if (!hero) return;
    window.addEventListener('scroll', () => {
        const y = window.scrollY;
        hero.style.backgroundPositionY = `calc(50% + ${y * 0.35}px)`;
    }, { passive: true });
}

function initDarkMode() {
    const btn = document.getElementById('darkModeToggle');
    if (!btn) return;
    const saved = localStorage.getItem('oshe_theme');
    if (saved === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); btn.innerHTML = '<i class="fas fa-sun"></i>'; }
    btn.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('oshe_theme', 'light');
            btn.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('oshe_theme', 'dark');
            btn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });
}

function showConfetti() {
    const colors = ['#ff7f50','#ff6b81','#3498db','#2ecc71','#f1c40f','#9b59b6','#e74c3c'];
    const shapes = ['circle', 'square', 'triangle'];
    for (let i = 0; i < 90; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = Math.random() * 10 + 6;
        el.style.cssText = `
            left:${Math.random() * 100}vw;
            width:${size}px; height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:${shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '2px'};
            animation-duration:${Math.random() * 2.5 + 2}s;
            animation-delay:${Math.random() * 0.8}s;`;
        if (shape === 'triangle') {
            el.style.background = 'transparent';
            el.style.borderLeft = `${size/2}px solid transparent`;
            el.style.borderRight = `${size/2}px solid transparent`;
            el.style.borderBottom = `${size}px solid ${colors[Math.floor(Math.random() * colors.length)]}`;
        }
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initScrollProgress();
    initNavbarScroll();
    initDarkMode();

    const servicesForSeed = getFirebaseServices();
    if (!servicesForSeed) {
        seedAdsIfEmpty();
    }

    const afterAuthSync = () => {
        mountLayout();
        updateAuthNav();
        initMenu();
    
        // Read URL params for buy.html (sale page) and pre-fill filters
        if (document.body?.getAttribute('data-page') === 'sale') {
            const sp = new URLSearchParams(window.location.search);
            const paramMap = { q: 'searchInput', district: 'districtFilter', cat: 'categoryFilter', rooms: 'roomsFilter', min: 'minPriceFilter', max: 'maxPriceFilter', furniture: 'furnitureFilter', sort: 'sortFilter' };
            let hasParams = false;
            Object.entries(paramMap).forEach(([param, id]) => {
                const val = sp.get(param);
                const el = document.getElementById(id);
                if (val && el) { el.value = val; hasParams = true; }
            });
            if (hasParams) { setTimeout(() => { if (window.__applyListingFilter) window.__applyListingFilter(); else triggerFilterApply(); }, 100); }
        }
        // For rent/land/commerce/sale: trigger apply if URL has query params
        const curPage = document.body?.getAttribute('data-page');
        if (['rent','land','commerce'].includes(curPage) && window.location.search) {
            setTimeout(() => triggerFilterApply(), 100);
        }

        // Инициализация фильтров на странице поиска
        const _lp = document.body?.getAttribute('data-page');
        const _usesFRL = ['sale','rent','land','commerce'].includes(_lp);
        if (document.getElementById('listings-container') && !_usesFRL) {
            renderListings();
        }
    
        // Автоприменение фильтров при изменении
        const filterInputs = ['searchInput', 'districtFilter', 'categoryFilter', 'roomsFilter', 'maxPriceFilter', 'furnitureFilter', 'sortFilter'];
        filterInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    if (id === 'sortFilter') {
                        applyFilters();
                    }
                });
                
                // Для поля поиска - применяем с задержкой (только для страниц без renderFilteredList)
                if (id === 'searchInput' && !_usesFRL) {
                    let searchTimeout;
                    element.addEventListener('input', () => {
                        clearTimeout(searchTimeout);
                        searchTimeout = setTimeout(() => applyFilters(), 500);
                    });
                }
            }
        });

        // Инициализация подсказок поиска
        initSearchSuggestions('heroSearch', () => {
            heroSearchGo();
        });
        initSearchSuggestions('searchInput');
    
        // Инициализация чатов
        if (document.getElementById('chatList')) {
            initChatSystem();
        }
    
        // Обновление счетчика непрочитанных сообщений
        updateUnreadBadge();
    
        // Периодическое обновление счетчика
        setInterval(updateUnreadBadge, 30000); // каждые 30 секунд
        // Инициализация системы отзывов
        if (document.getElementById('reviewsList')) {
            initReviewsSystem();
        }
        
        initLogin();
        initRegister();
        initAddPageAuthState();
        initAddPageForm();
        initProfile();
        initAdminPages();
        renderHome();
        renderBuy();
        renderFavorites();
        renderDetails();
        initCardTilt();
        initHeroOrbs();
        initHeroParallax();
        const page = document.body?.getAttribute("data-page");
        if (page === "sale") renderFilteredList(["flat", "house"], "sale-category");
        if (page === "land") renderFilteredList(["land"], "category-only");
        if (page === "commerce") renderFilteredList(["commerce"], "category-only");
        if (page === "rent") renderFilteredList(["flat", "house", "commerce"], "rent");
        // Умные фильтры: валюта, комнаты (segmented), документы, land/commerce поля
        upgradeListingFilters();
        // Лалафо-стиль: фильтр "Регион и район"
        initRegionFilterUI();
    };

    const services = getFirebaseServices();
    if (!services) {
        afterAuthSync();
        return;
    }

    Promise.all([
        syncCurrentUserFromFirebase().catch(() => {}),
        syncAdsFromFirestore().catch(() => {})
    ]).finally(afterAuthSync);
});
