/**
 * OpexMetrix Systems — Enterprise ERP + Analytics & Prediction
 */

(function () {
  'use strict';

  const CREDENTIALS = {
    CEO: { login: '00000000000000000000', pass: '00000000000000000000', name: 'Коваленко І. П.', title: 'CEO (Керівник)', initials: 'КІ' },
    CPA: { login: '00000000000000000000', pass: '11111111111111111111', name: 'Шевченко О. В.', title: 'Головний бухгалтер', initials: 'ШО' }
  };

  const state = {
    role: null,
    activeMode: 'TABLE',
    activeView: 'osv',
    viewDisplayMode: 'LIST', // 'LIST' | 'KANBAN' | 'GRAPH'
    selectedGraphMetric: null,
    chartMetric: 'rev',
    noNumbersMode: false,
    searchQuery: '',
    highlightedRowId: null,
    inspectedRowId: null,
    sortCol: null,
    sortDir: 1,
    undoStack: [],
    handoffContext: null,
    docContext: null,
    openTabs: [
      { id: 'acc-cockpit', title: 'Робочий стіл обліку', mode: 'ACC' },
      { id: 'osv', title: 'ОСВ', mode: 'TABLE' }
    ],
    drillAccount: null,
    drillPartner: null,
    docFormLines: [
      { item: 'Панчохи компресійні КЛ-2 (LOT-2026-TC112)', unit: 'пар', qty: 500, price: 640 },
      { item: 'Гольфи компресійні КЛ-1 (LOT-2026-TC118)', unit: 'пар', qty: 300, price: 420 }
    ],
    scanDraft: {
      fileName: 'Фото_накладної_телефон.jpg',
      previewUrl: null,
      docCategory: 'INCOMING',
      docType: 'Прибуткова накладна (Сировина)',
      docNum: 'ПН-009482',
      docDate: '16.11.2026',
      partner: 'ТОВ «Текстиль-Імпорт» (ЄДРПОУ 38491022)',
      itemDesc: 'Пряжа еластанова Lycra 70 DEN (800 кг) — Склад №1',
      amount: 720000,
      vat: 144000,
      postingDt: '201',
      postingCt: '631'
    },
    tasks: [
      { id: 'TSK-101', title: 'Акт звірки: Аптечна мережа АНЦ (Договір №402/26)', sender: 'Савченко Д. І. (Комерційний директор)', recipient: 'Шевченко О. В. (Головний бухгалтер)', priority: 'URGENT', date: '16.11.2026 11:45', view: 'sales-recon', rowId: 'REC-ANC', status: 'ACTIVE', comment: 'Перевірити зарахування оплати на 1 004 000 грн по накладній ВН-004182.' },
      { id: 'TSK-102', title: 'Списання сировини М-29: Наряд WO-2026-4402', sender: 'Мельник С. М. (Нач. швейного цеху)', recipient: 'Коваленко І. П. (CEO)', priority: 'APPROVAL', date: '16.11.2026 10:15', view: 'mes-m29', rowId: 'M29-LYCRA', status: 'ACTIVE', comment: 'Перевитрата пряжі Lycra 70 DEN (+1.8 кг) через переналагодження Merz CC4.' },
      { id: 'TSK-103', title: 'Партія LOT-2026-TC112 (Панчохи КЛ-2)', sender: 'Григоренко П. Т. (Нач. ВТК)', recipient: 'Бондар В. А. (Зав. складом)', priority: 'URGENT', date: '16.11.2026 09:30', view: 'wms-batch', rowId: 'LOT-2026-TC112', status: 'ACTIVE', comment: 'Контрольний тиск 26.4 мм рт. ст. підтверджено.' },
      { id: 'TSK-104', title: 'Замовлення ПД-8812 (ОРТОС — 685 000 грн)', sender: 'Савченко Д. І. (Комерційний директор)', recipient: 'Коваленко І. П. (CEO)', priority: 'APPROVAL', date: '15.11.2026 17:20', view: 'sales-orders', rowId: 'ORD-8812', status: 'ACTIVE', comment: 'Погодити відвантаження в межах кредитного ліміту.' }
    ]
  };

  const DOMAINS = [
    {
      id: 'ANALYTICS',
      title: 'Аналітика та Прогнозування',
      open: true,
      subtypes: [
        { id: 'an-yoy', code: 'YOY', title: 'Порівняння 2025 vs 2026 + Прогноз', tag: 'Prediction +3 міс.' },
        { id: 'an-sku', code: 'ABC', title: 'ABC/XYZ Аналіз SKU та Попит', tag: 'Прогноз замовлень' },
        { id: 'an-chains', code: 'LTV', title: 'Аналітика мереж, DSO та Скоринг', tag: 'Прогноз оплат' },
        { id: 'an-prod', code: 'OEE', title: 'Аналітика цеху (OEE та Запаси)', tag: 'Прогноз дефіциту' },
        { id: 'an-unit', code: 'BEP', title: 'Unit-економіка та Беззбитковість', tag: 'Маржинальність од.' },
        { id: 'an-tax', code: 'TAX', title: 'Податкове навантаження (ПДВ/ФОП)', tag: 'Оптимізація 2026' },
        { id: 'an-ccc', code: 'CCC', title: 'Цикл капіталу (DIO / DSO / DPO)', tag: 'Обігові кошти' },
        { id: 'an-cohort', code: 'RET', title: 'Когортний аналіз аптечних точок', tag: 'Retention мереж' }
      ]
    },
    {
      id: 'GL',
      title: 'Автоматичний облік та Звіти',
      open: true,
      subtypes: [
        { id: 'osv', code: 'ОСВ', title: 'Оборотно-сальдова відомість', tag: 'Синтетичний облік' },
        { id: 'ledger', code: 'ЖУРНАЛ', title: 'Єдиний журнал проводок (Live)', tag: 'Universal Journal' },
        { id: 'posting-setup', code: 'POST', title: 'Матриця автопроводок (Posting)', tag: 'Posting Groups' },
        { id: 'bank-recon', code: 'RECON', title: 'Звірка банку (Side-by-Side AI)', tag: 'Auto Bank Match' },
        { id: 'coa', code: 'COA', title: 'План рахунків (Live залишки)', tag: 'Chart of Accounts' },
        { id: 'fixed-assets', code: 'ОЗ', title: 'Основні засоби та Амортизація', tag: 'Знос 131' },
        { id: 'osv-acc', code: 'ОСВ-Р', title: 'ОСВ по рахунку 361', tag: 'Аналітика мереж' },
        { id: 'card-acc', code: 'КР', title: 'Картка рахунку', tag: 'Хронологія' },
        { id: 'balance', code: 'Ф-1', title: 'Баланс підприємства (Форма №1)', tag: 'НП(С)БО 1' },
        { id: 'pnl-stat', code: 'Ф-2', title: 'Фінансові результати (Форма №2)', tag: 'P&L' },
        { id: 'vat-decl', code: 'ПДВ', title: 'Реєстр ПН та Декларація ПДВ', tag: 'Податки' }
      ]
    },
    {
      id: 'DOCS',
      title: 'Обіг документів (Скан / ЕДО)',
      open: true,
      subtypes: [
        { id: 'doc-scan', code: 'SCAN', title: 'Скан з телефону / ПК (OCR)', tag: 'Фото / PDF → Облік' },
        { id: 'doc-flow', code: 'ЕДО', title: 'Реєстр обігу документів', tag: 'Вчасно / M.E.Doc' },
        { id: 'doc-archive', code: 'КЕП', title: 'Архів підписаних документів', tag: 'ЕЦП / Хеш' }
      ]
    },
    {
      id: 'MES',
      title: 'Виробництво та Собівартість',
      open: false,
      subtypes: [
        { id: 'mes-cost', code: 'СВ', title: 'Калькуляція собівартості', tag: 'Прямі + ЗВВ' },
        { id: 'mes-m29', code: 'М-29', title: 'Списання матеріалів (М-29)', tag: 'Норма / Факт' },
        { id: 'mes-orders', code: 'ВЗ', title: 'Виробничі замовлення', tag: 'Канбан / Цех', hasKanban: true },
        { id: 'mes-boms', code: 'BOM', title: 'Специфікації виробів (BOM)', tag: 'Техкарти' },
        { id: 'mes-scrap', code: 'ВТК', title: 'Акти браку та відхилень', tag: 'Якість' }
      ]
    },
    {
      id: 'WMS',
      title: 'Склад та Партії (WMS)',
      open: false,
      subtypes: [
        { id: 'wms-m19', code: 'М-19', title: 'Матеріальний звіт (М-19)', tag: 'Прихід / Розхід' },
        { id: 'wms-batch', code: 'LOT', title: 'Партійний облік та терміни', tag: 'Серії LOT' },
        { id: 'wms-reserves', code: 'РЕЗ', title: 'Залишки та резерви', tag: 'Доступність SKU' },
        { id: 'wms-inv19', code: 'Інв-19', title: 'Інвентаризація складу', tag: 'Ревізія' }
      ]
    },
    {
      id: 'SALES',
      title: 'Продажі, Мережі та Дебіторка',
      open: false,
      subtypes: [
        { id: 'sales-recon', code: 'АЗВ', title: 'Акт звірки взаєморозрахунків', tag: 'Мережі' },
        { id: 'sales-aging', code: 'AGE', title: 'Старіння дебіторки (Aging)', tag: 'Прострочення' },
        { id: 'sales-orders', code: 'ЗП', title: 'Реєстр замовлень (EDI)', tag: 'Канбан / EDI', hasKanban: true },
        { id: 'sales-margin', code: 'МРЖ', title: 'Маржинальність продажів', tag: 'SKU / Канали' }
      ]
    },
    {
      id: 'CASH',
      title: 'Казначейство та Банк',
      open: false,
      subtypes: [
        { id: 'treasury-stmt', code: 'БВ', title: 'Банківські виписки (IBAN)', tag: 'Рахунки 311' },
        { id: 'treasury-cash', code: 'КО-4', title: 'Касова книга (КО-4)', tag: 'Готівка 301' }
      ]
    },
    {
      id: 'HR',
      title: 'Кадри та Зарплата',
      open: false,
      subtypes: [
        { id: 'hr-payroll', code: 'П-6', title: 'Розрахункова відомість', tag: 'ФОП / Податки' }
      ]
    }
  ];

  const TIME_SERIES = {
    labels: ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру*', 'Січ27*', 'Лют27*'],
    rev: { y2025: [16.2, 17.1, 18.4, 18.0, 17.5, 16.8, 17.2, 18.9, 20.4, 22.1, 23.4, 26.2, null, null], y2026: [19.4, 20.8, 22.1, 21.6, 21.2, 20.5, 21.4, 23.1, 25.0, 27.1, 28.5, null, null, null], pred: [null, null, null, null, null, null, null, null, null, null, 28.5, 31.8, 29.4, 30.6] },
    profit: { y2025: [2.8, 3.0, 3.3, 3.2, 3.0, 2.9, 3.0, 3.4, 3.8, 4.2, 4.56, 5.2, null, null], y2026: [3.9, 4.2, 4.6, 4.4, 4.3, 4.1, 4.4, 4.9, 5.4, 5.9, 6.36, null, null, null], pred: [null, null, null, null, null, null, null, null, null, null, 6.36, 7.25, 6.60, 6.95] },
    cash: { y2025: [7.2, 7.8, 8.1, 8.5, 8.3, 8.0, 8.4, 9.1, 9.8, 10.6, 11.4, 12.8, null, null], y2026: [11.5, 11.9, 12.4, 12.1, 12.6, 12.9, 13.2, 13.6, 14.0, 14.4, 14.91, null, null, null], pred: [null, null, null, null, null, null, null, null, null, null, 14.91, 16.4, 17.1, 18.2] },
    units: { y2025: [32.0, 34.1, 36.5, 35.2, 34.0, 32.5, 33.8, 36.9, 40.1, 43.0, 45.2, 50.4, null, null], y2026: [38.5, 41.2, 43.8, 42.4, 41.5, 40.2, 41.9, 45.6, 49.2, 52.8, 55.4, null, null, null], pred: [null, null, null, null, null, null, null, null, null, null, 55.4, 61.5, 56.8, 58.9] }
  };

  function fmt(val) {
    if (state.noNumbersMode) return '—';
    if (val === null || val === undefined || isNaN(val)) return '—';
    const num = Number(val);
    if (num === 0) return '0.00';
    return num.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtInt(val, suffix = '') {
    if (state.noNumbersMode) return '—';
    if (val === null || val === undefined || isNaN(val)) return '—';
    return Number(val).toLocaleString('uk-UA') + (suffix ? ' ' + suffix : '');
  }

  function fmtPct(val) {
    if (state.noNumbersMode) return '—';
    if (val === null || val === undefined || isNaN(val)) return '—';
    return Number(val).toFixed(1) + '%';
  }

  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  const DATASETS = {
    'an-yoy': {
      columns: [
        { key: 'month', label: 'Період / Місяць', editable: true },
        { key: 'rev25', label: 'Виручка 2025', num: true, editable: true },
        { key: 'rev26', label: 'Виручка 2026', num: true, editable: true },
        { key: 'growth', label: 'Приріст YoY %', num: true, computed: true },
        { key: 'prof25', label: 'Прибуток 2025', num: true, editable: true },
        { key: 'prof26', label: 'Прибуток 2026', num: true, editable: true },
        { key: 'conf', label: 'Точність %', num: true, editable: true },
        { key: 'status', label: 'Тип даних', editable: true }
      ],
      recalcRow: (r) => { r.growth = r.rev25 > 0 ? ((r.rev26 - r.rev25) / r.rev25 * 100) : 0; },
      rows: [
        { id: 'YOY-08', month: 'Серпень 2026', rev25: 18900000, rev26: 23100000, growth: 22.2, prof25: 3400000, prof26: 4900000, conf: 100.0, status: 'Факт (Закрито)' },
        { id: 'YOY-09', month: 'Вересень 2026', rev25: 20400000, rev26: 25000000, growth: 22.5, prof25: 3800000, prof26: 5400000, conf: 100.0, status: 'Факт (Закрито)' },
        { id: 'YOY-10', month: 'Жовтень 2026', rev25: 22100000, rev26: 27100000, growth: 22.6, prof25: 4200000, prof26: 5900000, conf: 100.0, status: 'Факт (Закрито)' },
        { id: 'YOY-11', month: 'Листопад 2026', rev25: 23400000, rev26: 28500000, growth: 21.8, prof25: 4560000, prof26: 6355000, conf: 100.0, status: 'Поточний місяць' },
        { id: 'YOY-12', month: 'Грудень 2026 (Prediction)', rev25: 26200000, rev26: 31800000, growth: 21.4, prof25: 5200000, prof26: 7250000, conf: 94.2, status: 'Прогноз (Зимовий пік)' },
        { id: 'YOY-01', month: 'Січень 2027 (Prediction)', rev25: 19400000, rev26: 29400000, growth: 51.5, prof25: 3900000, prof26: 6600000, conf: 89.5, status: 'Прогноз (Тренд)' },
        { id: 'YOY-02', month: 'Лютий 2027 (Prediction)', rev25: 20800000, rev26: 30600000, growth: 47.1, prof25: 4200000, prof26: 6950000, conf: 87.0, status: 'Прогноз (Модель)' }
      ],
      kpis: (rows) => [
        { title: 'Виручка (Лис 2026)', val: fmt(28500000) + ' грн' },
        { title: 'Аналог. період 2025', val: fmt(23400000) + ' грн' },
        { title: 'Приріст YoY', val: '+21.8%' },
        { title: 'Прогноз Гру 2026', val: fmt(31800000) + ' грн' }
      ],
      summary: (rows) => `<div>Періодів: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Модель точності: 94.2%</span></div>`
    },

    'an-sku': {
      columns: [
        { key: 'sku', label: 'SKU', editable: true },
        { key: 'name', label: 'Номенклатура', editable: true },
        { key: 'rev', label: 'Виручка (міс)', num: true, editable: true },
        { key: 'share', label: 'Частка %', num: true, editable: true },
        { key: 'abc', label: 'ABC / XYZ', editable: true },
        { key: 'predQty', label: 'Прогноз попиту (Гру)', num: true, editable: true },
        { key: 'recStock', label: 'Рек. запас', num: true, editable: true },
        { key: 'status', label: 'Рекомендація', editable: true }
      ],
      rows: [
        { id: 'SKU-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи компресійні КЛ-2 (Чорні)', rev: 9400000, share: 33.0, abc: 'AX (Хіт)', predQty: 5400, recStock: 1800, status: 'Збільшити випуск +18%' },
        { id: 'SKU-2', sku: 'ALK-BP4-L', name: 'Бандаж попереково-крижовий БП-4', rev: 6800000, share: 23.9, abc: 'AX (Стабільний)', predQty: 3400, recStock: 1100, status: 'Норма запасу ОК' },
        { id: 'SKU-3', sku: 'ALK-GL1-L', name: 'Гольфи антиемболічні КЛ-1', rev: 5100000, share: 17.9, abc: 'AY (Клініки)', predQty: 7200, recStock: 2400, status: 'Тендерний пік' },
        { id: 'SKU-4', sku: 'ALK-OR2-S', name: 'Ортез колінний шарнірний OR-2', rev: 4200000, share: 14.7, abc: 'BX (Сезонний)', predQty: 1950, recStock: 650, status: 'Ризик попиту +25%' },
        { id: 'SKU-5', sku: 'ALK-INS-41', name: 'Устілки ортопедичні (Зима)', rev: 3000000, share: 10.5, abc: 'CY (Імпульс)', predQty: 3100, recStock: 900, status: 'Підтримати залишок' }
      ],
      kpis: (rows) => [
        { title: 'Група A (Локомотиви)', val: '3 SKU (74.8%)' },
        { title: 'Прогноз випуску Гру', val: fmtInt(21050, 'шт') },
        { title: 'Страховий запас', val: fmtInt(6850, 'шт') },
        { title: 'Лідер виручки', val: 'КЛ-2 (33.0%)' }
      ],
      summary: () => `<div>ABC/XYZ Матриця</div><div class="summary-checksum"><span class="checksum-badge">74.8% виручки дають 3 категорії</span></div>`
    },

    'an-chains': {
      columns: [
        { key: 'chain', label: 'Аптечна мережа', editable: true },
        { key: 'rev', label: 'Оборот (міс)', num: true, editable: true },
        { key: 'margin', label: 'Маржа %', num: true, editable: true },
        { key: 'avgCheck', label: 'Середнє замовл.', num: true, editable: true },
        { key: 'dso', label: 'DSO (днів)', num: true, editable: true },
        { key: 'predPay', label: 'Прогноз оплати', num: true, editable: true },
        { key: 'payDate', label: 'Дата оплати', editable: true },
        { key: 'status', label: 'Скоринг', editable: true }
      ],
      rows: [
        { id: 'CH-1', chain: 'ТОВ «Аптека АНЦ»', rev: 9450000, margin: 41.2, avgCheck: 1420000, dso: 16, predPay: 1950000, payDate: '20.11.2026', status: 'AAA (Надійний)' },
        { id: 'CH-2', chain: 'ТОВ «Подорожник»', rev: 7800000, margin: 39.8, avgCheck: 1180000, dso: 18, predPay: 1600000, payDate: '22.11.2026', status: 'AAA (Надійний)' },
        { id: 'CH-3', chain: 'ТОВ «ОРТОС»', rev: 4620000, margin: 43.5, avgCheck: 685000, dso: 24, predPay: 850000, payDate: '25.11.2026', status: 'AA (Контроль ліміту)' },
        { id: 'CH-4', chain: 'Аптека 9-1-1', rev: 3650000, margin: 38.4, avgCheck: 740000, dso: 15, predPay: 900000, payDate: '19.11.2026', status: 'AAA (Надійний)' },
        { id: 'CH-5', chain: 'ММ «Добробут»', rev: 2980000, margin: 44.0, avgCheck: 490000, dso: 14, predPay: 630000, payDate: '18.11.2026', status: 'AAA (Надійний)' }
      ],
      kpis: (rows) => [
        { title: 'Активних мереж', val: rows.length + ' мереж' },
        { title: 'Середній DSO', val: '17.4 дн.' },
        { title: 'Середня маржа', val: '41.4%' },
        { title: 'Прогноз Cash-In', val: fmt(5930000) + ' грн' }
      ],
      summary: (rows) => `<div>Прогноз надходжень: <strong>${fmt(rows.reduce((s, r) => s + Number(r.predPay), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Скоринг портфеля: AAA</span></div>`
    },

    'an-prod': {
      columns: [
        { key: 'line', label: 'Дільниця / Лінія', editable: true },
        { key: 'oee', label: 'OEE %', num: true, editable: true },
        { key: 'output', label: 'Випуск (шт)', num: true, editable: true },
        { key: 'scrap', label: 'Брак %', num: true, editable: true },
        { key: 'matDays', label: 'Запас сировини (дн)', num: true, editable: true },
        { key: 'status', label: 'Прогноз та Ризики', editable: true }
      ],
      rows: [
        { id: 'PR-1', line: 'В’язальний цех (Merz CC4 #1-4)', oee: 89.4, output: 18500, scrap: 0.31, matDays: 11, status: 'УВАГА: Замовити Lycra 70D' },
        { id: 'PR-2', line: 'В’язальний цех (Merz CC4 #5-8)', oee: 91.2, output: 21400, scrap: 0.24, matDays: 19, status: 'Завантажено оптимально' },
        { id: 'PR-3', line: 'Розкрійний комплекс CAD/CAM', oee: 86.0, output: 11200, scrap: 0.40, matDays: 24, status: 'ОК (Резерв +14%)' },
        { id: 'PR-4', line: 'Складальна дільниця (Ортези)', oee: 78.5, output: 4300, scrap: 0.52, matDays: 16, status: 'Потрібна 2-га зміна' }
      ],
      kpis: () => [
        { title: 'Середній OEE', val: '86.3%' },
        { title: 'Випуск за місяць', val: fmtInt(55400, 'шт') },
        { title: 'Середній брак', val: '0.32%' },
        { title: 'Мін. запас сировини', val: '11 днів (Lycra)' }
      ],
      summary: () => `<div>Ефективність цеху (OEE): <strong>86.3%</strong></div><div class="summary-checksum"><span class="checksum-badge">Норма браку &lt; 1.0% витримана</span></div>`
    },

    'an-unit': {
      columns: [
        { key: 'sku', label: 'SKU / Виріб', editable: true },
        { key: 'price', label: 'Ціна реалізації', num: true, editable: true },
        { key: 'varCost', label: 'Змінні витрати', num: true, editable: true },
        { key: 'cm', label: 'Маржин. дохід/од.', num: true, computed: true },
        { key: 'bepQty', label: 'Точка беззбитковості (шт)', num: true, editable: true },
        { key: 'factQty', label: 'Факт продажів (шт)', num: true, editable: true },
        { key: 'safety', label: 'Запас міцності %', num: true, computed: true }
      ],
      recalcRow: (r) => {
        r.cm = Number(r.price) - Number(r.varCost);
        r.safety = Number(r.factQty) > 0 ? ((Number(r.factQty) - Number(r.bepQty)) / Number(r.factQty) * 100) : 0;
      },
      rows: [
        { id: 'UN-1', sku: 'Панчохи КЛ-2 (Чорні, M)', price: 540, varCost: 270, cm: 270, bepQty: 1450, factQty: 4200, safety: 65.5 },
        { id: 'UN-2', sku: 'Бандаж поперековий БП-4', price: 890, varCost: 470, cm: 420, bepQty: 920, factQty: 2800, safety: 67.1 },
        { id: 'UN-3', sku: 'Ортез колінний OR-2', price: 1280, varCost: 700, cm: 580, bepQty: 510, factQty: 1450, safety: 64.8 },
        { id: 'UN-4', sku: 'Гольфи антиемболічні КЛ-1', price: 340, varCost: 180, cm: 160, bepQty: 2100, factQty: 6500, safety: 67.7 }
      ],
      kpis: () => [
        { title: 'Середній запас міцності', val: '66.3%' },
        { title: 'Точка беззбитковості', val: fmtInt(4980, 'шт/міс') },
        { title: 'Маржинальний дохід', val: fmt(445) + ' грн/од' },
        { title: 'Операційний важіль', val: '2.1x' }
      ],
      summary: () => `<div>Запас фінансової міцності: <strong>66.3%</strong></div><div class="summary-checksum"><span class="checksum-badge">Всі SKU вище точки беззбитковості</span></div>`
    },

    'an-tax': {
      columns: [
        { key: 'tax', label: 'Податок / Збір', editable: true },
        { key: 'base', label: 'База оподаткування', num: true, editable: true },
        { key: 'rate', label: 'Ефект. ставка %', num: true, editable: true },
        { key: 'y2025', label: 'Нараховано 2025', num: true, editable: true },
        { key: 'y2026', label: 'Нараховано 2026', num: true, editable: true },
        { key: 'shareRev', label: '% від виручки', num: true, computed: true },
        { key: 'status', label: 'Статус сплати', editable: true }
      ],
      recalcRow: (r) => { r.shareRev = Number(r.y2026) / 28500000 * 100; },
      rows: [
        { id: 'TX-1', tax: 'ПДВ (Медвироби 7% / Імпорт 20%)', base: 2150000, rate: 7.0, y2025: 128000, y2026: 150500, shareRev: 0.5, status: 'Оптимізовано (ПК 490k)' },
        { id: 'TX-2', tax: 'Податок на прибуток (18%)', base: 7750000, rate: 18.0, y2025: 1000800, y2026: 1395000, shareRev: 4.9, status: 'Сплачується в строк' },
        { id: 'TX-3', tax: 'ПДФО (18%) + Військовий збір (5%)', base: 3840000, rate: 23.0, y2025: 760000, y2026: 883200, shareRev: 3.1, status: 'Утримано з ФОП' },
        { id: 'TX-4', tax: 'ЄСВ роботодавця (22%)', base: 3840000, rate: 22.0, y2025: 745000, y2026: 844800, shareRev: 3.0, status: 'Нараховано' }
      ],
      kpis: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.y2026), 0);
        return [
          { title: 'Податки за місяць', val: fmt(tot) + ' грн' },
          { title: 'Податкове навантаження', val: '11.5% виручки' },
          { title: 'Податковий кредит ПДВ', val: fmt(490000) + ' грн' },
          { title: 'Ризик блокування ПН', val: '0.0% (Низький)' }
        ];
      },
      summary: (rows) => `<div>Загальні податки: <strong>${fmt(rows.reduce((s, r) => s + Number(r.y2026), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Ефективне навантаження: 11.5%</span></div>`
    },

    'an-ccc': {
      columns: [
        { key: 'period', label: 'Період', editable: true },
        { key: 'dio', label: 'DIO (Запаси, дн.)', num: true, editable: true },
        { key: 'dso', label: 'DSO (Дебіторка, дн.)', num: true, editable: true },
        { key: 'dpo', label: 'DPO (Постачальники, дн.)', num: true, editable: true },
        { key: 'ccc', label: 'Цикл CCC (днів)', num: true, computed: true },
        { key: 'frozen', label: 'Заморожено коштів (грн)', num: true, editable: true }
      ],
      recalcRow: (r) => { r.ccc = Number(r.dio) + Number(r.dso) - Number(r.dpo); },
      rows: [
        { id: 'CCC-1', period: 'Q1 2026', dio: 52.0, dso: 24.5, dpo: 19.0, ccc: 57.5, frozen: 18400000 },
        { id: 'CCC-2', period: 'Q2 2026', dio: 48.0, dso: 21.0, dpo: 20.5, ccc: 48.5, frozen: 16200000 },
        { id: 'CCC-3', period: 'Q3 2026', dio: 44.5, dso: 19.2, dpo: 21.0, ccc: 42.7, frozen: 14900000 },
        { id: 'CCC-4', period: 'Листопад 2026', dio: 42.0, dso: 17.4, dpo: 22.0, ccc: 37.4, frozen: 13200000 },
        { id: 'CCC-5', period: 'Прогноз Q1 2027', dio: 38.0, dso: 16.0, dpo: 23.0, ccc: 31.0, frozen: 11500000 }
      ],
      kpis: () => [
        { title: 'Поточний цикл CCC', val: '37.4 днів' },
        { title: 'Вивільнено за рік', val: '+5.20M грн' },
        { title: 'Оборотність запасів DIO', val: '42.0 дн.' },
        { title: 'Прогноз CCC Q1 2027', val: '31.0 дн.' }
      ],
      summary: () => `<div>Прискорення оборотності за 2026: <strong>-20.1 днів</strong></div><div class="summary-checksum"><span class="checksum-badge">Вивільнено в кеш: +5 200 000 грн</span></div>`
    },

    'an-cohort': {
      columns: [
        { key: 'chain', label: 'Мережа / Канал', editable: true },
        { key: 'stores', label: 'Активних аптек', num: true, editable: true },
        { key: 'ret3m', label: 'Retention 3 міс %', num: true, editable: true },
        { key: 'ret6m', label: 'Retention 6 міс %', num: true, editable: true },
        { key: 'skuPerStore', label: 'Середньо SKU/точку', num: true, editable: true },
        { key: 'growth', label: 'Приріст чеку %', num: true, editable: true }
      ],
      rows: [
        { id: 'COH-1', chain: 'ТОВ «Аптека АНЦ»', stores: 1120, ret3m: 98.4, ret6m: 96.2, skuPerStore: 18.5, growth: 14.2 },
        { id: 'COH-2', chain: 'ТОВ «Подорожник»', stores: 1480, ret3m: 97.8, ret6m: 94.8, skuPerStore: 16.2, growth: 16.8 },
        { id: 'COH-3', chain: 'Аптека 9-1-1', stores: 890, ret3m: 96.5, ret6m: 93.0, skuPerStore: 14.0, growth: 11.5 },
        { id: 'COH-4', chain: 'ТОВ «ОРТОС» (Спецсалони)', stores: 64, ret3m: 100.0, ret6m: 98.4, skuPerStore: 42.0, growth: 22.4 }
      ],
      kpis: () => [
        { title: 'Активних точок продажу', val: '3 554 аптек' },
        { title: 'Середній Retention 6м', val: '95.6%' },
        { title: 'Середньо SKU на точку', val: '22.7 поз.' },
        { title: 'Лідер росту чеку', val: 'ОРТОС (+22.4%)' }
      ],
      summary: () => `<div>Покриття України: <strong>3 554 торгових точок</strong></div><div class="summary-checksum"><span class="checksum-badge">Retention 6 міс: 95.6%</span></div>`
    },

    'doc-scan': {
      columns: [
        { key: 'docNum', label: '№ Документа', editable: true },
        { key: 'docType', label: 'Тип', editable: true },
        { key: 'partner', label: 'Контрагент', editable: true },
        { key: 'amount', label: 'Сума (грн)', num: true, editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'SCN-1', docNum: 'ПН-009482', docType: 'Скан з телефону (OCR)', partner: 'ТОВ «Текстиль-Імпорт»', amount: 720000, status: 'Очікує проведення' }
      ],
      kpis: () => [
        { title: 'Розпізнавання (OCR)', val: 'Фото / PDF / Камера' },
        { title: 'Авто-визначення Дт/Кт', val: 'Posting Groups' },
        { title: 'Середній час обробки', val: '3 секунди' },
        { title: 'Інтеграція ЕДО', val: 'Вчасно / M.E.Doc' }
      ],
      summary: () => `<div>Завантажте фото з телефону або PDF-скан з комп’ютера для миттєвого проведення в облік</div><div class="summary-checksum"><span class="checksum-badge">OCR + ЕЦП активні</span></div>`
    },

    'doc-flow': {
      columns: [
        { key: 'id', label: '№ Документа', editable: true },
        { key: 'date', label: 'Дата', editable: true },
        { key: 'type', label: 'Вид документа', editable: true },
        { key: 'partner', label: 'Контрагент / Відправник', editable: true },
        { key: 'channel', label: 'Джерело (Скан / ЕДО)', editable: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true },
        { key: 'status', label: 'Статус обігу', editable: true }
      ],
      rows: [
        { id: 'ВН-004182', date: '16.11.2026', type: 'Видаткова накладна + ТТН', partner: 'ТОВ «Аптека АНЦ»', channel: 'Вчасно.ЕДО (КЕП)', sum: 1004000, status: 'Очікує підпису контрагента' },
        { id: 'ПН-009480', date: '16.11.2026', type: 'Прибуткова накладна (Сировина)', partner: 'ТОВ «Текстиль-Імпорт»', channel: 'Скан з телефону (OCR)', sum: 864000, status: 'Проведено (Дт 201 Кт 631)' },
        { id: 'АЗВ-402', date: '15.11.2026', type: 'Акт звірки взаєморозрахунків', partner: 'ТОВ «Подорожник»', channel: 'M.E.Doc (КЕП)', sum: 1810000, status: 'Підписано з двох сторін' },
        { id: 'ТТН-8819', date: '15.11.2026', type: 'Товарно-транспортна накладна', partner: 'Нова Пошта / ТОВ «ОРТОС»', channel: 'Скан з ПК (PDF)', sum: 685000, status: 'Підписано та проведено' }
      ],
      kpis: (rows) => [
        { title: 'Документів в обігу', val: rows.length },
        { title: 'Підписано КЕП / Проведено', val: rows.filter(r => r.status.includes('Підпис') || r.status.includes('Провед')).length },
        { title: 'Отримано через Скан/Фото', val: rows.filter(r => r.channel.includes('Скан')).length },
        { title: 'Електронний обмін', val: 'Вчасно.ЕДО + M.E.Doc' }
      ],
      summary: (rows) => `<div>Загальна сума документів в обігу: <strong>${fmt(rows.reduce((s, r) => s + Number(r.sum), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">100% первинних документів зі сканом/КЕП</span></div>`
    },

    'doc-archive': {
      columns: [
        { key: 'id', label: 'ID Архіва', editable: true },
        { key: 'date', label: 'Дата підпису', editable: true },
        { key: 'doc', label: 'Документ', editable: true },
        { key: 'signer', label: 'Підписант (КЕП)', editable: true },
        { key: 'hash', label: 'Криптографічний хеш (SHA-256)', editable: true },
        { key: 'status', label: 'Статус зберігання', editable: true }
      ],
      rows: [
        { id: 'ARC-101', date: '15.11.2026 17:42', doc: 'АЗВ-402 (ТОВ «Подорожник»)', signer: 'Шевченко О. В. (ЦСК «Україна»)', hash: '8f4a2c91...d03e12', status: 'Незмінний архів (OK)' },
        { id: 'ARC-102', date: '15.11.2026 15:10', doc: 'ТТН-8819 (ТОВ «ОРТОС»)', signer: 'Коваленко І. П. (Приват24 КЕП)', hash: '3b71e90a...4419bc', status: 'Незмінний архів (OK)' },
        { id: 'ARC-103', date: '14.11.2026 11:20', doc: 'МД №100294 (Імпорт Lycra 70D)', signer: 'Шевченко О. В. (ЦСК «Україна»)', hash: '9c12a04f...8810ef', status: 'Незмінний архів (OK)' }
      ],
      summary: (rows) => `<div>Документів у крипто-архіві: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Перевірка цілісності: OK</span></div>`
    },

    'posting-setup': {
      columns: [
        { key: 'busGroup', label: 'Бізнес-група (ХТО)', editable: true },
        { key: 'prodGroup', label: 'Товарна група (ЩО)', editable: true },
        { key: 'ctrlAcc', label: 'Контр. рахунок', editable: true },
        { key: 'revAcc', label: 'Дохід (Кт)', editable: true },
        { key: 'cogsAcc', label: 'Собівартість (Дт)', editable: true },
        { key: 'vatRate', label: 'Ставка ПДВ %', num: true, editable: true },
        { key: 'status', label: 'Статус правила', editable: true }
      ],
      rows: [
        { id: 'PS-1', busGroup: 'DOMESTIC (Аптечні мережі)', prodGroup: 'MED_KNIT (Медвироби 7%)', ctrlAcc: '361', revAcc: '701', cogsAcc: '901 / 26', vatRate: 7.0, status: 'Активне (Авто)' },
        { id: 'PS-2', busGroup: 'DOMESTIC (Клініки/Ортосалони)', prodGroup: 'ORTHO_20 (Взуття/Товари)', ctrlAcc: '361', revAcc: '702', cogsAcc: '902 / 281', vatRate: 20.0, status: 'Активне (Авто)' },
        { id: 'PS-3', busGroup: 'IMPORT_EU (Постачальники ЄС)', prodGroup: 'RAW_YARN (Сировина Lycra)', ctrlAcc: '632', revAcc: '—', cogsAcc: '201', vatRate: 20.0, status: 'Активне (Авто)' },
        { id: 'PS-4', busGroup: 'PROD_WIP (Внутрішній цех)', prodGroup: 'WIP_MERZ (Випуск Merz CC4)', ctrlAcc: '23', revAcc: '26', cogsAcc: '23 / 201', vatRate: 0.0, status: 'Активне (Авто)' }
      ],
      kpis: (rows) => [
        { title: 'Активних правил Posting', val: rows.length },
        { title: 'Автоматизація проводок', val: '100% (Без ручного вибору)' },
        { title: 'Податкові групи (Tax Grid)', val: '7% / 20% / 0%' },
        { title: 'Розсинхрон Subledger-GL', val: 'Неможливий (0.00)' }
      ],
      summary: () => `<div>Матриця автоматичного визначення рахунків (Posting Groups)</div><div class="summary-checksum"><span class="checksum-badge">Оператор не обирає Дт/Кт вручну</span></div>`
    },

    'bank-recon': {
      columns: [
        { key: 'date', label: 'Дата виписки', editable: true },
        { key: 'partner', label: 'Контрагент (Приват24 / Райф)', editable: true },
        { key: 'purpose', label: 'Призначення платежу', editable: true },
        { key: 'amount', label: 'Сума (грн)', num: true, editable: true },
        { key: 'matchInv', label: 'AI-Підбір інвойсу', editable: true },
        { key: 'conf', label: 'Збіг %', num: true, editable: true },
        { key: 'status', label: 'Статус звірки', editable: true }
      ],
      rows: [
        { id: 'BR-1', date: '16.11.2026', partner: 'ТОВ «Аптека АНЦ»', purpose: 'Оплата зг. дог. 402/26 ВН-004182', amount: 1004000, matchInv: 'ВН-004182 (Дт 311 Кт 361)', conf: 99.8, status: 'Готово до звірки' },
        { id: 'BR-2', date: '16.11.2026', partner: 'ТОВ «Подорожник»', purpose: 'За ортопедичні вироби рах. 8819', amount: 540000, matchInv: 'ВН-004155 (Дт 311 Кт 361)', conf: 97.4, status: 'Готово до звірки' },
        { id: 'BR-3', date: '15.11.2026', partner: 'АТ КБ «ПриватБанк»', purpose: 'Комісія за РКО листопад', amount: -2450, matchInv: 'Списання на 92 (Дт 92 Кт 311)', conf: 100.0, status: 'Готово до звірки' },
        { id: 'BR-4', date: '15.11.2026', partner: 'ММ «Добробут»', purpose: 'Часткова оплата по ВН-004182', amount: 630000, matchInv: 'ВН-004182 (Дт 311 Кт 361)', conf: 95.0, status: 'Звірено автоматично' }
      ],
      kpis: (rows) => {
        const pending = rows.filter(r => r.status.includes('Готово')).length;
        return [
          { title: 'До звірки сьогодні', val: pending + ' платежі' },
          { title: 'Авто-підбір AI / Rules', val: '98.1% точність' },
          { title: 'Оброблено автоматично', val: '124 транзакції' },
          { title: 'Статус виписки', val: 'Синхронізовано' }
        ];
      },
      summary: () => `<div>Інтерактивна звірка банку (AI Auto-Matching)</div><div class="summary-checksum"><span class="checksum-badge">1-Клік проведення в ОСВ</span></div>`
    },

    'coa': {
      columns: [
        { key: 'acc', label: 'Код', editable: true },
        { key: 'name', label: 'Назва рахунку (План рахунків)', editable: true },
        { key: 'type', label: 'Тип (Class)', editable: true },
        { key: 'ctrl', label: 'Контроль субкниги', editable: true },
        { key: 'balance', label: 'Live Сальдо (грн)', num: true, editable: true }
      ],
      rows: [
        { id: 'COA-10', acc: '10', name: 'Основні засоби (Обладнання цеху)', type: 'Asset (Необоротні)', ctrl: 'Основні засоби', balance: 18870000 },
        { id: 'COA-201', acc: '201', name: 'Сировина й матеріали', type: 'Asset (Запаси)', ctrl: 'Складський облік', balance: 5030000 },
        { id: 'COA-23', acc: '23', name: 'Виробництво (WIP)', type: 'Asset (Виробництво)', ctrl: 'Наряди цеху', balance: 1370000 },
        { id: 'COA-26', acc: '26', name: 'Готова продукція', type: 'Asset (Запаси)', ctrl: 'Партії LOT', balance: 5880000 },
        { id: 'COA-311', acc: '311', name: 'Поточні рахунки в банках', type: 'Liquidity (Гроші)', ctrl: 'Банк-Клієнт', balance: 14850000 },
        { id: 'COA-361', acc: '361', name: 'Розрахунки з покупцями', type: 'Receivable (Субкнига AR)', ctrl: 'Тільки через AR', balance: 7000000 },
        { id: 'COA-631', acc: '631', name: 'Розрахунки з постачальниками', type: 'Payable (Субкнига AP)', ctrl: 'Тільки через AP', balance: -3670000 },
        { id: 'COA-641', acc: '641', name: 'Розрахунки за податками', type: 'Liability (Податки)', ctrl: 'Tax Grid ПДВ', balance: -1680000 }
      ],
      summary: () => `<div>Інтерактивний План рахунків (Chart of Accounts)</div><div class="summary-checksum"><span class="checksum-badge">Live агрегація з Universal Journal</span></div>`
    },

    'fixed-assets': {
      columns: [
        { key: 'inv', label: 'Інв. №', editable: true },
        { key: 'name', label: 'Об’єкт основних засобів', editable: true },
        { key: 'cost', label: 'Первісна вартість', num: true, editable: true },
        { key: 'deprAcc', label: 'Накопичений знос (131)', num: true, editable: true },
        { key: 'monthly', label: 'Міс. амортизація', num: true, editable: true },
        { key: 'net', label: 'Залишкова вартість', num: true, computed: true },
        { key: 'status', label: 'Стан', editable: true }
      ],
      recalcRow: (r) => { r.net = Number(r.cost) - Number(r.deprAcc); },
      rows: [
        { id: 'FA-1', inv: 'ОЗ-00101', name: 'В’язальні автомати Merz CC4 (Лінія №1, 4 шт)', cost: 9200000, deprAcc: 2100000, monthly: 95000, net: 7100000, status: 'В експлуатації' },
        { id: 'FA-2', inv: 'ОЗ-00102', name: 'В’язальні автомати Merz CC4 (Лінія №2, 4 шт)', cost: 6400000, deprAcc: 1280000, monthly: 62000, net: 5120000, status: 'В експлуатації' },
        { id: 'FA-3', inv: 'ОЗ-00204', name: 'Автоматичний розкрійний комплекс CAD/CAM', cost: 2450000, deprAcc: 640000, monthly: 20400, net: 1810000, status: 'В експлуатації' },
        { id: 'FA-4', inv: 'ОЗ-00309', name: 'Стенд тестування компресійного тиску HATRA', cost: 820000, deprAcc: 285000, monthly: 7600, net: 535000, status: 'В експлуатації' }
      ],
      kpis: (rows) => {
        const totNet = rows.reduce((s, r) => s + Number(r.net), 0);
        const totMon = rows.reduce((s, r) => s + Number(r.monthly), 0);
        return [
          { title: 'Об’єктів ОЗ', val: rows.length + ' ліній' },
          { title: 'Залишкова вартість', val: fmt(totNet) + ' грн' },
          { title: 'Місячна амортизація', val: fmt(totMon) + ' грн' },
          { title: 'Метод нарахування', val: 'Прямолінійний (Авто)' }
        ];
      },
      summary: (rows) => `<div>Місячний знос (Дт 23 Кт 131): <strong>${fmt(rows.reduce((s, r) => s + Number(r.monthly), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Графік амортизації активний</span></div>`
    },

    'osv': {
      columns: [
        { key: 'acc', label: 'Рахунок', editable: true },
        { key: 'name', label: 'Найменування рахунку', editable: true },
        { key: 'begDt', label: 'Поч. Дт', num: true, editable: true },
        { key: 'begCt', label: 'Поч. Кт', num: true, editable: true },
        { key: 'turnDt', label: 'Оборот Дт', num: true, editable: true },
        { key: 'turnCt', label: 'Оборот Кт', num: true, editable: true },
        { key: 'endDt', label: 'Кін. Дт', num: true, computed: true },
        { key: 'endCt', label: 'Кін. Кт', num: true, computed: true }
      ],
      recalcRow: (r) => {
        const net = (Number(r.begDt) - Number(r.begCt)) + (Number(r.turnDt) - Number(r.turnCt));
        r.endDt = net > 0 ? net : 0;
        r.endCt = net < 0 ? Math.abs(net) : 0;
      },
      rows: [
        { id: '10', acc: '10', name: 'Основні засоби (Merz CC4, CAD/CAM)', begDt: 18450000, begCt: 0, turnDt: 420000, turnCt: 0, endDt: 18870000, endCt: 0 },
        { id: '131', acc: '131', name: 'Знос основних засобів', begDt: 0, begCt: 4120000, turnDt: 0, turnCt: 185000, endDt: 0, endCt: 4305000 },
        { id: '201', acc: '201', name: 'Сировина й матеріали (Lycra, PA 6.6)', begDt: 4820000, begCt: 0, turnDt: 3150000, turnCt: 2940000, endDt: 5030000, endCt: 0 },
        { id: '23', acc: '23', name: 'Виробництво (НЗВ цеху)', begDt: 1120000, begCt: 0, turnDt: 6840000, turnCt: 6590000, endDt: 1370000, endCt: 0 },
        { id: '26', acc: '26', name: 'Готова продукція', begDt: 6410000, begCt: 0, turnDt: 6590000, turnCt: 7120000, endDt: 5880000, endCt: 0 },
        { id: '281', acc: '281', name: 'Товари на складі', begDt: 2150000, begCt: 0, turnDt: 1890000, turnCt: 1740000, endDt: 2300000, endCt: 0 },
        { id: '301', acc: '301', name: 'Готівка в касі', begDt: 42500, begCt: 0, turnDt: 180000, turnCt: 165000, endDt: 57500, endCt: 0 },
        { id: '311', acc: '311', name: 'Поточні рахунки в банках', begDt: 11420000, begCt: 0, turnDt: 29450000, turnCt: 26020000, endDt: 14850000, endCt: 0 },
        { id: '361', acc: '361', name: 'Розрахунки з покупцями (Мережі)', begDt: 5640000, begCt: 0, turnDt: 28500000, turnCt: 27140000, endDt: 7000000, endCt: 0 },
        { id: '40', acc: '40', name: 'Зареєстрований (статутний) капітал', begDt: 0, begCt: 35000000, turnDt: 0, turnCt: 0, endDt: 0, endCt: 35000000 },
        { id: '44', acc: '44', name: 'Нерозподілений прибуток', begDt: 0, begCt: 4482500, turnDt: 0, turnCt: 4280000, endDt: 0, endCt: 8762500 },
        { id: '631', acc: '631', name: 'Розрахунки з постачальниками', begDt: 0, begCt: 3180000, turnDt: 4920000, turnCt: 5410000, endDt: 0, endCt: 3670000 },
        { id: '641', acc: '641', name: 'Розрахунки за податками', begDt: 0, begCt: 1420000, turnDt: 1420000, turnCt: 1680000, endDt: 0, endCt: 1680000 },
        { id: '661', acc: '661', name: 'Розрахунки за зарплатою', begDt: 0, begCt: 1850000, turnDt: 1850000, turnCt: 1940000, endDt: 0, endCt: 1940000 },
        { id: '701', acc: '701', name: 'Дохід від реалізації', begDt: 0, begCt: 0, turnDt: 28500000, turnCt: 28500000, endDt: 0, endCt: 0 },
        { id: '901', acc: '901', name: 'Собівартість реалізації', begDt: 0, begCt: 0, turnDt: 17120000, turnCt: 17120000, endDt: 0, endCt: 0 },
        { id: '92', acc: '92', name: 'Адміністративні витрати', begDt: 0, begCt: 0, turnDt: 1950000, turnCt: 1950000, endDt: 0, endCt: 0 },
        { id: '93', acc: '93', name: 'Витрати на збут', begDt: 0, begCt: 0, turnDt: 1680000, turnCt: 1680000, endDt: 0, endCt: 0 }
      ],
      kpis: (rows) => {
        const dt = rows.reduce((s, r) => s + Number(r.turnDt || 0), 0);
        const ct = rows.reduce((s, r) => s + Number(r.turnCt || 0), 0);
        const endDt = rows.reduce((s, r) => s + Number(r.endDt || 0), 0);
        return [
          { title: 'Активних рахунків', val: rows.length },
          { title: 'Обороти Дт', val: fmt(dt) + ' грн' },
          { title: 'Сальдо Дт', val: fmt(endDt) + ' грн' },
          { title: 'Контроль Дт=Кт', val: Math.abs(dt - ct) < 0.01 ? '0.00 (OK)' : fmt(Math.abs(dt - ct)) }
        ];
      },
      summary: (rows) => {
        const dt = rows.reduce((s, r) => s + Number(r.turnDt || 0), 0);
        const ct = rows.reduce((s, r) => s + Number(r.turnCt || 0), 0);
        return `<div>Обороти Дт: <strong>${fmt(dt)}</strong> | Кт: <strong>${fmt(ct)}</strong></div><div class="summary-checksum"><span class="checksum-badge">${Math.abs(dt - ct) < 0.01 ? 'Баланс Дт=Кт: OK' : 'Різниця: ' + fmt(Math.abs(dt - ct))}</span></div>`;
      }
    },

    'ledger': {
      columns: [
        { key: 'time', label: 'Час', editable: true },
        { key: 'doc', label: 'Документ', editable: true },
        { key: 'dt', label: 'Дебет', editable: true },
        { key: 'ct', label: 'Кредит', editable: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true },
        { key: 'desc', label: 'Зміст операції', editable: true },
        { key: 'status', label: 'Джерело', editable: true }
      ],
      rows: [
        { id: 'JRN-1', time: '16.11 11:45', doc: 'ВН-004182', dt: '361', ct: '701', sum: 1814000, desc: 'Реалізація ортезів ММ «Добробут»', status: 'Авто-проводка' },
        { id: 'JRN-2', time: '16.11 10:15', doc: 'М29-4402', dt: '23', ct: '201', sum: 486200, desc: 'Списання пряжі Lycra 70 DEN у цех', status: 'Авто-проводка' },
        { id: 'JRN-3', time: '15.11 16:40', doc: 'БВ-009310', dt: '311', ct: '361', sum: 1004000, desc: 'Надходження оплати від ТОВ «Аптека АНЦ»', status: 'Банк-Клієнт' },
        { id: 'JRN-4', time: '15.11 14:10', doc: 'НВ-4411', dt: '26', ct: '23', sum: 1170000, desc: 'Оприбуткування гольфів КЛ-1 на склад ГП', status: 'Цех Merz CC4' }
      ],
      summary: (rows) => `<div>Проводок: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Сума: ${fmt(rows.reduce((s, r) => s + Number(r.sum), 0))}</span></div>`
    },

    'osv-acc': {
      columns: [
        { key: 'sub', label: 'Контрагент / Мережа', editable: true },
        { key: 'code', label: 'ЄДРПОУ', editable: true },
        { key: 'begDt', label: 'Поч. Дт', num: true, editable: true },
        { key: 'turnDt', label: 'Відвантажено (Дт)', num: true, editable: true },
        { key: 'turnCt', label: 'Оплачено (Кт)', num: true, editable: true },
        { key: 'endDt', label: 'Кін. сальдо Дт', num: true, computed: true }
      ],
      recalcRow: (r) => { r.endDt = Number(r.begDt) + Number(r.turnDt) - Number(r.turnCt); },
      rows: [
        { id: '361-ANC', sub: 'ТОВ «Аптека АНЦ»', code: '38910421', begDt: 1840000, turnDt: 9450000, turnCt: 8920000, endDt: 2370000 },
        { id: '361-POD', sub: 'ТОВ «Подорожник»', code: '39112840', begDt: 1420000, turnDt: 7800000, turnCt: 7410000, endDt: 1810000 },
        { id: '361-ORT', sub: 'ТОВ «ОРТОС»', code: '35449102', begDt: 960000, turnDt: 4620000, turnCt: 4380000, endDt: 1200000 },
        { id: '361-DOB', sub: 'ММ «Добробут»', code: '33219844', begDt: 540000, turnDt: 2980000, turnCt: 2890000, endDt: 630000 },
        { id: '361-911', sub: 'Аптека 9-1-1', code: '37820115', begDt: 880000, turnDt: 3650000, turnCt: 3540000, endDt: 990000 }
      ],
      summary: (rows) => `<div>Залишок по рахунку 361: <strong>${fmt(rows.reduce((s, r) => s + Number(r.endDt), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Авто-баланс</span></div>`
    },

    'card-acc': {
      columns: [
        { key: 'date', label: 'Дата', editable: true },
        { key: 'doc', label: 'Документ', editable: true },
        { key: 'op', label: 'Зміст операції', editable: true },
        { key: 'corr', label: 'Кореспонденція', editable: true },
        { key: 'dt', label: 'Дебет', num: true, editable: true },
        { key: 'ct', label: 'Кредит', num: true, editable: true },
        { key: 'bal', label: 'Сальдо', num: true, computed: true }
      ],
      rows: [
        { id: 'CR-01', date: '02.11.2026', doc: 'ВН-004112', op: 'Відвантаження АНЦ: Трикотаж КЛ-2', corr: '361 / 701', dt: 1450000, ct: 0, bal: 7090000 },
        { id: 'CR-02', date: '05.11.2026', doc: 'БВ-009241', op: 'Оплата від ТОВ «Подорожник»', corr: '311 / 361', dt: 0, ct: 1820000, bal: 5270000 },
        { id: 'CR-03', date: '09.11.2026', doc: 'ВН-004148', op: 'Відвантаження ОРТОС: Бандажі БП-4', corr: '361 / 701', dt: 920000, ct: 0, bal: 6190000 },
        { id: 'CR-04', date: '12.11.2026', doc: 'БВ-009310', op: 'Оплата від ТОВ «Аптека АНЦ»', corr: '311 / 361', dt: 0, ct: 1004000, bal: 5186000 },
        { id: 'CR-05', date: '15.11.2026', doc: 'ВН-004182', op: 'Відвантаження Добробут: Ортези', corr: '361 / 701', dt: 1814000, ct: 0, bal: 7000000 }
      ],
      summary: (rows) => `<div>Проводок: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Кінцеве сальдо: ${fmt(rows[rows.length-1]?.bal || 0)}</span></div>`
    },

    'balance': {
      columns: [
        { key: 'code', label: 'Код', editable: true },
        { key: 'article', label: 'Стаття балансу', editable: true },
        { key: 'beg', label: 'На поч. року', num: true, editable: true },
        { key: 'end', label: 'На кінець періоду', num: true, editable: true },
        { key: 'diff', label: 'Зміна', num: true, computed: true }
      ],
      recalcRow: (r) => { r.diff = Number(r.end) - Number(r.beg); },
      rows: [
        { id: 'B-1010', code: '1010', article: 'Основні засоби (залишкова вартість)', beg: 14330000, end: 14565000, diff: 235000 },
        { id: 'B-1100', code: '1100', article: 'Запаси (Сировина, НЗВ, ГП)', beg: 14500000, end: 14580000, diff: 80000 },
        { id: 'B-1125', code: '1125', article: 'Дебіторська заборгованість', beg: 5640000, end: 7000000, diff: 1360000 },
        { id: 'B-1165', code: '1165', article: 'Гроші та еквіваленти', beg: 11462500, end: 14907500, diff: 3445000 },
        { id: 'B-1400', code: '1400', article: 'Власний капітал (Пасив)', beg: 39482500, end: 43762500, diff: 4280000 },
        { id: 'B-1615', code: '1615', article: 'Кредиторська заборгованість', beg: 3180000, end: 3670000, diff: 490000 },
        { id: 'B-1620', code: '1620', article: 'Зобов’язання перед бюджетом', beg: 1420000, end: 1680000, diff: 260000 },
        { id: 'B-1630', code: '1630', article: 'Оплата праці', beg: 1850000, end: 1940000, diff: 90000 }
      ],
      summary: () => `<div>Баланс Ф-1: <strong>${fmt(51052500)}</strong></div><div class="summary-checksum"><span class="checksum-badge">Актив = Пасив (0.00)</span></div>`
    },

    'pnl-stat': {
      columns: [
        { key: 'code', label: 'Код', editable: true },
        { key: 'item', label: 'Показник (Форма №2)', editable: true },
        { key: 'curr', label: 'Поточний період', num: true, editable: true },
        { key: 'prev', label: 'Минулий період', num: true, editable: true },
        { key: 'pct', label: 'Динаміка %', num: true, computed: true }
      ],
      recalcRow: (r) => { r.pct = r.prev ? ((Math.abs(r.curr) - Math.abs(r.prev)) / Math.abs(r.prev) * 100) : 0; },
      rows: [
        { id: 'P-2000', code: '2000', item: 'Чистий дохід від реалізації', curr: 28500000, prev: 23400000, pct: 21.8 },
        { id: 'P-2050', code: '2050', item: 'Собівартість реалізації', curr: -17120000, prev: -14650000, pct: 16.9 },
        { id: 'P-2090', code: '2090', item: 'Валовий прибуток', curr: 11380000, prev: 8750000, pct: 30.1 },
        { id: 'P-2130', code: '2130', item: 'Адміністративні витрати', curr: -1950000, prev: -1780000, pct: 9.6 },
        { id: 'P-2150', code: '2150', item: 'Витрати на збут', curr: -1680000, prev: -1410000, pct: 19.1 },
        { id: 'P-2350', code: '2350', item: 'Чистий прибуток', curr: 6355000, prev: 4559200, pct: 39.4 }
      ],
      summary: (rows) => `<div>Чистий прибуток: <strong>${fmt(rows.find(r => r.code === '2350')?.curr || 6355000)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">EBITDA: 27.2%</span></div>`
    },

    'vat-decl': {
      columns: [
        { key: 'num', label: '№ ПН', editable: true },
        { key: 'date', label: 'Дата ЄРПН', editable: true },
        { key: 'partner', label: 'Контрагент', editable: true },
        { key: 'type', label: 'Тип (ПЗ/ПК)', editable: true },
        { key: 'base', label: 'База', num: true, editable: true },
        { key: 'vat', label: 'ПДВ', num: true, editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'VAT-1', num: 'ПН-001842', date: '03.11.2026', partner: 'ТОВ «Аптека АНЦ»', type: 'ПЗ (7%)', base: 4200000, vat: 294000, status: 'Зареєстровано' },
        { id: 'VAT-2', num: 'ПН-001856', date: '08.11.2026', partner: 'ТОВ «Подорожник»', type: 'ПЗ (7%)', base: 3100000, vat: 217000, status: 'Зареєстровано' },
        { id: 'VAT-3', num: 'ПН-994021', date: '10.11.2026', partner: 'Імпорт (МД №100294)', type: 'ПК (20%)', base: 2450000, vat: 490000, status: 'Прийнято' },
        { id: 'VAT-4', num: 'ПН-001891', date: '14.11.2026', partner: 'ТОВ «ОРТОС»', type: 'ПЗ (7%)', base: 1850000, vat: 129500, status: 'Зареєстровано' }
      ],
      summary: (rows) => {
        const pz = rows.filter(r => r.type.includes('ПЗ')).reduce((s, r) => s + Number(r.vat), 0);
        const pk = rows.filter(r => r.type.includes('ПК')).reduce((s, r) => s + Number(r.vat), 0);
        return `<div>ПЗ: <strong>${fmt(pz)}</strong> | ПК: <strong>${fmt(pk)}</strong></div><div class="summary-checksum"><span class="checksum-badge">До сплати: ${fmt(pz - pk)}</span></div>`;
      }
    },

    'mes-cost': {
      columns: [
        { key: 'sku', label: 'Артикул', editable: true },
        { key: 'name', label: 'Виріб', editable: true },
        { key: 'qty', label: 'Випуск (шт)', num: true, editable: true },
        { key: 'mat', label: 'Матеріали', num: true, editable: true },
        { key: 'lab', label: 'ЗП + ЄСВ', num: true, editable: true },
        { key: 'ovh', label: 'ЗВВ цеху', num: true, editable: true },
        { key: 'unit', label: 'Собівартість од.', num: true, computed: true },
        { key: 'tot', label: 'Всього', num: true, computed: true }
      ],
      recalcRow: (r) => { r.tot = Number(r.mat) + Number(r.lab) + Number(r.ovh); r.unit = Number(r.qty) > 0 ? r.tot / Number(r.qty) : 0; },
      rows: [
        { id: 'COST-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи КЛ-2 (Чорні, M)', qty: 4200, mat: 672000, lab: 294000, ovh: 168000, unit: 270, tot: 1134000 },
        { id: 'COST-2', sku: 'ALK-BP4-L', name: 'Бандаж БП-4 (L)', qty: 2800, mat: 784000, lab: 336000, ovh: 196000, unit: 470, tot: 1316000 },
        { id: 'COST-3', sku: 'ALK-OR2-S', name: 'Ортез OR-2 (S)', qty: 1450, mat: 609000, lab: 261000, ovh: 145000, unit: 700, tot: 1015000 },
        { id: 'COST-4', sku: 'ALK-GL1-L', name: 'Гольфи КЛ-1 (L)', qty: 6500, mat: 650000, lab: 325000, ovh: 195000, unit: 180, tot: 1170000 }
      ],
      kpis: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.tot), 0);
        const mat = rows.reduce((s, r) => s + Number(r.mat), 0);
        const lab = rows.reduce((s, r) => s + Number(r.lab), 0);
        const ovh = rows.reduce((s, r) => s + Number(r.ovh), 0);
        return [
          { title: 'Собівартість випуску', val: fmt(tot) + ' грн' },
          { title: 'Прямі матеріали (201)', val: fmt(mat) + ' грн (' + (tot ? (mat / tot * 100).toFixed(1) : '0') + '%)' },
          { title: 'Оплата праці (661)', val: fmt(lab) + ' грн (' + (tot ? (lab / tot * 100).toFixed(1) : '0') + '%)' },
          { title: 'ЗВВ цеху (91)', val: fmt(ovh) + ' грн (' + (tot ? (ovh / tot * 100).toFixed(1) : '0') + '%)' }
        ];
      },
      summary: (rows) => `<div>Собівартість випуску: <strong>${fmt(rows.reduce((s, r) => s + Number(r.tot), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Авто-калькуляція</span></div>`
    },

    'mes-m29': {
      columns: [
        { key: 'order', label: 'Наряд', editable: true },
        { key: 'mat', label: 'Сировина', editable: true },
        { key: 'unit', label: 'Од.', editable: true },
        { key: 'norm', label: 'Норма', num: true, editable: true },
        { key: 'fact', label: 'Факт', num: true, editable: true },
        { key: 'diff', label: 'Відхилення', num: true, computed: true },
        { key: 'status', label: 'Висновок', editable: true }
      ],
      recalcRow: (r) => { r.diff = Number(r.fact) - Number(r.norm); r.status = r.diff > 0 ? 'Перевитрата' : (r.diff < 0 ? 'Економія' : 'В межах норми'); },
      rows: [
        { id: 'M29-LYCRA', order: 'WO-2026-4402', mat: 'Пряжа Lycra 70 DEN (Італія)', unit: 'кг', norm: 412.0, fact: 413.8, diff: 1.8, status: 'Перевитрата (Переналагодження)' },
        { id: 'M29-POLY', order: 'WO-2026-4402', mat: 'Нитка поліамідна PA 6.6', unit: 'кг', norm: 850.0, fact: 848.5, diff: -1.5, status: 'Економія' },
        { id: 'M29-NEOP', order: 'WO-2026-4409', mat: 'Неопрен медичний 3мм', unit: 'м2', norm: 620.0, fact: 620.0, diff: 0, status: 'В межах норми' },
        { id: 'M29-SIL', order: 'WO-2026-4411', mat: 'Стрічка силіконова 50мм', unit: 'м.п.', norm: 2100.0, fact: 2100.0, diff: 0, status: 'В межах норми' }
      ],
      kpis: (rows) => {
        const over = rows.filter(r => Number(r.diff) > 0);
        const save = rows.filter(r => Number(r.diff) < 0);
        return [
          { title: 'Номенклатур списання', val: rows.length + ' позиції' },
          { title: 'Позицій з перевитратою', val: over.length + ' (Lycra +1.8 кг)' },
          { title: 'Позицій з економією', val: save.length + ' (PA 6.6 -1.5 кг)' },
          { title: 'Статус нормативів', val: over.length > 0 ? 'Допустиме відхил.' : 'В нормі' }
        ];
      },
      summary: (rows) => `<div>Списано матеріалів: <strong>${rows.length} позицій</strong></div><div class="summary-checksum"><span class="checksum-badge">Перевитрат: ${rows.filter(r => Number(r.diff) > 0).length} поз.</span></div>`
    },

    'mes-orders': {
      kanbanStages: ['В роботі', 'Пошиття фінальне', 'Формовка та ВТК', 'Передано на склад ГП'],
      columns: [
        { key: 'id', label: '№ Наряду', editable: true },
        { key: 'product', label: 'Виріб (Партія)', editable: true },
        { key: 'workshop', label: 'Дільниця', editable: true },
        { key: 'plan', label: 'План (шт)', num: true, editable: true },
        { key: 'done', label: 'Факт (шт)', num: true, editable: true },
        { key: 'pct', label: 'Готовність', num: true, computed: true },
        { key: 'status', label: 'Етап', editable: true }
      ],
      recalcRow: (r) => { r.pct = r.plan > 0 ? (r.done / r.plan * 100) : 0; },
      rows: [
        { id: 'WO-2026-4402', product: 'Панчохи КЛ-2 (LOT-2026-TC112)', workshop: 'Merz CC4 #1-4', plan: 5000, done: 4200, pct: 84.0, status: 'Формовка та ВТК' },
        { id: 'WO-2026-4409', product: 'Бандаж БП-4 (LOT-2026-AK048)', workshop: 'CAD/CAM цех', plan: 3000, done: 2800, pct: 93.3, status: 'Пошиття фінальне' },
        { id: 'WO-2026-4411', product: 'Гольфи КЛ-1 (LOT-2026-GL901)', workshop: 'Merz CC4 #5-8', plan: 6500, done: 6500, pct: 100.0, status: 'Передано на склад ГП' },
        { id: 'WO-2026-4418', product: 'Ортез OR-2 (LOT-2026-OR07)', workshop: 'Складальна №2', plan: 2000, done: 940, pct: 47.0, status: 'В роботі' }
      ],
      kpis: (rows) => {
        const totPlan = rows.reduce((s, r) => s + Number(r.plan), 0);
        const totDone = rows.reduce((s, r) => s + Number(r.done), 0);
        const avgPct = totPlan > 0 ? (totDone / totPlan * 100).toFixed(1) : '0.0';
        return [
          { title: 'План / Факт випуску', val: `${fmtInt(totPlan)} / ${fmtInt(totDone)} шт` },
          { title: 'Виконання плану', val: avgPct + '%' },
          { title: 'Нарядів у роботі', val: rows.filter(r => r.status !== 'Передано на склад ГП').length + ' з ' + rows.length },
          { title: 'Середній OEE', val: '86.3%' }
        ];
      },
      summary: (rows) => {
        const totPlan = rows.reduce((s, r) => s + Number(r.plan), 0);
        const totDone = rows.reduce((s, r) => s + Number(r.done), 0);
        const pct = totPlan > 0 ? (totDone / totPlan * 100).toFixed(1) : '0.0';
        return `<div>Нарядів: <strong>${rows.length}</strong> | Факт: <strong>${fmtInt(totDone)} шт</strong></div><div class="summary-checksum"><span class="checksum-badge">Виконання: ${pct}%</span></div>`;
      }
    },

    'mes-boms': {
      columns: [
        { key: 'code', label: 'Код BOM', editable: true },
        { key: 'product', label: 'Виріб', editable: true },
        { key: 'components', label: 'Склад специфікації', editable: true },
        { key: 'steps', label: 'Маршрут', editable: true },
        { key: 'normTime', label: 'Нормо-час (хв)', num: true, editable: true }
      ],
      rows: [
        { id: 'BOM-C2', code: 'SPEC-0012', product: 'Панчохи КЛ-2', components: 'Lycra 70D, PA 6.6, Силікон', steps: 'В’язання → Зшивання → Фарбування → ВТК', normTime: 18.5 },
        { id: 'BOM-BP4', code: 'SPEC-0048', product: 'Бандаж БП-4', components: 'Полотно, Ребра сталеві, Велкро', steps: 'CAD-розкрій → Окантовка → ВТК', normTime: 24.0 },
        { id: 'BOM-OR2', code: 'SPEC-0089', product: 'Ортез OR-2', components: 'Неопрен 3мм, Шарніри, Ремені', steps: 'Вирубка → Склеювання → ВТК', normTime: 32.0 }
      ],
      summary: (rows) => `<div>Техкарт: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">ISO 13485</span></div>`
    },

    'mes-scrap': {
      columns: [
        { key: 'act', label: 'Акт', editable: true },
        { key: 'date', label: 'Дата', editable: true },
        { key: 'lot', label: 'Партія', editable: true },
        { key: 'item', label: 'Продукція', editable: true },
        { key: 'qty', label: 'Брак (шт)', num: true, editable: true },
        { key: 'loss', label: 'Втрати (грн)', num: true, editable: true },
        { key: 'reason', label: 'Причина ВТК', editable: true }
      ],
      rows: [
        { id: 'SCR-01', act: 'АБ-0084', date: '12.11.2026', lot: 'LOT-2026-TC112', item: 'Панчохи КЛ-2', qty: 28, loss: 7560, reason: 'Тиск <23 мм рт. ст.' },
        { id: 'SCR-02', act: 'АБ-0089', date: '14.11.2026', lot: 'LOT-2026-AK048', item: 'Бандаж БП-4', qty: 12, loss: 5640, reason: 'Дефект рядка велкро' }
      ],
      kpis: (rows) => {
        const totQty = rows.reduce((s, r) => s + Number(r.qty), 0);
        const totLoss = rows.reduce((s, r) => s + Number(r.loss), 0);
        return [
          { title: 'Загальний брак ВТК', val: fmtInt(totQty, 'шт') },
          { title: 'Фінансові втрати', val: fmt(totLoss) + ' грн' },
          { title: 'Відсоток браку', val: '0.28% випуску' },
          { title: 'Критична причина', val: 'Тиск <23 мм рт.ст.' }
        ];
      },
      summary: (rows) => `<div>Брак ВТК: <strong>${fmtInt(rows.reduce((s, r) => s + Number(r.qty), 0), 'шт')}</strong></div><div class="summary-checksum"><span class="checksum-badge">Втрати: ${fmt(rows.reduce((s, r) => s + Number(r.loss), 0))} грн</span></div>`
    },

    'wms-m19': {
      columns: [
        { key: 'wh', label: 'Склад', editable: true },
        { key: 'item', label: 'Номенклатура', editable: true },
        { key: 'beg', label: 'Поч.', num: true, editable: true },
        { key: 'inc', label: 'Прихід', num: true, editable: true },
        { key: 'exp', label: 'Розхід', num: true, editable: true },
        { key: 'end', label: 'Кін.', num: true, computed: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true }
      ],
      recalcRow: (r) => { r.end = Number(r.beg) + Number(r.inc) - Number(r.exp); },
      rows: [
        { id: 'M19-1', wh: 'Склад Сировини №1', item: 'Пряжа Lycra 70 DEN (кг)', beg: 1840, inc: 1200, exp: 950, end: 2090, sum: 1881000 },
        { id: 'M19-2', wh: 'Склад Сировини №1', item: 'Нитка PA 6.6 (кг)', beg: 3200, inc: 2000, exp: 1850, end: 3350, sum: 1507500 },
        { id: 'M19-3', wh: 'Склад ГП №2', item: 'Панчохи КЛ-2 (пари)', beg: 8400, inc: 4200, exp: 5100, end: 7500, sum: 2025000 },
        { id: 'M19-4', wh: 'Склад ГП №2', item: 'Бандажі АЛКОМ (шт)', beg: 5120, inc: 2800, exp: 3400, end: 4520, sum: 2124400 },
        { id: 'M19-5', wh: 'Склад ГП №2', item: 'Гольфи КЛ-1 (пари)', beg: 0, inc: 6500, exp: 0, end: 6500, sum: 1170000 }
      ],
      kpis: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.sum), 0);
        const raw = rows.filter(r => r.wh.includes('Сировини')).reduce((s, r) => s + Number(r.sum), 0);
        const fg = rows.filter(r => r.wh.includes('ГП')).reduce((s, r) => s + Number(r.sum), 0);
        return [
          { title: 'Вартість залишків', val: fmt(tot) + ' грн' },
          { title: 'Склад сировини №1 (201)', val: fmt(raw) + ' грн' },
          { title: 'Склад ГП №2 (26)', val: fmt(fg) + ' грн' },
          { title: 'Позицій на обліку', val: rows.length + ' SKU' }
        ];
      },
      summary: (rows) => `<div>Залишок М-19: <strong>${fmt(rows.reduce((s, r) => s + Number(r.sum), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Рахунки 201 / 26: OK</span></div>`
    },

    'wms-batch': {
      columns: [
        { key: 'id', label: 'Партія (LOT)', editable: true },
        { key: 'item', label: 'Виріб', editable: true },
        { key: 'mfgDate', label: 'Виробн.', editable: true },
        { key: 'expDate', label: 'Придатний до', editable: true },
        { key: 'qty', label: 'Придатний залишок', num: true, editable: true },
        { key: 'pressure', label: 'Протокол ВТК', editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'LOT-2026-TC112', item: 'Панчохи КЛ-2 (M)', mfgDate: '12.11.2026', expDate: '12.11.2031', qty: 4172, pressure: '26.4 мм рт.ст. (-28 брак)', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-AK048', item: 'Бандаж БП-4 (L)', mfgDate: '10.11.2026', expDate: '10.11.2031', qty: 2800, pressure: 'Тест жорсткості OK', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-GL901', item: 'Гольфи КЛ-1 (L)', mfgDate: '08.11.2026', expDate: '08.11.2031', qty: 6500, pressure: '19.8 мм рт.ст.', status: 'Відвантажується (FEFO)' },
        { id: 'LOT-2026-OR07', item: 'Ортез OR-2', mfgDate: '14.11.2026', expDate: '14.11.2031', qty: 940, pressure: 'На тестуванні ВТК', status: 'Карантин до перевірки' }
      ],
      kpis: (rows) => {
        const quar = rows.filter(r => r.status.includes('Карантин'));
        const ok = rows.filter(r => !r.status.includes('Карантин'));
        return [
          { title: 'Партій (LOT)', val: rows.length + ' серій' },
          { title: 'Допущено ВТК', val: ok.length + ' LOT (' + fmtInt(ok.reduce((s, r) => s + Number(r.qty), 0)) + ' шт)' },
          { title: 'У карантині', val: quar.length + ' LOT (' + (quar[0]?.id || '—') + ')' },
          { title: 'Відбраковано ВТК', val: '28 шт (Списано)' }
        ];
      },
      summary: (rows) => `<div>Партій: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Простежуваність ISO 13485: 100%</span></div>`
    },

    'wms-reserves': {
      columns: [
        { key: 'sku', label: 'SKU', editable: true },
        { key: 'name', label: 'Товар', editable: true },
        { key: 'phys', label: 'Фізично', num: true, editable: true },
        { key: 'res', label: 'Резерв', num: true, editable: true },
        { key: 'free', label: 'Вільно', num: true, computed: true },
        { key: 'client', label: 'Резерв під мережу', editable: true }
      ],
      recalcRow: (r) => { r.free = Number(r.phys) - Number(r.res); },
      rows: [
        { id: 'RES-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи КЛ-2 (M)', phys: 7500, res: 3200, free: 4300, client: 'АНЦ (2000), Подорожник (1200)' },
        { id: 'RES-2', sku: 'ALK-BP4-L', name: 'Бандаж БП-4 (L)', phys: 4520, res: 1850, free: 2670, client: 'ОРТОС (1200), Добробут (650)' },
        { id: 'RES-3', sku: 'ALK-GL1-L', name: 'Гольфи КЛ-1', phys: 6500, res: 4100, free: 2400, client: 'Аптека 9-1-1 (4100)' }
      ],
      kpis: (rows) => {
        const phys = rows.reduce((s, r) => s + Number(r.phys), 0);
        const res = rows.reduce((s, r) => s + Number(r.res), 0);
        const free = rows.reduce((s, r) => s + Number(r.free), 0);
        return [
          { title: 'Фізичний залишок', val: fmtInt(phys, 'од.') },
          { title: 'В резерві (EDI)', val: fmtInt(res, 'од.') },
          { title: 'Вільний залишок', val: fmtInt(free, 'од.') },
          { title: 'Захист від оверселінгу', val: 'Активний' }
        ];
      },
      summary: (rows) => `<div>В резерві: <strong>${fmtInt(rows.reduce((s, r) => s + Number(r.res), 0), 'од.')}</strong></div><div class="summary-checksum"><span class="checksum-badge">Оверселінг заблоковано</span></div>`
    },

    'wms-inv19': {
      columns: [
        { key: 'code', label: 'Код', editable: true },
        { key: 'name', label: 'Номенклатура', editable: true },
        { key: 'book', label: 'Облік', num: true, editable: true },
        { key: 'fact', label: 'Факт (ТСД)', num: true, editable: true },
        { key: 'diff', label: 'Відхилення', num: true, computed: true },
        { key: 'res', label: 'Висновок', editable: true }
      ],
      recalcRow: (r) => { r.diff = Number(r.fact) - Number(r.book); r.res = r.diff === 0 ? 'Збіг 100%' : 'Розбіжність'; },
      rows: [
        { id: 'INV-1', code: '201-014', name: 'Пряжа Lycra 70 DEN', book: 2090, fact: 2090, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-2', code: '26-102', name: 'Панчохи КЛ-2 (Коробки)', book: 375, fact: 375, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-3', code: '26-205', name: 'Бандажі БП-4', book: 4520, fact: 4520, diff: 0, res: 'Збіг 100%' }
      ],
      summary: () => `<div>Інв-19</div><div class="summary-checksum"><span class="checksum-badge">Розбіжностей: 0</span></div>`
    },

    'sales-recon': {
      columns: [
        { key: 'id', label: 'Код', editable: true },
        { key: 'contract', label: 'Контрагент / Договір', editable: true },
        { key: 'beg', label: 'Поч. сальдо', num: true, editable: true },
        { key: 'shipped', label: 'Відвантажено', num: true, editable: true },
        { key: 'paid', label: 'Оплачено', num: true, editable: true },
        { key: 'end', label: 'Борг контрагента', num: true, computed: true },
        { key: 'status', label: 'Статус звірки', editable: true }
      ],
      recalcRow: (r) => { r.end = Number(r.beg) + Number(r.shipped) - Number(r.paid); },
      rows: [
        { id: 'REC-ANC', contract: 'ТОВ «Аптека АНЦ» (№402/26)', beg: 1840000, shipped: 9450000, paid: 8920000, end: 2370000, status: 'Потребує звірки (ТТН ВН-004182)' },
        { id: 'REC-POD', contract: 'ТОВ «Подорожник» (№118/26)', beg: 1420000, shipped: 7800000, paid: 7410000, end: 1810000, status: 'Підписано в Вчасно.ЕДО' },
        { id: 'REC-ORT', contract: 'ТОВ «ОРТОС» (№085/26)', beg: 960000, shipped: 4620000, paid: 4380000, end: 1200000, status: 'Підписано в Вчасно.ЕДО' },
        { id: 'REC-DOB', contract: 'ММ «Добробут» (№310/26)', beg: 540000, shipped: 2980000, paid: 2890000, end: 630000, status: 'Очікує підпису' },
        { id: 'REC-911', contract: 'Аптека 9-1-1 (№512/26)', beg: 880000, shipped: 3650000, paid: 3540000, end: 990000, status: 'Підписано в Вчасно.ЕДО' }
      ],
      summary: (rows) => `<div>Дебіторка (361): <strong>${fmt(rows.reduce((s, r) => s + Number(r.end), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">100% збіг з ОСВ 361</span></div>`
    },

    'sales-aging': {
      columns: [
        { key: 'client', label: 'Контрагент', editable: true },
        { key: 'd15', label: '0–15 днів', num: true, editable: true },
        { key: 'd30', label: '16–30 днів', num: true, editable: true },
        { key: 'd60', label: '31–60 днів', num: true, editable: true },
        { key: 'd60p', label: '60+ днів', num: true, editable: true },
        { key: 'total', label: 'Загальний борг', num: true, computed: true }
      ],
      recalcRow: (r) => { r.total = Number(r.d15) + Number(r.d30) + Number(r.d60) + Number(r.d60p); },
      rows: [
        { id: 'AGE-1', client: 'ТОВ «Аптека АНЦ»', d15: 1950000, d30: 420000, d60: 0, d60p: 0, total: 2370000 },
        { id: 'AGE-2', client: 'ТОВ «Подорожник»', d15: 1600000, d30: 210000, d60: 0, d60p: 0, total: 1810000 },
        { id: 'AGE-3', client: 'ТОВ «ОРТОС»', d15: 850000, d30: 230000, d60: 120000, d60p: 0, total: 1200000 },
        { id: 'AGE-4', client: 'Аптека 9-1-1', d15: 900000, d30: 90000, d60: 0, d60p: 0, total: 990000 },
        { id: 'AGE-5', client: 'ММ «Добробут»', d15: 540000, d30: 90000, d60: 0, d60p: 0, total: 630000 }
      ],
      summary: (rows) => `<div>Загальна дебіторка: <strong>${fmt(rows.reduce((s, r) => s + Number(r.total), 0))} грн</strong> | Прострочка 60+: <strong>0.00 грн</strong></div><div class="summary-checksum"><span class="checksum-badge">100% збіг з ОСВ 361</span></div>`
    },

    'sales-orders': {
      kanbanStages: ['Очікує погодження CEO', 'Зарезервовано', 'На збірці', 'Відвантажено'],
      columns: [
        { key: 'id', label: '№ Замовлення', editable: true },
        { key: 'date', label: 'Дата EDI', editable: true },
        { key: 'client', label: 'Мережа', editable: true },
        { key: 'items', label: 'Позицій', num: true, editable: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'ORD-8812', date: '16.11.2026', client: 'ТОВ «ОРТОС»', items: 42, sum: 685000, status: 'Очікує погодження CEO' },
        { id: 'ORD-8815', date: '16.11.2026', client: 'ТОВ «Аптека АНЦ»', items: 118, sum: 1420000, status: 'На збірці' },
        { id: 'ORD-8819', date: '15.11.2026', client: 'ТОВ «Подорожник»', items: 94, sum: 1180000, status: 'Відвантажено' },
        { id: 'ORD-8824', date: '15.11.2026', client: 'ММ «Добробут»', items: 28, sum: 490000, status: 'Зарезервовано' }
      ],
      kpis: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.sum), 0);
        const shipped = rows.filter(r => r.status === 'Відвантажено').reduce((s, r) => s + Number(r.sum), 0);
        const pick = rows.filter(r => r.status === 'На збірці' || r.status === 'Зарезервовано').reduce((s, r) => s + Number(r.sum), 0);
        return [
          { title: 'Портфель замовлень EDI', val: fmt(tot) + ' грн' },
          { title: 'Відвантажено', val: fmt(shipped) + ' грн' },
          { title: 'На збірці / Резерв', val: fmt(pick) + ' грн' },
          { title: 'Очікує погодження', val: rows.filter(r => r.status.includes('Очікує')).length + ' замовл.' }
        ];
      },
      summary: (rows) => `<div>Замовлень: <strong>${rows.length}</strong> | Сума: <strong>${fmt(rows.reduce((s, r) => s + Number(r.sum), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">EDI активний</span></div>`
    },

    'sales-margin': {
      columns: [
        { key: 'cat', label: 'Категорія продукції', editable: true },
        { key: 'rev', label: 'Виручка', num: true, editable: true },
        { key: 'cogs', label: 'Собівартість', num: true, editable: true },
        { key: 'gp', label: 'Валовий прибуток', num: true, computed: true },
        { key: 'margin', label: 'Маржа %', num: true, computed: true }
      ],
      recalcRow: (r) => { r.gp = Number(r.rev) - Number(r.cogs); r.margin = Number(r.rev) > 0 ? (r.gp / Number(r.rev) * 100) : 0; },
      rows: [
        { id: 'MRG-1', cat: 'Компресійний трикотаж', rev: 12400000, cogs: 7100000, gp: 5300000, margin: 42.7 },
        { id: 'MRG-2', cat: 'Бандажі та коректори', rev: 8200000, cogs: 4920000, gp: 3280000, margin: 40.0 },
        { id: 'MRG-3', cat: 'Ортези суглобові', rev: 4900000, cogs: 3180000, gp: 1720000, margin: 35.1 },
        { id: 'MRG-4', cat: 'Устілки та взуття', rev: 3000000, cogs: 1920000, gp: 1080000, margin: 36.0 }
      ],
      summary: (rows) => `<div>Валовий прибуток: <strong>${fmt(rows.reduce((s, r) => s + Number(r.gp), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Маржа: 39.9%</span></div>`
    },

    'treasury-stmt': {
      columns: [
        { key: 'bank', label: 'Банк / IBAN', editable: true },
        { key: 'beg', label: 'Поч. залишок', num: true, editable: true },
        { key: 'inc', label: 'Надходження', num: true, editable: true },
        { key: 'out', label: 'Списання', num: true, editable: true },
        { key: 'end', label: 'Поточний залишок', num: true, computed: true }
      ],
      recalcRow: (r) => { r.end = Number(r.beg) + Number(r.inc) - Number(r.out); },
      rows: [
        { id: 'BNK-PB', bank: 'ПриватБанк (UA48305299...124)', beg: 7420000, inc: 18450000, out: 15890000, end: 9980000 },
        { id: 'BNK-RF', bank: 'Райффайзен (UA12380805...022)', beg: 3100000, inc: 8200000, out: 7430000, end: 3870000 },
        { id: 'BNK-UKR', bank: 'Укрсиббанк (UA88351005...519)', beg: 900000, inc: 2800000, out: 2700000, end: 1000000 }
      ],
      summary: (rows) => `<div>Рахунки (311): <strong>${fmt(rows.reduce((s, r) => s + Number(r.end), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Звірено з ОСВ: OK</span></div>`
    },

    'treasury-cash': {
      columns: [
        { key: 'doc', label: '№ Ордера', editable: true },
        { key: 'date', label: 'Дата', editable: true },
        { key: 'person', label: 'Від кого / Кому', editable: true },
        { key: 'purpose', label: 'Підстава', editable: true },
        { key: 'inc', label: 'Прихід', num: true, editable: true },
        { key: 'out', label: 'Видаток', num: true, editable: true }
      ],
      rows: [
        { id: 'CSH-1', doc: 'ПКО-00112', date: '14.11.2026', person: 'Салон «Алком»', purpose: 'Здача виручки', inc: 48500, out: 0 },
        { id: 'CSH-2', doc: 'ВКО-00084', date: '15.11.2026', person: 'ПриватБанк', purpose: 'Інкасація', inc: 0, out: 33500 }
      ],
      summary: () => `<div>Каса (301): <strong>${fmt(57500)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Ліміт каси: OK</span></div>`
    },

    'hr-payroll': {
      columns: [
        { key: 'dept', label: 'Підрозділ', editable: true },
        { key: 'emp', label: 'Штат', num: true, editable: true },
        { key: 'gross', label: 'Нараховано', num: true, editable: true },
        { key: 'pdfo', label: 'ПДФО (18%)', num: true, computed: true },
        { key: 'vz', label: 'ВЗ (5%)', num: true, computed: true },
        { key: 'esv', label: 'ЄСВ (22%)', num: true, computed: true },
        { key: 'net', label: 'До виплати', num: true, computed: true }
      ],
      recalcRow: (r) => { r.pdfo = Number(r.gross) * 0.18; r.vz = Number(r.gross) * 0.05; r.esv = Number(r.gross) * 0.22; r.net = Number(r.gross) - r.pdfo - r.vz; },
      rows: [
        { id: 'HR-1', dept: 'Швейно-в’язальний цех', emp: 84, gross: 2100000, pdfo: 378000, vz: 105000, esv: 462000, net: 1617000 },
        { id: 'HR-2', dept: 'Склад, Логістика та ВТК', emp: 24, gross: 540000, pdfo: 97200, vz: 27000, esv: 118800, net: 415800 },
        { id: 'HR-3', dept: 'Відділ продажів та ЕДО', emp: 18, gross: 680000, pdfo: 122400, vz: 34000, esv: 149600, net: 523600 },
        { id: 'HR-4', dept: 'Адміністрація та Бухгалтерія', emp: 14, gross: 520000, pdfo: 93600, vz: 26000, esv: 114400, net: 400400 }
      ],
      kpis: (rows) => {
        const gross = rows.reduce((s, r) => s + Number(r.gross), 0);
        const esv = rows.reduce((s, r) => s + Number(r.esv), 0);
        const net = rows.reduce((s, r) => s + Number(r.net), 0);
        return [
          { title: 'Штат працівників', val: rows.reduce((s, r) => s + Number(r.emp), 0) + ' осіб' },
          { title: 'Нараховано ФОП', val: fmt(gross) + ' грн' },
          { title: 'ЄСВ (22%) на с/в', val: fmt(esv) + ' грн' },
          { title: 'До виплати на картки', val: fmt(net) + ' грн' }
        ];
      },
      summary: (rows) => `<div>До виплати: <strong>${fmt(rows.reduce((s, r) => s + Number(r.net), 0))} грн</strong> | ЄСВ (22%): <strong>${fmt(rows.reduce((s, r) => s + Number(r.esv), 0))} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">ПДФО + ВЗ + ЄСВ авто</span></div>`
    }
  };

  // ================= CENTRALIZED DOUBLE-ENTRY ENGINE =================
  function recomputeAllAccountingReports() {
    DATASETS['osv'].rows.forEach(r => {
      const net = (Number(r.begDt || 0) - Number(r.begCt || 0)) + (Number(r.turnDt || 0) - Number(r.turnCt || 0));
      if (net >= 0) { r.endDt = net; r.endCt = 0; }
      else { r.endDt = 0; r.endCt = Math.abs(net); }
    });

    const getOsvNet = (acc) => {
      const r = DATASETS['osv'].rows.find(x => x.acc === acc);
      return r ? (Number(r.endDt || 0) - Number(r.endCt || 0)) : 0;
    };

    DATASETS['coa'].rows.forEach(c => {
      const r = DATASETS['osv'].rows.find(x => x.acc === c.acc);
      if (r) c.balance = r.endDt > 0 ? r.endDt : -r.endCt;
    });

    const syncBal = (code, val) => {
      const b = DATASETS['balance'].rows.find(r => r.code === code);
      if (b) { b.end = val; b.diff = b.end - b.beg; }
    };
    syncBal('1010', getOsvNet('10') - Math.abs(getOsvNet('131')));
    syncBal('1100', getOsvNet('201') + getOsvNet('23') + getOsvNet('26') + getOsvNet('281'));
    syncBal('1125', getOsvNet('361'));
    syncBal('1165', getOsvNet('301') + getOsvNet('311'));
    syncBal('1615', Math.abs(getOsvNet('631')));
    syncBal('1620', Math.abs(getOsvNet('641')));
    syncBal('1630', Math.abs(getOsvNet('661')));
    syncBal('1400', Math.abs(getOsvNet('40')) + Math.abs(getOsvNet('44')));

    updateAuditRadar();
  }

  function postUniversalEntry({ doc, dt, ct, amount, partner, desc, source = 'Live' }) {
    DATASETS['ledger'].rows.unshift({
      id: 'JRN-' + Math.floor(100 + Math.random() * 899),
      time: '16.11 Щойно', doc, dt, ct, sum: amount,
      desc: `${partner}: ${desc}`, status: source
    });

    const rowDt = DATASETS['osv'].rows.find(r => r.acc === dt);
    if (rowDt) rowDt.turnDt += amount;
    const rowCt = DATASETS['osv'].rows.find(r => r.acc === ct);
    if (rowCt) rowCt.turnCt += amount;

    if (dt === '311' || ct === '311') {
      const pb = DATASETS['treasury-stmt'].rows[0];
      if (pb) {
        if (dt === '311') pb.inc += amount;
        if (ct === '311') pb.out += amount;
        DATASETS['treasury-stmt'].recalcRow(pb);
      }
    }

    if (dt === '361' || ct === '361') {
      const shortName = partner.replace(/ТОВ\s*|ММ\s*|[«»"]/g, '').trim().split(' ')[0];
      const rec = DATASETS['sales-recon'].rows.find(r => r.contract.includes(shortName) || r.id.includes(shortName));
      if (rec) {
        if (dt === '361') rec.shipped += amount;
        if (ct === '361') { rec.paid += amount; rec.status = 'Звірено (Банк OK)'; }
        DATASETS['sales-recon'].recalcRow(rec);
      }
      const age = DATASETS['sales-aging'].rows.find(r => r.client.includes(shortName));
      if (age) {
        if (dt === '361') age.d15 += amount;
        if (ct === '361') {
          if (age.d15 >= amount) age.d15 -= amount;
          else { const rem = amount - age.d15; age.d15 = 0; age.d30 = Math.max(0, age.d30 - rem); }
        }
        DATASETS['sales-aging'].recalcRow(age);
      }
      const oacc = DATASETS['osv-acc'].rows.find(r => r.sub.includes(shortName));
      if (oacc) {
        if (dt === '361') oacc.turnDt += amount;
        if (ct === '361') oacc.turnCt += amount;
        DATASETS['osv-acc'].recalcRow(oacc);
      }
    }

    recomputeAllAccountingReports();
  }

  function generateScanSvg(docNum, docType, partner, amount, date) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 620" width="100%" height="100%" style="background:#FCFAF7; font-family:sans-serif;">
        <rect width="100%" height="100%" fill="#FCFAF7"/>
        <text x="28" y="34" font-size="11" font-weight="700" fill="#64748B">СКАН-КОПІЯ ПЕРВИННОГО ДОКУМЕНТА</text>
        <text x="512" y="34" font-size="11" font-weight="700" text-anchor="end" fill="#059669">ВЧАСНО.ЕДО КЕП</text>
        <line x1="28" y1="46" x2="512" y2="46" stroke="#CBD5E1" stroke-dasharray="4,4"/>
        <rect x="28" y="64" width="84" height="24" rx="4" fill="#2563EB"/>
        <text x="70" y="80" font-size="10" font-weight="700" fill="#FFF" text-anchor="middle">OPEXMETRIX</text>
        <text x="122" y="81" font-size="13" font-weight="800" fill="#0F172A">ТОВ «ТД «АЛКОМ» • ЄДРПОУ 32894510</text>
        <text x="270" y="130" font-size="15" font-weight="800" text-anchor="middle" fill="#0F172A">${String(docType).toUpperCase()}</text>
        <text x="270" y="152" font-size="12" font-weight="700" text-anchor="middle" fill="#334155">№ ${docNum} від ${date}</text>
        <rect x="28" y="172" width="484" height="64" rx="6" fill="#F1F5F9" stroke="#CBD5E1"/>
        <text x="42" y="194" font-size="11" font-weight="700" fill="#475569">Контрагент:</text>
        <text x="42" y="216" font-size="12" font-weight="700" fill="#0F172A">${partner}</text>
        <rect x="28" y="256" width="484" height="24" fill="#E2E8F0"/>
        <text x="38" y="272" font-size="10" font-weight="700" fill="#334155">Найменування / Партія</text>
        <text x="498" y="272" font-size="10" font-weight="700" text-anchor="end" fill="#334155">Сума (грн)</text>
        <text x="38" y="302" font-size="11" fill="#0F172A">Товарно-матеріальні цінності / Медвироби (ISO 13485)</text>
        <text x="498" y="302" font-size="11" font-weight="700" text-anchor="end" fill="#0F172A">${Number(amount).toLocaleString('uk-UA')} грн</text>
        <line x1="28" y1="324" x2="512" y2="324" stroke="#CBD5E1"/>
        <text x="498" y="352" font-size="14" font-weight="800" text-anchor="end" fill="#0F172A">РАЗОМ: ${Number(amount).toLocaleString('uk-UA')} грн</text>
        <circle cx="115" cy="480" r="42" fill="none" stroke="#2563EB" stroke-width="2" opacity="0.7" stroke-dasharray="6,2"/>
        <text x="115" y="476" font-size="8" font-weight="800" fill="#2563EB" text-anchor="middle">ТОВ «ТД «АЛКОМ»</text>
        <text x="115" y="490" font-size="7" font-weight="700" fill="#2563EB" text-anchor="middle">ПЕЧАТКА №1</text>
        <rect x="288" y="444" width="224" height="72" rx="6" fill="#EFF6FF" stroke="#3B82F6"/>
        <text x="300" y="464" font-size="10" font-weight="800" fill="#1D4ED8">КЕП ПІДПИСАНО</text>
        <text x="300" y="480" font-size="9" fill="#1E3A8A">Шевченко О. В. (Головний бухгалтер)</text>
        <text x="300" y="496" font-size="8" font-family="monospace" fill="#64748B">SHA-256: 8f4a2c91...d03e</text>
      </svg>
    `)}`;
  }

  function pushUndo(viewId, rowsSnapshot) {
    state.undoStack.push({ viewId, rows: JSON.parse(JSON.stringify(rowsSnapshot)) });
    if (state.undoStack.length > 25) state.undoStack.shift();
    const btn = document.getElementById('btn-undo');
    if (btn) btn.disabled = state.undoStack.length === 0;
  }

  function performUndo() {
    if (state.undoStack.length === 0) return;
    const snap = state.undoStack.pop();
    DATASETS[snap.viewId].rows = snap.rows;
    const btn = document.getElementById('btn-undo');
    if (btn) btn.disabled = state.undoStack.length === 0;
    recomputeAllAccountingReports();
    if (state.activeMode === 'TABLE') renderActiveView();
    else if (state.activeMode === 'ACC') renderAccountingCockpit();
    else renderCEOCockpit();
    showToast('Останню дію скасовано');
  }

  function computeAuditRisks() {
    const risks = [];
    const osvDt = DATASETS['osv'].rows.reduce((s, r) => s + Number(r.turnDt || 0), 0);
    const osvCt = DATASETS['osv'].rows.reduce((s, r) => s + Number(r.turnCt || 0), 0);
    if (Math.abs(osvDt - osvCt) > 0.01) {
      risks.push({ level: 'danger', title: 'Розбаланс ОСВ (Дт != Кт)', desc: `Різниця оборотів: ${fmt(Math.abs(osvDt - osvCt))} грн.`, view: 'osv', rowId: '' });
    }
    const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
    if (anc && anc.status.includes('Потребує')) {
      risks.push({ level: 'warning', title: 'Незвірена оплата ТОВ «Аптека АНЦ» (1 004 000 грн)', desc: 'Банківський платіж ще не рознесений у Акті звірки.', view: 'sales-recon', rowId: 'REC-ANC' });
    }
    const m29 = DATASETS['mes-m29'].rows.find(r => Number(r.diff) > 0.5);
    if (m29) {
      risks.push({ level: 'warning', title: `Перевитрата сировини: ${m29.mat}`, desc: `Наряд ${m29.order}: перевитрата +${m29.diff} ${m29.unit}.`, view: 'mes-m29', rowId: m29.id });
    }
    return risks;
  }

  function updateAuditRadar() {
    const risks = computeAuditRisks();
    const btn = document.getElementById('btn-audit-radar');
    const countEl = document.getElementById('radar-count');
    if (btn && countEl) {
      if (risks.length === 0) { btn.classList.add('clean'); countEl.textContent = '0 ризиків'; }
      else { btn.classList.remove('clean'); countEl.textContent = `${risks.length} ризик(и)`; }
    }
    const body = document.getElementById('radar-list-body');
    if (body) {
      body.innerHTML = risks.length === 0
        ? '<div style="padding:20px; text-align:center; color:#059669; font-weight:700;">Аудит-Радар: 0 розбіжностей.</div>'
        : risks.map(r => `
          <div class="ceo-approval-item" style="border-left: 4px solid ${r.level === 'danger' ? '#DC2626' : '#D97706'};">
            <div>
              <div style="font-weight:700; font-size:12px;">${esc(r.title)}</div>
              <div style="font-size:11px; color:#64748B; margin-top:2px;">${esc(r.desc)}</div>
            </div>
            <button class="btn-action-primary" onclick="document.getElementById('modal-radar').classList.remove('open'); window.__switchToTable('${r.view}', '${r.rowId}')">Відкрити &rarr;</button>
          </div>
        `).join('');
    }
  }

  function initLoginGate() {
    const screen = document.getElementById('login-screen');
    const form = document.getElementById('login-form');
    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const userCount = document.getElementById('login-char-count');
    const passCount = document.getElementById('pass-char-count');
    const errBox = document.getElementById('login-error');

    function updateCounters() {
      const uLen = userInput.value.length, pLen = passInput.value.length;
      userCount.textContent = `${uLen} / 20`;
      passCount.textContent = `${pLen} / 20`;
      userCount.classList.toggle('valid', uLen === 20);
      passCount.classList.toggle('valid', pLen === 20);
    }
    userInput.addEventListener('input', updateCounters);
    passInput.addEventListener('input', updateCounters);

    document.getElementById('btn-toggle-pass').addEventListener('click', (e) => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      e.target.textContent = isPass ? 'Сховати' : 'Показати';
    });

    function loginAs(roleKey) {
      state.role = roleKey;
      sessionStorage.setItem('opex_role', roleKey);
      const profile = CREDENTIALS[roleKey];
      document.getElementById('user-avatar-initials').textContent = profile.initials;
      document.getElementById('user-role-label').textContent = `${profile.title}`;
      screen.classList.add('hidden');
      updateAuditRadar();
      if (roleKey === 'CEO') switchToCEO();
      else switchToAccountingCockpit();
      showToast(`Вхід виконано: ${profile.title}`);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errBox.classList.remove('show');
      const u = userInput.value, p = passInput.value;
      if (u.length !== 20 || p.length !== 20) {
        errBox.textContent = 'Логін та пароль мають містити рівно 20 символів.';
        errBox.classList.add('show');
        return;
      }
      if (u === CREDENTIALS.CEO.login && p === CREDENTIALS.CEO.pass) loginAs('CEO');
      else if (u === CREDENTIALS.CPA.login && p === CREDENTIALS.CPA.pass) loginAs('CPA');
      else { errBox.textContent = 'Невірний логін або пароль.'; errBox.classList.add('show'); }
    });

    document.getElementById('btn-quick-ceo').addEventListener('click', () => {
      userInput.value = CREDENTIALS.CEO.login; passInput.value = CREDENTIALS.CEO.pass; updateCounters(); loginAs('CEO');
    });
    document.getElementById('btn-quick-cpa').addEventListener('click', () => {
      userInput.value = CREDENTIALS.CPA.login; passInput.value = CREDENTIALS.CPA.pass; updateCounters(); loginAs('CPA');
    });
    document.getElementById('btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('opex_role'); state.role = null;
      userInput.value = ''; passInput.value = ''; updateCounters();
      errBox.classList.remove('show'); screen.classList.remove('hidden');
    });

    const saved = sessionStorage.getItem('opex_role');
    if (saved && CREDENTIALS[saved]) loginAs(saved);
  }

  // ================= CEO & ACCOUNTING COCKPITS =================
  function switchToCEO() {
    state.activeMode = 'CEO';
    document.getElementById('ceo-cockpit-view').classList.add('active');
    document.getElementById('acc-cockpit-view').classList.remove('active');
    document.getElementById('table-workspace-view').classList.add('hidden');
    document.getElementById('btn-sidebar-ceo').classList.add('active');
    document.getElementById('btn-sidebar-acc')?.classList.remove('active');
    ensureOpenTab('ceo-cockpit', 'Огляд та Аналітика', 'CEO');
    renderSidebar();
    renderCEOCockpit();
  }

  function switchToAccountingCockpit() {
    state.activeMode = 'ACC';
    document.getElementById('ceo-cockpit-view').classList.remove('active');
    document.getElementById('acc-cockpit-view').classList.add('active');
    document.getElementById('table-workspace-view').classList.add('hidden');
    document.getElementById('btn-sidebar-ceo').classList.remove('active');
    document.getElementById('btn-sidebar-acc')?.classList.add('active');
    ensureOpenTab('acc-cockpit', 'Робочий стіл обліку', 'ACC');
    renderSidebar();
    renderAccountingCockpit();
  }

  function renderAccountingCockpit() {
    const bankTot = DATASETS['treasury-stmt'].rows.reduce((s, r) => s + Number(r.end || 0), 0);
    const arTot = DATASETS['sales-recon'].rows.reduce((s, r) => s + Number(r.end || 0), 0);
    const reconPending = DATASETS['bank-recon'].rows.filter(r => r.status.includes('Готово')).length;
    const vatRow = DATASETS['vat-decl']?.rows.find(r => r.id === 'VAT-3') || DATASETS['vat-decl']?.rows[DATASETS['vat-decl'].rows.length - 1];
    const vatPayable = vatRow ? Number(vatRow.sum || 0) : 150500;
    const osv23 = DATASETS['osv'].rows.find(r => r.acc === '23');
    const osv26 = DATASETS['osv'].rows.find(r => r.acc === '26');
    const wipFgTot = (osv23 ? Number(osv23.endDt || 0) : 0) + (osv26 ? Number(osv26.endDt || 0) : 0);
    const deprTot = DATASETS['fixed-assets'].rows.reduce((s, r) => s + Number(r.depr || 0), 0);
    const osvDiff = Math.abs(
      DATASETS['osv'].rows.reduce((s, r) => s + Number(r.endDt || 0), 0) -
      DATASETS['osv'].rows.reduce((s, r) => s + Number(r.endCt || 0), 0)
    );

    document.getElementById('acc-journal-grid').innerHTML = `
      <div class="journal-card green">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Банк (Приват24 / Райффайзен)</div><div class="journal-card-sub">Рахунок 311 • Синхронізація Open Banking</div></div>
          <span class="status-badge ${reconPending > 0 ? 'status-warning' : 'status-ok'}">${reconPending > 0 ? reconPending + ' до звірки' : 'Все звірено'}</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(bankTot)}</div>
        <div class="journal-card-actions">
          <button class="btn-action-primary" onclick="window.__switchToTable('bank-recon')">Звірка банку (Side-by-Side) &rarr;</button>
          <button class="btn-row-action" onclick="window.__switchToTable('treasury-stmt')">Виписки</button>
        </div>
      </div>

      <div class="journal-card">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Рахунки покупцям (AR / 361)</div><div class="journal-card-sub">Контрольний рахунок мереж • Авто-проводки</div></div>
          <span class="status-badge status-info">Вчасно.ЕДО</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(arTot)}</div>
        <div class="journal-card-actions">
          <button class="btn-action-outline" onclick="window.__switchToTable('sales-recon')">Акти звірки</button>
          <button class="btn-row-action" onclick="window.__switchToTable('sales-aging')">Старіння (Aging)</button>
        </div>
      </div>

      <div class="journal-card amber">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Податки та ПДВ (641 / ЄРПН)</div><div class="journal-card-sub">Tax Grid 7% медвироби / 20% імпорт</div></div>
          <span class="status-badge status-ok">ПК: 490 тис.</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(vatPayable)} <span style="font-size:12px; font-weight:500; color:#64748B;">до сплати</span></div>
        <div class="journal-card-actions">
          <button class="btn-action-outline" onclick="window.__switchToTable('vat-decl')">Реєстр ПДВ</button>
          <button class="btn-row-action" onclick="window.__switchToTable('an-tax')">Навантаження</button>
        </div>
      </div>

      <div class="journal-card">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Єдиний журнал (Live Ledger)</div><div class="journal-card-sub">Подвійний запис без ручного вводу Дт/Кт</div></div>
          <span class="status-badge status-ok">${DATASETS['ledger'].rows.length} записів</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : fmt(osvDiff)} <span style="font-size:12px; font-weight:500; color:#059669;">розбіжностей</span></div>
        <div class="journal-card-actions">
          <button class="btn-action-outline" onclick="window.__switchToTable('ledger')">Журнал проводок</button>
          <button class="btn-row-action" onclick="window.__switchToTable('posting-setup')">Posting Groups</button>
        </div>
      </div>

      <div class="journal-card">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Виробництво та Склад (WIP / 23 / 26)</div><div class="journal-card-sub">М-29, Партії LOT, Собівартість Merz CC4</div></div>
          <span class="status-badge status-info">ISO 13485</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(wipFgTot)}</div>
        <div class="journal-card-actions">
          <button class="btn-action-outline" onclick="window.__switchToTable('mes-m29')">Списання М-29</button>
          <button class="btn-row-action" onclick="window.__switchToTable('wms-batch')">Партії LOT</button>
        </div>
      </div>

      <div class="journal-card green">
        <div class="journal-card-head">
          <div><div class="journal-card-title">Основні засоби та Зарплата (ОЗ / П-6)</div><div class="journal-card-sub">Авто-амортизація 131 + ФОП 18%/5%/22%</div></div>
          <span class="status-badge status-ok">Готово</span>
        </div>
        <div class="journal-card-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(deprTot)} <span style="font-size:12px; font-weight:500; color:#64748B;">знос/міс</span></div>
        <div class="journal-card-actions">
          <button class="btn-action-outline" onclick="window.__switchToTable('fixed-assets')">Основні засоби</button>
          <button class="btn-row-action" onclick="window.__switchToTable('hr-payroll')">Зарплата П-6</button>
        </div>
      </div>
    `;

    const shortcuts = [
      { id: 'doc-scan', title: 'Скан з телефону / ПК (OCR)', sub: 'Фото / PDF накладної → Облік' },
      { id: 'doc-flow', title: 'Реєстр обігу документів', sub: 'Вчасно.ЕДО, M.E.Doc, ТТН' },
      { id: 'osv', title: 'Оборотно-сальдова (ОСВ)', sub: 'Синтетичний баланс' },
      { id: 'balance', title: 'Баланс (Форма №1)', sub: 'Актив = Пасив (51.05M)' },
      { id: 'pnl-stat', title: 'Фін. результати (Форма №2)', sub: 'P&L / Прибуток 6.36M' },
      { id: 'vat-decl', title: 'Декларація ПДВ та ЄРПН', sub: 'Зобов’язання та кредит' },
      { id: 'mes-cost', title: 'Калькуляція собівартості', sub: 'Матеріали + ЗП + ЗВВ' },
      { id: 'coa', title: 'План рахунків (Live)', sub: 'Всі залишки в реальному часі' }
    ];
    document.getElementById('acc-reports-shortcut-grid').innerHTML = shortcuts.map(s => `
      <div onclick="window.__switchToTable('${s.id}')" style="cursor:pointer; padding:10px 12px; border:1px solid #E2E8F0; border-radius:8px; background:#F8FAFC; transition:all 0.15s;" onmouseover="this.style.borderColor='#2563EB'" onmouseout="this.style.borderColor='#E2E8F0'">
        <div style="font-weight:700; font-size:12.5px; color:#0F172A;">${esc(s.title)}</div>
        <div style="font-size:11px; color:#64748B; margin-top:2px;">${esc(s.sub)} &rarr;</div>
      </div>
    `).join('');
  }

  function renderOpenTabs() {
    const bar = document.getElementById('open-tabs-bar');
    if (!bar) return;
    const currentTabId = state.activeMode === 'CEO' ? 'ceo-cockpit' : state.activeMode === 'ACC' ? 'acc-cockpit' : state.activeView;
    bar.innerHTML = state.openTabs.map(tab => {
      const isActive = tab.id === currentTabId;
      return `
        <div class="open-tab ${isActive ? 'active' : ''}" onclick="window.__activateTab('${esc(tab.id)}')">
          <span>${esc(tab.title)}</span>
          ${state.openTabs.length > 1 ? `<span class="open-tab-close" onclick="window.__closeTab('${esc(tab.id)}', event)">&times;</span>` : ''}
        </div>
      `;
    }).join('');
  }

  function ensureOpenTab(id, title, mode) {
    if (!state.openTabs.some(t => t.id === id)) {
      state.openTabs.push({ id, title, mode });
      if (state.openTabs.length > 9) state.openTabs.shift();
    }
    renderOpenTabs();
  }

  window.__activateTab = function(tabId) {
    const tab = state.openTabs.find(t => t.id === tabId);
    if (!tab) return;
    if (tab.mode === 'CEO') switchToCEO();
    else if (tab.mode === 'ACC') switchToAccountingCockpit();
    else window.__switchToTable(tab.id);
  };

  window.__closeTab = function(tabId, e) {
    if (e) e.stopPropagation();
    const idx = state.openTabs.findIndex(t => t.id === tabId);
    if (idx < 0 || state.openTabs.length <= 1) return;
    const currentTabId = state.activeMode === 'CEO' ? 'ceo-cockpit' : state.activeMode === 'ACC' ? 'acc-cockpit' : state.activeView;
    state.openTabs.splice(idx, 1);
    if (tabId === currentTabId) {
      const next = state.openTabs[Math.max(0, idx - 1)];
      window.__activateTab(next.id);
    } else {
      renderOpenTabs();
    }
  };

  window.__drillFromOSV = function(accCode) {
    state.drillAccount = accCode;
    state.drillPartner = null;
    if (accCode === '361' || accCode === '631') {
      window.__switchToTable('osv-acc');
      showToast(`Деталізація ОСВ по рахунку ${accCode}`);
    } else {
      window.__switchToTable('card-acc');
      showToast(`Картка рахунку ${accCode}`);
    }
  };

  window.__drillToAccountCard = function(accCode, partnerName) {
    state.drillAccount = accCode || '361';
    state.drillPartner = partnerName || null;
    window.__switchToTable('card-acc');
    showToast(`Картка рахунку ${state.drillAccount}${partnerName ? ': ' + partnerName : ''}`);
  };

  window.__switchToTable = function(viewId, highlightId = null) {
    state.activeMode = 'TABLE';
    state.activeView = viewId;
    state.highlightedRowId = highlightId;
    state.viewDisplayMode = 'LIST';
    state.sortCol = null;
    document.getElementById('ceo-cockpit-view').classList.remove('active');
    document.getElementById('acc-cockpit-view').classList.remove('active');
    document.getElementById('table-workspace-view').classList.remove('hidden');
    document.getElementById('btn-sidebar-ceo').classList.remove('active');
    document.getElementById('btn-sidebar-acc')?.classList.remove('active');
    DOMAINS.forEach(d => { if (d.subtypes.some(s => s.id === viewId)) d.open = true; });
    const meta = getActiveSubtypeMeta();
    ensureOpenTab(viewId, meta.subtype.code ? `${meta.subtype.code}: ${meta.subtype.title}` : meta.subtype.title, 'TABLE');
    renderSidebar();
    renderActiveView();
  };

  function renderAnalyticsChart() {
    const container = document.getElementById('analytics-main-chart');
    if (!container) return;
    const series = TIME_SERIES[state.chartMetric] || TIME_SERIES.rev;
    const labels = TIME_SERIES.labels;
    const metricUnits = { rev: 'млн ₴', profit: 'млн ₴', cash: 'млн ₴', units: 'тис. шт' };
    const unit = metricUnits[state.chartMetric] || '';
    const allVals = [...series.y2025, ...series.y2026, ...series.pred].filter(v => v !== null);
    const minV = Math.floor(Math.min(...allVals) * 0.85), maxV = Math.ceil(Math.max(...allVals) * 1.15);
    const W = 920, H = 220, padL = 52, padR = 25, padT = 25, padB = 30;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const getX = (i) => padL + (i / (labels.length - 1)) * plotW;
    const getY = (v) => padT + plotH - ((v - minV) / (maxV - minV)) * plotH;

    function buildPath(arr) {
      let d = '';
      arr.forEach((v, i) => {
        if (v === null) return;
        d += (d === '' ? `M ${getX(i).toFixed(1)} ${getY(v).toFixed(1)}` : ` L ${getX(i).toFixed(1)} ${getY(v).toFixed(1)}`);
      });
      return d;
    }

    const predPts = [];
    series.pred.forEach((v, i) => { if (v !== null) predPts.push({ i, v }); });
    let bandPath = '';
    if (predPts.length > 1) {
      const upper = predPts.map((p, idx) => `${getX(p.i).toFixed(1)},${getY(p.v * (1 + idx * 0.025)).toFixed(1)}`);
      const lower = [...predPts].reverse().map((p, idx) => `${getX(p.i).toFixed(1)},${getY(p.v * (1 - (predPts.length - 1 - idx) * 0.025)).toFixed(1)}`);
      bandPath = `<polygon points="${upper.concat(lower).join(' ')}" fill="rgba(16, 185, 129, 0.14)"><title>95% Довірчий інтервал прогнозу</title></polygon>`;
    }

    let gridHtml = `<text x="${padL - 8}" y="${padT - 10}" font-size="10" font-weight="700" text-anchor="end" fill="#64748B">${unit}</text>`;
    for (let g = 0; g <= 4; g++) {
      const val = minV + ((maxV - minV) * g) / 4;
      const y = getY(val).toFixed(1);
      gridHtml += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#E2E8F0" stroke-width="1" />`;
      gridHtml += `<text x="${padL - 8}" y="${Number(y) + 3}" font-size="10" text-anchor="end" fill="#64748B" font-family="JetBrains Mono">${state.noNumbersMode ? '—' : val.toFixed(1)}</text>`;
    }

    const divX = getX(10).toFixed(1);
    let xLabelsHtml = `<line x1="${divX}" y1="${padT - 8}" x2="${divX}" y2="${H - padB}" stroke="#059669" stroke-dasharray="3,3" stroke-width="1.5" /><text x="${divX}" y="${padT - 12}" font-size="9" font-weight="700" text-anchor="middle" fill="#059669">T=0 (Live)</text>`;
    labels.forEach((lbl, i) => {
      const isPred = lbl.includes('*');
      xLabelsHtml += `<text x="${getX(i).toFixed(1)}" y="${H - 10}" font-size="10" text-anchor="middle" fill="${isPred ? '#059669' : '#64748B'}" font-weight="${isPred ? '700' : '500'}">${lbl}</text>`;
    });

    let dotsHtml = '';
    series.y2025.forEach((v, i) => { if (v !== null) dotsHtml += `<circle cx="${getX(i).toFixed(1)}" cy="${getY(v).toFixed(1)}" r="2.8" fill="#94A3B8"><title>${labels[i]} 2025: ${v} ${unit}</title></circle>`; });
    series.y2026.forEach((v, i) => {
      if (v !== null) {
        const v25 = series.y2025[i];
        const diffStr = v25 ? ` (+${(((v - v25) / v25) * 100).toFixed(1)}% YoY)` : '';
        dotsHtml += `<circle cx="${getX(i).toFixed(1)}" cy="${getY(v).toFixed(1)}" r="4" fill="#2563EB" stroke="#FFFFFF" stroke-width="1.5" style="cursor:pointer;"><title>${labels[i]} 2026: ${v} ${unit}${diffStr}</title></circle>`;
      }
    });
    series.pred.forEach((v, i) => {
      if (v === null || i === 10) return;
      dotsHtml += `<circle cx="${getX(i).toFixed(1)}" cy="${getY(v).toFixed(1)}" r="4.2" fill="#10B981" stroke="#FFFFFF" stroke-width="1.5" style="cursor:pointer;"><title>Прогноз ${labels[i]}: ${v} ${unit}</title></circle>`;
      dotsHtml += `<text x="${getX(i).toFixed(1)}" y="${(getY(v) - 9).toFixed(1)}" font-size="10" font-weight="700" text-anchor="middle" fill="#059669" font-family="JetBrains Mono">${state.noNumbersMode ? '—' : v}</text>`;
    });

    container.innerHTML = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="220" style="overflow:visible;">${gridHtml}${xLabelsHtml}${bandPath}<path d="${buildPath(series.y2025)}" fill="none" stroke="#94A3B8" stroke-width="2" stroke-dasharray="5,4" /><path d="${buildPath(series.y2026)}" fill="none" stroke="#2563EB" stroke-width="2.5" /><path d="${buildPath(series.pred)}" fill="none" stroke="#10B981" stroke-width="2.5" stroke-dasharray="6,4" />${dotsHtml}</svg>`;
  }

  function renderCEOCockpit() {
    const bankTot = DATASETS['treasury-stmt'].rows.reduce((s, r) => s + Number(r.end), 0);
    const cashOsv = DATASETS['osv'].rows.find(r => r.acc === '301')?.endDt || 57500;
    const cashTot = bankTot + cashOsv;
    const revTot = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.rev), 0);
    const gpTot = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.gp), 0);
    const marginPct = revTot > 0 ? (gpTot / revTot * 100) : 0;
    const yoyRows = DATASETS['an-yoy'].rows;
    const novRow = yoyRows.find(r => r.month.includes('Листопад')) || yoyRows[3] || {};
    const decPredRow = yoyRows.find(r => r.month.includes('Грудень')) || yoyRows[4] || {};
    const yoyRevG = novRow.rev25 ? (((novRow.rev26 - novRow.rev25) / novRow.rev25) * 100).toFixed(1) : '21.8';
    const yoyProfG = novRow.prof25 ? (((novRow.prof26 - novRow.prof25) / novRow.prof25) * 100).toFixed(1) : '39.4';
    const cccRow = DATASETS['an-ccc'].rows.find(r => r.period.includes('Листопад')) || DATASETS['an-ccc'].rows[3] || {};
    const unitRows = DATASETS['an-unit'].rows;
    const avgSafety = unitRows.length ? (unitRows.reduce((s, r) => s + Number(r.safety), 0) / unitRows.length) : 66.3;
    const totTaxes = DATASETS['an-tax'].rows.reduce((s, r) => s + Number(r.y2026), 0);
    const taxRate = revTot > 0 ? (totTaxes / revTot * 100) : 11.5;

    document.getElementById('ceo-kpi-grid').innerHTML = `
      <div class="ceo-kpi-card" onclick="window.__switchToTable('an-yoy')"><div class="ceo-kpi-label">Виручка (Лис 2026)</div><div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(revTot)}</div><div class="ceo-kpi-sub"><span>+21.8% vs 2025</span><span>YoY &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('pnl-stat')"><div class="ceo-kpi-label">Чистий прибуток</div><div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(6355000)}</div><div class="ceo-kpi-sub"><span>+39.4% vs 2025</span><span>P&amp;L &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('sales-margin')"><div class="ceo-kpi-label">Валова маржа</div><div class="ceo-kpi-val">${fmtPct(marginPct)}</div><div class="ceo-kpi-sub"><span>+2.5 п.п. vs 2025</span><span>SKU &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('treasury-stmt')"><div class="ceo-kpi-label">Вільні кошти</div><div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(cashTot)}</div><div class="ceo-kpi-sub"><span>+30.1% ліквідність</span><span>Банк &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('an-ccc')"><div class="ceo-kpi-label">Цикл капіталу (CCC)</div><div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '37.4 дн.'}</div><div class="ceo-kpi-sub"><span>DIO 42 / DSO 17.4</span><span>Кеш &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('an-unit')"><div class="ceo-kpi-label">Запас міцності (BEP)</div><div class="ceo-kpi-val">${fmtPct(66.3)}</div><div class="ceo-kpi-sub"><span>Вище точки беззбитк.</span><span>Unit &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('an-tax')"><div class="ceo-kpi-label">Податкове навантаж.</div><div class="ceo-kpi-val">${fmtPct(11.5)}</div><div class="ceo-kpi-sub"><span>ПК ПДВ: 490 тис.</span><span>Податки &rarr;</span></div></div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('an-yoy')" style="border-color:#10B981; background:#ECFDF5;"><div class="ceo-kpi-label" style="color:#047857;">Prediction (Гру 2026)</div><div class="ceo-kpi-val" style="color:#065F46;">${state.noNumbersMode ? '—' : '₴ ' + fmt(31800000)}</div><div class="ceo-kpi-sub" style="color:#047857;"><span>Точність 94.2%</span><span>Прогноз &rarr;</span></div></div>
    `;

    renderAnalyticsChart();

    // Cost Breakdown Chart
    const costItems = [
      { label: 'Сировина та матеріали (Lycra, PA, Неопрен)', pct: 44, sum: '9.74M', color: '#2563EB' },
      { label: 'ЗП виробничого персоналу + ЄСВ', pct: 21, sum: '4.65M', color: '#10B981' },
      { label: 'Загальновиробничі витрати (ЗВВ, Енергія)', pct: 12, sum: '2.66M', color: '#6366F1' },
      { label: 'Збут, логістика та маркетинг мереж', pct: 10, sum: '2.21M', color: '#F59E0B' },
      { label: 'Адміністративні витрати та Податки', pct: 13, sum: '2.88M', color: '#64748B' }
    ];
    document.getElementById('ceo-cost-breakdown-chart').innerHTML = costItems.map(c => `
      <div style="display:flex; flex-direction:column; gap:4px;">
        <div style="display:flex; justify-content:space-between; font-size:11.5px;">
          <span style="font-weight:600; color:#334155;">${c.label}</span>
          <span style="font-family:var(--font-mono); font-weight:700;">${state.noNumbersMode ? '—' : c.sum + ' (' + c.pct + '%)'}</span>
        </div>
        <div style="height:8px; background:#F1F5F9; border-radius:4px; overflow:hidden;">
          <div style="width:${c.pct}%; height:100%; background:${c.color}; border-radius:4px;"></div>
        </div>
      </div>
    `).join('');

    // Weekly Cashflow Runway SVG
    const weeks = [
      { w: 'Тиж 1 (18.11)', inc: 5.9, out: 3.1 },
      { w: 'Тиж 2 (25.11)', inc: 6.4, out: 4.8 },
      { w: 'Тиж 3 (02.12)', inc: 7.2, out: 3.9 },
      { w: 'Тиж 4 (09.12)', inc: 8.1, out: 4.2 }
    ];
    const baseY = 82;
    document.getElementById('ceo-cash-runway-chart').innerHTML = `
      <svg viewBox="0 0 420 155" width="100%" height="145" style="overflow:visible;">
        <line x1="20" y1="${baseY}" x2="400" y2="${baseY}" stroke="#94A3B8" stroke-width="1.5" />
        <text x="20" y="${baseY - 4}" font-size="8.5" fill="#64748B" font-weight="700">0</text>
        ${weeks.map((wk, i) => {
          const x = 48 + i * 90;
          const hIn = wk.inc * 6.5, hOut = wk.out * 6.5;
          return `
            <rect x="${x}" y="${baseY - hIn}" width="24" height="${hIn}" rx="3" fill="#10B981"><title>${wk.w} Cash-In: +${wk.inc}M грн</title></rect>
            <text x="${x + 12}" y="${baseY - hIn - 4}" font-size="9" text-anchor="middle" fill="#059669" font-family="JetBrains Mono" font-weight="700">${state.noNumbersMode ? '—' : '+' + wk.inc + 'M'}</text>
            <rect x="${x + 28}" y="${baseY}" width="24" height="${hOut}" rx="3" fill="#F59E0B"><title>${wk.w} Cash-Out: -${wk.out}M грн</title></rect>
            <text x="${x + 40}" y="${baseY + hOut + 11}" font-size="9" text-anchor="middle" fill="#D97706" font-family="JetBrains Mono" font-weight="700">${state.noNumbersMode ? '—' : '-' + wk.out + 'M'}</text>
            <text x="${x + 26}" y="150" font-size="9.5" text-anchor="middle" fill="#334155" font-weight="600">${wk.w}</text>
          `;
        }).join('')}
      </svg>
      <div style="display:flex; justify-content:space-between; font-size:11px; color:#64748B; border-top:1px solid #E2E8F0; padding-top:6px;">
        <span><strong style="color:#059669;">▲ Вгору:</strong> Cash-In (Мережі)</span>
        <span><strong style="color:#D97706;">▼ Вниз:</strong> Cash-Out (OPEX)</span>
        <span style="color:#059669; font-weight:700;">Профіцит: +11.6M грн</span>
      </div>
    `;

    document.getElementById('ceo-predictions-list').innerHTML = `
      <div class="pred-card good" onclick="window.__switchToTable('an-sku')" style="cursor:pointer;"><div><div style="font-weight:700; font-size:12px;">Сезонний пік попиту: Компресійний трикотаж КЛ-2 (+18%)</div><div style="font-size:11px; color:#334155;">Прогноз на грудень: 5 400 пар/міс. Рекомендація: збільшити завантаження Merz CC4.</div></div><span class="status-badge status-ok">94.2%</span></div>
      <div class="pred-card warn" onclick="window.__switchToTable('an-prod')" style="cursor:pointer;"><div><div style="font-weight:700; font-size:12px;">Ризик дефіциту: Пряжа Lycra 70 DEN вистачить на 11 днів</div><div style="font-size:11px; color:#334155;">Рекомендовано замовити 1 500 кг пряжі не пізніше 22.11.2026.</div></div><span class="status-badge status-warning">Критично</span></div>
      <div class="pred-card" onclick="window.__switchToTable('an-chains')" style="cursor:pointer;"><div><div style="font-weight:700; font-size:12px;">Прогноз надходжень до 25.11: +5 930 000 грн</div><div style="font-size:11px; color:#334155;">АНЦ (1.95M), Подорожник (1.60M), ОРТОС (0.85M), Аптека 9-1-1 (0.90M).</div></div><span class="status-badge status-info">Cash-In</span></div>
    `;

    const pending = state.tasks.filter(t => t.status === 'ACTIVE');
    document.getElementById('ceo-chains-and-approvals').innerHTML = `
      <div style="display:flex; flex-direction:column; gap:6px; margin-bottom:8px;">
        ${DATASETS['an-chains'].rows.slice(0, 3).map(c => `<div style="display:flex; justify-content:space-between; font-size:12px; padding:6px 10px; background:#F8FAFC; border-radius:6px; border:1px solid #E2E8F0;"><span><strong>${esc(c.chain)}</strong> (Маржа ${fmtPct(c.margin)}, DSO ${c.dso} дн.)</span><span style="font-family:var(--font-mono); font-weight:700;">${fmt(c.rev)} грн</span></div>`).join('')}
      </div>
      <div style="font-size:11px; font-weight:700; color:#64748B; text-transform:uppercase; margin-top:4px;">Черга на погодження (${pending.length}):</div>
      ${pending.length === 0 ? '<div style="color:#059669; font-weight:600; font-size:12px;">Всі документи погоджено</div>' : pending.slice(0, 2).map(t => `<div class="ceo-approval-item"><div><div style="font-weight:700; font-size:12px;">${esc(t.title)}</div><div style="font-size:11px; color:#64748B;">${esc(t.comment)}</div></div><div style="display:flex; gap:5px; flex-shrink:0;"><button class="btn-row-action" onclick="window.__switchToTable('${esc(t.view)}', '${esc(t.rowId || '')}')">Відкрити</button><button class="btn-approve-sm" onclick="window.__completeTask('${esc(t.id)}')">Погодити</button></div></div>`).join('')}
    `;
  }

  // ================= SIDEBAR =================
  function renderSidebar() {
    const container = document.getElementById('sidebar-tree-container');
    if (!container) return;
    const filterText = (document.getElementById('tree-search')?.value || '').toLowerCase().trim();
    container.innerHTML = DOMAINS.map(domain => {
      const filteredSubtypes = domain.subtypes.filter(st => !filterText || st.title.toLowerCase().includes(filterText) || st.code.toLowerCase().includes(filterText));
      if (filterText && filteredSubtypes.length === 0) return '';
      const isOpen = filterText ? true : domain.open;
      return `
        <div class="acc-domain-group ${isOpen ? 'open' : ''}">
          <div class="domain-header" onclick="window.__toggleDomain('${domain.id}')">
            <div class="domain-header-title"><span class="domain-arrow">&#9654;</span><span>${esc(domain.title)}</span></div>
            <span class="domain-count">${filteredSubtypes.length}</span>
          </div>
          <div class="subtype-list">
            ${filteredSubtypes.map(st => `<div class="subtype-item ${state.activeMode === 'TABLE' && state.activeView === st.id ? 'active' : ''}" onclick="window.__switchToTable('${st.id}')"><span>${esc(st.title)}</span><span class="subtype-code">${esc(st.code)}</span></div>`).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  window.__toggleDomain = function(domainId) {
    const dom = DOMAINS.find(d => d.id === domainId);
    if (dom) { dom.open = !dom.open; renderSidebar(); }
  };

  function getActiveSubtypeMeta() {
    for (const d of DOMAINS) {
      const st = d.subtypes.find(s => s.id === state.activeView);
      if (st) return { domain: d, subtype: st };
    }
    return { domain: DOMAINS[0], subtype: DOMAINS[0].subtypes[0] };
  }

  // ================= LIST / KANBAN + INSPECTOR =================
  function renderModuleKPIs(dataset, rows) {
    const strip = document.getElementById('module-kpi-strip');
    if (!strip) return;
    let cards = [];
    if (dataset.kpis) cards = dataset.kpis(rows);
    else {
      const numCol = dataset.columns.find(c => c.num);
      const totalVal = numCol ? rows.reduce((s, r) => s + Number(r[numCol.key] || 0), 0) : 0;
      cards = [
        { title: 'Записів у модулі', val: rows.length },
        { title: numCol ? `Разом (${numCol.label})` : 'Статус', val: numCol ? fmt(totalVal) : 'Активний' },
        { title: 'Організація', val: 'ТОВ «ТД «Алком»' },
        { title: 'Синхронізація обліку', val: 'Live (0 розбіжностей)' }
      ];
    }
    strip.innerHTML = cards.map(c => `<div class="mod-kpi-card"><div class="mod-kpi-title">${esc(c.title)}</div><div class="mod-kpi-val">${esc(c.val)}</div></div>`).join('');
  }

  function renderActiveView() {
    const meta = getActiveSubtypeMeta();
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];
    renderOpenTabs();

    const bcEl = document.getElementById('ctrl-breadcrumb');
    if (state.activeView === 'osv-acc' && state.drillAccount) {
      bcEl.innerHTML = `<span class="drill-breadcrumb" onclick="window.__switchToTable('osv')">&larr; Назад до ОСВ</span> &rsaquo; Рахунок ${esc(state.drillAccount)}`;
    } else if (state.activeView === 'card-acc' && state.drillAccount) {
      bcEl.innerHTML = `<span class="drill-breadcrumb" onclick="window.__switchToTable('osv')">&larr; ОСВ</span> &rsaquo; <span class="drill-breadcrumb" onclick="window.__drillFromOSV('${esc(state.drillAccount)}')">Рахунок ${esc(state.drillAccount)}</span>${state.drillPartner ? ' &rsaquo; ' + esc(state.drillPartner) : ''}`;
    } else {
      bcEl.textContent = `${meta.domain.title} > ${meta.subtype.title}`;
    }
    document.getElementById('ctrl-title').innerHTML = `<span>${esc(meta.subtype.title)}</span><span class="ctrl-tag">${esc(meta.subtype.tag)}</span>`;

    const modeSwitch = document.getElementById('view-mode-switch');
    const kanbanBtn = document.getElementById('btn-vmode-kanban');
    if (modeSwitch) {
      modeSwitch.style.display = 'inline-flex';
      if (kanbanBtn) kanbanBtn.style.display = meta.subtype.hasKanban ? 'inline-block' : 'none';
      modeSwitch.querySelectorAll('.view-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.vmode === state.viewDisplayMode));
    }

    const q = (state.searchQuery || '').toLowerCase().trim();
    let filteredRows = dataset.rows.filter(row => !q || Object.values(row).some(val => String(val).toLowerCase().includes(q)));

    if (state.sortCol) {
      const col = dataset.columns.find(c => c.key === state.sortCol);
      filteredRows = [...filteredRows].sort((a, b) => {
        const va = a[state.sortCol], vb = b[state.sortCol];
        if (col && col.num) return (Number(va) - Number(vb)) * state.sortDir;
        return String(va).localeCompare(String(vb), 'uk') * state.sortDir;
      });
    }

    renderModuleKPIs(dataset, filteredRows);
    const viewport = document.getElementById('table-viewport');
    if (!viewport) return;

    if (state.activeView === 'doc-scan' && state.viewDisplayMode === 'LIST') {
      const sd = state.scanDraft;
      const effectivePreview = sd.previewUrl || generateScanSvg(sd.docNum, sd.docType, sd.partner, sd.amount + sd.vat, sd.docDate);

      viewport.innerHTML = `
        <div class="scan-split">
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="background:#FFFFFF; border:1px solid var(--border); border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:10px;">
              <div style="font-weight:800; font-size:13px; color:#0F172A;">1. Джерело документа (Камера телефону або PDF/Файл)</div>
              <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                <label class="btn-action-primary" style="justify-content:center; cursor:pointer;" for="scan-cam-input">
                  Зробити фото (Камера)
                  <input type="file" id="scan-cam-input" accept="image/*" capture="environment" style="display:none;" onchange="window.__handleScanUpload(this)">
                </label>
                <label class="btn-action-outline" style="justify-content:center; cursor:pointer;" for="scan-file-input">
                  Обрати PDF / Скан з ПК
                  <input type="file" id="scan-file-input" accept="image/*,application/pdf" style="display:none;" onchange="window.__handleScanUpload(this)">
                </label>
              </div>
              <div style="display:flex; gap:6px; flex-wrap:wrap;">
                <button class="btn-row-action" onclick="window.__setScanDocCategory('INCOMING')">Зразок 1: Прибуткова (201/631)</button>
                <button class="btn-row-action" onclick="window.__setScanDocCategory('OUTGOING')">Зразок 2: Видаткова (361/701)</button>
                <button class="btn-row-action" onclick="window.__setScanDocCategory('TTN')">Зразок 3: ТТН (93/631)</button>
              </div>
            </div>

            <div class="scan-preview-box" style="background:#1E293B; min-height:360px;">
              <img src="${effectivePreview}" alt="Скан первинного документа" style="width:100%; max-height:440px; object-fit:contain; border-radius:6px;">
            </div>
          </div>

          <div class="scan-form-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h3 style="font-size:14px; font-weight:800;">2. Розпізнані дані (OCR) та Проводка</h3>
              <span class="status-badge status-ok">OCR 99.4%</span>
            </div>

            <div>
              <label class="form-label">Тип первинного документа (Posting Group):</label>
              <div class="scan-doc-type-toggle">
                <button type="button" class="btn-doc-type ${sd.postingDt === '201' ? 'active' : ''}" onclick="window.__setScanDocCategory('INCOMING')">Прибуткова (201/631)</button>
                <button type="button" class="btn-doc-type ${sd.postingDt === '361' ? 'active' : ''}" onclick="window.__setScanDocCategory('OUTGOING')">Видаткова (361/701)</button>
                <button type="button" class="btn-doc-type ${sd.postingDt === '93' ? 'active' : ''}" onclick="window.__setScanDocCategory('TTN')">ТТН (93/631)</button>
              </div>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group"><label class="form-label">№ Документа:</label><input type="text" id="scan-doc-num" class="form-control" value="${esc(sd.docNum)}"></div>
              <div class="form-group"><label class="form-label">Дата:</label><input type="text" id="scan-doc-date" class="form-control" value="${esc(sd.docDate)}"></div>
            </div>
            <div class="form-group"><label class="form-label">Контрагент (ЄДРПОУ):</label><input type="text" id="scan-partner" class="form-control" value="${esc(sd.partner)}"></div>
            <div class="form-group"><label class="form-label">Номенклатура / Призначення:</label><input type="text" id="scan-item" class="form-control" value="${esc(sd.itemDesc)}"></div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div class="form-group"><label class="form-label">Сума без ПДВ (грн):</label><input type="number" id="scan-amount" class="form-control" value="${sd.amount}"></div>
              <div class="form-group"><label class="form-label">ПДВ (грн):</label><input type="number" id="scan-vat" class="form-control" value="${sd.vat}"></div>
            </div>
            <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:6px; padding:10px; font-size:12px; color:#1E3A8A;">
              <strong>Авто-визначена проводка (Posting Group):</strong> Дт <code>${esc(sd.postingDt)}</code> / Кт <code>${esc(sd.postingCt)}</code>
            </div>
            <div style="display:flex; justify-content:space-between; gap:8px; margin-top:4px;">
              <button class="btn-action-outline" onclick="window.__openHandoff('Скан ' + document.getElementById('scan-doc-num').value, document.getElementById('scan-doc-num').value)">Передати колезі</button>
              <button class="btn-action-primary" onclick="window.__postScannedDoc()">Провести в облік і Реєстр ЕДО &rarr;</button>
            </div>
          </div>
        </div>
      `;
    } else if (state.activeView === 'bank-recon' && state.viewDisplayMode === 'LIST') {
      viewport.innerHTML = `
        <div class="recon-split">
          <div class="recon-col">
            <div style="font-size:12px; font-weight:700; color:#334155; text-transform:uppercase;">1. Банківська виписка (Приват24 / Райффайзен)</div>
            ${filteredRows.map(r => `
              <div class="recon-item ${r.status.includes('Звірено') ? 'matched' : ''}">
                <div>
                  <div style="font-weight:700; font-size:12.5px;">${esc(r.partner)}</div>
                  <div style="font-size:11px; color:#64748B;">${esc(r.date)} • ${esc(r.purpose)}</div>
                </div>
                <div style="text-align:right;">
                  <div style="font-family:var(--font-mono); font-weight:800; color:${r.amount >= 0 ? '#059669' : '#DC2626'};">${r.amount >= 0 ? '+' : ''}${fmt(r.amount)} грн</div>
                  <span class="status-badge ${r.status.includes('Звірено') ? 'status-ok' : 'status-warning'}">${esc(r.status)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="recon-col">
            <div style="font-size:12px; font-weight:700; color:#334155; text-transform:uppercase;">2. AI-Підбір інвойсів та 1-Клік Проведення</div>
            ${filteredRows.map(r => `
              <div class="recon-item ${r.status.includes('Звірено') ? 'matched' : ''}">
                <div>
                  <div style="font-weight:700; font-size:12.5px;">${esc(r.matchInv)}</div>
                  <div style="font-size:11px; color:#059669; font-weight:600;">Впевненість моделі: ${fmtPct(r.conf)}</div>
                </div>
                <div>
                  ${r.status.includes('Звірено')
                    ? '<span class="status-badge status-ok">Проведено</span>'
                    : `<button class="btn-action-primary" onclick="window.__reconcileBankRow('${esc(r.id)}')">Звірити і Провести &rarr;</button>`}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else if (state.viewDisplayMode === 'GRAPH') {
      const labelCol = dataset.columns.find(c => !c.num && c.key !== 'id') || dataset.columns[0];
      const numCols = dataset.columns.filter(c => c.num);
      const metricCol = (state.selectedGraphMetric && numCols.find(c => c.key === state.selectedGraphMetric)) || numCols[numCols.length - 1] || numCols[0];
      const isPctMetric = metricCol && ['pct', 'margin', 'growth', 'share', 'conf', 'oee', 'scrap'].includes(metricCol.key);
      const maxVal = metricCol ? Math.max(...filteredRows.map(r => Math.abs(Number(r[metricCol.key] || 0))), 1) : 1;
      const totalMetric = metricCol ? filteredRows.reduce((s, r) => s + Math.abs(Number(r[metricCol.key] || 0)), 0) : 0;
      const avgMetric = filteredRows.length > 0 ? totalMetric / filteredRows.length : 0;

      viewport.innerHTML = `
        <div style="padding:20px 24px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="font-size:15px; font-weight:800; color:#0F172A;">Візуальна аналітика модуля: ${esc(meta.subtype.title)}</h3>
              <div style="font-size:12px; color:#64748B;">Розподіл за показником «${esc(metricCol ? metricCol.label : 'Значення')}» • Клікніть по позиції для відкриття картки</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              ${numCols.length > 1 ? `
                <select class="form-select" style="width:auto; min-width:170px; height:32px; font-size:12px; padding:4px 8px;" onchange="window.__changeGraphMetric(this.value)">
                  ${numCols.map(c => `<option value="${esc(c.key)}" ${metricCol && c.key === metricCol.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
                </select>
              ` : ''}
              <div style="font-family:var(--font-mono); font-size:13px; font-weight:700; color:#2563EB;">
                ${state.noNumbersMode ? '—' : (isPctMetric ? 'Середнє: ' + fmtPct(avgMetric) : 'Разом: ' + (metricCol ? fmt(totalMetric) : filteredRows.length))}
              </div>
            </div>
          </div>
          ${filteredRows.length === 0 ? `
            <div class="empty-state">
              <div style="font-weight:700; color:#0F172A; margin-bottom:4px;">Записів не знайдено</div>
              <div style="font-size:12px; margin-bottom:12px;">Спробуйте змінити пошуковий запит або очистити фільтри.</div>
              <button class="btn-action-outline" onclick="window.__resetSearchFilter()">Скинути пошук</button>
            </div>
          ` : `
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${filteredRows.map(r => {
              const val = metricCol ? Math.abs(Number(r[metricCol.key] || 0)) : 1;
              const pct = Math.max(3, (val / maxVal) * 100);
              const share = totalMetric > 0 ? ((val / totalMetric) * 100).toFixed(1) : '0.0';
              const valFormatted = isPctMetric ? fmtPct(r[metricCol.key]) : fmt(r[metricCol.key]) + ' (' + share + '%)';
              return `
                <div onclick="window.__openInspector('${esc(r.id)}')" style="cursor:pointer; padding:8px 12px; border:1px solid #E2E8F0; border-radius:8px; background:#F8FAFC;">
                  <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:5px;">
                    <span style="font-weight:700; color:#0F172A;">${esc(r[labelCol.key])}</span>
                    <span style="font-family:var(--font-mono); font-weight:700;">${state.noNumbersMode ? '—' : valFormatted}</span>
                  </div>
                  <div style="height:10px; background:#E2E8F0; border-radius:5px; overflow:hidden;">
                    <div style="width:${pct.toFixed(1)}%; height:100%; background:linear-gradient(90deg, #2563EB, #10B981); border-radius:5px;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>`}
        </div>
      `;
    } else if (meta.subtype.hasKanban && state.viewDisplayMode === 'KANBAN' && dataset.kanbanStages) {
      viewport.innerHTML = `<div class="kanban-board">${dataset.kanbanStages.map((stage, sIdx) => {
        const cards = filteredRows.filter(r => r.status === stage);
        const hasNext = sIdx < dataset.kanbanStages.length - 1;
        return `
          <div class="kanban-col">
            <div class="kanban-col-head"><span>${esc(stage)}</span><span class="domain-count">${cards.length}</span></div>
            ${cards.map(r => `
              <div class="kanban-card" onclick="window.__openInspector('${esc(r.id)}')">
                <div style="font-family:var(--font-mono); font-size:11px; color:#2563EB; font-weight:700;">${esc(r.id)}</div>
                <div style="font-weight:700; font-size:12.5px;">${esc(r.product || r.client)}</div>
                <div style="font-size:11px; color:#64748B;">${esc(r.workshop || r.date)} • ${r.sum ? fmt(r.sum) + ' грн' : fmtPct(r.pct)}</div>
                ${hasNext ? `<button class="btn-kanban-next" onclick="event.stopPropagation(); window.__advanceKanbanStage('${esc(r.id)}')">Наступний етап &rarr;</button>` : ''}
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}</div>`;
    } else {
      if (filteredRows.length === 0) {
        viewport.innerHTML = `
          <div class="empty-state">
            <div style="font-weight:700; font-size:14px; color:#0F172A; margin-bottom:6px;">Записів не знайдено</div>
            <div style="font-size:12.5px; color:#64748B; margin-bottom:14px;">За запитом «${esc(state.searchQuery)}» у реєстрі «${esc(meta.subtype.title)}» немає збігів.</div>
            <button class="btn-action-outline" onclick="window.__resetSearchFilter()">Скинути пошук</button>
          </div>
        `;
      } else {
        let thead = '<thead><tr>';
        dataset.columns.forEach(col => {
          const arrow = state.sortCol === col.key ? (state.sortDir === 1 ? ' ▲' : ' ▼') : '';
          thead += `<th class="${col.num ? 'num' : ''}" onclick="window.__sortCol('${col.key}')">${esc(col.label)}${arrow}</th>`;
        });
        thead += '<th style="text-align:right; width:165px;">Дії</th></tr></thead>';

        let tbody = '<tbody>';
        filteredRows.forEach(row => {
          const isHighlighted = state.highlightedRowId === row.id ? 'highlighted' : '';
          const isSelected = state.inspectedRowId === row.id ? 'selected-row' : '';
          let rowOnClick = `window.__openInspector('${esc(row.id)}')`;
          if (state.activeView === 'osv') rowOnClick = `window.__drillFromOSV('${esc(row.acc)}')`;
          else if (state.activeView === 'osv-acc') rowOnClick = `window.__drillToAccountCard('${esc(state.drillAccount || '361')}', '${esc(row.partner || row.name || '')}')`;
          else if (state.activeView === 'card-acc') rowOnClick = `window.__openDocViewer('${esc(row.doc || row.id)}', '${esc(row.desc || row.partner || row.id)}')`;
          tbody += `<tr class="${isHighlighted} ${isSelected}" id="row-${esc(row.id)}" onclick="${rowOnClick}">`;

          dataset.columns.forEach((col, cIdx) => {
            const val = row[col.key];
            let displayVal = '';
            if (col.num) {
              if (['pct', 'margin', 'growth', 'share', 'conf', 'oee', 'scrap'].includes(col.key)) displayVal = fmtPct(val);
              else if (['qty', 'emp', 'items', 'book', 'fact', 'phys', 'res', 'free', 'plan', 'done', 'predQty', 'recStock', 'dso', 'output', 'matDays'].includes(col.key)) displayVal = fmtInt(val);
              else displayVal = fmt(val);
            } else if (col.key === 'status') {
              let badgeClass = 'status-info';
              const s = String(val).toLowerCase();
              if (s.includes('ок') || s.includes('дозв') || s.includes('підпис') || s.includes('прийн') || s.includes('зареєст') || s.includes('передано') || s.includes('норм') || s.includes('звірен') || s.includes('авто') || s.includes('aaa') || s.includes('факт') || s.includes('відвантаж') || s.includes('провед') || s.includes('погодж')) badgeClass = 'status-ok';
              else if (s.includes('потр') || s.includes('очік') || s.includes('перевитр') || s.includes('карант') || s.includes('увага') || s.includes('ризик') || s.includes('сторн')) badgeClass = 'status-warning';
              displayVal = `<span class="status-badge ${badgeClass}">${esc(val)}</span>`;
            } else {
              displayVal = esc(val);
            }
            tbody += `<td class="${col.num ? 'num' : ''} ${cIdx === 0 || cIdx === 1 ? 'primary-col' : ''}">${displayVal}</td>`;
          });

          const rowLabel = row.name || row.sub || row.article || row.item || row.mat || row.product || row.client || row.bank || row.dept || row.doc || row.contract || row.desc || row.month || row.chain || row.line || row.id;
          const canStorno = state.activeView === 'ledger' && !String(row.status || '').includes('Сторно');
          const primaryBtn = state.activeView === 'osv'
            ? `<button class="btn-row-action" onclick="window.__drillFromOSV('${esc(row.acc)}')">Розгорнути &rarr;</button>`
            : state.activeView === 'osv-acc'
              ? `<button class="btn-row-action" onclick="window.__drillToAccountCard('${esc(state.drillAccount || '361')}', '${esc(row.partner || row.name || '')}')">Картка рах. &rarr;</button>`
              : state.activeView === 'card-acc'
                ? `<button class="btn-row-action" onclick="window.__openDocViewer('${esc(row.doc || row.id)}', '${esc(row.desc || row.partner || row.id)}')">Документ</button>`
                : `<button class="btn-row-action" onclick="window.__openInspector('${esc(row.id)}')">Картка</button>`;
          tbody += `
            <td style="text-align:right;" onclick="event.stopPropagation();">
              ${primaryBtn}
              ${canStorno ? `<button class="btn-row-action" style="color:#DC2626; border-color:#FECACA;" onclick="window.__stornoLedgerEntry('${esc(row.id)}')">Сторно</button>` : `<button class="btn-row-action" onclick="window.__openHandoff('${esc(meta.subtype.title)}: ${esc(rowLabel)}', '${esc(row.id)}')">Передати</button>`}
            </td>
          </tr>`;
        });
        tbody += '</tbody>';
        viewport.innerHTML = `<table class="op-table">${thead}${tbody}</table>`;
      }
    }

    const summaryEl = document.getElementById('table-summary-bar');
    if (summaryEl) summaryEl.innerHTML = dataset.summary ? dataset.summary(filteredRows) : `<div>Рядків: ${filteredRows.length}</div>`;
  }

  window.__changeGraphMetric = function(metricKey) {
    state.selectedGraphMetric = metricKey;
    renderActiveView();
  };

  window.__resetSearchFilter = function() {
    state.searchQuery = '';
    const gs = document.getElementById('global-search');
    const ts = document.getElementById('table-search');
    if (gs) gs.value = '';
    if (ts) ts.value = '';
    renderActiveView();
  };

  window.__advanceKanbanStage = function(rowId) {
    const dataset = DATASETS[state.activeView];
    if (!dataset || !dataset.kanbanStages) return;
    const row = dataset.rows.find(r => r.id === rowId);
    if (!row) return;
    const idx = dataset.kanbanStages.indexOf(row.status);
    if (idx < 0 || idx >= dataset.kanbanStages.length - 1) return;
    pushUndo(state.activeView, dataset.rows);
    row.status = dataset.kanbanStages[idx + 1];
    if (typeof row.done === 'number' && typeof row.plan === 'number') {
      if (idx + 1 === dataset.kanbanStages.length - 1) { row.done = row.plan; row.pct = 100; }
      else if (row.pct < 50) { row.pct = 65; row.done = Math.round(row.plan * 0.65); }
    }
    updateAuditRadar();
    renderActiveView();
    showToast(`${row.id} переведено на етап «${row.status}»`);
  };

  window.__setScanDocCategory = function(cat) {
    state.scanDraft.docCategory = cat;
    if (cat === 'OUTGOING') {
      state.scanDraft.docType = 'Видаткова накладна / ТТН (Реалізація)';
      state.scanDraft.postingDt = '361';
      state.scanDraft.postingCt = '701';
    } else if (cat === 'EXPENSE') {
      state.scanDraft.docType = 'Акт виконаних робіт / Послуги (Адмін/Збут)';
      state.scanDraft.postingDt = '93';
      state.scanDraft.postingCt = '631';
    } else {
      state.scanDraft.docType = 'Прибуткова накладна (Вхідна від постачальника)';
      state.scanDraft.postingDt = '201';
      state.scanDraft.postingCt = '631';
    }
    renderActiveView();
  };

  window.__handleScanUpload = function(input) {
    const file = input.files && input.files[0];
    if (!file) return;
    state.scanDraft.fileName = file.name;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        state.scanDraft.previewUrl = e.target.result;
        renderActiveView();
        showToast(`Фото «${file.name}» завантажено та розпізнано через OCR`);
      };
      reader.readAsDataURL(file);
    } else {
      state.scanDraft.previewUrl = null;
      renderActiveView();
      showToast(`Файл «${file.name}» завантажено в чергу OCR`);
    }
  };

  window.__loadSampleScan = function(mode) {
    state.scanDraft.previewUrl = null;
    if (mode === 'TTN') {
      state.scanDraft = {
        fileName: 'Скан_ТТН_АНЦ_004195.pdf', previewUrl: null, sampleMode: 'TTN', docCategory: 'OUTGOING',
        docType: 'Товарно-транспортна накладна (ТТН)', docNum: 'ТТН-004195', docDate: '16.11.2026',
        partner: 'ТОВ «Аптека АНЦ» (ЄДРПОУ 38910421)',
        itemDesc: 'Панчохи компресійні КЛ-2 (1 200 пар, Партія LOT-2026-TC112)',
        amount: 648000, vat: 45360, postingDt: '361', postingCt: '701'
      };
    } else {
      state.scanDraft = {
        fileName: 'Фото_накладної_телефон.jpg', previewUrl: null, sampleMode: 'INVOICE', docCategory: 'INCOMING',
        docType: 'Прибуткова накладна (Вхідна від постачальника)', docNum: 'ПН-009482', docDate: '16.11.2026',
        partner: 'ТОВ «Текстиль-Імпорт» (ЄДРПОУ 38491022)',
        itemDesc: 'Пряжа еластанова Lycra 70 DEN (800 кг) — Склад №1',
        amount: 720000, vat: 144000, postingDt: '201', postingCt: '631'
      };
    }
    renderActiveView();
  };

  window.__postScannedDoc = function() {
    const docNum = document.getElementById('scan-doc-num').value.trim() || 'Скан-001';
    const docType = document.getElementById('scan-doc-type').value.trim();
    const docDate = document.getElementById('scan-doc-date').value.trim();
    const partner = document.getElementById('scan-partner').value.trim();
    const itemDesc = document.getElementById('scan-item').value.trim();
    const amt = parseFloat(document.getElementById('scan-amount').value) || 0;
    const vat = parseFloat(document.getElementById('scan-vat').value) || 0;
    const tot = amt + vat;
    const savedPreview = state.scanDraft.previewUrl || generateScanSvg(docNum, docType, partner, amt, docDate);

    DATASETS['doc-flow'].rows.unshift({
      id: docNum, date: docDate, type: docType, partner: partner,
      channel: 'Скан (Телефон / ПК OCR)', sum: tot,
      status: `Проведено (Дт ${state.scanDraft.postingDt} Кт ${state.scanDraft.postingCt})`,
      previewUrl: savedPreview
    });
    postUniversalEntry({
      doc: docNum,
      dt: state.scanDraft.postingDt,
      ct: state.scanDraft.postingCt,
      amount: tot,
      partner,
      desc: `${partner}: ${itemDesc}`,
      source: 'Скан OCR → Облік'
    });
    showToast(`Скан ${docNum} проведено! Додано в Реєстр обігу та Єдиний журнал.`);
    window.__switchToTable('doc-flow', docNum);
  };

  window.__reconcileBankRow = function(rowId) {
    const r = DATASETS['bank-recon'].rows.find(x => x.id === rowId);
    if (!r) return;
    if (r.status.includes('Звірено')) { showToast('Цей платіж вже звірено'); return; }
    pushUndo('bank-recon', DATASETS['bank-recon'].rows);
    r.status = 'Звірено автоматично';
    postUniversalEntry({
      doc: 'БВ-RECON',
      dt: r.amount >= 0 ? '311' : '92',
      ct: r.amount >= 0 ? '361' : '311',
      amount: Math.abs(r.amount),
      partner: r.partner,
      desc: `${r.partner}: ${r.purpose}`,
      source: 'Авто-звірка банку'
    });
    if (r.partner.includes('АНЦ')) {
      const anc = DATASETS['sales-recon'].rows.find(x => x.id === 'REC-ANC');
      if (anc) { anc.paid += Math.abs(r.amount); DATASETS['sales-recon'].recalcRow(anc); anc.status = 'Звірено автоматично (Банк OK)'; }
      const ancTask = state.tasks.find(t => t.id === 'TSK-101' && t.status === 'ACTIVE');
      if (ancTask) { ancTask.status = 'DONE'; renderTasksDrawer(); }
    }
    updateAuditRadar();
    renderActiveView();
    showToast(`Платіж ${r.partner} звірено та проведено в Єдиний журнал!`);
  };

  window.__accrueDepreciation = function() {
    const deprTot = DATASETS['fixed-assets'].rows.reduce((s, r) => s + Number(r.depr || 0), 0);
    if (deprTot <= 0) return;
    postUniversalEntry({
      doc: 'АМОРТ-1126',
      dt: '23',
      ct: '131',
      amount: deprTot,
      partner: 'Виробництво / Merz CC4',
      desc: 'Нарахування щомісячної амортизації ОЗ (131) у собівартість (23)',
      source: 'Авто-амортизація'
    });
    if (state.activeMode === 'ACC') renderAccountingCockpit();
    else if (state.activeMode === 'CEO') renderCEOCockpit();
    else renderActiveView();
    showToast(`Амортизацію ${fmt(deprTot)} грн нараховано (Дт 23 Кт 131)!`);
  };

  window.__stornoLedgerEntry = function(rowId) {
    const entry = DATASETS['ledger'].rows.find(r => r.id === rowId);
    if (!entry || String(entry.status).includes('Сторно')) return;
    pushUndo('ledger', DATASETS['ledger'].rows);
    entry.status = 'Сторновано';
    postUniversalEntry({
      doc: 'СТОРНО-' + entry.doc,
      dt: entry.dt,
      ct: entry.ct,
      amount: -Math.abs(Number(entry.sum || 0)),
      partner: entry.desc,
      desc: `[ЧЕРВОНЕ СТОРНО] ${entry.desc}`,
      source: 'Червоне сторно'
    });
    closeInspector();
    renderActiveView();
    showToast(`Проводку ${entry.id} сторновано методом Червоне сторно!`);
  };

  window.__sortCol = function(colKey) {
    if (state.sortCol === colKey) state.sortDir *= -1;
    else { state.sortCol = colKey; state.sortDir = 1; }
    renderActiveView();
  };

  // ================= RECORD INSPECTOR DRAWER =================
  window.__openInspector = function(rowId) {
    const dataset = DATASETS[state.activeView];
    const row = dataset?.rows.find(r => r.id === rowId);
    if (!row) return;
    state.inspectedRowId = rowId;
    const meta = getActiveSubtypeMeta();
    const rowLabel = row.name || row.sub || row.article || row.item || row.mat || row.product || row.client || row.bank || row.dept || row.doc || row.contract || row.desc || row.month || row.chain || row.line || row.id;

    document.getElementById('inspector-title').textContent = `${meta.subtype.code}: ${rowLabel}`;
    const body = document.getElementById('inspector-body');
    const hasScanPreview = row.previewUrl || state.activeView === 'doc-flow' || state.activeView === 'sales-orders';
    const previewSrc = row.previewUrl || generateScanSvg(row.id, meta.subtype.title, row.partner || row.client || 'ТОВ «ТД «Алком»', row.sum || row.amount || 0, row.date || '16.11.2026');
    const isLedgerStornable = state.activeView === 'ledger' && !String(row.status || '').includes('Сторно');

    let crossLinksHtml = '';
    if (state.activeView === 'sales-orders' || state.activeView === 'wms-batch') {
      const linkedMes = DATASETS['mes-orders']?.rows.slice(0, 2) || [];
      if (linkedMes.length) {
        crossLinksHtml = `
          <div class="inspector-section">
            <div class="inspector-sec-title">Пов'язані замовлення виробництва (MES)</div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${linkedMes.map(m => `
                <div onclick="window.__switchToTable('mes-orders', '${esc(m.id)}')" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; font-size:12px;">
                  <span><strong>${esc(m.id)}</strong> — ${esc(m.product)}</span>
                  <span class="status-badge status-info">${esc(m.status)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }

    body.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-sec-title">Параметри запису (Редагування)</div>
        <div class="inspector-field-grid">
          ${dataset.columns.map(col => `
            <div class="form-group">
              <label class="form-label">${esc(col.label)}</label>
              <input type="${col.num ? 'number' : 'text'}" class="insp-input ${col.num ? 'mono' : ''}" data-insp-key="${esc(col.key)}" value="${esc(row[col.key])}" ${col.computed ? 'readonly style="background:#EEF2F6;"' : ''}>
            </div>
          `).join('')}
        </div>
      </div>

      ${hasScanPreview ? `
        <div class="inspector-section">
          <div class="inspector-sec-title">Скан-копія / Первинний документ</div>
          <div style="border:1px solid #CBD5E1; border-radius:8px; overflow:hidden; background:#FFFFFF;">
            <img src="${previewSrc}" alt="Скан документа" style="width:100%; max-height:220px; object-fit:contain; display:block;">
          </div>
        </div>
      ` : ''}

      ${crossLinksHtml}

      <div class="inspector-section">
        <div class="inspector-sec-title">Журнал стану та Авто-проводки</div>
        <div class="timeline-box">
          <div class="timeline-step"><strong>Документ сформовано в OpexMetrix</strong><div style="font-size:11px; color:#64748B;">16.11.2026 • Організація: ТОВ «ТД «Алком»</div></div>
          <div class="timeline-step"><strong>Перевірено Аудит-Радаром 24/7</strong><div style="font-size:11px; color:#64748B;">Кореспонденція рахунків та балансові інваріанти валідні</div></div>
        </div>
      </div>

      ${isLedgerStornable ? `
        <div class="inspector-section">
          <button class="btn-action-outline" style="width:100%; color:#DC2626; border-color:#FECACA;" onclick="window.__stornoLedgerEntry('${esc(row.id)}')">Сторнувати (Червоне сторно)</button>
        </div>
      ` : ''}
    `;

    document.getElementById('inspector-overlay').classList.add('open');
    document.getElementById('inspector-drawer').classList.add('open');
    renderActiveView();
  };

  function closeInspector() {
    state.inspectedRowId = null;
    document.getElementById('inspector-overlay').classList.remove('open');
    document.getElementById('inspector-drawer').classList.remove('open');
  }

  document.getElementById('btn-close-inspector')?.addEventListener('click', closeInspector);
  document.getElementById('inspector-overlay')?.addEventListener('click', closeInspector);

  document.getElementById('btn-insp-save')?.addEventListener('click', () => {
    const dataset = DATASETS[state.activeView];
    const row = dataset?.rows.find(r => r.id === state.inspectedRowId);
    if (!row) return;
    pushUndo(state.activeView, dataset.rows);

    document.querySelectorAll('#inspector-body [data-insp-key]').forEach(inp => {
      const k = inp.dataset.inspKey;
      const col = dataset.columns.find(c => c.key === k);
      if (col && col.editable) {
        row[k] = col.num ? (parseFloat(inp.value) || 0) : inp.value;
      }
    });
    if (dataset.recalcRow) dataset.recalcRow(row);
    updateAuditRadar();
    closeInspector();
    renderActiveView();
    showToast('Зміни збережено та автоматично перераховано');
  });

  document.getElementById('btn-insp-doc')?.addEventListener('click', () => {
    const dataset = DATASETS[state.activeView];
    const row = dataset?.rows.find(r => r.id === state.inspectedRowId);
    if (!row) return;
    window.__openDocViewer(row.id, row.name || row.contract || row.product || row.id);
  });

  document.getElementById('btn-insp-handoff')?.addEventListener('click', () => {
    const dataset = DATASETS[state.activeView];
    const row = dataset?.rows.find(r => r.id === state.inspectedRowId);
    if (!row) return;
    const meta = getActiveSubtypeMeta();
    window.__openHandoff(`${meta.subtype.title}: ${row.name || row.contract || row.id}`, row.id);
  });

  // ================= CREATE & POST DOCUMENT FLOW (MULTI-LINE ERP FORM) =================
  function getDocFormTotals() {
    const vatRate = parseFloat(document.getElementById('new-doc-vat-rate')?.value || '0.07');
    const net = state.docFormLines.reduce((s, l) => s + (Number(l.qty || 0) * Number(l.price || 0)), 0);
    const vat = Math.round(net * vatRate * 100) / 100;
    const total = Math.round((net + vat) * 100) / 100;
    return { net, vat, total, vatRate };
  }

  function renderDocFormPostings() {
    const tbody = document.getElementById('doc-postings-preview-tbody');
    if (!tbody) return;
    const type = document.getElementById('new-doc-type')?.value || 'SALE';
    const { net, vat, total, vatRate } = getDocFormTotals();
    const rows = [];
    if (type === 'SALE') {
      rows.push({ dt: '361', ct: '701', sum: total, desc: 'Визнано дохід від реалізації покупцю (з ПДВ)' });
      if (vat > 0) rows.push({ dt: '701', ct: '6412', sum: vat, desc: `Податкові зобов'язання з ПДВ (${Math.round(vatRate * 100)}%)` });
    } else if (type === 'PURCHASE') {
      rows.push({ dt: '201', ct: '631', sum: net, desc: 'Оприбутковано сировину/ТМЦ на склад (без ПДВ)' });
      if (vat > 0) rows.push({ dt: '6412', ct: '631', sum: vat, desc: `Податковий кредит з ПДВ (${Math.round(vatRate * 100)}%)` });
    } else if (type === 'PAYMENT') {
      rows.push({ dt: '311', ct: '361', sum: total, desc: 'Надходження коштів на поточний рахунок від покупця' });
    } else {
      rows.push({ dt: '23', ct: '201', sum: net, desc: 'Списання сировини у виробництво (Merz CC4)' });
    }
    tbody.innerHTML = rows.map(r => `
      <tr>
        <td style="font-family:var(--font-mono); font-weight:700;">${esc(r.dt)}</td>
        <td style="font-family:var(--font-mono); font-weight:700;">${esc(r.ct)}</td>
        <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${fmt(r.sum)}</td>
        <td>${esc(r.desc)}</td>
      </tr>
    `).join('');
  }

  window.__renderDocLines = function() {
    const tbody = document.getElementById('doc-lines-tbody');
    const totalsEl = document.getElementById('doc-lines-totals');
    if (!tbody || !totalsEl) return;
    const { net, vat, total, vatRate } = getDocFormTotals();
    tbody.innerHTML = state.docFormLines.map((line, idx) => {
      const lineTotal = (Number(line.qty || 0) * Number(line.price || 0)) * (1 + vatRate);
      return `
        <tr>
          <td style="text-align:center; color:#64748B;">${idx + 1}</td>
          <td><input type="text" value="${esc(line.item)}" onchange="window.__updateDocLine(${idx}, 'item', this.value)"></td>
          <td><input type="text" value="${esc(line.unit)}" style="text-align:center;" onchange="window.__updateDocLine(${idx}, 'unit', this.value)"></td>
          <td><input type="number" value="${Number(line.qty || 0)}" style="text-align:right; font-family:var(--font-mono);" oninput="window.__updateDocLine(${idx}, 'qty', this.value)"></td>
          <td><input type="number" value="${Number(line.price || 0)}" style="text-align:right; font-family:var(--font-mono);" oninput="window.__updateDocLine(${idx}, 'price', this.value)"></td>
          <td style="text-align:right; font-family:var(--font-mono); font-weight:700;">${fmt(lineTotal)}</td>
          <td style="text-align:center;"><button type="button" class="btn-row-action" style="color:#DC2626; padding:2px 6px;" onclick="window.__removeDocLine(${idx})">&times;</button></td>
        </tr>
      `;
    }).join('');
    totalsEl.innerHTML = `
      <span>Без ПДВ: <strong>${fmt(net)} грн</strong></span>
      <span>ПДВ (${Math.round(vatRate * 100)}%): <strong>${fmt(vat)} грн</strong></span>
      <span style="color:#2563EB;">Разом: <strong>${fmt(total)} грн</strong></span>
    `;
    renderDocFormPostings();
  };

  window.__addDocLine = function() {
    state.docFormLines.push({ item: 'Нова номенклатура / послуга', unit: 'шт', qty: 100, price: 350 });
    window.__renderDocLines();
  };

  window.__removeDocLine = function(idx) {
    if (state.docFormLines.length <= 1) return;
    state.docFormLines.splice(idx, 1);
    window.__renderDocLines();
  };

  window.__updateDocLine = function(idx, field, val) {
    if (!state.docFormLines[idx]) return;
    state.docFormLines[idx][field] = (field === 'qty' || field === 'price') ? (parseFloat(val) || 0) : val;
    window.__renderDocLines();
  };

  window.__switchDocFormTab = function(tab) {
    const lBox = document.getElementById('doc-form-tab-lines');
    const pBox = document.getElementById('doc-form-tab-postings');
    const lBtn = document.getElementById('btn-doc-form-lines');
    const pBtn = document.getElementById('btn-doc-form-postings');
    if (!lBox || !pBox) return;
    if (tab === 'POSTINGS') {
      renderDocFormPostings();
      lBox.style.display = 'none';
      pBox.style.display = 'block';
      lBtn?.classList.remove('active');
      pBtn?.classList.add('active');
    } else {
      lBox.style.display = 'block';
      pBox.style.display = 'none';
      lBtn?.classList.add('active');
      pBtn?.classList.remove('active');
    }
  };

  window.__openCreateDocModal = function() {
    window.__switchDocFormTab('LINES');
    window.__renderDocLines();
    document.getElementById('modal-create-doc').classList.add('open');
  };

  document.getElementById('new-doc-type')?.addEventListener('change', renderDocFormPostings);
  document.getElementById('new-doc-vat-rate')?.addEventListener('change', window.__renderDocLines);
  document.getElementById('btn-create-doc')?.addEventListener('click', window.__openCreateDocModal);
  document.getElementById('btn-close-create-doc')?.addEventListener('click', () => document.getElementById('modal-create-doc').classList.remove('open'));
  document.getElementById('btn-cancel-create-doc')?.addEventListener('click', () => document.getElementById('modal-create-doc').classList.remove('open'));

  document.getElementById('btn-submit-create-doc')?.addEventListener('click', () => {
    const type = document.getElementById('new-doc-type').value;
    const partner = document.getElementById('new-doc-partner').value;
    const { net, vat, total, vatRate } = getDocFormTotals();
    const totalQty = state.docFormLines.reduce((s, l) => s + Number(l.qty || 0), 0);
    const desc = state.docFormLines.map(l => `${l.item} (${l.qty} ${l.unit})`).join('; ');
    const docId = (type === 'SALE' ? 'ВН-' : type === 'PURCHASE' ? 'ПН-' : type === 'PAYMENT' ? 'БВ-' : 'WO-2026-') + Math.floor(4200 + Math.random() * 5000);

    if (type === 'SALE') {
      DATASETS['sales-orders'].rows.unshift({ id: docId, date: '16.11.2026', client: partner.split(' (')[0], items: totalQty, sum: total, status: 'Відвантажено' });
      DATASETS['doc-flow'].rows.unshift({ id: docId, date: '16.11.2026', type: 'Видаткова накладна', partner, channel: 'Вчасно.ЕДО / API', sum: total, status: 'Проведено (Дт 361 Кт 701)' });
      postUniversalEntry({ doc: docId, dt: '361', ct: '701', amount: total, partner, desc: `${partner}: ${desc}`, source: 'Авто-проводка' });
      if (vat > 0) {
        postUniversalEntry({ doc: docId, dt: '701', ct: '641', amount: vat, partner, desc: `ПЗ з ПДВ ${Math.round(vatRate * 100)}% по ${docId}`, source: 'ПДВ (Авто)' });
        DATASETS['vat-decl']?.rows.unshift({ id: 'VAT-' + Math.floor(100 + Math.random() * 899), num: 'ПН-' + docId.replace(/\D/g, ''), date: '16.11.2026', partner: partner.split(' (')[0], type: `ПЗ (${Math.round(vatRate * 100)}%)`, base: net, vat, status: 'Зареєстровано' });
      }
    } else if (type === 'PURCHASE') {
      DATASETS['doc-flow'].rows.unshift({ id: docId, date: '16.11.2026', type: 'Прибуткова накладна', partner, channel: 'Вчасно.ЕДО / API', sum: total, status: 'Проведено (Дт 201 Кт 631)' });
      postUniversalEntry({ doc: docId, dt: '201', ct: '631', amount: net, partner, desc: `Оприбуткування: ${desc}`, source: 'Авто-проводка' });
      if (vat > 0) {
        postUniversalEntry({ doc: docId, dt: '641', ct: '631', amount: vat, partner, desc: `ПК з ПДВ ${Math.round(vatRate * 100)}% по ${docId}`, source: 'ПДВ (Авто)' });
      }
    } else if (type === 'PAYMENT') {
      DATASETS['doc-flow'].rows.unshift({ id: docId, date: '16.11.2026', type: 'Банківська виписка', partner, channel: 'Open Banking API', sum: total, status: 'Проведено (Дт 311 Кт 361)' });
      postUniversalEntry({ doc: docId, dt: '311', ct: '361', amount: total, partner, desc: `Оплата від ${partner}`, source: 'Банк-Клієнт' });
    } else {
      DATASETS['mes-orders'].rows.unshift({ id: docId, product: desc, workshop: partner, plan: totalQty, done: 0, pct: 0, status: 'В роботі' });
      updateAuditRadar();
    }

    document.getElementById('modal-create-doc').classList.remove('open');
    if (state.activeMode === 'CEO') renderCEOCockpit();
    else if (state.activeMode === 'ACC') renderAccountingCockpit();
    else renderActiveView();
    showToast(`Документ ${docId} (${state.docFormLines.length} поз., ${fmt(total)} грн) проведено в облік!`);
  });

  // ================= IMPORT, AUTOMATION, HANDOFF, DRAWER, DOC VIEWER =================
  document.getElementById('btn-open-import')?.addEventListener('click', () => {
    document.getElementById('import-log-box').style.display = 'none';
    document.getElementById('modal-import').classList.add('open');
  });
  document.getElementById('btn-close-import')?.addEventListener('click', () => document.getElementById('modal-import').classList.remove('open'));
  document.getElementById('btn-close-import-footer')?.addEventListener('click', () => document.getElementById('modal-import').classList.remove('open'));

  document.getElementById('btn-run-import')?.addEventListener('click', () => {
    const raw = document.getElementById('import-raw-text').value.trim();
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const logBox = document.getElementById('import-log-box');
    logBox.style.display = 'flex';
    logBox.innerHTML = '<div class="auto-log-line"><span class="auto-log-ok">[PARSE]</span><span>Розпізнавання виписки...</span></div>';

    lines.forEach((line, idx) => {
      setTimeout(() => {
        const parts = line.split(';');
        const partner = parts[2] || 'Контрагент';
        const amt = Math.abs(parseFloat((parts[3] || '0').replace(/[^\d.-]/g, ''))) || 0;
        const pb = DATASETS['treasury-stmt'].rows[0];
        if (pb && amt > 0) { pb.inc += amt; DATASETS['treasury-stmt'].recalcRow(pb); }
        if (partner.includes('АНЦ')) {
          const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
          if (anc) { anc.paid += amt; anc.status = 'Звірено автоматично (Банк OK)'; DATASETS['sales-recon'].recalcRow(anc); }
        }
        DATASETS['ledger'].rows.unshift({ id: 'JRN-' + Math.floor(100 + Math.random() * 899), time: '16.11 Щойно', doc: 'БВ-AUTO', dt: '311', ct: '361', sum: amt, desc: `${partner}: Оплата`, status: 'Імпорт Банк-Клієнт' });
        logBox.innerHTML += `<div class="auto-log-line"><span class="auto-log-ok">[Дт311 Кт361]</span><span>${esc(partner)}: +${fmt(amt)} грн</span></div>`;
        if (idx === lines.length - 1) {
          updateAuditRadar();
          if (state.activeMode === 'TABLE') renderActiveView();
          else renderCEOCockpit();
          showToast(`Імпортовано та проведено ${lines.length} платежі`);
        }
      }, (idx + 1) * 350);
    });
  });

  window.__openAutomationModal = function() { document.getElementById('modal-automation').classList.add('open'); };
  function runAutomationSequence(title, steps, onFinish) {
    const box = document.getElementById('auto-log-box');
    box.innerHTML = `<div class="auto-log-line"><span class="auto-log-ok">[START]</span><span>${esc(title)}</span></div>`;
    steps.forEach((step, idx) => {
      setTimeout(() => {
        box.innerHTML += `<div class="auto-log-line"><span class="auto-log-ok">[OK]</span><span>${esc(step)}</span></div>`;
        box.scrollTop = box.scrollHeight;
        if (idx === steps.length - 1 && onFinish) onFinish();
      }, (idx + 1) * 320);
    });
  }

  document.getElementById('btn-open-automation')?.addEventListener('click', window.__openAutomationModal);
  document.getElementById('btn-close-auto')?.addEventListener('click', () => document.getElementById('modal-automation').classList.remove('open'));
  document.getElementById('btn-close-auto-footer')?.addEventListener('click', () => document.getElementById('modal-automation').classList.remove('open'));

  document.getElementById('btn-run-auto-bank')?.addEventListener('click', () => {
    runAutomationSequence('Авто-звірка Банк ↔ 361...', ['Завантажено виписку ПриватБанк...', 'Оплату АНЦ 1 004 000 грн проведено (Дт 311 Кт 361).'], () => {
      const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
      if (anc) anc.status = 'Звірено автоматично (Банк OK)';
      updateAuditRadar();
      if (state.activeMode === 'TABLE') renderActiveView();
      else renderCEOCockpit();
      showToast('Авто-звірку завершено');
    });
  });
  document.getElementById('btn-run-auto-cost')?.addEventListener('click', () => {
    runAutomationSequence('Авто-розрахунок собівартості...', ['Зчитано списання М-29...', 'Оновлено собівартість одиниці по 4 партіях.'], () => {
      DATASETS['mes-cost'].rows.forEach(r => DATASETS['mes-cost'].recalcRow(r));
      if (state.activeMode === 'TABLE') renderActiveView();
      showToast('Калькуляцію перераховано');
    });
  });
  document.getElementById('btn-run-auto-vat')?.addEventListener('click', () => runAutomationSequence('Перевірка ПДВ...', ['Звірено ПН з ЄРПН (7% / 20%)...', 'До сплати: 150 500 грн.'], () => showToast('ПДВ перевірено')));
  document.getElementById('btn-run-auto-close')?.addEventListener('click', () => runAutomationSequence('Закриття місяця...', ['Дт 901 Кт 26 = 17 120 000 грн', 'Баланс Дт = Кт (0.00).'], () => showToast('Місяць закрито')));

  window.__openHandoff = function(docName, rowId = null) {
    state.handoffContext = { docName, rowId, view: state.activeView };
    document.getElementById('handoff-doc-name').value = docName;
    document.getElementById('handoff-comment').value = '';
    document.getElementById('modal-handoff').classList.add('open');
  };
  function closeHandoffModal() { document.getElementById('modal-handoff').classList.remove('open'); }
  function confirmHandoff() {
    const docName = document.getElementById('handoff-doc-name').value;
    const recipient = document.getElementById('handoff-recipient').value;
    const priority = document.getElementById('handoff-priority').value;
    const comment = document.getElementById('handoff-comment').value.trim() || 'Прошу перевірити документ.';
    const senderProfile = CREDENTIALS[state.role || 'CPA'];
    state.tasks.unshift({
      id: 'TSK-' + Math.floor(105 + Math.random() * 890),
      title: docName, sender: `${senderProfile.name} (${senderProfile.title})`,
      recipient, priority, date: '16.11.2026 Щойно',
      view: state.handoffContext ? state.handoffContext.view : state.activeView,
      rowId: state.handoffContext ? state.handoffContext.rowId : null,
      status: 'ACTIVE', comment
    });
    renderTasksDrawer();
    if (state.activeMode === 'CEO') renderCEOCockpit();
    closeHandoffModal();
    showToast(`Передано -> ${recipient}`);
  }

  function renderTasksDrawer() {
    const activeCount = state.tasks.filter(t => t.status === 'ACTIVE').length;
    document.getElementById('task-badge-count').textContent = activeCount;
    document.getElementById('drawer-badge-count').textContent = activeCount;
    const listEl = document.getElementById('drawer-tasks-list');
    if (!listEl) return;
    listEl.innerHTML = state.tasks.map(t => {
      let pClass = 'priority-normal', pText = 'Звичайне';
      if (t.priority === 'URGENT') { pClass = 'priority-urgent'; pText = 'ТЕРМІНОВО'; }
      else if (t.priority === 'APPROVAL') { pClass = 'priority-approval'; pText = 'НА ПОГОДЖЕННЯ'; }
      const isDone = t.status === 'DONE';
      return `
        <div class="task-card" style="opacity: ${isDone ? '0.6' : '1'};">
          <div class="task-card-header"><span class="task-priority-tag ${pClass}">${pText}</span><span style="font-size:11px; color:#64748B; font-family:var(--font-mono);">${esc(t.date)}</span></div>
          <div class="task-title">${esc(t.title)}</div>
          <div class="task-meta"><span>Від: <strong>${esc(t.sender.split('(')[0])}</strong></span><span>Кому: <strong>${esc(t.recipient.split('(')[0])}</strong></span></div>
          <div class="task-comment-box">${esc(t.comment)}</div>
          <div class="task-actions">
            <button class="btn-task-action" onclick="window.__goToTaskView('${esc(t.view)}', '${esc(t.rowId || '')}')">Відкрити</button>
            ${!isDone ? `<button class="btn-task-action" onclick="window.__completeTask('${esc(t.id)}')">Погодити</button>` : '<span style="font-size:11px; color:#059669; font-weight:600;">Виконано</span>'}
          </div>
        </div>
      `;
    }).join('');
  }

  window.__goToTaskView = function(viewId, rowId) {
    closeTasksDrawer();
    window.__switchToTable(viewId, rowId || null);
    if (rowId) setTimeout(() => window.__openInspector(rowId), 80);
  };

  window.__completeTask = function(taskId) {
    const t = state.tasks.find(x => x.id === taskId);
    if (!t) return;
    t.status = 'DONE';
    if (t.rowId === 'ORD-8812') {
      const ord = DATASETS['sales-orders'].rows.find(r => r.id === 'ORD-8812');
      if (ord) ord.status = 'Погоджено CEO';
      const res = DATASETS['wms-reserves']?.rows.find(r => r.order === 'ORD-8812');
      if (res) res.status = 'Дозволено до відвантаження';
    }
    updateAuditRadar();
    renderTasksDrawer();
    if (state.activeMode === 'CEO') renderCEOCockpit();
    else if (state.activeMode === 'ACC') renderAccountingCockpit();
    else renderActiveView();
    showToast('Погоджено');
  };

  function openTasksDrawer() { document.getElementById('drawer-overlay').classList.add('open'); document.getElementById('tasks-drawer').classList.add('open'); }
  function closeTasksDrawer() { document.getElementById('drawer-overlay').classList.remove('open'); document.getElementById('tasks-drawer').classList.remove('open'); }

  window.closeDocViewer = function() {
    document.getElementById('modal-doc-viewer')?.classList.remove('open');
  };

  window.closeModal = function(modalId) {
    document.getElementById(modalId)?.classList.remove('open');
  };

  window.__switchDocViewerTab = function(tab) {
    const elTab = document.getElementById('doc-tab-elec');
    const scanTab = document.getElementById('doc-tab-scan');
    const elBtn = document.getElementById('btn-doc-tab-elec');
    const scanBtn = document.getElementById('btn-doc-tab-scan');
    if (!elTab || !scanTab) return;
    if (tab === 'SCAN') {
      elTab.style.display = 'none';
      scanTab.style.display = 'block';
      elBtn?.classList.remove('active');
      scanBtn?.classList.add('active');
    } else {
      elTab.style.display = 'block';
      scanTab.style.display = 'none';
      elBtn?.classList.add('active');
      scanBtn?.classList.remove('active');
    }
  };

  window.__openDocViewer = function(docId, docLabel) {
    state.docContext = { docId, docLabel };
    const paper = document.getElementById('doc-paper-content');
    if (!paper) return;
    const flowRow = DATASETS['doc-flow']?.rows.find(r => r.id === docId);
    const sumNum = flowRow ? Number(flowRow.sum || 0) : 1004000;
    const sumVal = state.noNumbersMode ? '—' : `${fmt(sumNum)} грн`;
    const scanSrc = (flowRow && flowRow.previewUrl) || generateScanSvg(docId, 'Первинний документ', docLabel, sumNum, flowRow ? flowRow.date : '16.11.2026');

    paper.innerHTML = `
      <div class="doc-viewer-tabs">
        <button id="btn-doc-tab-elec" class="doc-viewer-tab active" onclick="window.__switchDocViewerTab('ELEC')">Електронний бланк</button>
        <button id="btn-doc-tab-scan" class="doc-viewer-tab" onclick="window.__switchDocViewerTab('SCAN')">Скан-копія / Фото</button>
      </div>
      <div id="doc-tab-elec">
        <div class="doc-barcode-row"><div><strong>Електронний первинний документ</strong></div><div style="font-family:var(--font-mono); font-size:12px;">ID: ${esc(docId)} | QR-VERIFIED</div></div>
        <div class="doc-title-h1">ПЕРВИННИЙ ОБЛІКОВИЙ ДОКУМЕНТ № ${esc(docId)} від 16.11.2026</div>
        <div class="doc-grid"><div class="doc-grid-label">Підприємство:</div><div>ТОВ «ТД «Алком» (ЄДРПОУ 32894510)</div><div class="doc-grid-label">Об'єкт:</div><div><strong>${esc(docLabel)}</strong></div></div>
        <table class="doc-table"><thead><tr><th>№</th><th>Найменування / Партія</th><th>Од.</th><th>Кількість</th><th>Сума (грн)</th></tr></thead><tbody><tr><td>1</td><td>${esc(docLabel)} (LOT-2026-TC112)</td><td>шт/пар</td><td style="text-align:right;">${state.noNumbersMode ? '—' : '1 200'}</td><td style="text-align:right;">${sumVal}</td></tr></tbody></table>
        <div class="doc-signatures"><div class="doc-sig-block">Сформував<br><strong>Шевченко О. В.</strong></div><div class="doc-sig-block">ЕЦП / КЕП<br><strong>Дійсний</strong></div><div class="doc-sig-block">Погодив (CEO)<br><strong>Коваленко І. П.</strong></div></div>
      </div>
      <div id="doc-tab-scan" style="display:none;">
        <div style="border:1px solid #CBD5E1; border-radius:8px; overflow:hidden; background:#FFFFFF;">
          <img src="${scanSrc}" alt="Скан-копія документа" style="width:100%; max-height:460px; object-fit:contain; display:block;">
        </div>
      </div>
    `;
    document.getElementById('modal-doc-viewer').classList.add('open');
  };

  function exportCSV() {
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];
    const meta = getActiveSubtypeMeta();
    const headers = dataset.columns.map(c => `"${c.label}"`).join(';');
    const lines = dataset.rows.map(r => dataset.columns.map(c => `"${String(state.noNumbersMode && c.num ? '' : r[c.key]).replace(/"/g, '""')}"`).join(';'));
    const blob = new Blob(['\uFEFF' + headers + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OpexMetrix_${state.activeView}_2026.csv`;
    link.click();
    showToast(`Експортовано: ${meta.subtype.title}`);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLoginGate();
    renderSidebar();
    renderTasksDrawer();
    updateAuditRadar();

    document.getElementById('btn-sidebar-ceo')?.addEventListener('click', switchToCEO);
    document.getElementById('btn-sidebar-acc')?.addEventListener('click', switchToAccountingCockpit);
    document.getElementById('tree-search')?.addEventListener('input', renderSidebar);
    document.getElementById('btn-undo')?.addEventListener('click', performUndo);

    document.querySelectorAll('.view-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.viewDisplayMode = btn.dataset.vmode;
        renderActiveView();
      });
    });

    document.querySelectorAll('#chart-metric-tabs .chart-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#chart-metric-tabs .chart-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.chartMetric = tab.dataset.metric;
        renderAnalyticsChart();
      });
    });

    document.getElementById('btn-audit-radar')?.addEventListener('click', () => { updateAuditRadar(); document.getElementById('modal-radar').classList.add('open'); });
    document.getElementById('btn-close-radar')?.addEventListener('click', () => document.getElementById('modal-radar').classList.remove('open'));
    document.getElementById('btn-close-radar-footer')?.addEventListener('click', () => document.getElementById('modal-radar').classList.remove('open'));

    const onSearch = (e) => { state.searchQuery = e.target.value; if (state.activeMode === 'TABLE') renderActiveView(); };
    document.getElementById('global-search')?.addEventListener('input', onSearch);
    document.getElementById('table-search')?.addEventListener('input', onSearch);

    document.getElementById('btn-toggle-numbers')?.addEventListener('click', (e) => {
      state.noNumbersMode = !state.noNumbersMode;
      e.currentTarget.classList.toggle('active', state.noNumbersMode);
      document.getElementById('label-num-mode').textContent = state.noNumbersMode ? 'Без цифр' : 'З цифрами';
      if (state.activeMode === 'CEO') renderCEOCockpit();
      else renderActiveView();
    });

    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activePeriod = btn.textContent.trim();
        renderActiveView();
        showToast(`Період: ${state.activePeriod}`);
      });
    });

    // Mobile sidebar drawer
    const mobileMenuBtn = document.getElementById('btn-mobile-menu');
    const sysSidebar = document.getElementById('sys-sidebar');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (mobileMenuBtn && sysSidebar && sidebarBackdrop) {
      mobileMenuBtn.addEventListener('click', () => {
        sysSidebar.classList.toggle('mobile-open');
        sidebarBackdrop.classList.toggle('open');
      });
      sidebarBackdrop.addEventListener('click', () => {
        sysSidebar.classList.remove('mobile-open');
        sidebarBackdrop.classList.remove('open');
      });
    }

    // Accounting Cockpit action buttons
    document.getElementById('btn-acc-import')?.addEventListener('click', () => {
      document.getElementById('import-log-box').style.display = 'none';
      document.getElementById('modal-import')?.classList.add('open');
    });
    document.getElementById('btn-acc-depreciation')?.addEventListener('click', () => window.__accrueDepreciation());
    document.getElementById('btn-acc-close-month')?.addEventListener('click', window.__openAutomationModal);
    document.getElementById('btn-acc-posting-setup')?.addEventListener('click', () => window.__switchToTable('posting-setup'));

    // Modal backdrop click-to-close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });

    document.getElementById('btn-tasks-drawer')?.addEventListener('click', openTasksDrawer);
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('btn-create-task-drawer')?.addEventListener('click', () => { closeTasksDrawer(); window.__openHandoff(getActiveSubtypeMeta().subtype.title); });
    document.getElementById('btn-handoff-report')?.addEventListener('click', () => window.__openHandoff(getActiveSubtypeMeta().subtype.title));
    document.getElementById('btn-close-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-cancel-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-confirm-handoff')?.addEventListener('click', confirmHandoff);

    document.getElementById('btn-close-doc-viewer')?.addEventListener('click', () => document.getElementById('modal-doc-viewer').classList.remove('open'));
    document.getElementById('btn-print-doc')?.addEventListener('click', () => window.print());
    document.getElementById('btn-doc-handoff')?.addEventListener('click', () => {
      document.getElementById('modal-doc-viewer').classList.remove('open');
      if (state.docContext) window.__openHandoff(`Первинний документ ${state.docContext.docId}: ${state.docContext.docLabel}`, state.docContext.docId);
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
        closeInspector();
        closeTasksDrawer();
        sysSidebar?.classList.remove('mobile-open');
        sidebarBackdrop?.classList.remove('open');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        performUndo();
      }
    });
  });

})();
