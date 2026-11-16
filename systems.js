/**
 * OpexMetrix Systems — Операційна ERP-платформа нового покоління
 * 20-символьний вхід, Excel-сітка з формулами (=), Undo Ctrl+Z, Аудит-Радар 24/7,
 * Імпорт Банк/1С, Живі проводки, Симулятор What-If для CEO, Маршрутизація
 */

(function () {
  'use strict';

  const CREDENTIALS = {
    CEO: {
      login: '00000000000000000000',
      pass:  '00000000000000000000',
      name:  'Коваленко І. П.',
      title: 'CEO (Керівник)',
      initials: 'КІ'
    },
    CPA: {
      login: '00000000000000000000',
      pass:  '11111111111111111111',
      name:  'Шевченко О. В.',
      title: 'Головний бухгалтер',
      initials: 'ШО'
    }
  };

  const state = {
    role: null,
    activeMode: 'TABLE',
    activeView: 'osv',
    entity: 'ALKOM',
    period: 'CURRENT_MONTH',
    noNumbersMode: false,
    searchQuery: '',
    highlightedRowId: null,
    activeCell: null,
    sortCol: null,
    sortDir: 1,
    undoStack: [],
    handoffContext: null,
    docContext: null,
    tasks: [
      {
        id: 'TSK-101',
        title: 'Акт звірки: Аптечна мережа АНЦ (Договір №402/26)',
        sender: 'Савченко Д. І. (Комерційний директор)',
        recipient: 'Шевченко О. В. (Головний бухгалтер)',
        priority: 'URGENT',
        date: '16.11.2026 11:45',
        view: 'sales-recon',
        rowId: 'REC-ANC',
        status: 'ACTIVE',
        comment: 'Перевірити зарахування оплати на 1 004 000 грн по накладній ВН-004182.'
      },
      {
        id: 'TSK-102',
        title: 'Списання сировини М-29: Наряд WO-2026-4402',
        sender: 'Мельник С. М. (Нач. швейного цеху)',
        recipient: 'Коваленко І. П. (CEO / Фінансовий директор)',
        priority: 'APPROVAL',
        date: '16.11.2026 10:15',
        view: 'mes-m29',
        rowId: 'M29-LYCRA',
        status: 'ACTIVE',
        comment: 'Перевитрата пряжі Lycra 70 DEN (+1.8 кг) через переналагодження Merz CC4.'
      },
      {
        id: 'TSK-103',
        title: 'Партія LOT-2026-TC112 (Панчохи компресійні КЛ-2)',
        sender: 'Григоренко П. Т. (Нач. ВТК)',
        recipient: 'Бондар В. А. (Зав. складом)',
        priority: 'URGENT',
        date: '16.11.2026 09:30',
        view: 'wms-batch',
        rowId: 'LOT-2026-TC112',
        status: 'ACTIVE',
        comment: 'Контрольний тиск 26.4 мм рт. ст. підтверджено.'
      },
      {
        id: 'TSK-104',
        title: 'Замовлення ПД-8812 (ОРТОС — 685 000 грн)',
        sender: 'Савченко Д. І. (Комерційний директор)',
        recipient: 'Коваленко І. П. (CEO / Фінансовий директор)',
        priority: 'APPROVAL',
        date: '15.11.2026 17:20',
        view: 'sales-orders',
        rowId: 'ORD-8812',
        status: 'ACTIVE',
        comment: 'Погодити відвантаження без передоплати в межах кредитного ліміту.'
      }
    ]
  };

  const DOMAINS = [
    {
      id: 'GL',
      title: 'Головна книга та Проводки',
      open: true,
      subtypes: [
        { id: 'osv', code: 'ОСВ', title: 'Оборотно-сальдова відомість', tag: 'Синтетичний облік' },
        { id: 'ledger', code: 'ЖП', title: 'Журнал проводок (Live)', tag: 'Подвійний запис Дт/Кт' },
        { id: 'osv-acc', code: 'ОСВ-Р', title: 'ОСВ по рахунку 361', tag: 'Аналітика мереж' },
        { id: 'card-acc', code: 'КР', title: 'Картка рахунку', tag: 'Хронологія' },
        { id: 'balance', code: 'Ф-1', title: 'Баланс підприємства (Форма №1)', tag: 'НП(С)БО 1' },
        { id: 'pnl-stat', code: 'Ф-2', title: 'Фінансові результати (Форма №2)', tag: 'P&L' },
        { id: 'vat-decl', code: 'ПДВ', title: 'Реєстр ПН та Декларація ПДВ', tag: 'Податки' }
      ]
    },
    {
      id: 'MES',
      title: 'Виробництво та Собівартість',
      open: false,
      subtypes: [
        { id: 'mes-cost', code: 'СВ', title: 'Калькуляція собівартості', tag: 'Прямі + ЗВВ' },
        { id: 'mes-m29', code: 'М-29', title: 'Списання матеріалів (М-29)', tag: 'Норма / Факт' },
        { id: 'mes-orders', code: 'ВЗ', title: 'Виробничі замовлення', tag: 'Цех / Дільниці' },
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
        { id: 'sales-orders', code: 'ЗП', title: 'Реєстр замовлень (EDI)', tag: 'Замовлення' },
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
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function colLetter(idx) {
    return String.fromCharCode(65 + idx);
  }

  function evalMathExpr(raw) {
    const s = String(raw).trim();
    if (!s.startsWith('=')) return null;
    const expr = s.slice(1).replace(/\s+/g, '').replace(/,/g, '.');
    if (!/^[0-9+\-*/().]+$/.test(expr)) return null;
    try {
      const res = Function('"use strict"; return (' + expr + ')')();
      return (typeof res === 'number' && isFinite(res)) ? res : null;
    } catch (_) {
      return null;
    }
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
    'osv': {
      columns: [
        { key: 'acc', label: 'Рахунок', editable: true },
        { key: 'name', label: 'Найменування рахунку', editable: true },
        { key: 'begDt', label: 'Сальдо поч. Дт', num: true, editable: true },
        { key: 'begCt', label: 'Сальдо поч. Кт', num: true, editable: true },
        { key: 'turnDt', label: 'Обороти Дт', num: true, editable: true },
        { key: 'turnCt', label: 'Обороти Кт', num: true, editable: true },
        { key: 'endDt', label: 'Сальдо кін. Дт', num: true, computed: true },
        { key: 'endCt', label: 'Сальдо кін. Кт', num: true, computed: true }
      ],
      recalcRow: (r) => {
        const net = (Number(r.begDt) - Number(r.begCt)) + (Number(r.turnDt) - Number(r.turnCt));
        r.endDt = net > 0 ? net : 0;
        r.endCt = net < 0 ? Math.abs(net) : 0;
      },
      rows: [
        { id: '10', acc: '10', name: 'Основні засоби (Верстати Merz CC4, CAD/CAM)', begDt: 18450000, begCt: 0, turnDt: 420000, turnCt: 0, endDt: 18870000, endCt: 0 },
        { id: '131', acc: '131', name: 'Знос основних засобів', begDt: 0, begCt: 4120000, turnDt: 0, turnCt: 185000, endDt: 0, endCt: 4305000 },
        { id: '201', acc: '201', name: 'Сировина й матеріали (Пряжа Lycra, Поліамід)', begDt: 4820000, begCt: 0, turnDt: 3150000, turnCt: 2940000, endDt: 5030000, endCt: 0 },
        { id: '23', acc: '23', name: 'Виробництво (НЗВ цеху)', begDt: 1120000, begCt: 0, turnDt: 6840000, turnCt: 6590000, endDt: 1370000, endCt: 0 },
        { id: '26', acc: '26', name: 'Готова продукція (Трикотаж, бандажі)', begDt: 6410000, begCt: 0, turnDt: 6590000, turnCt: 7120000, endDt: 5880000, endCt: 0 },
        { id: '281', acc: '281', name: 'Товари на складі (Взуття, устілки)', begDt: 2150000, begCt: 0, turnDt: 1890000, turnCt: 1740000, endDt: 2300000, endCt: 0 },
        { id: '301', acc: '301', name: 'Готівка в національній валюті', begDt: 42500, begCt: 0, turnDt: 180000, turnCt: 165000, endDt: 57500, endCt: 0 },
        { id: '311', acc: '311', name: 'Поточні рахунки в банках', begDt: 11420000, begCt: 0, turnDt: 29450000, turnCt: 26020000, endDt: 14850000, endCt: 0 },
        { id: '361', acc: '361', name: 'Розрахунки з покупцями (Аптечні мережі)', begDt: 5640000, begCt: 0, turnDt: 28500000, turnCt: 27140000, endDt: 7000000, endCt: 0 },
        { id: '631', acc: '631', name: 'Розрахунки з постачальниками', begDt: 0, begCt: 3180000, turnDt: 4920000, turnCt: 5410000, endDt: 0, endCt: 3670000 },
        { id: '641', acc: '641', name: 'Розрахунки за податками (ПДВ, Прибуток)', begDt: 0, begCt: 1420000, turnDt: 1420000, turnCt: 1680000, endDt: 0, endCt: 1680000 },
        { id: '661', acc: '661', name: 'Розрахунки за заробітною платою', begDt: 0, begCt: 1850000, turnDt: 1850000, turnCt: 1940000, endDt: 0, endCt: 1940000 },
        { id: '701', acc: '701', name: 'Дохід від реалізації продукції', begDt: 0, begCt: 0, turnDt: 28500000, turnCt: 28500000, endDt: 0, endCt: 0 },
        { id: '901', acc: '901', name: 'Собівартість реалізованої продукції', begDt: 0, begCt: 0, turnDt: 17120000, turnCt: 17120000, endDt: 0, endCt: 0 }
      ],
      summary: (rows) => {
        const totTurnDt = rows.reduce((s, r) => s + Number(r.turnDt || 0), 0);
        const totTurnCt = rows.reduce((s, r) => s + Number(r.turnCt || 0), 0);
        const totEndDt = rows.reduce((s, r) => s + Number(r.endDt || 0), 0);
        const diff = Math.abs(totTurnDt - totTurnCt);
        return `
          <div>Обороти Дт: <strong>${fmt(totTurnDt)}</strong> | Обороти Кт: <strong>${fmt(totTurnCt)}</strong></div>
          <div class="summary-checksum">
            <span>Сальдо Дт: ${fmt(totEndDt)}</span>
            <span class="checksum-badge">${diff < 0.01 ? 'Контроль Дт=Кт: OK (0.00)' : 'Різниця Дт/Кт: ' + fmt(diff)}</span>
          </div>
        `;
      }
    },

    'ledger': {
      columns: [
        { key: 'time', label: 'Час', editable: true },
        { key: 'doc', label: 'Документ', editable: true },
        { key: 'dt', label: 'Дебет (Дт)', editable: true },
        { key: 'ct', label: 'Кредит (Кт)', editable: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true },
        { key: 'desc', label: 'Зміст господарської операції', editable: true },
        { key: 'status', label: 'Джерело', editable: true }
      ],
      rows: [
        { id: 'JRN-1', time: '16.11 11:45', doc: 'ВН-004182', dt: '361', ct: '701', sum: 1814000, desc: 'Реалізація ортезів ММ «Добробут»', status: 'Авто-проводка' },
        { id: 'JRN-2', time: '16.11 10:15', doc: 'М29-4402', dt: '23', ct: '201', sum: 486200, desc: 'Списання пряжі Lycra 70 DEN у цех', status: 'Авто-проводка' },
        { id: 'JRN-3', time: '15.11 16:40', doc: 'БВ-009310', dt: '311', ct: '361', sum: 1004000, desc: 'Надходження оплати від ТОВ «Аптека АНЦ»', status: 'Банк-Клієнт' },
        { id: 'JRN-4', time: '15.11 14:10', doc: 'НВ-4411', dt: '26', ct: '23', sum: 1170000, desc: 'Оприбуткування гольфів КЛ-1 на склад ГП', status: 'Цех Merz CC4' }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.sum || 0), 0);
        return `<div>Проводок у журналі: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Оборот Дт=Кт: ${fmt(tot)}</span></div>`;
      }
    },

    'osv-acc': {
      columns: [
        { key: 'sub', label: 'Контрагент / Мережа', editable: true },
        { key: 'code', label: 'ЄДРПОУ', editable: true },
        { key: 'begDt', label: 'Поч. сальдо Дт', num: true, editable: true },
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
      summary: (rows) => {
        const endDt = rows.reduce((s, r) => s + Number(r.endDt || 0), 0);
        return `<div>Залишок по рахунку 361: <strong>${fmt(endDt)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Авто-баланс</span></div>`;
      }
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
        { key: 'article', label: 'Стаття балансу (Актив / Пасив)', editable: true },
        { key: 'beg', label: 'На початок року', num: true, editable: true },
        { key: 'end', label: 'На кінець періоду', num: true, editable: true },
        { key: 'diff', label: 'Зміна (+/-)', num: true, computed: true }
      ],
      recalcRow: (r) => { r.diff = Number(r.end) - Number(r.beg); },
      rows: [
        { id: 'B-1010', code: '1010', article: 'Основні засоби (залишкова вартість)', beg: 14120000, end: 14565000, diff: 445000 },
        { id: 'B-1100', code: '1100', article: 'Запаси (Сировина, НЗВ, Готова продукція)', beg: 12950000, end: 14580000, diff: 1630000 },
        { id: 'B-1125', code: '1125', article: 'Дебіторська заборгованість', beg: 5640000, end: 7000000, diff: 1360000 },
        { id: 'B-1165', code: '1165', article: 'Гроші та їх еквіваленти', beg: 11462500, end: 14907500, diff: 3445000 },
        { id: 'B-1400', code: '1400', article: 'Власний капітал (Пасив)', beg: 37722500, end: 43762500, diff: 6040000 },
        { id: 'B-1615', code: '1615', article: 'Кредиторська заборгованість постачальникам', beg: 3180000, end: 3670000, diff: 490000 },
        { id: 'B-1620', code: '1620', article: 'Зобов’язання перед бюджетом', beg: 1420000, end: 1680000, diff: 260000 },
        { id: 'B-1630', code: '1630', article: 'Зобов’язання з оплати праці', beg: 1850000, end: 1940000, diff: 90000 }
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
      summary: (rows) => {
        const np = rows.find(r => r.code === '2350')?.curr || 6355000;
        return `<div>Чистий прибуток: <strong>${fmt(np)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">EBITDA: ${fmtPct(27.2)}</span></div>`;
      }
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
      recalcRow: (r) => {
        r.tot = Number(r.mat) + Number(r.lab) + Number(r.ovh);
        r.unit = Number(r.qty) > 0 ? r.tot / Number(r.qty) : 0;
      },
      rows: [
        { id: 'COST-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи компресійні КЛ-2 (Чорні, M)', qty: 4200, mat: 672000, lab: 294000, ovh: 168000, unit: 270, tot: 1134000 },
        { id: 'COST-2', sku: 'ALK-BP4-L', name: 'Бандаж попереково-крижовий БП-4 (L)', qty: 2800, mat: 784000, lab: 336000, ovh: 196000, unit: 470, tot: 1316000 },
        { id: 'COST-3', sku: 'ALK-OR2-S', name: 'Ортез колінний шарнірний OR-2 (S)', qty: 1450, mat: 609000, lab: 261000, ovh: 145000, unit: 700, tot: 1015000 },
        { id: 'COST-4', sku: 'ALK-GL1-L', name: 'Гольфи антиемболічні КЛ-1 (Білі, L)', qty: 6500, mat: 650000, lab: 325000, ovh: 195000, unit: 180, tot: 1170000 }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.tot), 0);
        return `<div>Фактична собівартість: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Авто-калькуляція</span></div>`;
      }
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
      recalcRow: (r) => {
        r.diff = Number(r.fact) - Number(r.norm);
        r.status = r.diff > 0 ? 'Перевитрата' : (r.diff < 0 ? 'Економія' : 'В межах норми');
      },
      rows: [
        { id: 'M29-LYCRA', order: 'WO-2026-4402', mat: 'Пряжа Lycra 70 DEN (Італія)', unit: 'кг', norm: 412.0, fact: 413.8, diff: 1.8, status: 'Перевитрата (Переналагодження)' },
        { id: 'M29-POLY', order: 'WO-2026-4402', mat: 'Нитка поліамідна PA 6.6', unit: 'кг', norm: 850.0, fact: 848.5, diff: -1.5, status: 'Економія' },
        { id: 'M29-NEOP', order: 'WO-2026-4409', mat: 'Неопрен медичний 3мм', unit: 'м2', norm: 620.0, fact: 620.0, diff: 0, status: 'В межах норми' },
        { id: 'M29-SIL', order: 'WO-2026-4411', mat: 'Стрічка силіконова 50мм', unit: 'м.п.', norm: 2100.0, fact: 2100.0, diff: 0, status: 'В межах норми' }
      ],
      summary: () => `<div>Форма М-29: контроль нормативів</div><div class="summary-checksum"><span class="checksum-badge">Допуск: 0.5%</span></div>`
    },

    'mes-orders': {
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
      summary: (rows) => `<div>Нарядів у роботі: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Виконання: ${fmtPct(87.5)}</span></div>`
    },

    'mes-boms': {
      columns: [
        { key: 'code', label: 'Код BOM', editable: true },
        { key: 'product', label: 'Виріб', editable: true },
        { key: 'components', label: 'Склад специфікації', editable: true },
        { key: 'steps', label: 'Технологічний маршрут', editable: true },
        { key: 'normTime', label: 'Нормо-час (хв)', num: true, editable: true }
      ],
      rows: [
        { id: 'BOM-C2', code: 'SPEC-0012', product: 'Панчохи КЛ-2', components: 'Lycra 70D (0.045кг), PA 6.6 (0.085кг), Силікон (0.5м)', steps: 'В’язання → Зшивання → Фарбування → Формовка → ВТК', normTime: 18.5 },
        { id: 'BOM-BP4', code: 'SPEC-0048', product: 'Бандаж БП-4', components: 'Полотно еластичне (0.35м), Ребра сталеві (4шт), Велкро', steps: 'CAD-розкрій → Окантовка → Ребра → ВТК', normTime: 24.0 },
        { id: 'BOM-OR2', code: 'SPEC-0089', product: 'Ортез OR-2', components: 'Неопрен 3мм (0.42м2), Шарніри алюм. (2шт), Ремені (2шт)', steps: 'Вирубка → Оверлок → Склеювання → Шарніри → ВТК', normTime: 32.0 }
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
        { key: 'loss', label: 'Сума втрат', num: true, editable: true },
        { key: 'reason', label: 'Причина ВТК', editable: true }
      ],
      rows: [
        { id: 'SCR-01', act: 'АБ-0084', date: '12.11.2026', lot: 'LOT-2026-TC112', item: 'Панчохи КЛ-2', qty: 28, loss: 7560, reason: 'Невідповідність тиску на щиколотці (<23 мм рт. ст.)' },
        { id: 'SCR-02', act: 'АБ-0089', date: '14.11.2026', lot: 'LOT-2026-AK048', item: 'Бандаж БП-4', qty: 12, loss: 5640, reason: 'Дефект закріпки велкро-стрічки' }
      ],
      summary: (rows) => {
        const loss = rows.reduce((s, r) => s + Number(r.loss), 0);
        return `<div>Рівень браку: <strong>${fmtPct(0.32)}</strong></div><div class="summary-checksum"><span class="checksum-badge">Списано: ${fmt(loss)}</span></div>`;
      }
    },

    'wms-m19': {
      columns: [
        { key: 'wh', label: 'Склад', editable: true },
        { key: 'item', label: 'Номенклатура', editable: true },
        { key: 'beg', label: 'Залишок поч.', num: true, editable: true },
        { key: 'inc', label: 'Прихід', num: true, editable: true },
        { key: 'exp', label: 'Розхід', num: true, editable: true },
        { key: 'end', label: 'Залишок кін.', num: true, computed: true },
        { key: 'sum', label: 'Сума (грн)', num: true, editable: true }
      ],
      recalcRow: (r) => { r.end = Number(r.beg) + Number(r.inc) - Number(r.exp); },
      rows: [
        { id: 'M19-1', wh: 'Склад Сировини №1', item: 'Пряжа Lycra 70 DEN (кг)', beg: 1840, inc: 1200, exp: 950, end: 2090, sum: 1881000 },
        { id: 'M19-2', wh: 'Склад Сировини №1', item: 'Нитка PA 6.6 (кг)', beg: 3200, inc: 2000, exp: 1850, end: 3350, sum: 1507500 },
        { id: 'M19-3', wh: 'Склад ГП №2', item: 'Панчохи КЛ-2 (пари)', beg: 8400, inc: 4200, exp: 5100, end: 7500, sum: 2025000 },
        { id: 'M19-4', wh: 'Склад ГП №2', item: 'Бандажі АЛКОМ (шт)', beg: 5120, inc: 2800, exp: 3400, end: 4520, sum: 2124400 }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.sum), 0);
        return `<div>Залишок по М-19: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Рахунки 201 / 26: OK</span></div>`;
      }
    },

    'wms-batch': {
      columns: [
        { key: 'id', label: 'Партія (LOT)', editable: true },
        { key: 'item', label: 'Виріб', editable: true },
        { key: 'mfgDate', label: 'Виготовлено', editable: true },
        { key: 'expDate', label: 'Термін до', editable: true },
        { key: 'qty', label: 'Залишок', num: true, editable: true },
        { key: 'pressure', label: 'Протокол ВТК', editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'LOT-2026-TC112', item: 'Панчохи КЛ-2 (Чорні, M)', mfgDate: '12.11.2026', expDate: '12.11.2031', qty: 4200, pressure: '26.4 мм рт.ст. (Норма)', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-AK048', item: 'Бандаж БП-4 (L)', mfgDate: '10.11.2026', expDate: '10.11.2031', qty: 2800, pressure: 'Тест жорсткості: OK', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-GL901', item: 'Гольфи КЛ-1 (L)', mfgDate: '08.11.2026', expDate: '08.11.2031', qty: 6500, pressure: '19.8 мм рт.ст. (Норма)', status: 'Відвантажується (FEFO)' },
        { id: 'LOT-2026-OR07', item: 'Ортез OR-2', mfgDate: '14.11.2026', expDate: '14.11.2031', qty: 940, pressure: 'На тестуванні ВТК', status: 'Карантин до перевірки' }
      ],
      summary: (rows) => `<div>Активних партій: <strong>${rows.length}</strong></div><div class="summary-checksum"><span class="checksum-badge">Простежуваність 100%</span></div>`
    },

    'wms-reserves': {
      columns: [
        { key: 'sku', label: 'SKU', editable: true },
        { key: 'name', label: 'Товар', editable: true },
        { key: 'phys', label: 'Фізично', num: true, editable: true },
        { key: 'res', label: 'Резерв', num: true, editable: true },
        { key: 'free', label: 'Вільно', num: true, computed: true },
        { key: 'client', label: 'Під кого резерв', editable: true }
      ],
      recalcRow: (r) => { r.free = Number(r.phys) - Number(r.res); },
      rows: [
        { id: 'RES-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи КЛ-2 (Чорні, M)', phys: 7500, res: 3200, free: 4300, client: 'АНЦ (2000), Подорожник (1200)' },
        { id: 'RES-2', sku: 'ALK-BP4-L', name: 'Бандаж БП-4 (L)', phys: 4520, res: 1850, free: 2670, client: 'ОРТОС (1200), Добробут (650)' },
        { id: 'RES-3', sku: 'ALK-GL1-L', name: 'Гольфи КЛ-1', phys: 6500, res: 4100, free: 2400, client: 'Аптека 9-1-1 (4100)' }
      ],
      summary: (rows) => {
        const res = rows.reduce((s, r) => s + Number(r.res), 0);
        return `<div>Зарезервовано: <strong>${fmtInt(res, 'од.')}</strong></div><div class="summary-checksum"><span class="checksum-badge">Оверселінг заблоковано</span></div>`;
      }
    },

    'wms-inv19': {
      columns: [
        { key: 'code', label: 'Інв. код', editable: true },
        { key: 'name', label: 'Номенклатура', editable: true },
        { key: 'book', label: 'За обліком', num: true, editable: true },
        { key: 'fact', label: 'Фактично (ТСД)', num: true, editable: true },
        { key: 'diff', label: 'Відхилення', num: true, computed: true },
        { key: 'res', label: 'Висновок', editable: true }
      ],
      recalcRow: (r) => {
        r.diff = Number(r.fact) - Number(r.book);
        r.res = r.diff === 0 ? 'Збіг 100%' : (r.diff > 0 ? 'Лишок' : 'Нестача');
      },
      rows: [
        { id: 'INV-1', code: '201-014', name: 'Пряжа Lycra 70 DEN', book: 2090, fact: 2090, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-2', code: '26-102', name: 'Панчохи КЛ-2 (Коробки)', book: 375, fact: 375, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-3', code: '26-205', name: 'Бандажі БП-4', book: 4520, fact: 4520, diff: 0, res: 'Збіг 100%' }
      ],
      summary: () => `<div>Інвентаризація (Форма Інв-19)</div><div class="summary-checksum"><span class="checksum-badge">Розбіжностей: 0</span></div>`
    },

    'sales-recon': {
      columns: [
        { key: 'id', label: 'Код', editable: true },
        { key: 'contract', label: 'Контрагент / Договір', editable: true },
        { key: 'beg', label: 'Сальдо поч.', num: true, editable: true },
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
        { id: 'REC-DOB', contract: 'ММ «Добробут» (№310/26)', beg: 540000, shipped: 2980000, paid: 2890000, end: 630000, status: 'Очікує підпису контрагента' }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.end), 0);
        return `<div>Дебіторка по мережах: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Вчасно.ЕДО / M.E.Doc</span></div>`;
      }
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
        { id: 'AGE-4', client: 'Аптека 9-1-1', d15: 900000, d30: 90000, d60: 0, d60p: 0, total: 990000 }
      ],
      summary: (rows) => {
        const p60 = rows.reduce((s, r) => s + Number(r.d60p), 0);
        return `<div>Прострочка 60+ днів: <strong>${fmt(p60)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Ризик портфеля: Низький</span></div>`;
      }
    },

    'sales-orders': {
      columns: [
        { key: 'id', label: '№ Замовлення', editable: true },
        { key: 'date', label: 'Дата EDI', editable: true },
        { key: 'client', label: 'Мережа', editable: true },
        { key: 'items', label: 'Позицій', num: true, editable: true },
        { key: 'sum', label: 'Сума', num: true, editable: true },
        { key: 'status', label: 'Статус', editable: true }
      ],
      rows: [
        { id: 'ORD-8812', date: '16.11.2026', client: 'ТОВ «ОРТОС»', items: 42, sum: 685000, status: 'Очікує погодження CEO' },
        { id: 'ORD-8815', date: '16.11.2026', client: 'ТОВ «Аптека АНЦ»', items: 118, sum: 1420000, status: 'На збірці' },
        { id: 'ORD-8819', date: '15.11.2026', client: 'ТОВ «Подорожник»', items: 94, sum: 1180000, status: 'Відвантажено' },
        { id: 'ORD-8824', date: '15.11.2026', client: 'ММ «Добробут»', items: 28, sum: 490000, status: 'Зарезервовано' }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.sum), 0);
        return `<div>Замовлень: <strong>${rows.length}</strong> на суму <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">EDI-шлюз активний</span></div>`;
      }
    },

    'sales-margin': {
      columns: [
        { key: 'cat', label: 'Категорія продукції', editable: true },
        { key: 'rev', label: 'Виручка', num: true, editable: true },
        { key: 'cogs', label: 'Собівартість', num: true, editable: true },
        { key: 'gp', label: 'Валовий прибуток', num: true, computed: true },
        { key: 'margin', label: 'Маржа %', num: true, computed: true }
      ],
      recalcRow: (r) => {
        r.gp = Number(r.rev) - Number(r.cogs);
        r.margin = Number(r.rev) > 0 ? (r.gp / Number(r.rev) * 100) : 0;
      },
      rows: [
        { id: 'MRG-1', cat: 'Компресійний трикотаж (КЛ-1..3)', rev: 12400000, cogs: 7100000, gp: 5300000, margin: 42.7 },
        { id: 'MRG-2', cat: 'Бандажі та коректори', rev: 8200000, cogs: 4920000, gp: 3280000, margin: 40.0 },
        { id: 'MRG-3', cat: 'Ортези суглобові', rev: 4900000, cogs: 3180000, gp: 1720000, margin: 35.1 },
        { id: 'MRG-4', cat: 'Устілки та взуття', rev: 3000000, cogs: 1920000, gp: 1080000, margin: 36.0 }
      ],
      summary: (rows) => {
        const gp = rows.reduce((s, r) => s + Number(r.gp), 0);
        const rev = rows.reduce((s, r) => s + Number(r.rev), 0);
        const m = rev > 0 ? (gp / rev * 100) : 0;
        return `<div>Середня маржа: <strong>${fmtPct(m)}</strong></div><div class="summary-checksum"><span class="checksum-badge">Валовий прибуток: ${fmt(gp)}</span></div>`;
      }
    },

    'treasury-stmt': {
      columns: [
        { key: 'bank', label: 'Банк / IBAN', editable: true },
        { key: 'beg', label: 'Залишок поч.', num: true, editable: true },
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
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + Number(r.end), 0);
        return `<div>Залишок на рахунках (311): <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Звірено з ОСВ 311: OK</span></div>`;
      }
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
        { id: 'CSH-1', doc: 'ПКО-00112', date: '14.11.2026', person: 'Салон «Алком»', purpose: 'Здача роздрібної виручки', inc: 48500, out: 0 },
        { id: 'CSH-2', doc: 'ВКО-00084', date: '15.11.2026', person: 'Інкасація ПриватБанк', purpose: 'Здача готівки в банк', inc: 0, out: 33500 }
      ],
      summary: () => `<div>Залишок каси (301): <strong>${fmt(57500)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Ліміт каси: OK</span></div>`
    },

    'hr-payroll': {
      columns: [
        { key: 'dept', label: 'Підрозділ', editable: true },
        { key: 'emp', label: 'Штат (осіб)', num: true, editable: true },
        { key: 'gross', label: 'Нараховано (ФОП)', num: true, editable: true },
        { key: 'pdfo', label: 'ПДФО (18%)', num: true, computed: true },
        { key: 'vz', label: 'Військ. збір (5%)', num: true, computed: true },
        { key: 'net', label: 'До виплати', num: true, computed: true }
      ],
      recalcRow: (r) => {
        r.pdfo = Number(r.gross) * 0.18;
        r.vz = Number(r.gross) * 0.05;
        r.net = Number(r.gross) - r.pdfo - r.vz;
      },
      rows: [
        { id: 'HR-1', dept: 'Швейно-в’язальний цех', emp: 84, gross: 2100000, pdfo: 378000, vz: 105000, net: 1617000 },
        { id: 'HR-2', dept: 'Склад, Логістика та ВТК', emp: 24, gross: 540000, pdfo: 97200, vz: 27000, net: 415800 },
        { id: 'HR-3', dept: 'Відділ продажів та ЕДО', emp: 18, gross: 680000, pdfo: 122400, vz: 34000, net: 523600 },
        { id: 'HR-4', dept: 'Адміністрація та Бухгалтерія', emp: 14, gross: 520000, pdfo: 93600, vz: 26000, net: 400400 }
      ],
      summary: (rows) => {
        const net = rows.reduce((s, r) => s + Number(r.net), 0);
        return `<div>Загалом до виплати: <strong>${fmt(net)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">ПДФО 18% + ВЗ 5% авто</span></div>`;
      }
    }
  };

  // ================= UNDO HISTORY =================
  function pushUndo(viewId, rowsSnapshot) {
    state.undoStack.push({ viewId, rows: JSON.parse(JSON.stringify(rowsSnapshot)) });
    if (state.undoStack.length > 25) state.undoStack.shift();
    updateUndoBtn();
  }

  function performUndo() {
    if (state.undoStack.length === 0) return;
    const snap = state.undoStack.pop();
    DATASETS[snap.viewId].rows = snap.rows;
    updateUndoBtn();
    updateAuditRadar();
    if (state.activeMode === 'TABLE') {
      if (state.activeView !== snap.viewId) window.__switchToTable(snap.viewId);
      else renderActiveView();
    } else {
      renderCEOCockpit();
    }
    showToast('Останню зміну скасовано (Ctrl+Z)');
  }

  function updateUndoBtn() {
    const btn = document.getElementById('btn-undo');
    if (btn) btn.disabled = state.undoStack.length === 0;
  }

  // ================= AUDIT RADAR 24/7 =================
  function computeAuditRisks() {
    const risks = [];
    const osvDt = DATASETS['osv'].rows.reduce((s, r) => s + Number(r.turnDt || 0), 0);
    const osvCt = DATASETS['osv'].rows.reduce((s, r) => s + Number(r.turnCt || 0), 0);
    if (Math.abs(osvDt - osvCt) > 0.01) {
      risks.push({
        level: 'danger',
        title: 'Розбаланс ОСВ (Дт != Кт)',
        desc: `Різниця оборотів становить ${fmt(Math.abs(osvDt - osvCt))} грн. Потребує перевірки проводок.`,
        view: 'osv',
        rowId: ''
      });
    }
    const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
    if (anc && anc.status.includes('Потребує')) {
      risks.push({
        level: 'warning',
        title: 'Незвірена оплата ТОВ «Аптека АНЦ» (1 004 000 грн)',
        desc: 'Банківський платіж ще не рознесений у Акті звірки.',
        view: 'sales-recon',
        rowId: 'REC-ANC'
      });
    }
    const m29 = DATASETS['mes-m29'].rows.find(r => Number(r.diff) > 0.5);
    if (m29) {
      risks.push({
        level: 'warning',
        title: `Перевитрата сировини: ${m29.mat}`,
        desc: `Наряд ${m29.order}: перевитрата +${m29.diff} ${m29.unit} понад технологічну норму.`,
        view: 'mes-m29',
        rowId: m29.id
      });
    }
    return risks;
  }

  function updateAuditRadar() {
    const risks = computeAuditRisks();
    const btn = document.getElementById('btn-audit-radar');
    const countEl = document.getElementById('radar-count');
    if (!btn || !countEl) return;

    if (risks.length === 0) {
      btn.classList.add('clean');
      countEl.textContent = '0 ризиків';
    } else {
      btn.classList.remove('clean');
      countEl.textContent = `${risks.length} ризик(и)`;
    }

    const body = document.getElementById('radar-list-body');
    if (body) {
      body.innerHTML = risks.length === 0
        ? '<div style="padding:20px; text-align:center; color:#059669; font-weight:700;">Аудит-Радар: 0 розбіжностей. Баланс, податки та склад синхронізовані.</div>'
        : risks.map(r => `
          <div class="ceo-approval-item" style="border-left: 4px solid ${r.level === 'danger' ? '#DC2626' : '#D97706'};">
            <div>
              <div style="font-weight:700; font-size:12px;">${esc(r.title)}</div>
              <div style="font-size:11px; color:#64748B; margin-top:2px;">${esc(r.desc)}</div>
            </div>
            <button class="btn-action-primary" onclick="document.getElementById('modal-radar').classList.remove('open'); window.__switchToTable('${r.view}', '${r.rowId}')">Перейти &rarr;</button>
          </div>
        `).join('');
    }
  }

  // ================= LOGIN GATE =================
  function initLoginGate() {
    const screen = document.getElementById('login-screen');
    const form = document.getElementById('login-form');
    const userInput = document.getElementById('login-user');
    const passInput = document.getElementById('login-pass');
    const userCount = document.getElementById('login-char-count');
    const passCount = document.getElementById('pass-char-count');
    const errBox = document.getElementById('login-error');

    function updateCounters() {
      const uLen = userInput.value.length;
      const pLen = passInput.value.length;
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
      else window.__switchToTable('osv');
      showToast(`Вхід виконано: ${profile.title} — ${profile.name}`);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      errBox.classList.remove('show');
      const u = userInput.value;
      const p = passInput.value;
      if (u.length !== 20 || p.length !== 20) {
        errBox.textContent = 'Помилка: Логін та пароль мають містити рівно 20 символів.';
        errBox.classList.add('show');
        return;
      }
      if (u === CREDENTIALS.CEO.login && p === CREDENTIALS.CEO.pass) loginAs('CEO');
      else if (u === CREDENTIALS.CPA.login && p === CREDENTIALS.CPA.pass) loginAs('CPA');
      else {
        errBox.textContent = 'Невірний логін або пароль.';
        errBox.classList.add('show');
      }
    });

    document.getElementById('btn-quick-ceo').addEventListener('click', () => {
      userInput.value = CREDENTIALS.CEO.login;
      passInput.value = CREDENTIALS.CEO.pass;
      updateCounters();
      loginAs('CEO');
    });

    document.getElementById('btn-quick-cpa').addEventListener('click', () => {
      userInput.value = CREDENTIALS.CPA.login;
      passInput.value = CREDENTIALS.CPA.pass;
      updateCounters();
      loginAs('CPA');
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('opex_role');
      state.role = null;
      userInput.value = '';
      passInput.value = '';
      updateCounters();
      errBox.classList.remove('show');
      screen.classList.remove('hidden');
    });

    const saved = sessionStorage.getItem('opex_role');
    if (saved && CREDENTIALS[saved]) loginAs(saved);
  }

  // ================= CEO COCKPIT + WHAT-IF SIMULATOR =================
  function switchToCEO() {
    state.activeMode = 'CEO';
    document.getElementById('ceo-cockpit-view').classList.add('active');
    document.getElementById('table-workspace-view').classList.add('hidden');
    document.getElementById('btn-sidebar-ceo').classList.add('active');
    renderSidebar();
    renderCEOCockpit();
  }

  window.__switchToTable = function(viewId, highlightId = null) {
    state.activeMode = 'TABLE';
    state.activeView = viewId;
    state.highlightedRowId = highlightId;
    state.activeCell = null;
    state.sortCol = null;
    document.getElementById('ceo-cockpit-view').classList.remove('active');
    document.getElementById('table-workspace-view').classList.remove('hidden');
    document.getElementById('btn-sidebar-ceo').classList.remove('active');
    DOMAINS.forEach(d => { if (d.subtypes.some(s => s.id === viewId)) d.open = true; });
    renderSidebar();
    renderActiveView();
  };

  function updateSimulator() {
    const pDelta = Number(document.getElementById('sim-price')?.value || 0);
    const cDelta = Number(document.getElementById('sim-cost')?.value || 0);
    const days = Number(document.getElementById('sim-days')?.value || 14);

    document.getElementById('sim-price-val').textContent = (pDelta >= 0 ? '+' : '') + pDelta + '%';
    document.getElementById('sim-cost-val').textContent = (cDelta >= 0 ? '+' : '') + cDelta + '%';
    document.getElementById('sim-days-val').textContent = days + ' дн.';

    const baseRev = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.rev), 0);
    const baseCogs = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.cogs), 0);
    const projRev = baseRev * (1 + pDelta / 100);
    const projCogs = baseCogs * (1 + cDelta / 100);
    const projProfit = (projRev - projCogs) - 5025000;
    const ebitda = projRev > 0 ? ((projRev - projCogs - 3630000) / projRev * 100) : 0;
    const cashGapRisk = days > 35 ? 'Ризик розриву!' : (days > 21 ? 'Помірний' : 'Безпечно');

    document.getElementById('sim-result-box').innerHTML = `
      <div class="sim-res-item"><span>Прогноз виручки</span><strong>${state.noNumbersMode ? '—' : '₴ ' + fmt(projRev)}</strong></div>
      <div class="sim-res-item"><span>Чистий прибуток</span><strong style="color:${projProfit >= 0 ? '#34D399' : '#F87171'};">${state.noNumbersMode ? '—' : '₴ ' + fmt(projProfit)}</strong></div>
      <div class="sim-res-item"><span>EBITDA / Ліквідність</span><strong>${fmtPct(ebitda)} (${cashGapRisk})</strong></div>
    `;

    const cashBase = DATASETS['treasury-stmt'].rows.reduce((s, r) => s + Number(r.end), 0);
    const m1 = cashBase;
    const m2 = cashBase + projProfit * 0.6 - (days * 140000);
    const m3 = m2 + projProfit * 0.85;
    const maxV = Math.max(m1, m2, m3, 1);
    const h1 = Math.max(12, Math.round((m1 / maxV) * 56));
    const h2 = Math.max(12, Math.round((Math.max(m2, 0) / maxV) * 56));
    const h3 = Math.max(12, Math.round((Math.max(m3, 0) / maxV) * 56));

    document.getElementById('ceo-cashflow-chart').innerHTML = `
      <svg viewBox="0 0 360 72" width="100%" height="72" style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:6px; padding:4px;">
        <rect x="28" y="${64 - h1}" width="64" height="${h1}" rx="4" fill="#2563EB"></rect>
        <text x="60" y="69" font-size="9" text-anchor="middle" fill="#64748B">Поточний міс.</text>
        <rect x="148" y="${64 - h2}" width="64" height="${h2}" rx="4" fill="${days > 35 ? '#F59E0B' : '#10B981'}"></rect>
        <text x="180" y="69" font-size="9" text-anchor="middle" fill="#64748B">Прогноз +30 дн.</text>
        <rect x="268" y="${64 - h3}" width="64" height="${h3}" rx="4" fill="#10B981"></rect>
        <text x="300" y="69" font-size="9" text-anchor="middle" fill="#64748B">Прогноз +60 дн.</text>
      </svg>
    `;
  }

  function renderCEOCockpit() {
    const cashTot = DATASETS['treasury-stmt'].rows.reduce((s, r) => s + Number(r.end), 0) + 57500;
    const revTot = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.rev), 0);
    const gpTot = DATASETS['sales-margin'].rows.reduce((s, r) => s + Number(r.gp), 0);
    const debtTot = DATASETS['sales-recon'].rows.reduce((s, r) => s + Number(r.end), 0);

    document.getElementById('ceo-kpi-grid').innerHTML = `
      <div class="ceo-kpi-card" onclick="window.__switchToTable('treasury-stmt')">
        <div class="ceo-kpi-label">Гроші на рахунках і в касі</div>
        <div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(cashTot)}</div>
        <div class="ceo-kpi-sub">Банківські виписки IBAN &rarr;</div>
      </div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('sales-margin')">
        <div class="ceo-kpi-label">Виручка від реалізації</div>
        <div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(revTot)}</div>
        <div class="ceo-kpi-sub">Валовий прибуток: ${fmt(gpTot)} &rarr;</div>
      </div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('pnl-stat')">
        <div class="ceo-kpi-label">Чистий прибуток (P&amp;L)</div>
        <div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(6355000)}</div>
        <div class="ceo-kpi-sub">Рентабельність 22.3% &rarr;</div>
      </div>
      <div class="ceo-kpi-card" onclick="window.__switchToTable('sales-recon')">
        <div class="ceo-kpi-label">Дебіторка аптечних мереж</div>
        <div class="ceo-kpi-val">${state.noNumbersMode ? '—' : '₴ ' + fmt(debtTot)}</div>
        <div class="ceo-kpi-sub">Прострочка 60+ дн: 0.00 &rarr;</div>
      </div>
    `;

    const pending = state.tasks.filter(t => t.status === 'ACTIVE');
    document.getElementById('ceo-pending-count').textContent = `${pending.length} активних`;
    document.getElementById('ceo-approvals-list').innerHTML = pending.length === 0
      ? '<div style="color:#059669; font-weight:600; text-align:center; padding:16px;">Всі документи погоджено</div>'
      : pending.map(t => `
        <div class="ceo-approval-item">
          <div>
            <div style="font-weight:700; font-size:12px;">${esc(t.title)}</div>
            <div style="font-size:11px; color:#64748B;">Від: ${esc(t.sender)} • ${esc(t.comment)}</div>
          </div>
          <div style="display:flex; gap:5px; flex-shrink:0;">
            <button class="btn-row-action" onclick="window.__switchToTable('${esc(t.view)}', '${esc(t.rowId || '')}')">Таблиця</button>
            <button class="btn-approve-sm" onclick="window.__completeTask('${esc(t.id)}')">Погодити</button>
          </div>
        </div>
      `).join('');

    updateSimulator();
  }

  // ================= SIDEBAR =================
  function renderSidebar() {
    const container = document.getElementById('sidebar-tree-container');
    if (!container) return;
    const filterText = (document.getElementById('tree-search')?.value || '').toLowerCase().trim();

    container.innerHTML = DOMAINS.map(domain => {
      const filteredSubtypes = domain.subtypes.filter(st => {
        if (!filterText) return true;
        return st.title.toLowerCase().includes(filterText) || st.code.toLowerCase().includes(filterText);
      });
      if (filterText && filteredSubtypes.length === 0) return '';
      const isOpen = filterText ? true : domain.open;
      return `
        <div class="acc-domain-group ${isOpen ? 'open' : ''}">
          <div class="domain-header" onclick="window.__toggleDomain('${domain.id}')">
            <div class="domain-header-title">
              <span class="domain-arrow">&#9654;</span>
              <span>${esc(domain.title)}</span>
            </div>
            <span class="domain-count">${filteredSubtypes.length}</span>
          </div>
          <div class="subtype-list">
            ${filteredSubtypes.map(st => `
              <div class="subtype-item ${state.activeMode === 'TABLE' && state.activeView === st.id ? 'active' : ''}" onclick="window.__switchToTable('${st.id}')">
                <span>${esc(st.title)}</span>
                <span class="subtype-code">${esc(st.code)}</span>
              </div>
            `).join('')}
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

  // ================= EXCEL-GRID TABLE =================
  function renderActiveView(recalcRowIdx = null) {
    const meta = getActiveSubtypeMeta();
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];

    document.getElementById('ctrl-breadcrumb').textContent = `${meta.domain.title} > ${meta.subtype.title}`;
    document.getElementById('ctrl-title').innerHTML = `
      <span>${esc(meta.subtype.title)}</span>
      <span class="ctrl-tag">${esc(meta.subtype.tag)}</span>
    `;

    const q = (state.searchQuery || '').toLowerCase().trim();
    let filteredRows = dataset.rows.filter(row => {
      if (!q) return true;
      return Object.values(row).some(val => String(val).toLowerCase().includes(q));
    });

    if (state.sortCol) {
      const col = dataset.columns.find(c => c.key === state.sortCol);
      filteredRows = [...filteredRows].sort((a, b) => {
        const va = a[state.sortCol], vb = b[state.sortCol];
        if (col && col.num) return (Number(va) - Number(vb)) * state.sortDir;
        return String(va).localeCompare(String(vb), 'uk') * state.sortDir;
      });
    }

    const viewport = document.getElementById('table-viewport');
    if (!viewport) return;

    let thead = '<thead><tr><th class="col-letter-row" style="width:36px;">#</th>';
    dataset.columns.forEach((col, cIdx) => {
      thead += `<th class="col-letter-row" onclick="window.__sortCol('${col.key}')" title="Клікніть для сортування">${colLetter(cIdx)}</th>`;
    });
    thead += '<th class="col-letter-row">Дії</th></tr>';

    thead += '<tr><th class="col-title-row" style="text-align:center;">№</th>';
    dataset.columns.forEach(col => {
      const arrow = state.sortCol === col.key ? (state.sortDir === 1 ? ' ▲' : ' ▼') : '';
      thead += `<th class="col-title-row ${col.num ? 'num' : ''}" onclick="window.__sortCol('${col.key}')">${esc(col.label)}${arrow}</th>`;
    });
    thead += '<th class="col-title-row" style="text-align:right; width:175px;">Маршрут / Док / Вид.</th></tr></thead>';

    let tbody = '<tbody>';
    filteredRows.forEach((row, rIdx) => {
      const isHighlighted = state.highlightedRowId === row.id ? 'highlighted' : '';
      tbody += `<tr class="${isHighlighted}" id="row-${esc(row.id)}">`;
      tbody += `<td class="row-index-cell">${rIdx + 1}</td>`;

      dataset.columns.forEach((col, cIdx) => {
        const val = row[col.key];
        const cellRef = `${colLetter(cIdx)}${rIdx + 1}`;
        const isActiveCell = state.activeCell && state.activeCell.cellRef === cellRef ? 'active-cell' : '';
        const isFlash = (recalcRowIdx === rIdx && col.computed) ? 'recalc-flash' : '';
        const editableClass = col.editable ? 'editable-cell' : '';

        let displayVal = '';
        if (col.num) {
          if (col.key === 'pct' || col.key === 'margin') displayVal = fmtPct(val);
          else if (['qty', 'emp', 'items', 'book', 'fact', 'phys', 'res', 'free', 'plan', 'done'].includes(col.key)) displayVal = fmtInt(val);
          else displayVal = fmt(val);
        } else if (col.key === 'status') {
          let badgeClass = 'status-info';
          const s = String(val).toLowerCase();
          if (s.includes('ок') || s.includes('дозв') || s.includes('підпис') || s.includes('прийн') || s.includes('зареєст') || s.includes('передано') || s.includes('норм') || s.includes('звірен') || s.includes('авто')) badgeClass = 'status-ok';
          else if (s.includes('потр') || s.includes('очік') || s.includes('перевитр') || s.includes('карант')) badgeClass = 'status-warning';
          displayVal = `<span class="status-badge ${badgeClass}">${esc(val)}</span>`;
        } else {
          displayVal = esc(val);
        }

        tbody += `<td class="${col.num ? 'num' : ''} ${editableClass} ${isActiveCell} ${isFlash}"
                      data-row-id="${esc(row.id)}" data-col-key="${esc(col.key)}" data-cell-ref="${cellRef}"
                      onclick="window.__selectCell('${esc(row.id)}', '${esc(col.key)}', '${cellRef}', ${rIdx})"
                      ondblclick="window.__editCell(this, '${esc(row.id)}', '${esc(col.key)}', ${rIdx})">${displayVal}</td>`;
      });

      const rowLabel = row.name || row.sub || row.article || row.item || row.mat || row.product || row.client || row.bank || row.dept || row.doc || row.contract || row.desc || row.id;
      tbody += `
        <td style="text-align:right;">
          <div class="row-actions">
            <button class="btn-row-action" onclick="window.__openHandoff('${esc(meta.subtype.title)}: ${esc(rowLabel)}', '${esc(row.id)}')">Передати</button>
            <button class="btn-row-action" onclick="window.__openDocViewer('${esc(row.id)}', '${esc(rowLabel)}')">Док</button>
            <button class="btn-row-action btn-row-del" onclick="window.__deleteRow('${esc(row.id)}')" title="Видалити рядок">&times;</button>
          </div>
        </td>
      </tr>`;
    });
    tbody += '</tbody>';

    viewport.innerHTML = `<table class="op-table">${thead}${tbody}</table>`;

    const summaryEl = document.getElementById('table-summary-bar');
    if (summaryEl) {
      summaryEl.innerHTML = dataset.summary ? dataset.summary(filteredRows) : `<div>Рядків: ${filteredRows.length}</div>`;
    }
  }

  window.__sortCol = function(colKey) {
    if (state.sortCol === colKey) state.sortDir *= -1;
    else { state.sortCol = colKey; state.sortDir = 1; }
    renderActiveView();
  };

  window.__selectCell = function(rowId, colKey, cellRef, rIdx) {
    const dataset = DATASETS[state.activeView];
    const row = dataset.rows.find(r => r.id === rowId);
    const col = dataset.columns.find(c => c.key === colKey);
    if (!row) return;
    state.activeCell = { rowId, colKey, cellRef, rIdx };
    document.getElementById('fx-cell-ref').textContent = cellRef;
    document.getElementById('fx-input').value = row[colKey];

    const hintEl = document.getElementById('fx-col-stats');
    if (hintEl && col && col.num && !state.noNumbersMode) {
      const vals = dataset.rows.map(r => Number(r[colKey] || 0));
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = vals.length ? sum / vals.length : 0;
      hintEl.textContent = `Колонка [${col.label}]: Сума = ${fmt(sum)} | Середнє = ${fmt(avg)} | Рядків = ${vals.length}`;
    } else if (hintEl) {
      hintEl.textContent = 'Двічі клікніть або введіть =формулу у рядок fx';
    }

    document.querySelectorAll('.op-table td.active-cell').forEach(td => td.classList.remove('active-cell'));
    const target = document.querySelector(`td[data-cell-ref="${cellRef}"]`);
    if (target) target.classList.add('active-cell');
  };

  window.__editCell = function(tdEl, rowId, colKey, rIdx) {
    const dataset = DATASETS[state.activeView];
    const col = dataset.columns.find(c => c.key === colKey);
    const row = dataset.rows.find(r => r.id === rowId);
    if (!row || !col || !col.editable) return;

    const currentVal = row[colKey];
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'cell-inline-input';
    input.value = currentVal;
    tdEl.innerHTML = '';
    tdEl.appendChild(input);
    input.focus();
    input.select();

    let committed = false;
    function commit() {
      if (committed) return;
      committed = true;
      let rawVal = input.value.trim();
      let newVal = rawVal;
      if (col.num) {
        const evalRes = evalMathExpr(rawVal);
        if (evalRes !== null) newVal = evalRes;
        else {
          newVal = parseFloat(rawVal.replace(/\s+/g, '').replace(',', '.'));
          if (isNaN(newVal)) newVal = currentVal;
        }
      }
      if (newVal !== currentVal) {
        pushUndo(state.activeView, dataset.rows);
        row[colKey] = newVal;
        if (dataset.recalcRow) dataset.recalcRow(row);
        updateAuditRadar();
        showToast(`Оновлено (${col.label}) — підсумки та Аудит-Радар перераховано`);
      }
      renderActiveView(rIdx);
    }

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); }
      else if (e.key === 'Escape') { committed = true; renderActiveView(); }
    });
    input.addEventListener('blur', commit);
  };

  window.__deleteRow = function(rowId) {
    const dataset = DATASETS[state.activeView];
    if (!dataset) return;
    pushUndo(state.activeView, dataset.rows);
    dataset.rows = dataset.rows.filter(r => r.id !== rowId);
    updateAuditRadar();
    renderActiveView();
    showToast('Рядок видалено (Ctrl+Z для скасування)');
  };

  document.getElementById('fx-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && state.activeCell) {
      const { rowId, colKey, rIdx } = state.activeCell;
      const dataset = DATASETS[state.activeView];
      const col = dataset.columns.find(c => c.key === colKey);
      const row = dataset.rows.find(r => r.id === rowId);
      if (!row || !col || !col.editable) {
        showToast('Розрахункова клітинка — редагуйте базові значення');
        return;
      }
      let raw = e.target.value.trim();
      let val = raw;
      if (col.num) {
        const evalRes = evalMathExpr(raw);
        if (evalRes !== null) val = evalRes;
        else {
          val = parseFloat(raw.replace(/\s+/g, '').replace(',', '.'));
          if (isNaN(val)) return;
        }
      }
      pushUndo(state.activeView, dataset.rows);
      row[colKey] = val;
      if (dataset.recalcRow) dataset.recalcRow(row);
      updateAuditRadar();
      renderActiveView(rIdx);
      showToast('Формулу / значення застосовано');
    }
  });

  document.getElementById('btn-add-row')?.addEventListener('click', () => {
    const dataset = DATASETS[state.activeView];
    if (!dataset) return;
    pushUndo(state.activeView, dataset.rows);
    const newRow = { id: 'ROW-' + Math.floor(1000 + Math.random() * 9000) };
    dataset.columns.forEach(c => { newRow[c.key] = c.num ? 0 : 'Новий запис'; });
    dataset.rows.push(newRow);
    renderActiveView(dataset.rows.length - 1);
    showToast('Додано новий рядок');
  });

  // ================= LIVE BANK / 1C IMPORT =================
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
        const purpose = parts[4] || 'Оплата по банку';

        // Credit Bank 311
        const pb = DATASETS['treasury-stmt'].rows[0];
        if (pb && amt > 0) {
          pb.inc += amt;
          DATASETS['treasury-stmt'].recalcRow(pb);
        }
        // Match sales-recon
        if (partner.includes('АНЦ')) {
          const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
          if (anc) {
            anc.paid += amt;
            anc.status = 'Звірено автоматично (Банк OK)';
            DATASETS['sales-recon'].recalcRow(anc);
          }
        } else if (partner.includes('Подорожник')) {
          const pod = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-POD');
          if (pod) {
            pod.paid += amt;
            DATASETS['sales-recon'].recalcRow(pod);
          }
        }
        // Add live double-entry posting
        DATASETS['ledger'].rows.unshift({
          id: 'JRN-' + Math.floor(100 + Math.random() * 899),
          time: '16.11 Щойно',
          doc: 'БВ-AUTO',
          dt: '311',
          ct: '361',
          sum: amt,
          desc: `${partner}: ${purpose}`,
          status: 'Імпорт Банк-Клієнт'
        });

        logBox.innerHTML += `<div class="auto-log-line"><span class="auto-log-ok">[Дт311 Кт361]</span><span>${esc(partner)}: +${fmt(amt)} грн проведено автоматично</span></div>`;
        if (idx === lines.length - 1) {
          updateAuditRadar();
          if (state.activeMode === 'TABLE') renderActiveView();
          else renderCEOCockpit();
          showToast(`Імпортовано та проведено ${lines.length} банківських платежі`);
        }
      }, (idx + 1) * 350);
    });
  });

  // ================= AUTOMATION ENGINE =================
  window.__openAutomationModal = function() {
    document.getElementById('modal-automation').classList.add('open');
  };

  function appendAutoLog(tag, msg) {
    const box = document.getElementById('auto-log-box');
    const line = document.createElement('div');
    line.className = 'auto-log-line';
    line.innerHTML = `<span class="auto-log-ok">[${tag}]</span><span>${esc(msg)}</span>`;
    box.appendChild(line);
    box.scrollTop = box.scrollHeight;
  }

  function runAutomationSequence(title, steps, onFinish) {
    const box = document.getElementById('auto-log-box');
    box.innerHTML = '';
    appendAutoLog('START', title);
    steps.forEach((step, idx) => {
      setTimeout(() => {
        appendAutoLog('OK', step);
        if (idx === steps.length - 1 && onFinish) onFinish();
      }, (idx + 1) * 320);
    });
  }

  document.getElementById('btn-open-automation')?.addEventListener('click', window.__openAutomationModal);
  document.getElementById('btn-close-auto')?.addEventListener('click', () => document.getElementById('modal-automation').classList.remove('open'));
  document.getElementById('btn-close-auto-footer')?.addEventListener('click', () => document.getElementById('modal-automation').classList.remove('open'));

  document.getElementById('btn-run-auto-bank')?.addEventListener('click', () => {
    runAutomationSequence('Авто-звірка Банк ↔ 361...', [
      'Завантажено виписку ПриватБанк (128 транзакцій)...',
      'Оплату ТОВ «Аптека АНЦ» 1 004 000.00 грн прив’язано до ВН-004182',
      'Оновлено Акт звірки та Журнал проводок.'
    ], () => {
      const anc = DATASETS['sales-recon'].rows.find(r => r.id === 'REC-ANC');
      if (anc) anc.status = 'Звірено автоматично (Банк OK)';
      updateAuditRadar();
      if (state.activeMode === 'TABLE') renderActiveView();
      else renderCEOCockpit();
      showToast('Авто-звірку завершено');
    });
  });

  document.getElementById('btn-run-auto-cost')?.addEventListener('click', () => {
    runAutomationSequence('Авто-розрахунок собівартості (Матеріали + ЗП + ЗВВ)...', [
      'Зчитано списання М-29 (Lycra 70D, PA 6.6)...',
      'Розподілено ЗВВ цеху пропорційно нормо-годинам Merz CC4...',
      'Оновлено собівартість одиниці по 4 партіях.'
    ], () => {
      DATASETS['mes-cost'].rows.forEach(r => DATASETS['mes-cost'].recalcRow(r));
      if (state.activeMode === 'TABLE') renderActiveView();
      showToast('Калькуляцію перераховано');
    });
  });

  document.getElementById('btn-run-auto-vat')?.addEventListener('click', () => {
    runAutomationSequence('Авто-перевірка ПДВ...', [
      'Звірено ПН з ЄРПН (7% медвироби / 20% імпорт)...',
      'Сформовано Декларацію ПДВ: до сплати 150 500 грн.'
    ], () => showToast('ПДВ перевірено без помилок'));
  });

  document.getElementById('btn-run-auto-close')?.addEventListener('click', () => {
    runAutomationSequence('Закриття місяця...', [
      'Дт 901 Кт 26 = 17 120 000.00 грн',
      'Дт 701 Кт 791 = 28 500 000.00 грн',
      'Баланс Дт = Кт (Розбіжність 0.00).'
    ], () => {
      updateAuditRadar();
      if (state.activeMode === 'TABLE') renderActiveView();
      showToast('Місяць закрито успішно');
    });
  });

  // ================= HANDOFF & TASKS DRAWER =================
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
    const comment = document.getElementById('handoff-comment').value.trim() || 'Прошу перевірити та опрацювати документ.';
    const senderProfile = CREDENTIALS[state.role || 'CPA'];

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.2026 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    state.tasks.unshift({
      id: 'TSK-' + Math.floor(105 + Math.random() * 890),
      title: docName,
      sender: `${senderProfile.name} (${senderProfile.title})`,
      recipient, priority, date: timeStr,
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
          <div class="task-card-header">
            <span class="task-priority-tag ${pClass}">${pText}</span>
            <span style="font-size:11px; color:#64748B; font-family:var(--font-mono);">${esc(t.date)}</span>
          </div>
          <div class="task-title">${esc(t.title)}</div>
          <div class="task-meta">
            <span>Від: <strong>${esc(t.sender.split('(')[0])}</strong></span>
            <span>Кому: <strong>${esc(t.recipient.split('(')[0])}</strong></span>
          </div>
          <div class="task-comment-box">${esc(t.comment)}</div>
          <div class="task-actions">
            <button class="btn-task-action" onclick="window.__goToTaskView('${esc(t.view)}', '${esc(t.rowId || '')}')">Перейти до таблиці</button>
            ${!isDone ? `<button class="btn-task-action" onclick="window.__completeTask('${esc(t.id)}')">Погодити</button>` : '<span style="font-size:11px; color:#059669; font-weight:600;">Виконано</span>'}
          </div>
        </div>
      `;
    }).join('');
  }

  window.__goToTaskView = function(viewId, rowId) {
    closeTasksDrawer();
    window.__switchToTable(viewId, rowId || null);
    if (rowId) {
      setTimeout(() => {
        const el = document.getElementById('row-' + rowId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  };

  window.__completeTask = function(taskId) {
    const t = state.tasks.find(x => x.id === taskId);
    if (t) {
      t.status = 'DONE';
      renderTasksDrawer();
      if (state.activeMode === 'CEO') renderCEOCockpit();
      showToast('Погоджено та виконано');
    }
  };

  function openTasksDrawer() {
    document.getElementById('drawer-overlay').classList.add('open');
    document.getElementById('tasks-drawer').classList.add('open');
  }

  function closeTasksDrawer() {
    document.getElementById('drawer-overlay').classList.remove('open');
    document.getElementById('tasks-drawer').classList.remove('open');
  }

  // ================= PRIMARY DOCUMENT VIEWER =================
  window.__openDocViewer = function(docId, docLabel) {
    state.docContext = { docId, docLabel };
    const paper = document.getElementById('doc-paper-content');
    if (!paper) return;
    const sumVal = state.noNumbersMode ? '—' : '1 004 000.00 грн (в т.ч. ПДВ 7%: 65 682.24 грн)';

    paper.innerHTML = `
      <div class="doc-barcode-row">
        <div><strong>Електронний первинний документ</strong></div>
        <div style="font-family:var(--font-mono); font-size:12px;">ID: ${esc(docId)} | QR-VERIFIED</div>
      </div>
      <div class="doc-title-h1">ПЕРВИННИЙ ОБЛІКОВИЙ ДОКУМЕНТ № ${esc(docId)} від 16.11.2026</div>
      <div class="doc-grid">
        <div class="doc-grid-label">Підприємство:</div>
        <div>ТОВ «ТД «Алком» (ЄДРПОУ 32894510, м. Київ, вул. Промислова, 14)</div>
        <div class="doc-grid-label">Підстава / Об'єкт:</div>
        <div><strong>${esc(docLabel)}</strong></div>
        <div class="doc-grid-label">Відповідальний:</div>
        <div>Шевченко О. В. (Головний бухгалтер)</div>
      </div>
      <table class="doc-table">
        <thead><tr><th>№</th><th>Найменування позиції / Партія (LOT)</th><th>Од.</th><th>Кількість</th><th>Сума (грн)</th></tr></thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${esc(docLabel)} (Партія LOT-2026-TC112, ISO 13485)</td>
            <td>шт/пар</td>
            <td style="text-align:right;">${state.noNumbersMode ? '—' : '1 200'}</td>
            <td style="text-align:right;">${sumVal}</td>
          </tr>
        </tbody>
      </table>
      <div class="doc-signatures">
        <div class="doc-sig-block">Сформував<br><strong>Шевченко О. В.</strong></div>
        <div class="doc-sig-block">ЕЦП / КЕП Підпис<br><strong>Дійсний (ЦСК «Україна»)</strong></div>
        <div class="doc-sig-block">Погодив (CEO)<br><strong>Коваленко І. П.</strong></div>
      </div>
    `;
    document.getElementById('modal-doc-viewer').classList.add('open');
  };

  function closeDocViewer() { document.getElementById('modal-doc-viewer').classList.remove('open'); }

  function exportCSV() {
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];
    const meta = getActiveSubtypeMeta();
    const headers = dataset.columns.map(c => `"${c.label}"`).join(';');
    const lines = dataset.rows.map(r => dataset.columns.map(c => {
      let val = r[c.key];
      if (state.noNumbersMode && c.num) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    }).join(';'));
    const csvContent = '\uFEFF' + headers + '\n' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OpexMetrix_${state.activeView}_2026.csv`;
    link.click();
    showToast(`Експортовано в Excel: ${meta.subtype.title}`);
  }

  // ================= INIT =================
  document.addEventListener('DOMContentLoaded', () => {
    initLoginGate();
    renderSidebar();
    renderTasksDrawer();
    updateAuditRadar();

    document.getElementById('btn-sidebar-ceo')?.addEventListener('click', switchToCEO);
    document.getElementById('tree-search')?.addEventListener('input', renderSidebar);
    document.getElementById('btn-undo')?.addEventListener('click', performUndo);

    ['sim-price', 'sim-cost', 'sim-days'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updateSimulator);
    });

    document.getElementById('btn-audit-radar')?.addEventListener('click', () => {
      updateAuditRadar();
      document.getElementById('modal-radar').classList.add('open');
    });
    document.getElementById('btn-close-radar')?.addEventListener('click', () => document.getElementById('modal-radar').classList.remove('open'));
    document.getElementById('btn-close-radar-footer')?.addEventListener('click', () => document.getElementById('modal-radar').classList.remove('open'));

    const onSearch = (e) => {
      state.searchQuery = e.target.value;
      if (state.activeMode === 'TABLE') renderActiveView();
    };
    document.getElementById('global-search')?.addEventListener('input', onSearch);
    document.getElementById('table-search')?.addEventListener('input', onSearch);

    document.getElementById('btn-toggle-numbers')?.addEventListener('click', (e) => {
      state.noNumbersMode = !state.noNumbersMode;
      e.currentTarget.classList.toggle('active', state.noNumbersMode);
      document.getElementById('label-num-mode').textContent = state.noNumbersMode ? 'Без цифр' : 'З цифрами';
      if (state.activeMode === 'CEO') renderCEOCockpit();
      else renderActiveView();
      showToast(state.noNumbersMode ? 'Увімкнено режим без цифр' : 'Увімкнено числовий режим');
    });

    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.period = btn.dataset.period;
        renderActiveView();
      });
    });

    document.getElementById('btn-tasks-drawer')?.addEventListener('click', openTasksDrawer);
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('btn-create-task-drawer')?.addEventListener('click', () => {
      closeTasksDrawer();
      const meta = getActiveSubtypeMeta();
      window.__openHandoff(meta.subtype.title);
    });

    document.getElementById('btn-handoff-report')?.addEventListener('click', () => {
      const meta = getActiveSubtypeMeta();
      window.__openHandoff(meta.subtype.title);
    });
    document.getElementById('btn-close-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-cancel-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-confirm-handoff')?.addEventListener('click', confirmHandoff);

    document.getElementById('btn-close-doc-viewer')?.addEventListener('click', closeDocViewer);
    document.getElementById('btn-print-doc')?.addEventListener('click', () => window.print());
    document.getElementById('btn-doc-handoff')?.addEventListener('click', () => {
      closeDocViewer();
      if (state.docContext) {
        window.__openHandoff(`Первинний документ ${state.docContext.docId}: ${state.docContext.docLabel}`, state.docContext.docId);
      }
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
          e.preventDefault();
          performUndo();
        }
      }
    });
  });

})();
