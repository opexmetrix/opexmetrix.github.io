/**
 * OpexMetrix Systems — Операційний контур підприємства
 * 22 робочих підтипи, маршрутизація документів, режим "Без цифр", первинні документи
 */

(function () {
  'use strict';

  const state = {
    activeView: 'osv',
    entity: 'ALKOM',
    period: 'CURRENT_MONTH',
    account: '361',
    noNumbersMode: false,
    searchQuery: '',
    highlightedRowId: null,
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
        recipient: 'Шевченко О. В. (Головний бухгалтер)',
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
        comment: 'Контрольний тиск 26.4 мм рт. ст. підтверджено. Можна переводити у вільний залишок.'
      },
      {
        id: 'TSK-104',
        title: 'Реєстр замовлення ПД-8812 (ОРТОС)',
        sender: 'Савченко Д. І. (Комерційний директор)',
        recipient: 'Коваленко І. П. (Фінансовий директор)',
        priority: 'NORMAL',
        date: '15.11.2026 17:20',
        view: 'sales-orders',
        rowId: 'ORD-8812',
        status: 'ACTIVE',
        comment: 'Прошу погодити відвантаження без передоплати в межах кредитного ліміту.'
      }
    ]
  };

  // Activity Domains & 22 Subtypes
  const DOMAINS = [
    {
      id: 'GL',
      title: 'Головна книга та Облік',
      open: true,
      subtypes: [
        { id: 'osv', code: 'ОСВ', title: 'Оборотно-сальдова відомість', tag: 'Синтетичний облік' },
        { id: 'osv-acc', code: 'ОСВ-Р', title: 'ОСВ по рахунку', tag: 'Аналітика рахунків' },
        { id: 'card-acc', code: 'КР', title: 'Картка рахунку', tag: 'Хронологія проводок' },
        { id: 'balance', code: 'Ф-1', title: 'Баланс підприємства (Форма №1)', tag: 'НП(С)БО 1' },
        { id: 'pnl-stat', code: 'Ф-2', title: 'Звіт про фін. результати (Форма №2)', tag: 'P&L' },
        { id: 'vat-decl', code: 'ПДВ', title: 'Реєстр ПН та Декларація ПДВ', tag: 'Податковий облік' }
      ]
    },
    {
      id: 'MES',
      title: 'Виробництво та Собівартість',
      open: false,
      subtypes: [
        { id: 'mes-cost', code: 'СВ', title: 'Калькуляція собівартості', tag: 'Прямі + ЗВВ' },
        { id: 'mes-m29', code: 'М-29', title: 'Списання матеріалів (М-29)', tag: 'Норма / Факт' },
        { id: 'mes-orders', code: 'ВЗ', title: 'Виробничі замовлення та статус', tag: 'Цех / Дільниці' },
        { id: 'mes-boms', code: 'BOM', title: 'Специфікації виробів (BOM)', tag: 'Технологічні карти' },
        { id: 'mes-scrap', code: 'ВТК', title: 'Акти браку та відхилень', tag: 'Контроль якості' }
      ]
    },
    {
      id: 'WMS',
      title: 'Склад та Матеріальні потоки',
      open: false,
      subtypes: [
        { id: 'wms-m19', code: 'М-19', title: 'Матеріальний звіт складу (М-19)', tag: 'Прихід / Розхід' },
        { id: 'wms-batch', code: 'LOT', title: 'Партійний облік та терміни', tag: 'Серії та партії' },
        { id: 'wms-reserves', code: 'РЕЗ', title: 'Залишки та резерви під мережі', tag: 'Доступність SKU' },
        { id: 'wms-inv19', code: 'Інв-19', title: 'Інвентаризаційна відомість', tag: 'Ревізія складу' }
      ]
    },
    {
      id: 'SALES',
      title: 'Збут, Мережі та Дебіторка',
      open: false,
      subtypes: [
        { id: 'sales-recon', code: 'АЗВ', title: 'Акт звірки взаєморозрахунків', tag: 'Контрагенти' },
        { id: 'sales-aging', code: 'AGE', title: 'Старіння дебіторки (Aging)', tag: 'Прострочення' },
        { id: 'sales-orders', code: 'ЗП', title: 'Реєстр замовлень покупців', tag: 'EDI Мережі' },
        { id: 'sales-margin', code: 'МРЖ', title: 'Маржинальність продажів', tag: 'SKU / Канали' }
      ]
    },
    {
      id: 'CASH',
      title: 'Казначейство та Банк',
      open: false,
      subtypes: [
        { id: 'treasury-stmt', code: 'БВ', title: 'Банківські виписки та залишки', tag: 'IBAN / Рахунки' },
        { id: 'treasury-cash', code: 'КО-4', title: 'Касова книга та рух готівки', tag: 'ПКО / ВКО' }
      ]
    },
    {
      id: 'HR',
      title: 'Кадри та Заробітна плата',
      open: false,
      subtypes: [
        { id: 'hr-payroll', code: 'П-6', title: 'Розрахунково-платіжна відомість', tag: 'ФОП / Податки' }
      ]
    }
  ];

  // Formatters respecting "No Numbers" mode
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
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
    }, 3200);
  }

  // Datasets for all 22 Subtypes
  const DATASETS = {
    'osv': {
      columns: [
        { key: 'acc', label: 'Рахунок' },
        { key: 'name', label: 'Найменування рахунку' },
        { key: 'begDt', label: 'Сальдо поч. Дт', num: true },
        { key: 'begCt', label: 'Сальдо поч. Кт', num: true },
        { key: 'turnDt', label: 'Обороти Дт', num: true },
        { key: 'turnCt', label: 'Обороти Кт', num: true },
        { key: 'endDt', label: 'Сальдо кін. Дт', num: true },
        { key: 'endCt', label: 'Сальдо кін. Кт', num: true }
      ],
      rows: [
        { id: '10', acc: '10', name: 'Основні засоби (Верстати Merz CC4, CAD/CAM)', begDt: 18450000, begCt: 0, turnDt: 420000, turnCt: 0, endDt: 18870000, endCt: 0 },
        { id: '131', acc: '131', name: 'Знос основних засобів', begDt: 0, begCt: 4120000, turnDt: 0, turnCt: 185000, endDt: 0, endCt: 4305000 },
        { id: '201', acc: '201', name: 'Сировина й матеріали (Пряжа Lycra, Поліамід)', begDt: 4820000, begCt: 0, turnDt: 3150000, turnCt: 2940000, endDt: 5030000, endCt: 0 },
        { id: '23', acc: '23', name: 'Виробництво (Незавершене виробництво цеху)', begDt: 1120000, begCt: 0, turnDt: 6840000, turnCt: 6590000, endDt: 1370000, endCt: 0 },
        { id: '26', acc: '26', name: 'Готова продукція (Компресійний трикотаж, бандажі)', begDt: 6410000, begCt: 0, turnDt: 6590000, turnCt: 7120000, endDt: 5880000, endCt: 0 },
        { id: '281', acc: '281', name: 'Товари на складі (Ортопедичне взуття, устілки)', begDt: 2150000, begCt: 0, turnDt: 1890000, turnCt: 1740000, endDt: 2300000, endCt: 0 },
        { id: '301', acc: '301', name: 'Готівка в національній валюті', begDt: 42500, begCt: 0, turnDt: 180000, turnCt: 165000, endDt: 57500, endCt: 0 },
        { id: '311', acc: '311', name: 'Поточні рахунки в національній валюті', begDt: 11420000, begCt: 0, turnDt: 29450000, turnCt: 26020000, endDt: 14850000, endCt: 0 },
        { id: '361', acc: '361', name: 'Розрахунки з вітчизняними покупцями (Мережі)', begDt: 5640000, begCt: 0, turnDt: 28500000, turnCt: 27140000, endDt: 7000000, endCt: 0 },
        { id: '631', acc: '631', name: 'Розрахунки з постачальниками (Сировина / Послуги)', begDt: 0, begCt: 3180000, turnDt: 4920000, turnCt: 5410000, endDt: 0, endCt: 3670000 },
        { id: '641', acc: '641', name: 'Розрахунки за податками (ПДВ, Податок на прибуток)', begDt: 0, begCt: 1420000, turnDt: 1420000, turnCt: 1680000, endDt: 0, endCt: 1680000 },
        { id: '661', acc: '661', name: 'Розрахунки за заробітною платою', begDt: 0, begCt: 1850000, turnDt: 1850000, turnCt: 1940000, endDt: 0, endCt: 1940000 },
        { id: '701', acc: '701', name: 'Дохід від реалізації готової продукції', begDt: 0, begCt: 0, turnDt: 28500000, turnCt: 28500000, endDt: 0, endCt: 0 },
        { id: '901', acc: '901', name: 'Собівартість реалізованої готової продукції', begDt: 0, begCt: 0, turnDt: 17120000, turnCt: 17120000, endDt: 0, endCt: 0 }
      ],
      summary: (rows) => {
        const totBegDt = rows.reduce((s, r) => s + r.begDt, 0);
        const totBegCt = rows.reduce((s, r) => s + r.begCt, 0);
        const totTurnDt = rows.reduce((s, r) => s + r.turnDt, 0);
        const totTurnCt = rows.reduce((s, r) => s + r.turnCt, 0);
        const totEndDt = rows.reduce((s, r) => s + r.endDt, 0);
        const totEndCt = rows.reduce((s, r) => s + r.endCt, 0);
        return `
          <div>Разом по ОСВ: Обороти Дт = <strong>${fmt(totTurnDt)}</strong> | Обороти Кт = <strong>${fmt(totTurnCt)}</strong></div>
          <div class="summary-checksum">
            <span>Сальдо Дт: ${fmt(totEndDt)}</span>
            <span class="checksum-badge">Контроль Дт/Кт: OK</span>
          </div>
        `;
      }
    },

    'osv-acc': {
      columns: [
        { key: 'sub', label: 'Аналітика (Контрагент / Номенклатура)' },
        { key: 'code', label: 'Код / ЄДРПОУ' },
        { key: 'begDt', label: 'Поч. сальдо Дт', num: true },
        { key: 'begCt', label: 'Поч. сальдо Кт', num: true },
        { key: 'turnDt', label: 'Оборот Дт', num: true },
        { key: 'turnCt', label: 'Оборот Кт', num: true },
        { key: 'endDt', label: 'Кін. сальдо Дт', num: true },
        { key: 'endCt', label: 'Кін. сальдо Кт', num: true }
      ],
      rows: [
        { id: '361-ANC', sub: 'ТОВ «Аптека АНЦ» (Мережа)', code: '38910421', begDt: 1840000, begCt: 0, turnDt: 9450000, turnCt: 8920000, endDt: 2370000, endCt: 0 },
        { id: '361-POD', sub: 'ТОВ «Подорожник» (Аптечна мережа)', code: '39112840', begDt: 1420000, begCt: 0, turnDt: 7800000, turnCt: 7410000, endDt: 1810000, endCt: 0 },
        { id: '361-ORT', sub: 'ТОВ «ОРТОС» (Спеціалізовані салони)', code: '35449102', begDt: 960000, begCt: 0, turnDt: 4620000, turnCt: 4380000, endDt: 1200000, endCt: 0 },
        { id: '361-DOB', sub: 'ММ «Добробут» (Медична мережа)', code: '33219844', begDt: 540000, begCt: 0, turnDt: 2980000, turnCt: 2890000, endDt: 630000, endCt: 0 },
        { id: '361-911', sub: 'Аптека 9-1-1 (ТОВ «Аптека №1»)', code: '37820115', begDt: 880000, begCt: 0, turnDt: 3650000, turnCt: 3540000, endDt: 990000, endCt: 0 }
      ],
      summary: (rows) => {
        const endDt = rows.reduce((s, r) => s + r.endDt, 0);
        return `<div>Залишок по рахунку: <strong>${fmt(endDt)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Деталізація 100%</span></div>`;
      }
    },

    'card-acc': {
      columns: [
        { key: 'date', label: 'Дата' },
        { key: 'doc', label: 'Первинний документ' },
        { key: 'op', label: 'Зміст операції' },
        { key: 'corr', label: 'Кореспонденція' },
        { key: 'dt', label: 'Дебет', num: true },
        { key: 'ct', label: 'Кредит', num: true },
        { key: 'bal', label: 'Поточне сальдо', num: true }
      ],
      rows: [
        { id: 'CR-01', date: '02.11.2026', doc: 'ВН-004112', op: 'Відвантаження АНЦ: Компресійний трикотаж КЛ-2', corr: '361 / 701', dt: 1450000, ct: 0, bal: 7090000 },
        { id: 'CR-02', date: '05.11.2026', doc: 'БВ-009241', op: 'Надходження оплати від ТОВ «Подорожник»', corr: '311 / 361', dt: 0, ct: 1820000, bal: 5270000 },
        { id: 'CR-03', date: '09.11.2026', doc: 'ВН-004148', op: 'Відвантаження ОРТОС: Бандажі поперекові БП-4', corr: '361 / 701', dt: 920000, ct: 0, bal: 6190000 },
        { id: 'CR-04', date: '12.11.2026', doc: 'БВ-009310', op: 'Надходження оплати від ТОВ «Аптека АНЦ»', corr: '311 / 361', dt: 0, ct: 1004000, bal: 5186000 },
        { id: 'CR-05', date: '15.11.2026', doc: 'ВН-004182', op: 'Відвантаження Добробут: Ортези колінні', corr: '361 / 701', dt: 1814000, ct: 0, bal: 7000000 }
      ],
      summary: () => `<div>Всього проводок: <strong>5</strong></div><div class="summary-checksum"><span class="checksum-badge">Кінцеве сальдо: ${fmt(7000000)}</span></div>`
    },

    'balance': {
      columns: [
        { key: 'code', label: 'Код рядка' },
        { key: 'article', label: 'Стаття балансу (Актив / Пасив)' },
        { key: 'beg', label: 'На початок звітного року', num: true },
        { key: 'end', label: 'На кінець звітного періоду', num: true },
        { key: 'diff', label: 'Відхилення (+/-)', num: true }
      ],
      rows: [
        { id: 'B-1010', code: '1010', article: 'Нематеріальні активи та основні засоби (залишкова)', beg: 14120000, end: 14565000, diff: 445000 },
        { id: 'B-1100', code: '1100', article: 'Запаси (Сировина, НЗВ, Готова продукція, Товари)', beg: 12950000, end: 14580000, diff: 1630000 },
        { id: 'B-1125', code: '1125', article: 'Дебіторська заборгованість за продукцію, товари', beg: 5640000, end: 7000000, diff: 1360000 },
        { id: 'B-1165', code: '1165', article: 'Гроші та їх еквіваленти', beg: 11462500, end: 14907500, diff: 3445000 },
        { id: 'B-1300', code: '1300', article: 'БАЛАНС (АКТИВ)', beg: 44172500, end: 51052500, diff: 6880000 },
        { id: 'B-1400', code: '1400', article: 'Власний капітал (Статутний + Нерозподілений прибуток)', beg: 37722500, end: 43762500, diff: 6040000 },
        { id: 'B-1615', code: '1615', article: 'Поточна кредиторська заборгованість за товари/послуги', beg: 3180000, end: 3670000, diff: 490000 },
        { id: 'B-1620', code: '1620', article: 'Поточні зобов’язання за розрахунками з бюджетом', beg: 1420000, end: 1680000, diff: 260000 },
        { id: 'B-1630', code: '1630', article: 'Поточні зобов’язання за розрахунками з оплати праці', beg: 1850000, end: 1940000, diff: 90000 },
        { id: 'B-1900', code: '1900', article: 'БАЛАНС (ПАСИВ)', beg: 44172500, end: 51052500, diff: 6880000 }
      ],
      summary: () => `<div>Баланс Ф-1: <strong>${fmt(51052500)}</strong></div><div class="summary-checksum"><span class="checksum-badge">Актив = Пасив (Розбіжність 0.00)</span></div>`
    },

    'pnl-stat': {
      columns: [
        { key: 'code', label: 'Код' },
        { key: 'item', label: 'Найменування показника (Форма №2)' },
        { key: 'curr', label: 'За поточний період', num: true },
        { key: 'prev', label: 'За аналогічний період минулого року', num: true },
        { key: 'pct', label: 'Динаміка %', num: true }
      ],
      rows: [
        { id: 'P-2000', code: '2000', item: 'Чистий дохід від реалізації продукції', curr: 28500000, prev: 23400000, pct: 21.8 },
        { id: 'P-2050', code: '2050', item: 'Собівартість реалізованої продукції', curr: -17120000, prev: -14650000, pct: 16.9 },
        { id: 'P-2090', code: '2090', item: 'Валовий прибуток', curr: 11380000, prev: 8750000, pct: 30.1 },
        { id: 'P-2130', code: '2130', item: 'Адміністративні витрати', curr: -1950000, prev: -1780000, pct: 9.6 },
        { id: 'P-2150', code: '2150', item: 'Витрати на збут (логістика, маркетинг мереж)', curr: -1680000, prev: -1410000, pct: 19.1 },
        { id: 'P-2290', code: '2290', item: 'Фінансовий результат до оподаткування', curr: 7750000, prev: 5560000, pct: 39.4 },
        { id: 'P-2300', code: '2300', item: 'Витрати з податку на прибуток (18%)', curr: -1395000, prev: -1000800, pct: 39.4 },
        { id: 'P-2350', code: '2350', item: 'Чистий фінансовий результат (Прибуток)', curr: 6355000, prev: 4559200, pct: 39.4 }
      ],
      summary: () => `<div>Чистий прибуток: <strong>${fmt(6355000)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Рентабельність EBITDA: ${fmtPct(27.2)}</span></div>`
    },

    'vat-decl': {
      columns: [
        { key: 'num', label: '№ ПН' },
        { key: 'date', label: 'Дата реєстрації ЄРПН' },
        { key: 'partner', label: 'Контрагент' },
        { key: 'type', label: 'Тип (ПЗ / ПК)' },
        { key: 'base', label: 'База оподаткування', num: true },
        { key: 'vat', label: 'Сума ПДВ (20% / 7%)', num: true },
        { key: 'status', label: 'Статус ЄРПН' }
      ],
      rows: [
        { id: 'VAT-1', num: 'ПН-001842', date: '03.11.2026', partner: 'ТОВ «Аптека АНЦ»', type: 'ПЗ (Медвироби 7%)', base: 4200000, vat: 294000, status: 'Зареєстровано' },
        { id: 'VAT-2', num: 'ПН-001856', date: '08.11.2026', partner: 'ТОВ «Подорожник»', type: 'ПЗ (Медвироби 7%)', base: 3100000, vat: 217000, status: 'Зареєстровано' },
        { id: 'VAT-3', num: 'ПН-994021', date: '10.11.2026', partner: 'Імпорт (Митна декларація №100294)', type: 'ПК (Сировина 20%)', base: 2450000, vat: 490000, status: 'Прийнято' },
        { id: 'VAT-4', num: 'ПН-001891', date: '14.11.2026', partner: 'ТОВ «ОРТОС»', type: 'ПЗ (Медвироби 7%)', base: 1850000, vat: 129500, status: 'Зареєстровано' }
      ],
      summary: () => `<div>Податкове зобов’язання (ПЗ): <strong>${fmt(640500)}</strong> | Податковий кредит (ПК): <strong>${fmt(490000)}</strong></div><div class="summary-checksum"><span class="checksum-badge">До сплати в бюджет: ${fmt(150500)}</span></div>`
    },

    'mes-cost': {
      columns: [
        { key: 'sku', label: 'Артикул' },
        { key: 'name', label: 'Виріб (Медичний трикотаж / Ортез)' },
        { key: 'qty', label: 'Випуск (шт/пар)', num: true },
        { key: 'mat', label: 'Прямі матеріали', num: true },
        { key: 'lab', label: 'Відрядна ЗП + ЄСВ', num: true },
        { key: 'ovh', label: 'ЗВВ цеху', num: true },
        { key: 'unit', label: 'Собівартість од.', num: true },
        { key: 'tot', label: 'Всього собівартість', num: true }
      ],
      rows: [
        { id: 'COST-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи компресійні КЛ-2 (Чорні, р. M)', qty: 4200, mat: 672000, lab: 294000, ovh: 168000, unit: 270, tot: 1134000 },
        { id: 'COST-2', sku: 'ALK-BP4-L', name: 'Бандаж попереково-крижовий з ребрами жорсткості (L)', qty: 2800, mat: 784000, lab: 336000, ovh: 196000, unit: 470, tot: 1316000 },
        { id: 'COST-3', sku: 'ALK-OR2-S', name: 'Ортез колінний роз’ємний з металевими шарнірами (S)', qty: 1450, mat: 609000, lab: 261000, ovh: 145000, unit: 700, tot: 1015000 },
        { id: 'COST-4', sku: 'ALK-GL1-L', name: 'Гольфи антиемболічні КЛ-1 (Білі, р. L)', qty: 6500, mat: 650000, lab: 325000, ovh: 195000, unit: 180, tot: 1170000 }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + r.tot, 0);
        return `<div>Загальна фактична собівартість випуску: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Калькуляція закрита</span></div>`;
      }
    },

    'mes-m29': {
      columns: [
        { key: 'order', label: 'Наряд-замовлення' },
        { key: 'mat', label: 'Сировина / Комплектуючі' },
        { key: 'unit', label: 'Од. вим.' },
        { key: 'norm', label: 'За нормою', num: true },
        { key: 'fact', label: 'Фактично списано', num: true },
        { key: 'diff', label: 'Відхилення', num: true },
        { key: 'status', label: 'Висновок' }
      ],
      rows: [
        { id: 'M29-LYCRA', order: 'WO-2026-4402', mat: 'Пряжа еластанова Lycra 70 DEN (Італія)', unit: 'кг', norm: 412.0, fact: 413.8, diff: 1.8, status: 'Перевитрата (Переналагодження)' },
        { id: 'M29-POLY', order: 'WO-2026-4402', mat: 'Нитка поліамідна текстурована PA 6.6', unit: 'кг', norm: 850.0, fact: 848.5, diff: -1.5, status: 'Економія' },
        { id: 'M29-NEOP', order: 'WO-2026-4409', mat: 'Неопрен медичний перфорований 3мм', unit: 'м2', norm: 620.0, fact: 620.0, diff: 0, status: 'В межах норми' },
        { id: 'M29-SIL', order: 'WO-2026-4411', mat: 'Стрічка силіконова фіксуюча 50мм', unit: 'м.п.', norm: 2100.0, fact: 2100.0, diff: 0, status: 'В межах норми' }
      ],
      summary: () => `<div>Форма М-29: контроль нормативів</div><div class="summary-checksum"><span class="checksum-badge">Відхилення у межах допуску 0.5%</span></div>`
    },

    'mes-orders': {
      columns: [
        { key: 'id', label: '№ Замовлення' },
        { key: 'product', label: 'Номенклатура (Партія)' },
        { key: 'workshop', label: 'Дільниця / Обладнання' },
        { key: 'plan', label: 'План (шт)', num: true },
        { key: 'done', label: 'Виконано (шт)', num: true },
        { key: 'pct', label: 'Готовність', num: true },
        { key: 'status', label: 'Поточний етап' }
      ],
      rows: [
        { id: 'WO-2026-4402', product: 'Панчохи КЛ-2 (LOT-2026-TC112)', workshop: 'В’язальний цех (Merz CC4 #1-4)', plan: 5000, done: 4200, pct: 84.0, status: 'Формовка та ВТК' },
        { id: 'WO-2026-4409', product: 'Бандаж БП-4 (LOT-2026-AK048)', workshop: 'Розкрійний комплекс (CAD/CAM)', plan: 3000, done: 2800, pct: 93.3, status: 'Пошиття фінальне' },
        { id: 'WO-2026-4411', product: 'Гольфи КЛ-1 (LOT-2026-GL901)', workshop: 'В’язальний цех (Merz CC4 #5-8)', plan: 6500, done: 6500, pct: 100.0, status: 'Передано на склад ГП' },
        { id: 'WO-2026-4418', product: 'Ортез колінний OR-2 (LOT-2026-OR07)', workshop: 'Складальна дільниця №2', plan: 2000, done: 940, pct: 47.0, status: 'В роботі' }
      ],
      summary: () => `<div>Активних нарядів у цеху: <strong>4</strong></div><div class="summary-checksum"><span class="checksum-badge">Виконання плану: ${fmtPct(87.5)}</span></div>`
    },

    'mes-boms': {
      columns: [
        { key: 'code', label: 'Код BOM' },
        { key: 'product', label: 'Кінцевий виріб' },
        { key: 'components', label: 'Склад специфікації (Ключові матеріали)' },
        { key: 'steps', label: 'Кількість операцій' },
        { key: 'normTime', label: 'Нормо-час (хв/од)', num: true }
      ],
      rows: [
        { id: 'BOM-C2', code: 'SPEC-0012', product: 'Панчохи компресійні КЛ-2', components: 'Пряжа Lycra 70D (0.045кг), PA 6.6 (0.085кг), Силікон стрічка (0.5м), Упаковка', steps: '5 операцій (В’язання → Зшивання миска → Фарбування → Формовка → Стенд тиску)', normTime: 18.5 },
        { id: 'BOM-BP4', code: 'SPEC-0048', product: 'Бандаж поперековий БП-4', components: 'Полотно еластичне медичне (0.35м), Ребра жорсткості сталеві (4 шт), Велкро липучка', steps: '4 операції (CAD-розкрій → Окантовка → Встановлення ребер → ВТК)', normTime: 24.0 },
        { id: 'BOM-OR2', code: 'SPEC-0089', product: 'Ортез колінний шарнірний OR-2', components: 'Неопрен 3мм (0.42м2), Шарніри алюмінієві (2 шт), Ремінь фіксації (2 шт)', steps: '6 операцій (Вирубка → Оверлок → Склеювання → Шарнірний вузол → Тест)', normTime: 32.0 }
      ],
      summary: () => `<div>Активних технологічних карт: <strong>3</strong></div><div class="summary-checksum"><span class="checksum-badge">ДСТУ / ISO 13485 сумісні</span></div>`
    },

    'mes-scrap': {
      columns: [
        { key: 'act', label: 'Акт браку' },
        { key: 'date', label: 'Дата' },
        { key: 'lot', label: 'Партія' },
        { key: 'item', label: 'Продукція' },
        { key: 'qty', label: 'Кількість браку (шт)', num: true },
        { key: 'loss', label: 'Сума втрат', num: true },
        { key: 'reason', label: 'Причина відхилення ВТК' }
      ],
      rows: [
        { id: 'SCR-01', act: 'АБ-0084', date: '12.11.2026', lot: 'LOT-2026-TC112', item: 'Панчохи КЛ-2', qty: 28, loss: 7560, reason: 'Невідповідність градієнту тиску на щиколотці (<23 мм рт. ст.)' },
        { id: 'SCR-02', act: 'АБ-0089', date: '14.11.2026', lot: 'LOT-2026-AK048', item: 'Бандаж БП-4', qty: 12, loss: 5640, reason: 'Дефект рядка закріпки велкро-стрічки' }
      ],
      summary: () => `<div>Загальний рівень браку: <strong>${fmtPct(0.32)}</strong> (норма &lt; 1.0%)</div><div class="summary-checksum"><span class="checksum-badge">Списано на витрати цеху: ${fmt(13200)}</span></div>`
    },

    'wms-m19': {
      columns: [
        { key: 'wh', label: 'Склад' },
        { key: 'item', label: 'Номенклатура' },
        { key: 'beg', label: 'Залишок поч.', num: true },
        { key: 'inc', label: 'Прихід', num: true },
        { key: 'exp', label: 'Розхід', num: true },
        { key: 'end', label: 'Залишок кін.', num: true },
        { key: 'sum', label: 'Балансова вартість', num: true }
      ],
      rows: [
        { id: 'M19-1', wh: 'Склад Сировини №1', item: 'Пряжа Lycra 70 DEN (кг)', beg: 1840, inc: 1200, exp: 950, end: 2090, sum: 1881000 },
        { id: 'M19-2', wh: 'Склад Сировини №1', item: 'Нитка Поліамід PA 6.6 (кг)', beg: 3200, inc: 2000, exp: 1850, end: 3350, sum: 1507500 },
        { id: 'M19-3', wh: 'Склад ГП №2', item: 'Панчохи компресійні КЛ-2 (пари)', beg: 8400, inc: 4200, exp: 5100, end: 7500, sum: 2025000 },
        { id: 'M19-4', wh: 'Склад ГП №2', item: 'Бандажі серії АЛКОМ (шт)', beg: 5120, inc: 2800, exp: 3400, end: 4520, sum: 2124400 }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + r.sum, 0);
        return `<div>Залишок по формі М-19: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Синхронізовано з рахунками 201 / 26</span></div>`;
      }
    },

    'wms-batch': {
      columns: [
        { key: 'id', label: 'Код партії (LOT)' },
        { key: 'item', label: 'Найменування виробу' },
        { key: 'mfgDate', label: 'Дата виробн.' },
        { key: 'expDate', label: 'Придатний до' },
        { key: 'qty', label: 'Залишок партії', num: true },
        { key: 'pressure', label: 'Протокол ВТК (мм рт.ст.)' },
        { key: 'status', label: 'Статус партії' }
      ],
      rows: [
        { id: 'LOT-2026-TC112', item: 'Панчохи КЛ-2 (Чорні, р. M)', mfgDate: '12.11.2026', expDate: '12.11.2031', qty: 4200, pressure: '26.4 (Клас 2 Норма)', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-AK048', item: 'Бандаж поперековий БП-4 (L)', mfgDate: '10.11.2026', expDate: '10.11.2031', qty: 2800, pressure: 'Тест жорсткості: OK', status: 'Дозволено до відвантаження' },
        { id: 'LOT-2026-GL901', item: 'Гольфи антиемболічні КЛ-1 (L)', mfgDate: '08.11.2026', expDate: '08.11.2031', qty: 6500, pressure: '19.8 (Клас 1 Норма)', status: 'Відвантажується (FEFO)' },
        { id: 'LOT-2026-OR07', item: 'Ортез колінний шарнірний OR-2', mfgDate: '14.11.2026', expDate: '14.11.2031', qty: 940, pressure: 'На тестуванні ВТК', status: 'Карантин до перевірки' }
      ],
      summary: () => `<div>Активних серійних партій: <strong>4</strong></div><div class="summary-checksum"><span class="checksum-badge">Повна простежуваність (Traceability)</span></div>`
    },

    'wms-reserves': {
      columns: [
        { key: 'sku', label: 'SKU' },
        { key: 'name', label: 'Товар / Виріб' },
        { key: 'phys', label: 'Фізичний залишок', num: true },
        { key: 'res', label: 'В резерві під замовлення', num: true },
        { key: 'free', label: 'Вільний залишок', num: true },
        { key: 'client', label: 'Ключовий резерв' }
      ],
      rows: [
        { id: 'RES-1', sku: 'ALK-C2-M-BLK', name: 'Панчохи КЛ-2 (Чорні, M)', phys: 7500, res: 3200, free: 4300, client: 'ТОВ «Аптека АНЦ» (2000), Подорожник (1200)' },
        { id: 'RES-2', sku: 'ALK-BP4-L', name: 'Бандаж БП-4 (L)', phys: 4520, res: 1850, free: 2670, client: 'ТОВ «ОРТОС» (1200), Добробут (650)' },
        { id: 'RES-3', sku: 'ALK-GL1-L', name: 'Гольфи антиемболічні КЛ-1', phys: 6500, res: 4100, free: 2400, client: 'Клініки та Аптека 9-1-1 (4100)' }
      ],
      summary: () => `<div>Зарезервовано під відвантаження: <strong>${fmtInt(9150, 'од.')}</strong></div><div class="summary-checksum"><span class="checksum-badge">Оверселінг заблоковано</span></div>`
    },

    'wms-inv19': {
      columns: [
        { key: 'code', label: 'Інв. код' },
        { key: 'name', label: 'Номенклатура (Склад №1 / №2)' },
        { key: 'book', label: 'За даними обліку', num: true },
        { key: 'fact', label: 'Фактично (Сканер)', num: true },
        { key: 'diff', label: 'Відхилення', num: true },
        { key: 'res', label: 'Висновок комісії' }
      ],
      rows: [
        { id: 'INV-1', code: '201-014', name: 'Пряжа Lycra 70 DEN (бобіни)', book: 2090, fact: 2090, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-2', code: '26-102', name: 'Панчохи КЛ-2 (Коробки по 20 пар)', book: 375, fact: 375, diff: 0, res: 'Збіг 100%' },
        { id: 'INV-3', code: '26-205', name: 'Бандажі БП-4', book: 4520, fact: 4520, diff: 0, res: 'Збіг 100%' }
      ],
      summary: () => `<div>Інвентаризація (Форма Інв-19)</div><div class="summary-checksum"><span class="checksum-badge">Нестач / Лишків не виявлено</span></div>`
    },

    'sales-recon': {
      columns: [
        { key: 'id', label: 'Контрагент' },
        { key: 'contract', label: 'Договір' },
        { key: 'beg', label: 'Сальдо поч.', num: true },
        { key: 'shipped', label: 'Відвантажено', num: true },
        { key: 'paid', label: 'Оплачено', num: true },
        { key: 'end', label: 'Борг контрагента', num: true },
        { key: 'status', label: 'Статус звірки' }
      ],
      rows: [
        { id: 'REC-ANC', contract: 'Договір №402/26', beg: 1840000, shipped: 9450000, paid: 8920000, end: 2370000, status: 'Потребує звірки (ТТН ВН-004182)' },
        { id: 'REC-POD', contract: 'Договір №118/26', beg: 1420000, shipped: 7800000, paid: 7410000, end: 1810000, status: 'Підписано в Вчасно.ЕДО' },
        { id: 'REC-ORT', contract: 'Договір №085/26', beg: 960000, shipped: 4620000, paid: 4380000, end: 1200000, status: 'Підписано в Вчасно.ЕДО' },
        { id: 'REC-DOB', contract: 'Договір №310/26', beg: 540000, shipped: 2980000, paid: 2890000, end: 630000, status: 'Очікує підпису контрагента' }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + r.end, 0);
        return `<div>Загальна дебіторка по мережах: <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Інтеграція з Вчасно / M.E.Doc</span></div>`;
      }
    },

    'sales-aging': {
      columns: [
        { key: 'client', label: 'Контрагент' },
        { key: 'total', label: 'Загальний борг', num: true },
        { key: 'd15', label: '0–15 днів (Поточна)', num: true },
        { key: 'd30', label: '16–30 днів', num: true },
        { key: 'd60', label: '31–60 днів', num: true },
        { key: 'd60p', label: '60+ днів (Прострочена)', num: true }
      ],
      rows: [
        { id: 'AGE-1', client: 'ТОВ «Аптека АНЦ»', total: 2370000, d15: 1950000, d30: 420000, d60: 0, d60p: 0 },
        { id: 'AGE-2', client: 'ТОВ «Подорожник»', total: 1810000, d15: 1600000, d30: 210000, d60: 0, d60p: 0 },
        { id: 'AGE-3', client: 'ТОВ «ОРТОС»', total: 1200000, d15: 850000, d30: 230000, d60: 120000, d60p: 0 },
        { id: 'AGE-4', client: 'Аптека 9-1-1', total: 990000, d15: 900000, d30: 90000, d60: 0, d60p: 0 }
      ],
      summary: () => `<div>Прострочка 60+ днів: <strong>${fmt(0)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Якість дебіторського портфеля: Висока</span></div>`
    },

    'sales-orders': {
      columns: [
        { key: 'id', label: '№ Замовлення' },
        { key: 'date', label: 'Дата EDI' },
        { key: 'client', label: 'Мережа / Покупець' },
        { key: 'items', label: 'Позицій (SKU)', num: true },
        { key: 'sum', label: 'Сума замовлення', num: true },
        { key: 'status', label: 'Статус відвантаження' }
      ],
      rows: [
        { id: 'ORD-8812', date: '16.11.2026', client: 'ТОВ «ОРТОС»', items: 42, sum: 685000, status: 'Очікує погодження фіндиректора' },
        { id: 'ORD-8815', date: '16.11.2026', client: 'ТОВ «Аптека АНЦ»', items: 118, sum: 1420000, status: 'На збірці на складі ГП' },
        { id: 'ORD-8819', date: '15.11.2026', client: 'ТОВ «Подорожник»', items: 94, sum: 1180000, status: 'Відвантажено (ТТН сформовано)' },
        { id: 'ORD-8824', date: '15.11.2026', client: 'ММ «Добробут»', items: 28, sum: 490000, status: 'Зарезервовано під відправку' }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + r.sum, 0);
        return `<div>Замовлень у роботі: <strong>4</strong> на суму <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">EDI-шлюз активний</span></div>`;
      }
    },

    'sales-margin': {
      columns: [
        { key: 'cat', label: 'Категорія продукції' },
        { key: 'rev', label: 'Виручка', num: true },
        { key: 'cogs', label: 'Собівартість', num: true },
        { key: 'gp', label: 'Валовий прибуток', num: true },
        { key: 'margin', label: 'Маржа %', num: true }
      ],
      rows: [
        { id: 'MRG-1', cat: 'Компресійний трикотаж (КЛ-1, КЛ-2, КЛ-3)', rev: 12400000, cogs: 7100000, gp: 5300000, margin: 42.7 },
        { id: 'MRG-2', cat: 'Бандажі та коректори постави', rev: 8200000, cogs: 4920000, gp: 3280000, margin: 40.0 },
        { id: 'MRG-3', cat: 'Ортези суглобові (Шарнірні)', rev: 4900000, cogs: 3180000, gp: 1720000, margin: 35.1 },
        { id: 'MRG-4', cat: 'Ортопедичні устілки та взуття', rev: 3000000, cogs: 1920000, gp: 1080000, margin: 36.0 }
      ],
      summary: () => `<div>Середня валова маржа: <strong>${fmtPct(39.9)}</strong></div><div class="summary-checksum"><span class="checksum-badge">Валовий прибуток: ${fmt(11380000)}</span></div>`
    },

    'treasury-stmt': {
      columns: [
        { key: 'bank', label: 'Банк / Рахунок (IBAN)' },
        { key: 'beg', label: 'Залишок на початок', num: true },
        { key: 'inc', label: 'Надходження', num: true },
        { key: 'out', label: 'Списання', num: true },
        { key: 'end', label: 'Поточний залишок', num: true }
      ],
      rows: [
        { id: 'BNK-PB', bank: 'АТ КБ «ПриватБанк» (UA483052990000026004016201124)', beg: 7420000, inc: 18450000, out: 15890000, end: 9980000 },
        { id: 'BNK-RF', bank: 'АТ «Райффайзен Банк» (UA123808050000000026009481022)', beg: 3100000, inc: 8200000, out: 7430000, end: 3870000 },
        { id: 'BNK-UKR', bank: 'АТ «Укрсиббанк» (UA883510050000026003871004519)', beg: 900000, inc: 2800000, out: 2700000, end: 1000000 }
      ],
      summary: (rows) => {
        const tot = rows.reduce((s, r) => s + r.end, 0);
        return `<div>Загальний залишок на рахунках (311): <strong>${fmt(tot)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Звірено з ОСВ 311 (0.00 розбіжностей)</span></div>`;
      }
    },

    'treasury-cash': {
      columns: [
        { key: 'doc', label: '№ Ордера (ПКО / ВКО)' },
        { key: 'date', label: 'Дата' },
        { key: 'person', label: 'Від кого / Кому' },
        { key: 'purpose', label: 'Підстава' },
        { key: 'inc', label: 'Прихід', num: true },
        { key: 'out', label: 'Видаток', num: true }
      ],
      rows: [
        { id: 'CSH-1', doc: 'ПКО-00112', date: '14.11.2026', person: 'Салон-магазин «Алком» (Виторг)', purpose: 'Здача роздрібної виручки в касу', inc: 48500, out: 0 },
        { id: 'CSH-2', doc: 'ВКО-00084', date: '15.11.2026', person: 'Інкасація ПриватБанк', purpose: 'Здача готівки на поточний рахунок', inc: 0, out: 33500 }
      ],
      summary: () => `<div>Залишок каси (Рахунок 301): <strong>${fmt(57500)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Ліміт каси дотримано</span></div>`
    },

    'hr-payroll': {
      columns: [
        { key: 'dept', label: 'Підрозділ' },
        { key: 'emp', label: 'Штат (осіб)', num: true },
        { key: 'gross', label: 'Нараховано (ФОП)', num: true },
        { key: 'pdfo', label: 'ПДФО (18%)', num: true },
        { key: 'vz', label: 'Військ. збір (5%)', num: true },
        { key: 'net', label: 'До виплати (На руки)', num: true }
      ],
      rows: [
        { id: 'HR-1', dept: 'Швейно-в’язальний цех (Відрядна оплата)', emp: 84, gross: 2100000, pdfo: 378000, vz: 105000, net: 1617000 },
        { id: 'HR-2', dept: 'Склад, Логістика та ВТК', emp: 24, gross: 540000, pdfo: 97200, vz: 27000, net: 415800 },
        { id: 'HR-3', dept: 'Відділ продажів та ЕДО (Менеджери мереж)', emp: 18, gross: 680000, pdfo: 122400, vz: 34000, net: 523600 },
        { id: 'HR-4', dept: 'Адміністрація та Бухгалтерія', emp: 14, gross: 520000, pdfo: 93600, vz: 26000, net: 400400 }
      ],
      summary: (rows) => {
        const net = rows.reduce((s, r) => s + r.net, 0);
        return `<div>Загалом до виплати: <strong>${fmt(net)} грн</strong></div><div class="summary-checksum"><span class="checksum-badge">Нарахування ЄСВ 22% сформовано</span></div>`
      }
    }
  };

  // Render Sidebar Accordion Tree
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
        <div class="acc-domain-group ${isOpen ? 'open' : ''}" data-domain="${domain.id}">
          <div class="domain-header" onclick="window.__toggleDomain('${domain.id}')">
            <div class="domain-header-title">
              <span class="domain-arrow">&#9654;</span>
              <span>${esc(domain.title)}</span>
            </div>
            <span class="domain-count">${filteredSubtypes.length}</span>
          </div>
          <div class="subtype-list">
            ${filteredSubtypes.map(st => `
              <div class="subtype-item ${state.activeView === st.id ? 'active' : ''}" onclick="window.__selectSubtype('${st.id}')">
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
    if (dom) {
      dom.open = !dom.open;
      renderSidebar();
    }
  };

  window.__selectSubtype = function(viewId, highlightId = null) {
    state.activeView = viewId;
    state.highlightedRowId = highlightId;
    DOMAINS.forEach(d => {
      if (d.subtypes.some(s => s.id === viewId)) {
        d.open = true;
      }
    });
    renderSidebar();
    renderActiveView();
  };

  // Find metadata for active view
  function getActiveSubtypeMeta() {
    for (const d of DOMAINS) {
      const st = d.subtypes.find(s => s.id === state.activeView);
      if (st) return { domain: d, subtype: st };
    }
    return { domain: DOMAINS[0], subtype: DOMAINS[0].subtypes[0] };
  }

  // Render Main Operational Table
  function renderActiveView() {
    const meta = getActiveSubtypeMeta();
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];

    // Update Header
    const bc = document.getElementById('ctrl-breadcrumb');
    const titleEl = document.getElementById('ctrl-title');
    if (bc) bc.textContent = `${meta.domain.title} > ${meta.subtype.title}`;
    if (titleEl) {
      titleEl.innerHTML = `
        <span>${esc(meta.subtype.title)}</span>
        <span class="ctrl-tag">${esc(meta.subtype.tag)}</span>
      `;
    }

    // Show/Hide account select for osv-acc / card-acc
    const accSelect = document.getElementById('filter-account');
    if (accSelect) {
      accSelect.style.display = (state.activeView === 'osv-acc' || state.activeView === 'card-acc') ? 'inline-block' : 'none';
    }

    // Filter rows by searchQuery
    const q = (state.searchQuery || '').toLowerCase().trim();
    const filteredRows = dataset.rows.filter(row => {
      if (!q) return true;
      return Object.values(row).some(val => String(val).toLowerCase().includes(q));
    });

    // Build Table HTML
    const viewport = document.getElementById('table-viewport');
    if (!viewport) return;

    let thead = '<thead><tr>';
    dataset.columns.forEach(col => {
      thead += `<th class="${col.num ? 'num' : ''}">${esc(col.label)}</th>`;
    });
    thead += '<th style="width: 170px; text-align: right;">Дії / Маршрут</th></tr></thead>';

    let tbody = '<tbody>';
    if (filteredRows.length === 0) {
      tbody += `<tr><td colspan="${dataset.columns.length + 1}" style="text-align:center; padding: 24px; color: #64748B;">Записів не знайдено</td></tr>`;
    } else {
      filteredRows.forEach(row => {
        const isHighlighted = state.highlightedRowId === row.id ? 'highlighted' : '';
        tbody += `<tr class="${isHighlighted}" id="row-${esc(row.id)}">`;
        dataset.columns.forEach(col => {
          const val = row[col.key];
          if (col.num) {
            if (col.key === 'pct' || col.key === 'margin') {
              tbody += `<td class="num">${fmtPct(val)}</td>`;
            } else if (col.key === 'qty' || col.key === 'emp' || col.key === 'items' || col.key === 'beg' && (state.activeView === 'wms-m19' || state.activeView === 'wms-inv19') || col.key === 'book' || col.key === 'fact' || col.key === 'phys' || col.key === 'res' || col.key === 'free' || col.key === 'plan' || col.key === 'done') {
              tbody += `<td class="num">${fmtInt(val)}</td>`;
            } else {
              tbody += `<td class="num">${fmt(val)}</td>`;
            }
          } else if (col.key === 'status') {
            let badgeClass = 'status-info';
            const s = String(val).toLowerCase();
            if (s.includes('ок') || s.includes('дозв') || s.includes('підпис') || s.includes('прийн') || s.includes('зареєст') || s.includes('передано') || s.includes('норм')) badgeClass = 'status-ok';
            else if (s.includes('потр') || s.includes('очік') || s.includes('перевитр') || s.includes('карант')) badgeClass = 'status-warning';
            tbody += `<td><span class="status-badge ${badgeClass}">${esc(val)}</span></td>`;
          } else {
            tbody += `<td>${esc(val)}</td>`;
          }
        });

        const rowLabel = row.name || row.sub || row.article || row.item || row.mat || row.product || row.client || row.bank || row.dept || row.doc || row.id;
        tbody += `
          <td style="text-align: right;">
            <div class="row-actions">
              <button class="btn-row-action" onclick="window.__openHandoff('${esc(meta.subtype.title)}: ${esc(rowLabel)}', '${esc(row.id)}')" title="Кинути колезі в роботу">Передати</button>
              <button class="btn-row-action" onclick="window.__openDocViewer('${esc(row.id)}', '${esc(rowLabel)}')" title="Переглянути первинний документ">Документ</button>
            </div>
          </td>
        `;
        tbody += '</tr>';
      });
    }
    tbody += '</tbody>';

    viewport.innerHTML = `<table class="op-table">${thead}${tbody}</table>`;

    // Summary bar
    const summaryEl = document.getElementById('table-summary-bar');
    if (summaryEl) {
      summaryEl.innerHTML = dataset.summary ? dataset.summary(filteredRows) : `<div>Всього записів: ${filteredRows.length}</div>`;
    }
  }

  // Document Routing / Handoff Modal ("Кидати між людьми")
  window.__openHandoff = function(docName, rowId = null) {
    state.handoffContext = { docName, rowId, view: state.activeView };
    document.getElementById('handoff-doc-name').value = docName;
    document.getElementById('handoff-comment').value = '';
    document.getElementById('modal-handoff').classList.add('open');
  };

  function closeHandoffModal() {
    document.getElementById('modal-handoff').classList.remove('open');
  }

  function confirmHandoff() {
    const docName = document.getElementById('handoff-doc-name').value;
    const recipient = document.getElementById('handoff-recipient').value;
    const priority = document.getElementById('handoff-priority').value;
    const comment = document.getElementById('handoff-comment').value.trim() || 'Прошу перевірити та опрацювати документ.';

    const now = new Date();
    const timeStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.2026 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTask = {
      id: 'TSK-' + Math.floor(105 + Math.random() * 890),
      title: docName,
      sender: 'Шевченко О. В. (Головний бухгалтер)',
      recipient: recipient,
      priority: priority,
      date: timeStr,
      view: state.handoffContext ? state.handoffContext.view : state.activeView,
      rowId: state.handoffContext ? state.handoffContext.rowId : null,
      status: 'ACTIVE',
      comment: comment
    };

    state.tasks.unshift(newTask);
    renderTasksDrawer();
    closeHandoffModal();
    showToast(`Документ передано -> ${recipient}`);
  }

  // Tasks Drawer ("Маршрути та завдання")
  function renderTasksDrawer() {
    const activeCount = state.tasks.filter(t => t.status === 'ACTIVE').length;
    const badge1 = document.getElementById('task-badge-count');
    const badge2 = document.getElementById('drawer-badge-count');
    if (badge1) badge1.textContent = activeCount;
    if (badge2) badge2.textContent = activeCount;

    const listEl = document.getElementById('drawer-tasks-list');
    if (!listEl) return;

    if (state.tasks.length === 0) {
      listEl.innerHTML = '<div style="text-align:center; padding: 30px; color:#64748B;">Активних маршрутів немає</div>';
      return;
    }

    listEl.innerHTML = state.tasks.map(t => {
      let pClass = 'priority-normal';
      let pText = 'Звичайне';
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
            ${!isDone ? `<button class="btn-task-action" onclick="window.__completeTask('${esc(t.id)}')">Виконано</button>` : '<span style="font-size:11px; color:#059669; font-weight:600;">Опрацьовано</span>'}
          </div>
        </div>
      `;
    }).join('');
  }

  window.__goToTaskView = function(viewId, rowId) {
    closeTasksDrawer();
    window.__selectSubtype(viewId, rowId || null);
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
      showToast('Завдання позначено виконаним');
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

  // Primary Document Viewer Modal
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
        <thead>
          <tr>
            <th>№</th>
            <th>Найменування позиції / Партія (LOT)</th>
            <th>Од. вим.</th>
            <th>Кількість</th>
            <th>Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${esc(docLabel)} (Партія LOT-2026-TC112, Сертифікат ISO 13485)</td>
            <td>шт/пар</td>
            <td style="text-align:right;">${state.noNumbersMode ? '—' : '1 200'}</td>
            <td style="text-align:right;">${sumVal}</td>
          </tr>
        </tbody>
      </table>
      <div class="doc-signatures">
        <div class="doc-sig-block">Відпустив / Сформував<br><strong>Шевченко О. В.</strong></div>
        <div class="doc-sig-block">ЕЦП / КЕП Підпис<br><strong>Дійсний (ЦСК «Україна»)</strong></div>
        <div class="doc-sig-block">Прийняв / Погодив<br><strong>_____________________</strong></div>
      </div>
    `;

    document.getElementById('modal-doc-viewer').classList.add('open');
  };

  function closeDocViewer() {
    document.getElementById('modal-doc-viewer').classList.remove('open');
  }

  // Export current table to Excel CSV
  function exportCSV() {
    const dataset = DATASETS[state.activeView] || DATASETS['osv'];
    const meta = getActiveSubtypeMeta();
    const headers = dataset.columns.map(c => `"${c.label}"`).join(';');
    const lines = dataset.rows.map(r => {
      return dataset.columns.map(c => {
        let val = r[c.key];
        if (state.noNumbersMode && c.num) val = '';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(';');
    });
    const csvContent = '\uFEFF' + headers + '\n' + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `OpexMetrix_${state.activeView}_2026.csv`;
    link.click();
    showToast(`Експортовано: ${meta.subtype.title}`);
  }

  // Initialization & Event Listeners
  document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    renderActiveView();
    renderTasksDrawer();

    // Tree Search
    const treeSearch = document.getElementById('tree-search');
    if (treeSearch) {
      treeSearch.addEventListener('input', renderSidebar);
    }

    // Global Search
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
      globalSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderActiveView();
      });
    }

    // Table Search
    const tableSearch = document.getElementById('table-search');
    if (tableSearch) {
      tableSearch.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderActiveView();
      });
    }

    // Toggle "Без цифр" Mode
    const btnNoNum = document.getElementById('btn-toggle-numbers');
    const labelNum = document.getElementById('label-num-mode');
    if (btnNoNum) {
      btnNoNum.addEventListener('click', () => {
        state.noNumbersMode = !state.noNumbersMode;
        btnNoNum.classList.toggle('active', state.noNumbersMode);
        if (labelNum) labelNum.textContent = state.noNumbersMode ? 'Без цифр (Структура)' : 'З цифрами';
        renderActiveView();
        showToast(state.noNumbersMode ? 'Увімкнено структурний режим без цифр' : 'Увімкнено повний числовий режим');
      });
    }

    // Period Buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.period = btn.dataset.period;
        renderActiveView();
        showToast(`Період оновлено: ${btn.textContent}`);
      });
    });

    // Tasks Drawer Controls
    document.getElementById('btn-tasks-drawer')?.addEventListener('click', openTasksDrawer);
    document.getElementById('btn-close-drawer')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('drawer-overlay')?.addEventListener('click', closeTasksDrawer);
    document.getElementById('btn-create-task-drawer')?.addEventListener('click', () => {
      closeTasksDrawer();
      const meta = getActiveSubtypeMeta();
      window.__openHandoff(meta.subtype.title);
    });

    // Report Level Handoff Button
    document.getElementById('btn-handoff-report')?.addEventListener('click', () => {
      const meta = getActiveSubtypeMeta();
      window.__openHandoff(meta.subtype.title);
    });

    // Handoff Modal Controls
    document.getElementById('btn-close-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-cancel-handoff')?.addEventListener('click', closeHandoffModal);
    document.getElementById('btn-confirm-handoff')?.addEventListener('click', confirmHandoff);

    // Primary Doc Modal Controls
    document.getElementById('btn-close-doc-viewer')?.addEventListener('click', closeDocViewer);
    document.getElementById('btn-print-doc')?.addEventListener('click', () => window.print());
    document.getElementById('btn-doc-handoff')?.addEventListener('click', () => {
      closeDocViewer();
      if (state.docContext) {
        window.__openHandoff(`Первинний документ ${state.docContext.docId}: ${state.docContext.docLabel}`, state.docContext.docId);
      }
    });

    // Export CSV
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);

    // Keyboard shortcut Ctrl+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        globalSearch?.focus();
      }
    });
  });

})();
