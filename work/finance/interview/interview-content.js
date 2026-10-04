/* HKChat Finance interview demo. Fictional profiles and scenarios; local,
 * conservative text cues, not a language model or recruitment assessment. */
(function (global) {
  'use strict';

  const profiles = [
    {
      id: 'hkust-ai-finance', name: '科大 AI × 金融畢業生', label: '主線示範 · 虛構履歷',
      school: '香港科技大學畢業生', focus: 'AI × 金融學習背景',
      experience: '曾在虛構金融科技團隊實習，使用合成客服查詢整理問題分類，協助資料清理與測試紀錄。',
      project: '畢業專題：RAG 金融服務 FAQ 助手。以虛構服務文件為知識庫，回答附文件來源；資料不足時轉交人工。',
      skills: ['Python', 'SQL', 'RAG', '資料分析', '中英雙語溝通'],
      summary: '希望投身金融行業，把資料整理、查證與清楚解說的能力用於服務及風險管理。專題負責資料整理、檢索測試與來源標示；尚未有銀行業務或風險管理的正式工作經驗。',
      fictional: true, custom: false
    },
    {
      id: 'finance-graduate', name: '金融系應屆畢業生', label: '金融行業起步 · 虛構履歷',
      school: '香港本地大專畢業生', focus: '金融學習背景，正在建立資料分析能力',
      experience: '曾參與虛構校園金融教育活動，整理參加者對服務條款的疑問，製作解說材料。',
      project: '課堂專題：金融服務申請流程研究。以虛構訪談記錄整理常見誤解，設計白話說明與人工支援入口。',
      skills: ['Excel', '基礎 SQL', '資料整理', '訪談', '中英雙語溝通'],
      summary: '熟悉金融服務的使用者角度，能整理資訊與清楚解說。希望從銀行業務或風險管理的初階工作開始，仍需學習實際流程及專業要求。',
      fictional: true, custom: false
    },
    {
      id: 'career-switcher', name: '自學轉職資料分析員', label: '跨界起步 · 虛構履歷',
      school: '自學與短期課程背景', focus: '由一般客戶服務轉向金融行業，正在建立資料分析能力',
      experience: '曾在虛構一般服務團隊處理查詢，整理交接筆記；沒有銀行從業經驗。',
      project: '自學專題：以自行編寫的虛構查詢資料，建立問題分類小工具及簡單測試表。',
      skills: ['Python 基礎', 'Excel', '問題分類', '客戶溝通', '測試紀錄'],
      summary: '希望把前線溝通與問題整理經驗帶到金融行業。能拆解常見疑問，也會清楚交代自己尚未熟悉的銀行流程與風險工作。',
      fictional: true, custom: false
    }
  ];

  const roles = [
    {id: 'product', title: '銀行業務培訓生', team: '虛構銀行業務團隊 · Graduate / Junior',
      brief: '了解客戶需要、核對服務條件，與前線及營運同事協作，把每一步交代清楚。',
      skills: ['客戶需要', '金融服務理解', '資料核對', '專業操守', '團隊溝通']},
    {id: 'risk', title: '風險管理分析員', team: '虛構風險管理團隊 · Graduate / Junior',
      brief: '整理業務資料、辨認異常與資訊缺口，向負責同事交代風險及跟進安排。',
      skills: ['風險辨識', '資料查證', '分析判斷', '紀錄追溯', '清楚匯報']}
  ];

  // A criterion is observed only when multiple relevant cues occur together.
  // Wording such as "not checked" must not become evidence of completed work.
  // Stable criterion and round ids are retained for existing saved practice flows.
  function criterion(id, label, groups, guidance, blockers) {
    return {id, label, groups, guidance, blockers: blockers || []};
  }
  const negativeCompletion = [
    '(?:沒有|未曾|未有|冇|未做|沒有做|冇做|未有做)[^，。；!?\\n]{0,14}(?:測試|驗證|檢查|記錄|負責|比較|核對|整理)',
    "(?:did not|didn't|have not|haven't|never)\\s+(?:\\w+\\s+){0,3}(?:test|validat|check|record|compar|organis|organiz)"
  ];
  const c = {
    pitchLink: () => criterion('pitch-link', '把背景連到金融職位工作', [
      '(?:金融|銀行|finance|bank|data|資料|服務|service|溝通|communication|客戶|風險|risk)',
      '(?:需要|需求|分析|核對|查證|整理|解說|追溯|流程|協作|analy[sz]|check|explain|organis|organiz|trace|process|collaborat)'
    ], '挑一項已確認的背景，接上職位工作，例如「整理查詢 → 理解客戶需要」或「核對資料 → 找出業務異常」。'),
    pitchEvidence: () => criterion('pitch-evidence', '說明自己做過的一件事', [
      '(?:我(?:曾|有|在|用|負責|做|整理|設計|建立|協助|檢查)|my role|I (?:worked|built|created|organis|organiz|checked|designed|was responsible|helped))',
      '(?:專題|項目|實習|查詢|記錄|資料|文件|工具|報告|project|intern|quer|record|data|document|tool|report)'
    ], '用「我負責……」說清個人工作，與團隊成果分開。沒有金融工作經驗，也可用真實課堂、自學或服務例子。', negativeCompletion),
    pitchLimit: () => criterion('pitch-limit', '誠實交代經驗與學習方向', [
      '(?:未曾|尚未|未有|未做|沒有|仍在(?:學習|累積|補足)|需要學|有待學|not yet|have not|haven.t|still learning|need to learn)',
      '(?:銀行|金融|業務|風險|流程|客戶|資料分析|數據分析|實習|從業|bank|financ|risk|process|customer|data analysis|intern|professional)'
    ], '補一句目前還未熟悉的金融工作，以及入職後會怎樣請教或補足；不用假裝已有銀行或風險管理經驗。'),
    ownership: () => criterion('project-ownership', '分清自己的工作與團隊範圍', [
      '(?:我(?:主要|具體|親自)?(?:負責|做|整理|建立|設計|檢查|協助)|my role|I (?:was responsible|owned|built|designed|checked|helped|organis|organiz))',
      '(?:文件|資料|檢索|測試|分類|訪談|說明|問題|紀錄|記錄|活動|交接|data|document|retriev|test|classif|interview|record|explain|event|handover)'
    ], '把「我們做了」拆成你親自處理的資料、工作及交付物；課堂、實習和服務經驗都可以。', negativeCompletion),
    projectMethod: () => criterion('project-method', '解釋做法及選擇理由', [
      '(?:因為|目的是|為了|避免|所以|先[^。]{0,30}再|because|so that|in order|to avoid|first[^.]{0,40}then)',
      '(?:來源|資料|文件|分類|檢索|訪談|對照|測試|溝通|需要|流程|source|data|document|classif|retriev|interview|test|communicat|need|process)'
    ], '說出一個取捨與原因，例如先分類查詢再改寫說明，因為不同客戶遇到的問題未必相同。'),
    projectEvidence: () => criterion('project-evidence', '用紀錄支持成果與限制', [
      '(?:紀錄|記錄|錯例|例子|對照|測試表|回饋|核對表|人工核對|record|log|example|comparison|test case|feedback|checklist|manual review)',
      '(?:顯示|發現|觀察|改善|仍|限制|不足|未|核對|比較|show|found|observ|improv|limit|still|check|compar)'
    ], '補一個實際觀察或可展示的紀錄；只說「效果不錯」不夠。未有成效證據時，直接說明限制。', negativeCompletion),
    testCoverage: () => criterion('test-coverage', '分清客戶需要與未確認條件', [
      '(?:客戶|需要|用途|情況|customer|need|purpose|situation)',
      '(?:缺|未齊|不足|未確認|條件|限制|例外|missing|incomplete|unconfirmed|condition|limit|exception)'
    ], '先了解客戶想辦甚麼、何時需要，再列出未齊資料或未確認的條件；不要一開始就承諾辦妥。'),
    testGrounding: () => criterion('test-grounding', '根據正式資料核對條件', [
      '(?:來源|原始|文件|條件|流程|紀錄|記錄|reference|source|document|condition|procedure|record)',
      '(?:核對|對照|一致|確認|批准|覆核|比較|check|compar|confirm|approv|review|consistent)'
    ], '說清會查哪份正式說明、流程或原始紀錄，以及向哪位負責同事確認；不要用印象代替核對。'),
    testAction: () => criterion('test-action', '把問題交給合適同事跟進', [
      '(?:異常|錯誤|不足|缺|風險|問題|例外|abnormal|error|missing|risk|issue|exception)',
      '(?:暫停|標示|轉交|主管|修正|記錄|紀錄|補|跟進|覆核|pause|flag|refer|supervisor|fix|record|log|follow.up|review|escalat)'
    ], '補上誰跟進資訊缺口或例外、何時更新進度；未確認前，清楚說明限制，不代替有權限的同事批准。'),
    riskData: () => criterion('risk-data', '核對異常資料的來源與口徑', [
      '(?:來源|版本|時間|日期|source|version|time|date)',
      '(?:口徑|定義|範圍|重複|一致|差異|核對|比較|definition|scope|duplicat|consistent|discrepan|check|compar)'
    ], '先查來源、日期、版本及統計口徑，弄清差異是資料問題還是真實異常；不要直接挑一個看起來合理的數字。'),
    riskSlice: () => criterion('risk-slice', '把異常拆成可跟進的情況', [
      '(?:分組|分開|分別|各類|不同|按|slice|segment|separat|different|group)',
      '(?:流程|階段|來源|日期|完成|未完成|缺|待|例外|process|stage|source|date|complete|missing|pending|exception)'
    ], '按流程階段、來源或資料是否齊備分開查看，列出哪些已核對、哪些仍待確認，再說明潛在影響。'),
    privacy: () => criterion('responsible-privacy', '保護客戶資料並使用合適渠道', [
      '(?:不(?:應|會|可以)?(?:直接)?(?:上傳|使用|輸入|貼上|收集|轉發|傳送)|移除|遮蓋|遮擋|刪除|最少|最小|合成|虛構|去識別|anonym|synthetic|redact|minimi[sz]|remove|do not (?:upload|forward|send)|don.t (?:upload|forward|send)|avoid (?:uploading|sharing))',
      '(?:資料|身份|姓名|電話|客戶|個人|data|identity|name|phone|customer|personal)'
    ], '指出不應把客戶資料轉發到未確認的私人渠道；只用經團隊確認的渠道，並減少不必要資料。'),
    human: () => criterion('responsible-human', '超出權限時請合適同事處理', [
      '(?:不足|不確定|無法|缺|敏感|例外|風險|權限|uncertain|missing|insufficient|sensitive|exception|risk|authority)',
      '(?:同事|主管|覆核|轉交|接手|review|supervisor|colleague|escalat|handover)'
    ], '說清甚麼情況要轉交主管或指定同事，例如資料未齊、要求越過程序，或決定超出自己的權限。'),
    audit: () => criterion('responsible-trace', '如實記錄狀態並交代責任', [
      '(?:記錄|紀錄|版本|來源|權限|範圍|log|record|version|source|access|scope)',
      '(?:覆核|追溯|待確認|查證|檢查|批准|限制|負責|review|trace|pending|check|approv|limit|responsib)'
    ], '保留查詢及跟進紀錄，將未完成的核對標為待確認，寫清負責人；不能為趕進度而寫成已批准。'),
    plain: () => criterion('communication-plain', '用白話說清未確認的限制', [
      '(?:條件|文件|資料|流程|進度|狀態|口徑|缺|condition|document|data|process|progress|status|definition|missing)',
      '(?:未確認|待確認|未齊|不代表|不等於|未必|不能保證|不保證|不一定|可能|仍需|unconfirmed|pending|incomplete|may|might|does not mean|doesn.t mean|not guarantee|not always|still need)'
    ], '直接說清現在已知道甚麼、還欠甚麼；例如「收到申請不代表已完成審核，仍要核對文件」。'),
    propose: () => criterion('communication-propose', '提出可執行的跟進安排', [
      '(?:先|建議|可以|安排|改為|不如|propose|suggest|first|instead|could|arrange)',
      '(?:核對|補充|更新|回覆|覆核|聯絡|文件|待確認|負責|check|supplement|update|reply|review|contact|document|pending|owner)'
    ], '給對方一個能夠前進的安排，例如先更新已確認部分、列明待辦，再找負責同事補資料。'),
    clarify: () => criterion('communication-clarify', '確認需要、負責人與回覆時間', [
      '(?:確認|想了解|請問|需要|關心|對齊|confirm|clarif|understand|need|concern|align)',
      '(?:誰|哪|甚麼|什麼|目的|同事|負責|下一步|何時|回覆|who|which|what|purpose|colleague|owner|next step|when|reply)'
    ], '先確認對方的需要或期限，再約定誰負責核對、誰回覆，以及何時更新進度；不把更新時間說成辦妥承諾。')
  };

  function confirmedProfile(input) {
    const source = input || profiles[0];
    const original = profiles.find(profile => profile.id === source.id);
    const editableFields = ['school', 'focus', 'experience', 'project', 'summary'];
    // An edited demonstration is no longer the original fictional character.
    // Do not key personal examples by id alone, since the UI keeps that id when
    // a user changes the school, project or other confirmed background fields.
    const edited = !original || editableFields.some(key => String(source[key] || '').trim() !== original[key].trim()) ||
      JSON.stringify(source.skills || []) !== JSON.stringify(original.skills);
    const custom = source.custom === true || source.source === 'custom' || source.id === 'custom' || edited;
    const clean = {};
    ['id', 'name', 'label', 'school', 'focus', 'experience', 'project', 'summary'].forEach(key => {
      clean[key] = typeof source[key] === 'string' ? source[key].trim().slice(0, 1800) : '';
    });
    clean.skills = Array.isArray(source.skills) ? source.skills.filter(x => typeof x === 'string').slice(0, 12) : [];
    clean.custom = custom;
    return clean;
  }
  function personalExample(profile, kind, roleId) {
    const risk = roleId === 'risk';
    const roleWork = risk ? '核對資料、辨認異常及交代風險' : '理解客戶需要、核對服務條件及協調跟進';
    if (profile.custom) {
      const background = [profile.school, profile.focus].filter(Boolean).join('，');
      const project = profile.project ? '我想以這項已確認的專題作例子：「' + profile.project + '」。' : '我想用【一件實際做過的工作、課堂或自學任務】作例子。';
      if (kind === 'pitch') return (background ? '我的背景是「' + background + '」。' : '我的背景是【已確認的學習或工作背景】。') + '我曾在【真實任務】親自負責【個人工作】，可以把當中的【可轉移能力】用於' + roleWork + '。我希望投身金融行業，是因為【自己的求職動機】。目前尚未掌握的是【能力或經驗邊界】，我會透過【具體學習安排】補足。';
      return project + '我實際負責【個人工作】，選擇這個做法是因為【當時的理由】，可以用【已有紀錄】說明。目前還不能證明的是【限制】；我會把【可轉移能力】用於本職位的【工作內容】。';
    }
    const bridge = '這段經驗令我想在金融行業從事' + roleWork + '的工作。';
    if (profile.id === 'finance-graduate') {
      return kind === 'pitch'
        ? '我有金融學習背景。課堂專題中，我負責整理虛構訪談記錄，把申請流程的常見誤解改寫成白話說明。' + bridge + '我希望讓服務資訊更清楚，也留意每個說法是否有根據。目前尚未有銀行業務或風險管理的正式工作經驗，會先學習團隊流程，並向負責同事請教。'
        : '在課堂流程研究中，我負責把虛構訪談記錄分成「文件看不懂」和「下一步不清楚」等問題。先做分類，是因為不能只憑自己的感覺改文案。我用原訪談對照改寫說明，記錄仍有歧義的句子；這只是一個課堂研究，沒有真實客戶成效或上線結果。這個經驗讓我練習按證據整理問題，再向不同背景的人說清楚。';
    }
    if (profile.id === 'career-switcher') {
      return kind === 'pitch'
        ? '我有一般客戶服務經驗，正在自學資料分析。自學專題中，我用自己編寫的虛構查詢做分類小工具，負責整理問題與建立測試表。前線經驗讓我留意到，同一句說明也可能被不同人理解錯。' + bridge + '我尚未有銀行工作經驗，想先把金融服務流程和資料核對的基本功做好。'
        : '自學分類工具中，我負責編寫虛構查詢、整理類別與建立測試表。我先把相近問題分開，因為同一個關鍵字未必代表同一個需要。我以手動分類對照工具結果，記錄容易混淆的例子；這只是小型練習，不能代表真實服務環境的表現。可轉移的能力是把模糊問題分清楚、核對依據，再交代限制。';
    }
    return kind === 'pitch'
      ? '我在香港科技大學完成學習，背景結合 AI 與金融。畢業專題做的是 RAG 金融服務 FAQ 助手，我負責整理虛構服務文件、檢索測試與來源標示。實習時也用合成查詢資料協助分類及清理。' + bridge + '吸引我的是把複雜資訊整理清楚，幫助同事作有根據的判斷。我尚未有銀行業務或風險管理的正式工作經驗，入職後會先學習流程、請教主管並做好紀錄。'
      : '我的 FAQ 專題用虛構服務文件作知識庫。我主要負責整理文件、檢索測試及答案來源標示。我先核對資料來源，是因為說法有依據，其他人才能查證。我以測試表對照原文，記錄引用不對及漏掉條件的錯例；資料不足時轉人工。這是課堂示範，沒有正式部署，也未能證明真實服務成效。對金融工作而言，我能帶來的是資料核對、清楚說明限制及留下跟進紀錄的習慣。';
  }

  function rounds(input, roleId) {
    const profile = confirmedProfile(input);
    const risk = roleId === 'risk';
    const role = roles.find(x => x.id === roleId) || roles[0];
    const projectReference = profile.project ? '你確認的專題是：「' + profile.project + '」也可換成你實際做過的工作、實習或活動；重點是個人貢獻與可轉移能力。' : '可用你實際做過的工作、課堂或自學任務作例子；沒有相關經驗也可以直接說明。';
    const general = {name: '何穎', role: '招聘同事 · 虛構角色'};
    const business = {name: '陳朗', role: risk ? '風險管理主管 · 虛構角色' : '銀行業務主管 · 虛構角色'};
    const partner = {name: '梁欣', role: risk ? '營運同事 · 虛構角色' : '前線服務同事 · 虛構角色'};
    const sampleBusiness = risk
      ? '我會先核對兩份紀錄的來源、版本和日期，確認「已完成」的定義與統計範圍是否一致，檢查重複或漏列的申請。再按流程階段、來源及資料是否齊備分組，把已核對和仍待確認的項目分開。差異可能令團隊誤判工作進度，我會先標示問題及可能影響，請營運同事補充原始紀錄，交主管覆核。未確認前不選一份當作定論，也不把資料異常直接說成違規。'
      : '我會先確認客戶想申請哪項服務、用途及何時需要，再整理未齊文件和未確認條件。按正式服務說明及內部流程核對所需資料，向負責同事確認哪些步驟可以先做。對資料不足或例外情況，我會記錄並轉交指定同事跟進；向客戶清楚交代待辦和下次更新時間，不把收到申請說成已批准，也不承諾未確認的完成日期。';
    const sampleResponsible = risk
      ? '我不會把客戶資料轉發到未確認的私人渠道；先移除工作不需要的姓名、電話，向負責同事確認合適的傳送方式。資料不足就如實標示待確認，記錄缺甚麼及誰跟進。要求跳過程序或超出我權限時，轉交主管覆核，保留來源和跟進紀錄。可以先提交已確認部分及待辦清單，但不把未核對項目寫成已完成。'
      : '我不會把客戶文件轉發到未確認的私人渠道，也會移除當次工作不需要的個人資料。我會向同事說明資料未齊，現在不能記成已核對，改用團隊確認的渠道補文件。若要求超出我的權限或出現例外，轉交主管覆核；如實記錄待確認事項、負責人及跟進時間，先讓客戶知道下一步，不為趕進度而代為批准。';
    const sampleCommunication = risk
      ? '我明白你要趕會議，但兩份紀錄的口徑仍待確認，現在直接選其中一份可能誤導大家。我想先確認會議最需要作甚麼決定。不如先提供已核對的部分，將差異和可能影響列為待確認；我負責整理差異，請你聯絡來源同事補充紀錄。我們約定會前何時更新，若仍未查清，就如實交代，並請主管決定下一步。'
      : '我明白你想先安撫客戶，但文件未齊，收到申請不代表已完成審核，現在不能保證今日辦妥。我想先確認客戶最需要哪一項進度資訊。不如先說清已完成及待補的部分，我負責核對文件清單，請你聯絡客戶補充資料；我們再確認由誰及何時回覆進度，讓客戶知道會有人跟進。';
    return [
      {id: 'pitch', label: '背景與動機', interviewer: general,
        question: '先用大約一分鐘介紹自己。為甚麼想投身金融行業？你的背景，怎樣連到「' + role.title + '」這份工作？',
        context: '從已確認的背景出發，揀一個例子便夠；說清求職動機及可轉移能力，不需要逐行背履歷。',
        promptHints: ['為何選金融行業', '自己做過的一件事', '職位連結與學習方向'],
        sampleKind: profile.custom ? 'structure' : 'fictional-example',
        sampleAnswer: personalExample(profile, 'pitch', roleId), strongExample: personalExample(profile, 'pitch', roleId),
        criteria: [c.pitchLink(), c.pitchEvidence(), c.pitchLimit()]},
      {id: 'project', label: '經驗深挖', interviewer: business,
        question: risk ? '挑一段實際經驗。你曾怎樣從資料或紀錄找出問題？哪些工作由你負責，你如何交代結果及限制？' : '挑一段實際經驗。你怎樣了解別人的需要、整理資訊或解決問題？你負責哪部分，為甚麼這樣做？',
        context: projectReference,
        promptHints: ['我負責的部分', '一個做法及理由', '紀錄、結果與限制'],
        sampleKind: profile.custom ? 'structure' : 'fictional-example',
        sampleAnswer: personalExample(profile, 'project', roleId), strongExample: personalExample(profile, 'project', roleId),
        criteria: [c.ownership(), c.projectMethod(), c.projectEvidence()]},
      {id: 'technical_validation', label: risk ? '業務風險判斷' : '金融服務判斷', interviewer: business,
        question: risk ? '兩份內部紀錄對同一批服務申請的「已完成」狀態不一致。主管想在會議前了解有沒有風險，你會怎樣核對、分析及匯報？' : '客戶想盡快完成一項銀行服務申請，但文件未齊，又把「已提交」理解為「已批准」。你會先了解甚麼，再怎樣安排下一步？',
        context: '假設題：申請、客戶及紀錄均為虛構。重點是業務判斷、查證及跟進；不需要背特定銀行流程，也不代替有權限的同事作決定。',
        promptHints: risk ? ['來源與統計口徑', '異常及可能影響', '待確認事項與跟進'] : ['需要與缺少的資料', '正式條件及流程', '下一步與承諾邊界'],
        sampleAnswer: sampleBusiness, strongExample: sampleBusiness,
        criteria: risk ? [c.riskData(), c.riskSlice(), c.testGrounding(), c.testAction()] : [c.testCoverage(), c.testGrounding(), c.testAction()]},
      {id: 'responsible_AI', label: '專業操守與界線', interviewer: business,
        question: risk ? '同事想把含客戶資料的表格轉發到私人通訊群組，並先把未核對項目標成「已完成」來趕報告。你會怎樣回應，又如何讓工作繼續？' : '同事說「客戶急用」，請你把客戶文件轉發到私人通訊群組，並先把資料未齊的申請記成「已核對」。你會怎樣處理？',
        context: '假設題：用具體步驟說明資料保護、如實紀錄及權限界線；不需要背法例，亦不要自行宣布已符合法規。',
        promptHints: ['資料與傳送渠道', '超出權限時怎樣做', '如實記錄及替代安排'],
        sampleAnswer: sampleResponsible, strongExample: sampleResponsible,
        criteria: [c.privacy(), c.human(), c.audit()]},
      {id: 'communication', label: '溝通與協作', interviewer: partner,
        question: risk ? '「個會就開喇，兩份紀錄揀一份放入簡報先啦。」假設我是一位營運同事，你會怎樣回覆我，並提出可行的安排？' : '「客人等咗好耐，你先話今日搞得掂，文件之後再補啦。」假設我是一位前線同事，你會怎樣回覆我，並一起處理這個情況？',
        context: '直接當成同事間的對話，用清楚、有禮的說法回答；理解對方的壓力，同時交代已知、未知及下一步。',
        promptHints: ['理解需要與說清限制', '一個可行跟進安排', '負責人及回覆時間'],
        sampleAnswer: sampleCommunication, strongExample: sampleCommunication,
        criteria: [c.plain(), c.propose(), c.clarify()]}
    ];
  }

  function re(pattern) { return new RegExp(pattern, 'iu'); }
  function segments(text) {
    const result = [];
    const match = /[^。！？!?\n]+[。！？!?\n]*/gu;
    let part;
    while ((part = match.exec(text))) {
      const raw = part[0];
      const leading = raw.length - raw.trimStart().length;
      if (raw.trim()) result.push({text: raw.trim(), start: part.index + leading});
    }
    return result;
  }
  function evaluateEvidence(item, answer) {
    const parts = segments(answer);
    for (let i = 0; i < parts.length; i++) {
      // One sentence or a short adjacent pair, never unrelated keywords scattered
      // throughout a long answer. Exact text is retained for evidence display.
      for (let size = 1; size <= 2 && i + size <= parts.length; size++) {
        const start = parts[i].start;
        const last = parts[i + size - 1];
        const windowText = answer.slice(start, last.start + last.text.length);
        if (windowText.length > 460) continue;
        const matches = item.groups.map(pattern => re(pattern).exec(windowText));
        if (matches.some(m => !m)) continue;
        if (item.blockers.some(pattern => re(pattern).test(windowText))) continue;
        if (!['pitch-limit', 'communication-plain', 'responsible-privacy'].includes(item.id)) {
          const negativeAction = /(?:不會|不需要|不需|不用|不必|不想|不打算|沒有|冇|未有|毋須|無須|唔會|唔使|唔需要|未曾)[^，。；!?\n]{0,12}(?:核對|對照|覆核|測試|驗證|檢查|轉人工|轉交|記錄|紀錄|修正|重測|追溯|分開|切分|保留)|不(?:核對|對照|覆核|測試|驗證|檢查|轉人工|記錄|修正|重測)|(?:do not|don't|will not|won't|would not|wouldn't|did not|didn't|never|no need to)\s+(?:\w+\s+){0,3}(?:check|review|test|validat|record|log|compar|escalat|separat|retest)|(?:review|testing|validation|checking)\s+(?:is|was)\s+(?:not needed|unnecessary)/iu;
          if (negativeAction.test(windowText)) continue;
        }
        // "No sources, no review" is not a positive sourcing plan.
        if (/^(?:沒有|冇|未有|no\b|not\b)/iu.test(windowText) &&
            !/(?:但|會|建議|應|所以|因此|instead|but|will|would|should)/iu.test(windowText) &&
            !/(?:pitch-limit|communication-plain)/u.test(item.id)) continue;
        let lo = Math.min(...matches.map(m => m.index));
        let hi = Math.max(...matches.map(m => m.index + m[0].length));
        lo = Math.max(0, lo - 18);
        hi = Math.min(windowText.length, Math.max(hi + 24, lo + 65));
        const quote = windowText.slice(lo, Math.min(hi, lo + 210)).trim();
        return quote;
      }
    }
    return '';
  }
  function meaningful(answer) {
    const compact = answer.replace(/\s/g, '');
    const chars = (compact.match(/[\p{Script=Han}]/gu) || []).length;
    const words = (answer.match(/[a-z]{2,}/gi) || []).length;
    return chars >= 12 || words >= 9;
  }
  const followSamples = {
    'pitch-link': '我曾在【真實任務】負責【個人工作】，這項能力可以用於本職位的【金融工作內容】。我想投身金融行業，是因為【自己的動機】，也希望補足【需要學習的部分】。',
    'pitch-evidence': '這項任務中，我親自負責【實際工作】；團隊其他成員負責【其他分工】。我可以拿【已有交付物或紀錄】說明自己的貢獻。',
    'pitch-limit': '我目前還未做過【金融工作或經驗邊界】，所以不會把現有練習等同正式工作。入職後我想先請教【合適同事】，透過【具體學習安排】逐步補足。',
    'project-ownership': '我親自負責的輸入是【資料或材料】，做了【實際工作】，交付了【交付物】。其他部分由【實際負責人或團隊】處理。',
    'project-method': '我選【實際做法】，因為當時需要解決【問題】。另一個考慮過的做法是【替代方案】，但它的限制是【當時的取捨理由】。',
    'project-evidence': '目前可以用【實際已有的紀錄】支持【有限的觀察】，未能證明【尚未確認的成效】。下一步我會向【相關人士】補充查證，不能把預期當作已有成果。',
    'test-coverage': '我會先確認客戶的用途、需要及期限，再列出未齊資料和未確認的條件。收到申請不代表已批准，要先把這個分別講清楚。',
    'test-grounding': '我會用正式文件及原始紀錄核對目前的條件與狀態，再向流程負責同事確認；遇到版本或說法不一致時，會把差異記錄下來。',
    'test-action': '若有資料不足或其他異常，我會先標示待確認，記錄問題及可能影響，轉交合適同事跟進，並約定更新時間；不自行代為批准或下定論。',
    'risk-data': '我會先核對資料來源、版本、日期及「已完成」的定義，確認兩份紀錄的統計範圍是否一致，再檢查重複或漏列的項目。',
    'risk-slice': '我會按流程階段、來源及資料是否齊備分組，把已核對和仍待確認的項目分開，列明每類異常及需要找誰查證。',
    'responsible-privacy': '我不會把客戶資料轉發到未確認的私人渠道。先移除當次工作不需要的姓名、電話，再向負責同事確認合適的傳送渠道及存取權限。',
    'responsible-human': '資料不足、出現例外或要求超出我權限時，我會如實說明，轉交主管或指定同事覆核；不為趕時間代為批准。',
    'responsible-trace': '我會保留來源與跟進紀錄，將未核對部分標示為待確認，寫清誰負責補資料及覆核；不能把尚未完成的步驟記成已完成。',
    'communication-plain': '現在的資料仍有待確認之處，所以暫時不能保證結果。我會先說清已核對的部分，再解釋還欠甚麼，讓同事知道限制在哪裏。',
    'communication-propose': '不如先更新已確認的部分，把待辦及資訊缺口列清楚。我可以負責核對文件，請相關同事補充資料，再約定何時回覆進度。',
    'communication-clarify': '我想先確認，你現在最需要哪項資訊，以及何時需要回覆？我們分清誰負責查證、誰聯絡客戶或其他同事，並約定下一次更新時間。'
  };
  function assess(round, rawAnswer) {
    const answer = typeof rawAnswer === 'string' ? rawAnswer.trim().slice(0, 12000) : '';
    const incompleteTemplate = /【[^】]*】/u.test(answer);
    const evidence = round.criteria.map(item => ({item, quote: incompleteTemplate ? '' : evaluateEvidence(item, answer)}));
    const recognizedWords = /(?:金融|銀行|資料|文件|來源|產品|服務|客戶|專題|工作|核對|流程|操守|權限|背景|溝通|風險|經驗|Python|SQL|RAG|AI|financ|bank|data|document|source|product|service|customer|project|check|process|ethic|authority|background|communicat|risk|experience)/iu.test(answer);
    const recognised = !incompleteTemplate && meaningful(answer) && (recognizedWords || evidence.some(x => x.quote));
    const items = evidence.map(({item, quote}) => ({id: item.id, label: item.label,
      status: quote && meaningful(answer) ? 'observed' : recognised ? 'develop' : 'unknown',
      quote: quote && meaningful(answer) ? quote : '', guidance: item.guidance}));
    const missing = items.find(x => x.status !== 'observed');
    const observed = items.find(x => x.status === 'observed');
    let followQuestion;
    if (incompleteTemplate) {
      followQuestion = '這段仍有未填寫的回答骨架，暫時不作線索判讀。請把括號內的提示換成真實內容；沒有做過的部分可以直接說明。';
    } else if (!recognised) {
      followQuestion = '這段回答未提供足夠可辨認的例子，我先不下判斷。可否用一句說明你的做法，再補一句具體例子？';
    } else if (missing) {
      const contextQuote = observed && observed.quote ? '你提到「' + observed.quote.slice(0, 72) + '」。' : '';
      followQuestion = contextQuote + '我想再了解「' + missing.label + '」：' + missing.guidance;
    } else {
      followQuestion = round.id === 'project'
        ? '如果再處理一次這項任務，你會先改善哪一處？請分清已有的觀察，以及仍需要查證的想法。'
        : round.id === 'communication'
          ? '如果對方仍然說「但我哋趕時間」，你會用哪兩句說話，確認需要又守住你提出的安排？'
          : '如果時間有限，你會先保留哪一步，哪一步稍後再做？請說明理由與仍需交代的限制。';
    }
    return {items, recognised,
      summary: !recognised ? '暫未辨認到足夠具體內容；這不代表你的回答錯誤。' : '以下只標示這段回答中可辨認的表達線索，不代表已驗證你的經驗或能力。',
      followUp: {question: followQuestion,
        sampleAnswer: missing ? followSamples[missing.id] || missing.guidance : '我會先核對會影響判斷的重要資料，並清楚交代尚未確認的部分。其他安排列成待辦，確認負責人及回覆時間；不把未完成的工作說成已完成。',
        sampleKind: missing && /【[^】]*】/u.test(followSamples[missing.id] || '') ? 'structure' : 'hypothetical-example',
        why: missing ? '這次追問聚焦目前未清楚表達的「' + missing.label + '」。' : '已辨認到本題的主要表達線索，追問改為練習取捨與限制。'},
      limitation: '本 demo 以有限文字規則標示線索，可能漏掉同義表達或理解不到語境；請對照原文自行檢查。'};
  }

  function report(roundList, rawAnswers) {
    const answers = Array.isArray(rawAnswers) ? rawAnswers : [];
    const details = roundList.map((round, index) => {
      const entry = answers[index];
      const answer = typeof entry === 'string' ? entry : entry && typeof entry.answer === 'string' ? entry.answer : '';
      const followAnswer = entry && typeof entry === 'object' ? entry.followAnswer || entry.followUpAnswer || '' : '';
      return {id: round.id, label: round.label, answer, followAnswer,
        assessment: assess(round, answer),
        revisedAssessment: followAnswer ? assess(round, answer + '\n' + followAnswer) : null};
    });
    const strengths = [], nextSteps = [];
    details.forEach(detail => {
      const chosen = detail.revisedAssessment || detail.assessment;
      chosen.items.forEach(item => {
        const record = {roundId: detail.id, roundLabel: detail.label, ...item};
        if (item.status === 'observed') strengths.push(record); else nextSteps.push(record);
      });
    });
    return {details, strengths, nextSteps,
      title: '你的面試練習回顧',
      guidance: '先挑一個缺少具體例子的回答重寫，再練習用白話交代業務判斷與跟進安排；把個人經驗連到金融職位，並分清真實經歷與假設方案。',
      limitation: '這是表達練習回饋，沒有錄取機率、適任分數或招聘結論；有限文字規則不能代替專業面試評估。'};
  }
  global.HKInterviewContent = {profiles, roles, rounds, assess, report};
})(typeof window !== 'undefined' ? window : globalThis);
