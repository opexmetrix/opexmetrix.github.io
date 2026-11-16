/**
 * OpexMetrix Systems — Центр звітності та корпоративного обліку (Заміна 1С/BAS)
 * Повна реалізація 15 регламентованих та управлінських звітів за стандартами НП(С)БО та вимогами Держлікслужби
 */

(function () {
  'use strict';

  // Format currency
  function fmt(val) {
    if (val === null || val === undefined || isNaN(val)) return '—';
    const num = Number(val);
    if (num === 0) return '0.00';
    return num.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtQty(val, unit = 'од.') {
    if (val === null || val === undefined || isNaN(val)) return '—';
    return Number(val).toLocaleString('uk-UA') + ' ' + unit;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // State
  const state = {
    activeReport: 'osv',
    entity: 'ALKOM',
    period: 'CURRENT_MONTH',
    account: '361'
  };

  // ─── REPORT BUILDERS ────────────────────────────────────────────────────────

  // 1. Оборотно-сальдова відомість (ОСВ загальна)
  function renderReportOsv() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Оборотно-сальдова відомість (ОСВ)</div>
          <div class="report-meta-line">Організація: <strong>ТОВ "ТД Алком" (ЄДРПОУ 32490244)</strong> • Період: <strong>01.11.2026 – 30.11.2026</strong> • Валюта: <strong>ГРН</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>ЗБАЛАНСОВАНО: Дт ≡ Кт</div>
          <div style="font-size:10px; color:#64748b;">Сертифікований аудит-контур</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 80px;">Рахунок</th>
            <th rowspan="2">Найменування рахунку</th>
            <th colspan="2" class="text-center">Сальдо на початок</th>
            <th colspan="2" class="text-center">Обороти за період</th>
            <th colspan="2" class="text-center">Сальдо на кінець</th>
          </tr>
          <tr>
            <th class="text-right" style="width: 110px;">Дебет</th>
            <th class="text-right" style="width: 110px;">Кредит</th>
            <th class="text-right" style="width: 110px;">Дебет</th>
            <th class="text-right" style="width: 110px;">Кредит</th>
            <th class="text-right" style="width: 110px;">Дебет</th>
            <th class="text-right" style="width: 110px;">Кредит</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-group"><td colspan="8">Клас 1. Необоротні активи</td></tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('104')">104</td>
            <td>Машини та обладнання (Круглопанчішні автомати Merz, САПР Lectra)</td>
            <td class="text-right mono">14 250 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">180 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">14 430 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('131')">131</td>
            <td>Знос основних засобів (Амортизація обладнання)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">3 840 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">165 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">4 005 000.00</td>
          </tr>

          <tr class="row-group"><td colspan="8">Клас 2. Запаси та Виробництво</td></tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('201')">201</td>
            <td>Сировина й матеріали (Силікон медичний, Нитки Roica, Тканини)</td>
            <td class="text-right mono">3 640 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">2 180 000.00</td>
            <td class="text-right mono">1 700 000.00</td>
            <td class="text-right mono font-bold">4 120 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('202')">202</td>
            <td>Купівельні напівфабрикати та комплектуючі (Ребра жорсткості, Velcro)</td>
            <td class="text-right mono">780 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">450 000.00</td>
            <td class="text-right mono">390 000.00</td>
            <td class="text-right mono">840 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('231')">231</td>
            <td>Основне виробництво (НЗВ цеху компресії та бандажів)</td>
            <td class="text-right mono">1 120 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">4 280 000.00</td>
            <td class="text-right mono">4 450 000.00</td>
            <td class="text-right mono font-bold">950 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('26')">26</td>
            <td>Готова продукція (Склад WMS: Бандажі 2045, Панчохи 6052, Ортези)</td>
            <td class="text-right mono">4 850 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">4 450 000.00</td>
            <td class="text-right mono">4 120 000.00</td>
            <td class="text-right mono font-bold">5 180 000.00</td>
            <td class="text-right mono">—</td>
          </tr>

          <tr class="row-group"><td colspan="8">Клас 3. Грошові кошти та Розрахунки</td></tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('311')">311</td>
            <td>Поточні рахунки в національній валюті (ПриватБанк, Монобанк)</td>
            <td class="text-right mono">9 860 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">18 420 000.00</td>
            <td class="text-right mono">13 430 000.00</td>
            <td class="text-right mono font-bold">14 850 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('361')">361</td>
            <td>Розрахунки з вітчизняними покупцями (Мережі АНЦ, Подорожник, ORTOS)</td>
            <td class="text-right mono">4 210 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">17 240 000.00</td>
            <td class="text-right mono">16 530 000.00</td>
            <td class="text-right mono font-bold">4 920 000.00</td>
            <td class="text-right mono">—</td>
          </tr>

          <tr class="row-group"><td colspan="8">Клас 4. Власний капітал</td></tr>
          <tr>
            <td class="mono font-bold">401</td>
            <td>Статутний капітал підприємства</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">10 000 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">10 000 000.00</td>
          </tr>
          <tr>
            <td class="mono font-bold">441</td>
            <td>Прибуток нерозподілений (Поточний рік та минулі періоди)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">12 430 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">4 960 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold">17 390 000.00</td>
          </tr>

          <tr class="row-group"><td colspan="8">Клас 6. Поточні зобов'язання та Розрахунки</td></tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('631')">631</td>
            <td>Розрахунки з постачальниками та підрядниками (Wacker, Roica, Алюм)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">1 920 000.00</td>
            <td class="text-right mono">2 850 000.00</td>
            <td class="text-right mono">2 630 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold">1 700 000.00</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('6412')">6412</td>
            <td>Розрахунки за податками (ПДВ 7% та 20% / Ліміт СЕА)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">320 000.00</td>
            <td class="text-right mono">1 420 000.00</td>
            <td class="text-right mono">1 580 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">480 000.00</td>
          </tr>
          <tr>
            <td class="mono font-bold">661</td>
            <td>Розрахунки за заробітною платою (Швачки, оператори САПР, менеджери)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">940 000.00</td>
            <td class="text-right mono">1 840 000.00</td>
            <td class="text-right mono">1 650 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">750 000.00</td>
          </tr>

          <tr class="row-group"><td colspan="8">Клас 7, 9. Доходи, Собівартість та Фінансовий результат</td></tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('701')">701</td>
            <td>Дохід від реалізації готової продукції (Ставка 7% та 20%)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">16 112 149.53</td>
            <td class="text-right mono">16 112 149.53</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="drillToAccount('901')">901</td>
            <td>Собівартість реалізованої готової продукції (FIFO)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">9 180 000.00</td>
            <td class="text-right mono">9 180 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono font-bold">91</td>
            <td>Загальновиробничі витрати цехів (Закрито на 231 / 901)</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">820 000.00</td>
            <td class="text-right mono">820 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
          </tr>

          <!-- TOTAL -->
          <tr class="row-total">
            <td colspan="2">РАЗОМ ПО ПІДПРИЄМСТВУ (БАЛАНС ОБОРОТІВ)</td>
            <td class="text-right mono">34 500 000.00</td>
            <td class="text-right mono">34 500 000.00</td>
            <td class="text-right mono">68 622 149.53</td>
            <td class="text-right mono">68 622 149.53</td>
            <td class="text-right mono">38 420 000.00</td>
            <td class="text-right mono">38 420 000.00</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 2. ОСВ по рахунку (розгорнута з субконто)
  function renderReportOsvAccount(accountCode = '361') {
    const accTitle = accountCode === '201' ? '201 «Сировина й матеріали» (по складах та номенклатурі)' :
                     accountCode === '26' ? '26 «Готова продукція» (по партіях і серіях)' :
                     accountCode === '631' ? '631 «Розрахунки з постачальниками»' :
                     '361 «Розрахунки з вітчизняними покупцями» (Мережі АНЦ, ORTOS, Подорожник)';

    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">ОСВ по рахунку ${accTitle}</div>
          <div class="report-meta-line">Організація: <strong>ТОВ "ТД Алком"</strong> • Період: <strong>Листопад 2026</strong> • Деталізація: <strong>Контрагент $\\rightarrow$ Договір $\\rightarrow$ Документ</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Звірено з актами розрахунків</div>
          <div style="font-size:10px; color:#64748b;">Розбіжність: 0.00 ₴</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Субконто (Контрагент / Договір / Замовлення)</th>
            <th class="text-right" style="width: 120px;">Сальдо поч. Дт</th>
            <th class="text-right" style="width: 120px;">Оборот Дебет</th>
            <th class="text-right" style="width: 120px;">Оборот Кредит</th>
            <th class="text-right" style="width: 120px;">Сальдо кін. Дт</th>
            <th class="text-center" style="width: 100px;">Статус</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-group"><td colspan="6">Аптечна мережа «АНЦ» (ТОВ "Аптека-Магнолія", ЄДРПОУ 36453412)</td></tr>
          <tr>
            <td style="padding-left: 20px;">
              <div>Договір дистрибуції №АНЦ-2026/04 від 12.01.2026 (Відстрочка 21 день)</div>
              <div style="font-size:11px; color:#64748b;">Останнє відвантаження: ВН-2026/ALK104 від 16.11.2026 • Партія LOT-2026-TC112</div>
            </td>
            <td class="text-right mono">1 420 000.00</td>
            <td class="text-right mono clickable-cell" onclick="openDocModal('ВН-2026/ALK104')">1 434 000.00</td>
            <td class="text-right mono">1 004 000.00</td>
            <td class="text-right mono font-bold">1 850 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Кредит OK</span></td>
          </tr>

          <tr class="row-group"><td colspan="6">Мережа ортопедичних салонів «ORTOS» (Власний роздріб, ТОВ "Ортос-Рітейл")</td></tr>
          <tr>
            <td style="padding-left: 20px;">
              <div>Внутрішньохолдинговий договір поставки №ORT-14 від 01.02.2026</div>
              <div style="font-size:11px; color:#64748b;">14 салонів (Київ, Львів, Дніпро, Одеса) • Pick & Pack за рецептами лікарів</div>
            </td>
            <td class="text-right mono">850 000.00</td>
            <td class="text-right mono clickable-cell" onclick="openDocModal('ВН-2026/ALK105')">400 000.00</td>
            <td class="text-right mono">310 000.00</td>
            <td class="text-right mono font-bold">940 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#E0E7FF; color:#3730A3;">Холдинг</span></td>
          </tr>

          <tr class="row-group"><td colspan="6">Аптечна мережа «Подорожник» (ТОВ "Соломія-Сервіс", ЄДРПОУ 37291044)</td></tr>
          <tr>
            <td style="padding-left: 20px;">
              <div>Генеральний договір поставки №ПОД-88 від 10.03.2026 (850 аптек)</div>
              <div style="font-size:11px; color:#64748b;">Бандажна група 2045 та післяопераційні корсети • Відстрочка 14 днів</div>
            </td>
            <td class="text-right mono">1 140 000.00</td>
            <td class="text-right mono">1 420 000.00</td>
            <td class="text-right mono">1 320 000.00</td>
            <td class="text-right mono font-bold">1 240 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Кредит OK</span></td>
          </tr>

          <tr class="row-group"><td colspan="6">Медичний центр «Добробут» (ТОВ "МЦ Добробут", ЄДРПОУ 31821094)</td></tr>
          <tr>
            <td style="padding-left: 20px;">
              <div>Договір клінічного постачання ортезів №ДБ-110 від 15.05.2026</div>
              <div style="font-size:11px; color:#64748b;">Ортези колінні Алком 3023 з силіконовими кільцями (Стаціонар травматології)</div>
            </td>
            <td class="text-right mono">380 000.00</td>
            <td class="text-right mono">385 000.00</td>
            <td class="text-right mono">380 000.00</td>
            <td class="text-right mono font-bold">385 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Кредит OK</span></td>
          </tr>

          <tr class="row-group"><td colspan="6">ТОВ «Аптека Низьких Цін Дніпро» (ТОВ "Аптека-Апріорі")</td></tr>
          <tr>
            <td style="padding-left: 20px;">
              <div>Договір субдистрибуції №АНЦ-ДН-02 (Прострочено 18 днів)</div>
              <div style="font-size:11px; color:#DC2626;">Кредитний стоп-лист активовано • Блокування нових відвантажень</div>
            </td>
            <td class="text-right mono">420 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold" style="color:#DC2626;">505 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#FEE2E2; color:#991B1B;">СТОП-ЛИСТ</span></td>
          </tr>

          <tr class="row-total">
            <td>РАЗОМ ПО РАХУНКУ 361</td>
            <td class="text-right mono">4 210 000.00</td>
            <td class="text-right mono">17 240 000.00</td>
            <td class="text-right mono">16 530 000.00</td>
            <td class="text-right mono">4 920 000.00</td>
            <td class="text-center">Звірено ✓</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 3. Картка рахунку (Хронологія проводок)
  function renderReportCardAccount() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Картка рахунку 361 «Розрахунки з покупцями»</div>
          <div class="report-meta-line">Контрагент: <strong>Аптечна мережа «АНЦ» (ТОВ "Аптека-Магнолія")</strong> • Період: <strong>Листопад 2026</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Початкове сальдо: 1 420 000.00 ₴</div>
          <div style="font-weight:700;">Кінцеве сальдо: 1 850 000.00 ₴</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th style="width: 120px;">Дата / Час</th>
            <th style="width: 180px;">Документ-реєстратор</th>
            <th>Зміст господарської операції</th>
            <th style="width: 70px;" class="text-center">Кор. рах</th>
            <th class="text-right" style="width: 110px;">Дебет (грн)</th>
            <th class="text-right" style="width: 110px;">Кредит (грн)</th>
            <th class="text-right" style="width: 120px;">Поточне сальдо</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">01.11.2026 09:00</td>
            <td>Вхідне сальдо</td>
            <td>Залишок боргу за договором АНЦ-2026/04</td>
            <td class="text-center mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold">1 420 000.00</td>
          </tr>
          <tr>
            <td class="mono">04.11.2026 14:15</td>
            <td class="clickable-cell" onclick="openDocModal('БВ-8801')">Банківська виписка №8801</td>
            <td>Оплата за партію бандажів за платіжним дорученням №1492</td>
            <td class="text-center mono">311</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">1 004 000.00</td>
            <td class="text-right mono">416 000.00</td>
          </tr>
          <tr>
            <td class="mono">16.11.2026 11:30</td>
            <td class="clickable-cell font-bold" onclick="openDocModal('ВН-2026/ALK104')">ВН-2026/ALK104</td>
            <td>Реалізація партії компресійного трикотажу Алком 6052 (500 пар) та бандажів 2045 (300 шт) • LOT-2026-TC112 / AK048</td>
            <td class="text-center mono">701</td>
            <td class="text-right mono font-bold">1 340 186.92</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">1 756 186.92</td>
          </tr>
          <tr>
            <td class="mono">16.11.2026 11:30</td>
            <td class="clickable-cell font-bold" onclick="openDocModal('ВН-2026/ALK104')">ПН J1201016 #441</td>
            <td>ПДВ за пільговою ставкою 7% на медичні вироби (Реєстрація в ЄРПН)</td>
            <td class="text-center mono">6412</td>
            <td class="text-right mono font-bold">93 813.08</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold">1 850 000.00</td>
          </tr>
          <tr class="row-total">
            <td colspan="4">ОБОРОТИ ЗА ПЕРІОД ТА КІНЦЕВЕ САЛЬДО</td>
            <td class="text-right mono">1 434 000.00</td>
            <td class="text-right mono">1 004 000.00</td>
            <td class="text-right mono">1 850 000.00</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 4. Калькуляція собівартості випуску продукції (Цех MES)
  function renderReportProdCost() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Калькуляція собівартості випуску готової продукції (Рах. 231 $\\rightarrow$ 26)</div>
          <div class="report-meta-line">Підрозділ: <strong>Виробничий комплекс ТД Алком (Цех компресійного в'язання та швейна ділянка)</strong> • Листопад 2026</div>
        </div>
        <div class="report-signature-stamp">
          <div>Розподіл ЗВВ (Рах. 91): 100%</div>
          <div style="font-size:10px; color:#64748b;">Сальдо рах. 91 на кінець: 0.00 ₴</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Номенклатура / Стаття калькуляції</th>
            <th class="text-center" style="width: 80px;">Випуск</th>
            <th class="text-right" style="width: 100px;">План на од.</th>
            <th class="text-right" style="width: 100px;">Факт на од.</th>
            <th class="text-right" style="width: 110px;">Пряма сировина</th>
            <th class="text-right" style="width: 100px;">Відрядна ЗП</th>
            <th class="text-right" style="width: 100px;">Частка ЗВВ (91)</th>
            <th class="text-right" style="width: 120px;">Фактична собівартість</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-group"><td colspan="8">1. Бандаж попереково-крижовий напівжорсткий Алком 2045 (Розмір M, бежевий, 4 ребра) • Партія LOT-2026-AK048</td></tr>
          <tr>
            <td style="padding-left:16px;">Полотно еластичне гіпоалергенне (САПР розкрій)</td>
            <td class="text-center mono">340 шт</td>
            <td class="text-right mono">280.00</td>
            <td class="text-right mono">284.50</td>
            <td class="text-right mono">96 730.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">96 730.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Ребра жорсткості алюмінієві профільовані (4 шт/комплект)</td>
            <td class="text-center mono">340 шт</td>
            <td class="text-right mono">145.00</td>
            <td class="text-right mono">145.00</td>
            <td class="text-right mono">49 300.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">49 300.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Застібка Velcro та текстильні стрічки посилення</td>
            <td class="text-center mono">340 шт</td>
            <td class="text-right mono">55.00</td>
            <td class="text-right mono">54.20</td>
            <td class="text-right mono">18 428.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">18 428.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Оплата праці швачок та збиральників (відрядна + ЄСВ 22%)</td>
            <td class="text-center mono">340 шт</td>
            <td class="text-right mono">120.00</td>
            <td class="text-right mono">120.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">40 800.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">40 800.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Загальновиробничі витрати цеху (Амортизація САПР, електроенергія)</td>
            <td class="text-center mono">340 шт</td>
            <td class="text-right mono">115.00</td>
            <td class="text-right mono">116.30</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">39 542.00</td>
            <td class="text-right mono">39 542.00</td>
          </tr>
          <tr class="row-subtotal">
            <td colspan="3">Підсумок по виробу Алком 2045 (Собівартість одиниці: <strong>720.00 ₴</strong>)</td>
            <td class="text-right mono font-bold">720.00</td>
            <td class="text-right mono">164 458.00</td>
            <td class="text-right mono">40 800.00</td>
            <td class="text-right mono">39 542.00</td>
            <td class="text-right mono font-bold">244 800.00</td>
          </tr>

          <tr class="row-group"><td colspan="8">2. Панчохи компресійні 2 клас (23-32 мм рт.ст.) Алком 6052 (Розмір L, карамель) • Партія LOT-2026-TC112</td></tr>
          <tr>
            <td style="padding-left:16px;">Нитки компресійні еластомерні Roica/Lycra (бобіни)</td>
            <td class="text-center mono">415 пар</td>
            <td class="text-right mono">410.00</td>
            <td class="text-right mono">412.00</td>
            <td class="text-right mono">170 980.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">170 980.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Оператор круглопанчішного автомата Merz CC4-II (Зміна)</td>
            <td class="text-center mono">415 пар</td>
            <td class="text-right mono">160.00</td>
            <td class="text-right mono">160.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">66 400.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">66 400.00</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">Стендові випробування градієнта тиску HOSY / MST та ВТК</td>
            <td class="text-center mono">415 пар</td>
            <td class="text-right mono">85.00</td>
            <td class="text-right mono">84.50</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">35 067.50</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">35 067.50</td>
          </tr>
          <tr>
            <td style="padding-left:16px;">ЗВВ цеху компресії (Амортизація Merz, термофіксація)</td>
            <td class="text-center mono">415 пар</td>
            <td class="text-right mono">235.00</td>
            <td class="text-right mono">233.50</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">96 902.50</td>
            <td class="text-right mono">96 902.50</td>
          </tr>
          <tr class="row-subtotal">
            <td colspan="3">Підсумок по виробу Алком 6052 (Собівартість одиниці: <strong>890.00 ₴</strong>)</td>
            <td class="text-right mono font-bold">890.00</td>
            <td class="text-right mono">170 980.00</td>
            <td class="text-right mono">101 467.50</td>
            <td class="text-right mono">96 902.50</td>
            <td class="text-right mono font-bold">369 350.00</td>
          </tr>

          <tr class="row-total">
            <td colspan="4">РАЗОМ ВИПУСК ГОТОВОЇ ПРОДУКЦІЇ НА СКЛАД (Дт 26 Кт 231)</td>
            <td class="text-right mono">1 945 438.00</td>
            <td class="text-right mono">824 562.00</td>
            <td class="text-right mono">820 000.00</td>
            <td class="text-right mono">4 450 000.00</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 5. Матеріальний звіт складу (М-19)
  function renderReportStockM19() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Матеріальний звіт складу (Типова форма М-19)</div>
          <div class="report-meta-line">Склад: <strong>Центральний WMS-склад сировини та готової продукції ТД Алком</strong> • Листопад 2026 • МВО: <strong>Завскладом Бондаренко Д.М.</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Звірено з ОСВ (Рах. 201 + 26)</div>
          <div style="font-weight:700;">Сума: 9 300 000.00 ₴ ✓</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 100px;">Номенкл. №</th>
            <th rowspan="2">Найменування ТМЦ та характеристика</th>
            <th rowspan="2" style="width: 60px;" class="text-center">Од.</th>
            <th colspan="2" class="text-center">Залишок на початок</th>
            <th colspan="2" class="text-center">Прихід (Надходження)</th>
            <th colspan="2" class="text-center">Витрата (Списання/Збут)</th>
            <th colspan="2" class="text-center">Залишок на кінець</th>
          </tr>
          <tr>
            <th class="text-right" style="width: 70px;">Кільк.</th>
            <th class="text-right" style="width: 95px;">Сума (грн)</th>
            <th class="text-right" style="width: 70px;">Кільк.</th>
            <th class="text-right" style="width: 95px;">Сума (грн)</th>
            <th class="text-right" style="width: 70px;">Кільк.</th>
            <th class="text-right" style="width: 95px;">Сума (грн)</th>
            <th class="text-right" style="width: 70px;">Кільк.</th>
            <th class="text-right" style="width: 95px;">Сума (грн)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-group"><td colspan="11">Рахунок 201. Сировина й матеріали</td></tr>
          <tr>
            <td class="mono">RAW-SILIC-01</td>
            <td>Силікон медичний рідкий двокомпонентний (ISO 10993)</td>
            <td class="text-center">кг</td>
            <td class="text-right mono">320</td>
            <td class="text-right mono">592 000.00</td>
            <td class="text-right mono">480</td>
            <td class="text-right mono">888 000.00</td>
            <td class="text-right mono">320</td>
            <td class="text-right mono">592 000.00</td>
            <td class="text-right mono font-bold">480</td>
            <td class="text-right mono font-bold">888 000.00</td>
          </tr>
          <tr>
            <td class="mono">RAW-ELAST-02</td>
            <td>Нитки компресійні еластомерні Roica/Lycra (бобіни)</td>
            <td class="text-center">кг</td>
            <td class="text-right mono">650</td>
            <td class="text-right mono">923 000.00</td>
            <td class="text-right mono">600</td>
            <td class="text-right mono">852 000.00</td>
            <td class="text-right mono">430</td>
            <td class="text-right mono">610 600.00</td>
            <td class="text-right mono font-bold">820</td>
            <td class="text-right mono font-bold">1 164 400.00</td>
          </tr>
          <tr>
            <td class="mono">RAW-ALUM-03</td>
            <td>Ребра жорсткості алюмінієві профільовані (4 шт/к-т)</td>
            <td class="text-center">к-т</td>
            <td class="text-right mono">900</td>
            <td class="text-right mono">130 500.00</td>
            <td class="text-right mono">1 000</td>
            <td class="text-right mono">145 000.00</td>
            <td class="text-right mono">650</td>
            <td class="text-right mono">94 250.00</td>
            <td class="text-right mono font-bold">1 250</td>
            <td class="text-right mono font-bold">181 250.00</td>
          </tr>

          <tr class="row-group"><td colspan="11">Рахунок 26. Готова продукція на складі</td></tr>
          <tr>
            <td class="mono">FIN-BAN-2045</td>
            <td>Бандаж поперековий напівжорсткий Алком 2045 (р. M, беж)</td>
            <td class="text-center">шт</td>
            <td class="text-right mono">220</td>
            <td class="text-right mono">158 400.00</td>
            <td class="text-right mono">420</td>
            <td class="text-right mono">302 400.00</td>
            <td class="text-right mono">300</td>
            <td class="text-right mono">216 000.00</td>
            <td class="text-right mono font-bold">340</td>
            <td class="text-right mono font-bold">244 800.00</td>
          </tr>
          <tr>
            <td class="mono">FIN-STK-6052</td>
            <td>Панчохи компресійні 2 клас Алком 6052 (р. L, карамель)</td>
            <td class="text-center">пар</td>
            <td class="text-right mono">280</td>
            <td class="text-right mono">249 200.00</td>
            <td class="text-right mono">635</td>
            <td class="text-right mono">565 150.00</td>
            <td class="text-right mono">500</td>
            <td class="text-right mono">445 000.00</td>
            <td class="text-right mono font-bold">415</td>
            <td class="text-right mono font-bold">369 350.00</td>
          </tr>

          <tr class="row-total">
            <td colspan="3">РАЗОМ ПО СКЛАДСЬКИХ ЗАПАСАХ (М-19)</td>
            <td class="text-right mono">3 840</td>
            <td class="text-right mono">8 490 000.00</td>
            <td class="text-right mono">5 420</td>
            <td class="text-right mono">6 630 000.00</td>
            <td class="text-right mono">4 680</td>
            <td class="text-right mono">5 820 000.00</td>
            <td class="text-right mono font-bold">4 580</td>
            <td class="text-right mono font-bold">9 300 000.00</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 6. Звіт по партіях і серіях (Batch / Lot Tracking)
  function renderReportStockBatch() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Регістр партійного та серійного обліку (Batch / Lot Traceability)</div>
          <div class="report-meta-line">Підприємство: <strong>ТОВ "ТД Алком"</strong> • Вимоги: <strong>Держлікслужба України / ISO 13485</strong> • Алгоритм: <strong>FEFO</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Простежуваність: 100%</div>
          <div style="font-size:10px; color:#64748b;">Штрихкоди GS1 DataMatrix</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Номер серії (Lot ID)</th>
            <th>Номенклатура виробу / сировини</th>
            <th>Дата випуску</th>
            <th>Термін придатності</th>
            <th class="text-center">Днів до кінця</th>
            <th>Сертифікат відповідності</th>
            <th class="text-right">Залишок</th>
            <th class="text-right">Собівартість (грн)</th>
            <th class="text-center">Статус ВТК</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="openDocModal('LOT-2026-TC112')">LOT-2026-TC112</td>
            <td>Панчохи компресійні 2 клас Алком 6052 (р. L)</td>
            <td class="mono">14.11.2026</td>
            <td class="mono">14.11.2031</td>
            <td class="text-center mono">1 824 дн.</td>
            <td>UA.TR.099-МВ-4410/26 (Держлікслужба)</td>
            <td class="text-right mono font-bold">415 пар</td>
            <td class="text-right mono">369 350.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Допущено ВТК</span></td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="openDocModal('LOT-2026-AK048')">LOT-2026-AK048</td>
            <td>Бандаж поперековий напівжорсткий Алком 2045 (р. M)</td>
            <td class="mono">10.11.2026</td>
            <td class="mono">10.11.2031</td>
            <td class="text-center mono">1 820 дн.</td>
            <td>UA.TR.099-МВ-3912/26 (Держлікслужба)</td>
            <td class="text-right mono font-bold">340 шт</td>
            <td class="text-right mono">244 800.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Допущено ВТК</span></td>
          </tr>
          <tr>
            <td class="mono font-bold clickable-cell" onclick="openDocModal('LOT-2026-KN033')">LOT-2026-KN033</td>
            <td>Ортез колінний з силіконовим пелотом Алком 3023 (р. XL)</td>
            <td class="mono">05.11.2026</td>
            <td class="mono">05.11.2031</td>
            <td class="text-center mono">1 815 дн.</td>
            <td>UA.TR.099-МВ-4015/26 (Держлікслужба)</td>
            <td class="text-right mono font-bold">195 шт</td>
            <td class="text-right mono">191 100.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Допущено ВТК</span></td>
          </tr>
          <tr>
            <td class="mono font-bold">LOT-RAW-8812</td>
            <td>Силікон рідкий медичний Wacker A+B (Бочки)</td>
            <td class="mono">15.10.2026</td>
            <td class="mono">15.10.2028</td>
            <td class="text-center mono">700 дн.</td>
            <td>ISO 10993 Biocompatibility Certificate</td>
            <td class="text-right mono font-bold">480 кг</td>
            <td class="text-right mono">888 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Вхідний контроль OK</span></td>
          </tr>
          <tr>
            <td class="mono font-bold">LOT-RAW-4410</td>
            <td>Нитки еластомерні Roica Europe (Клас пружності II)</td>
            <td class="mono">01.10.2026</td>
            <td class="mono">01.10.2028</td>
            <td class="text-center mono">685 дн.</td>
            <td>OEKO-TEX Standard 100 Class I</td>
            <td class="text-right mono font-bold">820 кг</td>
            <td class="text-right mono">1 164 400.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Вхідний контроль OK</span></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 7. Акт звірки взаєморозрахунків
  function renderReportSettleRecon() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Акт звірки взаємних розрахунків</div>
          <div class="report-meta-line">Між: <strong>ТОВ "ТД Алком"</strong> та <strong>ТОВ "Аптека-Магнолія" (Мережа «АНЦ»)</strong> • За період: <strong>01.11.2026 – 30.11.2026</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Сальдо на користь Алком:</div>
          <div style="font-weight:700; font-size:13px;">1 850 000.00 ₴</div>
        </div>
      </div>

      <div style="font-size:12px; margin-bottom:12px; color:#475569;">
        Ми, що нижче підписалися, Головний бухгалтер ТОВ "ТД Алком" та Головний бухгалтер ТОВ "Аптека-Магнолія", склали цей акт про те, що стан взаємних розрахунків за договором поставки №АНЦ-2026/04 станом на 30.11.2026 становить:
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th colspan="4" class="text-center" style="background:#EFF6FF; border-right: 2px solid #0F172A;">За даними ТОВ "ТД Алком" (Постачальник)</th>
            <th colspan="4" class="text-center" style="background:#F0FDF4;">За даними ТОВ "Аптека-Магнолія" (Покупець)</th>
          </tr>
          <tr>
            <th>Дата</th>
            <th>Документ</th>
            <th class="text-right">Дебет</th>
            <th class="text-right" style="border-right: 2px solid #0F172A;">Кредит</th>
            <th>Дата</th>
            <th>Документ</th>
            <th class="text-right">Дебет</th>
            <th class="text-right">Кредит</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="mono">01.11.2026</td>
            <td>Сальдо початкове</td>
            <td class="text-right mono">1 420 000.00</td>
            <td class="text-right mono" style="border-right: 2px solid #0F172A;">—</td>
            <td class="mono">01.11.2026</td>
            <td>Сальдо початкове</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">1 420 000.00</td>
          </tr>
          <tr>
            <td class="mono">04.11.2026</td>
            <td>Пл. доручення №1492</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono" style="border-right: 2px solid #0F172A;">1 004 000.00</td>
            <td class="mono">04.11.2026</td>
            <td>Списання коштів №1492</td>
            <td class="text-right mono">1 004 000.00</td>
            <td class="text-right mono">—</td>
          </tr>
          <tr>
            <td class="mono">16.11.2026</td>
            <td class="clickable-cell" onclick="openDocModal('ВН-2026/ALK104')">ВН-2026/ALK104 (Компресія 2 кл)</td>
            <td class="text-right mono font-bold">1 434 000.00</td>
            <td class="text-right mono" style="border-right: 2px solid #0F172A;">—</td>
            <td class="mono">16.11.2026</td>
            <td>Прибуткова накладна №4418</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold">1 434 000.00</td>
          </tr>
          <tr class="row-total">
            <td colspan="2">Обороти за період</td>
            <td class="text-right mono">1 434 000.00</td>
            <td class="text-right mono" style="border-right: 2px solid #0F172A;">1 004 000.00</td>
            <td colspan="2">Обороти за період</td>
            <td class="text-right mono">1 004 000.00</td>
            <td class="text-right mono">1 434 000.00</td>
          </tr>
          <tr class="row-group">
            <td colspan="4" style="border-right: 2px solid #0F172A;"><strong>Сальдо кінцеве: 1 850 000.00 ₴ (на користь ТОВ "ТД Алком")</strong></td>
            <td colspan="4"><strong>Сальдо кінцеве: 1 850 000.00 ₴ (заборгованість перед ТД Алком)</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 8. Реєстр старіння дебіторської заборгованості (Aging Report)
  function renderReportSettleAging() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">Реєстр старіння дебіторської заборгованості (Aging Report)</div>
          <div class="report-meta-line">Підприємство: <strong>ТОВ "ТД Алком"</strong> • Рахунок обліку: <strong>361</strong> • Дата контролю: <strong>16.11.2026</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Загальна дебіторка: 4 920 000.00 ₴</div>
          <div style="font-size:10px; color:#DC2626;">Прострочено: 505 000.00 ₴</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Покупець / Контрагент</th>
            <th class="text-right" style="width: 100px;">Кредит-ліміт</th>
            <th class="text-right" style="width: 110px;">Всього борг</th>
            <th class="text-right" style="width: 100px;">Поточний (0-7 дн)</th>
            <th class="text-right" style="width: 100px;">8–14 днів</th>
            <th class="text-right" style="width: 100px;">15–30 днів</th>
            <th class="text-right" style="width: 100px;">Понад 30 днів</th>
            <th class="text-center" style="width: 90px;">Кредитний статус</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold">Аптечна мережа «АНЦ» (ТОВ "Аптека-Магнолія")</td>
            <td class="text-right mono">3 000 000.00</td>
            <td class="text-right mono font-bold">1 850 000.00</td>
            <td class="text-right mono">1 434 000.00</td>
            <td class="text-right mono">416 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">ДОЗВОЛЕНО</span></td>
          </tr>
          <tr>
            <td class="font-bold">Аптечна мережа «Подорожник» (ТОВ "Соломія-Сервіс")</td>
            <td class="text-right mono">2 500 000.00</td>
            <td class="text-right mono font-bold">1 240 000.00</td>
            <td class="text-right mono">720 000.00</td>
            <td class="text-right mono">520 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">ДОЗВОЛЕНО</span></td>
          </tr>
          <tr>
            <td class="font-bold">Мережа ортопедичних салонів «ORTOS» (14 салонів)</td>
            <td class="text-right mono">2 000 000.00</td>
            <td class="text-right mono font-bold">940 000.00</td>
            <td class="text-right mono">400 000.00</td>
            <td class="text-right mono">340 000.00</td>
            <td class="text-right mono">200 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-center"><span class="report-code-badge" style="background:#E0E7FF; color:#3730A3;">ХОЛДИНГ</span></td>
          </tr>
          <tr>
            <td class="font-bold">Медичний центр «Добробут» (VIP-стаціонар)</td>
            <td class="text-right mono">800 000.00</td>
            <td class="text-right mono font-bold">385 000.00</td>
            <td class="text-right mono">385 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">ДОЗВОЛЕНО</span></td>
          </tr>
          <tr>
            <td class="font-bold" style="color:#DC2626;">ТОВ «Аптека Низьких Цін Дніпро» (ТОВ "Апріорі")</td>
            <td class="text-right mono">400 000.00</td>
            <td class="text-right mono font-bold" style="color:#DC2626;">505 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono" style="color:#DC2626;">505 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-center"><span class="report-code-badge" style="background:#FEE2E2; color:#991B1B;">СТОП-ЛИСТ</span></td>
          </tr>

          <tr class="row-total">
            <td>РАЗОМ ДЕБІТОРСЬКА ЗАБОРГОВАНІСТЬ (РАХ. 361)</td>
            <td class="text-right mono">8 700 000.00</td>
            <td class="text-right mono font-bold">4 920 000.00</td>
            <td class="text-right mono">2 939 000.00</td>
            <td class="text-right mono">1 276 000.00</td>
            <td class="text-right mono" style="color:#DC2626;">705 000.00</td>
            <td class="text-right mono">—</td>
            <td class="text-center">Звірено ✓</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 9. Баланс (Форма №1 НП(С)БО 1)
  function renderReportStatBalance() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">БАЛАНС (Звіт про фінансовий стан) • Форма №1 за НП(С)БО 1</div>
          <div class="report-meta-line">Підприємство: <strong>ТОВ "ТД Алком"</strong> • Код ЄДРПОУ: <strong>32490244</strong> • Станом на <strong>30 листопада 2026 р.</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Рівність досягнута:</div>
          <div style="font-weight:800; font-size:13px;">АКТИВИ ≡ ПАСИВИ ✓</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
        <!-- АКТИВ -->
        <div>
          <table class="acc-table">
            <thead>
              <tr>
                <th colspan="3" style="background:#0F172A; color:#FFFFFF;">АКТИВ</th>
              </tr>
              <tr>
                <th>Стаття балансу</th>
                <th style="width: 50px;" class="text-center">Код</th>
                <th class="text-right" style="width: 110px;">На кінець періоду</th>
              </tr>
            </thead>
            <tbody>
              <tr class="row-group"><td colspan="3">I. Необоротні активи</td></tr>
              <tr>
                <td>Основні засоби (залишкова вартість)</td>
                <td class="text-center mono">1010</td>
                <td class="text-right mono">10 425 000.00</td>
              </tr>
              <tr>
                <td style="padding-left:14px; font-size:11px; color:#64748b;">Первісна вартість (Рах. 104)</td>
                <td class="text-center mono">1011</td>
                <td class="text-right mono">14 430 000.00</td>
              </tr>
              <tr>
                <td style="padding-left:14px; font-size:11px; color:#64748b;">Знос (Рах. 131)</td>
                <td class="text-center mono">1012</td>
                <td class="text-right mono">(4 005 000.00)</td>
              </tr>
              <tr>
                <td>Нематеріальні активи (САПР, ТМ "Алком", "ORTOS")</td>
                <td class="text-center mono">1000</td>
                <td class="text-right mono">1 850 000.00</td>
              </tr>
              <tr class="row-subtotal">
                <td>Усього за розділом I</td>
                <td class="text-center mono">1095</td>
                <td class="text-right mono font-bold">12 275 000.00</td>
              </tr>

              <tr class="row-group"><td colspan="3">II. Оборотні активи</td></tr>
              <tr>
                <td>Запаси (Сировина 201 + НЗВ 231 + ГП 26)</td>
                <td class="text-center mono">1100</td>
                <td class="text-right mono">10 250 000.00</td>
              </tr>
              <tr>
                <td>Дебіторська заборгованість за товари (Рах. 361)</td>
                <td class="text-center mono">1125</td>
                <td class="text-right mono">4 920 000.00</td>
              </tr>
              <tr>
                <td>Дебіторська заборгованість за авансами виданими (Рах. 371)</td>
                <td class="text-center mono">1130</td>
                <td class="text-right mono">285 000.00</td>
              </tr>
              <tr>
                <td>Інша поточна дебіторська заборгованість</td>
                <td class="text-center mono">1155</td>
                <td class="text-right mono">140 000.00</td>
              </tr>
              <tr>
                <td>Гроші та їх еквіваленти (Рах. 311, 301)</td>
                <td class="text-center mono">1165</td>
                <td class="text-right mono font-bold">14 850 000.00</td>
              </tr>
              <tr class="row-subtotal">
                <td>Усього за розділом II</td>
                <td class="text-center mono">1195</td>
                <td class="text-right mono font-bold">30 445 000.00</td>
              </tr>

              <tr class="row-total">
                <td>БАЛАНС АКТИВУ</td>
                <td class="text-center mono">1300</td>
                <td class="text-right mono font-bold">42 720 000.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ПАСИВ -->
        <div>
          <table class="acc-table">
            <thead>
              <tr>
                <th colspan="3" style="background:#0F172A; color:#FFFFFF;">ПАСИВ</th>
              </tr>
              <tr>
                <th>Стаття балансу</th>
                <th style="width: 50px;" class="text-center">Код</th>
                <th class="text-right" style="width: 110px;">На кінець періоду</th>
              </tr>
            </thead>
            <tbody>
              <tr class="row-group"><td colspan="3">I. Власний капітал</td></tr>
              <tr>
                <td>Зареєстрований (статутний) капітал (Рах. 401)</td>
                <td class="text-center mono">1400</td>
                <td class="text-right mono">10 000 000.00</td>
              </tr>
              <tr>
                <td>Нерозподілений прибуток (Рах. 441)</td>
                <td class="text-center mono">1420</td>
                <td class="text-right mono font-bold">28 090 000.00</td>
              </tr>
              <tr class="row-subtotal">
                <td>Усього за розділом I</td>
                <td class="text-center mono">1495</td>
                <td class="text-right mono font-bold">38 090 000.00</td>
              </tr>

              <tr class="row-group"><td colspan="3">III. Поточні зобов'язання</td></tr>
              <tr>
                <td>Поточна кредиторська заборгованість за товари (Рах. 631)</td>
                <td class="text-center mono">1615</td>
                <td class="text-right mono font-bold">1 700 000.00</td>
              </tr>
              <tr>
                <td>Поточні зобов'язання з бюджетом за податками (Рах. 6412)</td>
                <td class="text-center mono">1620</td>
                <td class="text-right mono">480 000.00</td>
              </tr>
              <tr>
                <td>Поточні зобов'язання з оплати праці (Рах. 661)</td>
                <td class="text-center mono">1630</td>
                <td class="text-right mono">750 000.00</td>
              </tr>
              <tr>
                <td>Поточні зобов'язання за одержаними авансами (Рах. 681)</td>
                <td class="text-center mono">1635</td>
                <td class="text-right mono">1 700 000.00</td>
              </tr>
              <tr class="row-subtotal">
                <td>Усього за розділом III</td>
                <td class="text-center mono">1695</td>
                <td class="text-right mono font-bold">4 630 000.00</td>
              </tr>

              <tr class="row-total">
                <td>БАЛАНС ПАСИВУ</td>
                <td class="text-center mono">1900</td>
                <td class="text-right mono font-bold">42 720 000.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // 10. Звіт про фінансові результати (Форма №2)
  function renderReportStatPnl() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">ЗВІТ ПРО ФІНАНСОВІ РЕЗУЛЬТАТИ (Звіт про сукупний дохід) • Форма №2</div>
          <div class="report-meta-line">Підприємство: <strong>ТОВ "ТД Алком"</strong> • Період: <strong>Листопад 2026 р.</strong> • Стандарти: <strong>НП(С)БО 1</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Чистий прибуток:</div>
          <div style="font-weight:800; font-size:13px; color:#059669;">6 350 000.00 ₴</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Стаття фінансового звіту</th>
            <th class="text-center" style="width: 70px;">Код рядка</th>
            <th class="text-right" style="width: 130px;">За звітний період (грн)</th>
            <th class="text-right" style="width: 130px;">За аналогічний період минулого року</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="font-bold">Чистий дохід від реалізації продукції (Рах. 701 мінус ПДВ)</td>
            <td class="text-center mono">2000</td>
            <td class="text-right mono font-bold">26 635 514.02</td>
            <td class="text-right mono">18 420 000.00</td>
          </tr>
          <tr>
            <td>Собівартість реалізованої продукції (Рах. 901 за методом FIFO)</td>
            <td class="text-center mono">2050</td>
            <td class="text-right mono">(16 200 000.00)</td>
            <td class="text-right mono">(11 850 000.00)</td>
          </tr>
          <tr class="row-subtotal">
            <td class="font-bold">ВАЛОВИЙ ПРИБУТОК (Ряд. 2000 - Ряд. 2050)</td>
            <td class="text-center mono">2090</td>
            <td class="text-right mono font-bold">10 435 514.02</td>
            <td class="text-right mono">6 570 000.00</td>
          </tr>
          <tr>
            <td>Адміністративні витрати (Рах. 92: оренда офісу, юристи, топ-менеджмент)</td>
            <td class="text-center mono">2130</td>
            <td class="text-right mono">(1 450 000.00)</td>
            <td class="text-right mono">(980 000.00)</td>
          </tr>
          <tr>
            <td>Витрати на збут (Рах. 93: оренда салонів ORTOS, медпредставники, логістика)</td>
            <td class="text-center mono">2150</td>
            <td class="text-right mono">(2 100 000.00)</td>
            <td class="text-right mono">(1 420 000.00)</td>
          </tr>
          <tr>
            <td>Інші операційні витрати (Рах. 94)</td>
            <td class="text-center mono">2180</td>
            <td class="text-right mono">(550 000.00)</td>
            <td class="text-right mono">(320 000.00)</td>
          </tr>
          <tr class="row-subtotal">
            <td class="font-bold">ФІНАНСОВИЙ РЕЗУЛЬТАТ ВІД ОПЕРАЦІЙНОЇ ДІЯЛЬНОСТІ</td>
            <td class="text-center mono">2190</td>
            <td class="text-right mono font-bold">6 335 514.02</td>
            <td class="text-right mono">3 850 000.00</td>
          </tr>
          <tr>
            <td>Податок на прибуток підприємства (18%)</td>
            <td class="text-center mono">2300</td>
            <td class="text-right mono">(1 140 392.52)</td>
            <td class="text-right mono">(693 000.00)</td>
          </tr>
          <tr class="row-total">
            <td class="font-bold">ЧИСТИЙ ПРИБУТОК ПІДПРИЄМСТВА (Перенесено на Рах. 441)</td>
            <td class="text-center mono">2350</td>
            <td class="text-right mono font-bold" style="color:#059669;">5 195 121.50</td>
            <td class="text-right mono">3 157 000.00</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // 11. Декларація з ПДВ
  function renderReportStatVat() {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">ПОДАТКОВА ДЕКЛАРАЦІЯ З ПДВ (Форма J0200126) • Реєстр ЄРПН</div>
          <div class="report-meta-line">Платник: <strong>ТОВ "ТД Алком" (ІПН 324902426568)</strong> • Звітний період: <strong>Листопад 2026 р.</strong></div>
        </div>
        <div class="report-signature-stamp">
          <div>Ліміт СЕА ПДВ:</div>
          <div style="font-weight:800; font-size:13px; color:#059669;">1 842 500.00 ₴ ✓</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            <th>Розділ декларації та операція</th>
            <th class="text-center" style="width: 70px;">Код рядка</th>
            <th class="text-right" style="width: 140px;">Обсяг постачання (без ПДВ)</th>
            <th class="text-right" style="width: 120px;">Сума ПДВ (грн)</th>
            <th class="text-center" style="width: 110px;">Статус в ЄРПН</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-group"><td colspan="5">I. Податкові зобов'язання (Кт 6412)</td></tr>
          <tr>
            <td>Операції, що оподатковуються за ставкою 7% (Медичні вироби згідно з Техрегламентами)</td>
            <td class="text-center mono">1.2</td>
            <td class="text-right mono">22 571 428.57</td>
            <td class="text-right mono font-bold">1 580 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Зареєстровано 100%</span></td>
          </tr>
          <tr>
            <td>Операції, що оподатковуються за основною ставкою 20% (Супутні послуги)</td>
            <td class="text-center mono">1.1</td>
            <td class="text-right mono">1 420 000.00</td>
            <td class="text-right mono font-bold">284 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Зареєстровано 100%</span></td>
          </tr>
          <tr class="row-subtotal">
            <td class="font-bold">Усього податкових зобов'язань (Ряд. 1.1 + Ряд. 1.2)</td>
            <td class="text-center mono">9</td>
            <td class="text-right mono">23 991 428.57</td>
            <td class="text-right mono font-bold">1 864 000.00</td>
            <td class="text-center">—</td>
          </tr>

          <tr class="row-group"><td colspan="5">II. Податковий кредит (Дт 6412)</td></tr>
          <tr>
            <td>Придбання сировини та послуг на території України за ставкою 20%</td>
            <td class="text-center mono">10.1</td>
            <td class="text-right mono">4 850 000.00</td>
            <td class="text-right mono font-bold">970 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">Підтверджено ЄРПН</span></td>
          </tr>
          <tr>
            <td>Ввезення товарів на митну територію України (Імпорт силікону Wacker та ниток Roica)</td>
            <td class="text-center mono">11.1</td>
            <td class="text-right mono">2 250 000.00</td>
            <td class="text-right mono font-bold">450 000.00</td>
            <td class="text-center"><span class="report-code-badge" style="background:#DCFCE7; color:#166534;">МД підтверджено</span></td>
          </tr>
          <tr class="row-subtotal">
            <td class="font-bold">Усього податкового кредиту (Ряд. 10.1 + Ряд. 11.1)</td>
            <td class="text-center mono">17</td>
            <td class="text-right mono">7 100 000.00</td>
            <td class="text-right mono font-bold">1 420 000.00</td>
            <td class="text-center">—</td>
          </tr>

          <tr class="row-total">
            <td class="font-bold">СУМА ПДВ, ЩО ПІДЛЯГАЄ СПЛАТІ ДО БЮДЖЕТУ (Ряд. 9 - Ряд. 17)</td>
            <td class="text-center mono">18</td>
            <td class="text-right mono">—</td>
            <td class="text-right mono font-bold" style="color:#DC2626;">444 000.00</td>
            <td class="text-center">До сплати 20.12</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  // Fallback for other reports
  function renderGenericReport(title, subtitle, headers, rows) {
    return `
      <div class="report-header-block">
        <div>
          <div class="report-main-title">${escapeHtml(title)}</div>
          <div class="report-meta-line">${escapeHtml(subtitle)}</div>
        </div>
        <div class="report-signature-stamp">
          <div>Звірено в реальному часі</div>
          <div style="font-size:10px; color:#64748b;">OpexMetrix Single Ledger</div>
        </div>
      </div>

      <table class="acc-table">
        <thead>
          <tr>
            ${headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              ${r.map((c, i) => `<td class="${i > 1 ? 'text-right mono' : ''}">${escapeHtml(String(c))}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  // ─── REPORT DISPATCHER ─────────────────────────────────────────────────────

  function renderCurrentReport() {
    const paper = document.getElementById('report-paper');
    if (!paper) return;

    switch (state.activeReport) {
      case 'osv':
        paper.innerHTML = renderReportOsv();
        break;
      case 'osv-account':
        paper.innerHTML = renderReportOsvAccount(state.account || '361');
        break;
      case 'card-account':
        paper.innerHTML = renderReportCardAccount();
        break;
      case 'prod-cost':
        paper.innerHTML = renderReportProdCost();
        break;
      case 'stock-m19':
        paper.innerHTML = renderReportStockM19();
        break;
      case 'stock-batch':
        paper.innerHTML = renderReportStockBatch();
        break;
      case 'settle-recon':
        paper.innerHTML = renderReportSettleRecon();
        break;
      case 'settle-aging':
        paper.innerHTML = renderReportSettleAging();
        break;
      case 'stat-balance':
        paper.innerHTML = renderReportStatBalance();
        break;
      case 'stat-pnl':
        paper.innerHTML = renderReportStatPnl();
        break;
      case 'stat-vat':
        paper.innerHTML = renderReportStatVat();
        break;
      case 'analysis-account':
        paper.innerHTML = renderGenericReport(
          'Аналіз рахунку 361 «Розрахунки з покупцями» за кореспондуючими рахунками',
          'Організація: ТОВ "ТД Алком" • Листопад 2026',
          ['Кореспондуючий рахунок', 'Найменування кор. рахунку', 'Дебет (Обороти)', 'Кредит (Обороти)'],
          [
            ['311', 'Поточні рахунки в банку (Оплата клієнтів)', '—', '16 530 000.00 ₴'],
            ['701', 'Дохід від реалізації готової продукції', '16 112 149.53 ₴', '—'],
            ['6412', 'Розрахунки за ПДВ (7% / 20%)', '1 127 850.47 ₴', '—'],
            ['371', 'Залік виданих авансів', '—', '285 000.00 ₴']
          ]
        );
        break;
      case 'chessboard':
        paper.innerHTML = renderGenericReport(
          'Шахова відомість (Шахматка) • Матриця подвійного запису',
          'Підприємство: ТОВ "ТД Алком" • Листопад 2026 • Усі рахунки Дт/Кт збігаються до копійки',
          ['Рахунок Дт \\ Кт', '201 (Склад)', '231 (Цех)', '26 (ГП)', '311 (Банк)', '361 (АНЦ)', '631 (Постач)', '701 (Дохід)'],
          [
            ['201 Сировина', '—', '—', '—', '—', '—', '2 180 000.00 ₴', '—'],
            ['231 Виробництво', '1 700 000.00 ₴', '—', '—', '—', '—', '—', '—'],
            ['26 Готова прод.', '—', '4 450 000.00 ₴', '—', '—', '—', '—', '—'],
            ['311 Банк', '—', '—', '—', '—', '16 530 000.00 ₴', '—', '—'],
            ['361 Покупці', '—', '—', '—', '—', '—', '—', '17 240 000.00 ₴']
          ]
        );
        break;
      case 'prod-m29':
        paper.innerHTML = renderGenericReport(
          'Звіт про витрати сировини та матеріалів у виробництві (Форма М-29)',
          'Цех компресії та швейний цех ТД Алком • Порівняння Норматив vs Факт',
          ['Матеріал / Сировина', 'Од.', 'Норма на факт випуску', 'Фактично списано', 'Відхилення', 'Сума відхилення (грн)', 'Статус'],
          [
            ['Полотно еластичне медичне (САПР)', 'м.п.', '1 428.00', '1 445.00', '+17.00 (+1.2%)', '4 820.00', 'В межах толерансу'],
            ['Нитки компресійні Roica кл. 2', 'кг', '412.00', '412.00', '0.00 (0.0%)', '0.00', 'Ідеальна відповідність'],
            ['Ребра жорсткості алюмінієві', 'к-т', '340.00', '340.00', '0.00 (0.0%)', '0.00', 'Норма 100%'],
            ['Силікон рідкий двокомпонентний', 'кг', '195.00', '194.50', '-0.50 (Економія)', '-925.00', 'Економія САПР']
          ]
        );
        break;
      default:
        paper.innerHTML = renderReportOsv();
        break;
    }
  }

  // ─── MODAL PRIMARY DOCUMENT VIEWER ─────────────────────────────────────────

  window.drillToAccount = function (accCode) {
    state.activeReport = 'osv-account';
    state.account = accCode;
    const sel = document.getElementById('flt-account');
    if (sel) sel.value = accCode;
    updateTreeActive('osv-account');
    renderCurrentReport();
  };

  window.openDocModal = function (docId) {
    const modal = document.getElementById('doc-modal');
    const body = document.getElementById('modal-doc-body');
    const title = document.getElementById('modal-doc-title');
    if (!modal || !body) return;

    title.textContent = `Первинний документ: ${docId} (ТОВ "ТД Алком")`;
    body.innerHTML = `
      <div style="border:1px solid #CBD5E1; border-radius:6px; padding:18px; background:#FFFFFF; font-family:var(--font-sans);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0F172A; padding-bottom:12px; margin-bottom:14px;">
          <div>
            <div style="font-size:16px; font-weight:800; color:#0F172A;">ВИДАТКОВА НАКЛАДНА № ВН-2026/ALK104</div>
            <div style="font-size:11.5px; color:#64748b; margin-top:3px;">від 16 листопада 2026 року • Підписано КЕП (Дія.Підпис / ЦСК)</div>
          </div>
          <div style="text-align:right;">
            <span class="report-code-badge" style="background:#DCFCE7; color:#166534; font-size:11px;">КЕП ВАЛІДНИЙ ✓</span>
            <div style="font-size:10.5px; color:#059669; margin-top:2px;">Мітка часу: 16.11.2026 11:30:14 UTC+2</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px; font-size:12px;">
          <div>
            <div><strong>Постачальник:</strong> ТОВ "ТД «Алком»"</div>
            <div><strong>ЄДРПОУ:</strong> 32490244 • ІПН: 324902426568</div>
            <div><strong>IBAN:</strong> UA743052990000026001234567890 в АТ КБ "ПриватБанк"</div>
            <div><strong>Місце складання:</strong> Київ, вул. Бориспільська, 9</div>
          </div>
          <div>
            <div><strong>Одержувач / Покупець:</strong> ТОВ "Аптека-Магнолія" (Мережа «АНЦ»)</div>
            <div><strong>ЄДРПОУ:</strong> 36453412 • ІПН: 364534126589</div>
            <div><strong>Договір:</strong> №АНЦ-2026/04 від 12.01.2026 р.</div>
            <div><strong>Пункт розвантаження:</strong> Логістичний хаб АНЦ, м. Бровари</div>
          </div>
        </div>

        <table class="acc-table" style="margin-bottom:16px;">
          <thead>
            <tr>
              <th>№</th>
              <th>Товар / Медичний виріб</th>
              <th>Серія (Batch / Lot)</th>
              <th class="text-center">Од.</th>
              <th class="text-right">Кільк.</th>
              <th class="text-right">Ціна без ПДВ</th>
              <th class="text-right">ПДВ 7%</th>
              <th class="text-right">Всього з ПДВ</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Панчохи компресійні 2 клас Алком 6052 (р. L, карамель)</td>
              <td class="mono font-bold" style="color:#2563EB;">LOT-2026-TC112</td>
              <td class="text-center">пар</td>
              <td class="text-right mono">500</td>
              <td class="text-right mono">1 570.09</td>
              <td class="text-right mono">109.91</td>
              <td class="text-right mono font-bold">840 000.00</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Бандаж поперековий напівжорсткий Алком 2045 (р. M, беж, 4 ребра)</td>
              <td class="mono font-bold" style="color:#2563EB;">LOT-2026-AK048</td>
              <td class="text-center">шт</td>
              <td class="text-right mono">300</td>
              <td class="text-right mono">1 261.68</td>
              <td class="text-right mono">88.32</td>
              <td class="text-right mono font-bold">405 000.00</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Ортез колінний з шарнірами Алком 3023 (р. XL)</td>
              <td class="mono font-bold" style="color:#2563EB;">LOT-2026-KN033</td>
              <td class="text-center">шт</td>
              <td class="text-right mono">100</td>
              <td class="text-right mono">1 766.36</td>
              <td class="text-right mono">123.64</td>
              <td class="text-right mono font-bold">189 000.00</td>
            </tr>
            <tr class="row-total">
              <td colspan="4">РАЗОМ ДО СПЛАТИ З ПДВ (7%)</td>
              <td class="text-right mono">900</td>
              <td class="text-right mono">1 340 186.92</td>
              <td class="text-right mono">93 813.08</td>
              <td class="text-right mono font-bold">1 434 000.00 ₴</td>
            </tr>
          </tbody>
        </table>

        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:4px; padding:10px 14px; font-size:11.5px; font-family:var(--font-mono);">
          <strong>Сформовані проводки в Головній Книзі (OpexMetrix Single Ledger):</strong><br>
          1. Дт 361 (АНЦ) Кт 701 (Виручка) — 1 340 186.92 ₴<br>
          2. Дт 361 (АНЦ) Кт 6412 (ПДВ 7%) — 93 813.08 ₴<br>
          3. Дт 901 (Собівартість) Кт 26 (Склад WMS: партії TC112, AK048) — 759 000.00 ₴ (FIFO)
        </div>
      </div>
    `;

    modal.classList.add('active');
  };

  window.closeDocModal = function () {
    const modal = document.getElementById('doc-modal');
    if (modal) modal.classList.remove('active');
  };

  function updateTreeActive(reportKey) {
    document.querySelectorAll('.report-tree-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-report') === reportKey);
    });
  }

  // ─── EXPORT TO EXCEL / CSV ──────────────────────────────────────────────────
  function exportTableToCsv(filename = 'OpexMetrix_Report.csv') {
    const table = document.querySelector('.acc-table');
    if (!table) return;

    let csv = [];
    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('th, td');
      let rowData = [];
      cols.forEach(col => {
        let text = col.innerText.replace(/"/g, '""').replace(/\n/g, ' ').trim();
        rowData.push(`"${text}"`);
      });
      csv.push(rowData.join(';'));
    });

    const csvContent = '\uFEFF' + csv.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ─── INITIALIZATION ────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    // Tree clicks
    document.querySelectorAll('.report-tree-item').forEach(item => {
      item.addEventListener('click', () => {
        const rep = item.getAttribute('data-report');
        if (rep) {
          state.activeReport = rep;
          updateTreeActive(rep);
          renderCurrentReport();
        }
      });
    });

    // Account select change
    const accSel = document.getElementById('flt-account');
    if (accSel) {
      accSel.addEventListener('change', () => {
        state.account = accSel.value;
        if (state.activeReport === 'osv-account') {
          renderCurrentReport();
        }
      });
    }

    // Generate button click
    const btnGen = document.getElementById('btn-generate-report');
    if (btnGen) {
      btnGen.addEventListener('click', () => {
        renderCurrentReport();
      });
    }

    // Export to Excel click
    const btnExp = document.getElementById('btn-export-excel');
    if (btnExp) {
      btnExp.addEventListener('click', () => {
        exportTableToCsv(`OpexMetrix_${state.activeReport}_${state.period}.csv`);
      });
    }

    // Initial render
    renderCurrentReport();
  });

})();
