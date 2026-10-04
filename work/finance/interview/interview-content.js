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
      summary: '想把 AI 技術變成清楚、可查證的金融服務。專題負責資料整理、檢索測試與來源標示；尚未在真實銀行環境部署。',
      fictional: true, custom: false
    },
    {
      id: 'finance-graduate', name: '金融系應屆畢業生', label: '入門轉向金融科技 · 虛構履歷',
      school: '香港本地大專畢業生', focus: '金融學習背景，正在建立資料分析能力',
      experience: '曾參與虛構校園金融教育活動，整理參加者對服務條款的疑問，製作解說材料。',
      project: '課堂專題：金融服務申請流程研究。以虛構訪談記錄整理常見誤解，設計白話說明與人工支援入口。',
      skills: ['Excel', '基礎 SQL', '資料整理', '訪談', '中英雙語溝通'],
      summary: '熟悉金融服務的使用者角度；能整理資訊與清楚解說。AI 實作經驗仍在累積，希望從產品分析工作開始。',
      fictional: true, custom: false
    },
    {
      id: 'career-switcher', name: '自學轉職資料分析員', label: '跨界起步 · 虛構履歷',
      school: '自學與短期課程背景', focus: '由一般客戶服務轉向資料與金融科技',
      experience: '曾在虛構一般服務團隊處理查詢，整理交接筆記；沒有銀行從業經驗。',
      project: '自學專題：以自行編寫的虛構查詢資料，建立問題分類小工具及簡單測試表。',
      skills: ['Python 基礎', 'Excel', '問題分類', '客戶溝通', '測試紀錄'],
      summary: '希望把前線溝通經驗帶到金融科技團隊。能拆解常見疑問，也會清楚交代自己尚未做過的技術工作。',
      fictional: true, custom: false
    }
  ];

  const roles = [
    {id: 'product', title: 'AI × 金融產品分析員', team: '虛構金融科技團隊 · Graduate / Junior',
      brief: '把使用者需要變成可測試的 AI 服務方案，協調產品、技術及前線同事。',
      skills: ['需求拆解', 'RAG 與資料理解', '成效驗證', '風險意識', '跨團隊溝通']},
    {id: 'risk', title: '模型風險與數據分析員', team: '虛構模型驗證團隊 · Graduate / Junior',
      brief: '檢查資料與模型測試是否可信，記錄限制，協助團隊決定下一步驗證。',
      skills: ['資料品質', '驗證設計', '錯誤分析', '追溯紀錄', '清楚匯報']}
  ];

  // A criterion is observed only when multiple relevant cues occur together.
  // Wording such as "not tested" must not become evidence of completed testing.
  function criterion(id, label, groups, guidance, blockers) {
    return {id, label, groups, guidance, blockers: blockers || []};
  }
  const negativeCompletion = [
    '(?:沒有|未曾|未有|冇|未做|沒有做|冇做|未有做)[^，。；!?\\n]{0,14}(?:測試|驗證|檢查|記錄|負責|比較)',
    "(?:did not|didn't|have not|haven't|never)\\s+(?:\\w+\\s+){0,3}(?:test|validat|check|record|compar)"
  ];
  const c = {
    pitchLink: () => criterion('pitch-link', '把背景連到職位工作', [
      '(?:AI|人工智能|金融|finance|data|資料|服務|service|溝通|communication|客戶)',
      '(?:需求|分析|測試|驗證|產品|整理|解說|轉化|追溯|analy[sz]|test|validat|product|explain|organis|organiz|trace)'
    ], '挑一項已確認的背景，接上這個職位會做的工作；例如「整理查詢 → 找出使用者誤解」。'),
    pitchEvidence: () => criterion('pitch-evidence', '說明自己做過的一件事', [
      '(?:我(?:曾|有|在|用|負責|做|整理|設計|建立|協助|檢查)|my role|I (?:worked|built|created|organis|organiz|checked|designed|was responsible|helped))',
      '(?:專題|項目|實習|查詢|記錄|資料|文件|工具|報告|project|intern|quer|record|data|document|tool|report)'
    ], '用「我負責……」說清個人工作，與團隊成果分開。沒有相關工作經驗，也可用真實課堂或自學例子。', negativeCompletion),
    pitchLimit: () => criterion('pitch-limit', '誠實交代學習或經驗邊界', [
      '(?:未曾|尚未|未有|未做|沒有|仍在(?:學習|累積|補足)|需要學|有待學|not yet|have not|haven.t|still learning|need to learn)',
      '(?:部署|銀行|金融|驗證|實作|資料分析|數據分析|檢索|模型|production|bank|financ|validat|deploy|data analysis|retriev|model|\\b(?:AI|RAG|SQL|Python)\\b)'
    ], '補一句目前還未做過的部分，以及入職後會怎樣請教或補足；不要把課堂專題說成正式部署。'),
    ownership: () => criterion('project-ownership', '分清自己的工作與團隊範圍', [
      '(?:我(?:主要|具體|親自)?(?:負責|做|整理|建立|設計|檢查|協助)|my role|I (?:was responsible|owned|built|designed|checked|helped|organis|organiz))',
      '(?:文件|資料|檢索|測試|分類|訪談|說明|問題|紀錄|記錄|data|document|retriev|test|classif|interview|record|explain)'
    ], '把「我們做了」拆成你親自處理的輸入、工作及交付物；不需要把所有成果都歸到自己。', negativeCompletion),
    projectMethod: () => criterion('project-method', '解釋做法及選擇理由', [
      '(?:因為|目的是|為了|避免|所以|先[^。]{0,30}再|because|so that|in order|to avoid|first[^.]{0,40}then)',
      '(?:來源|資料|文件|分類|檢索|訪談|對照|測試|人工|source|data|document|classif|retriev|interview|test|human)'
    ], '說出一個取捨與原因，例如先整理來源再調整提示，因為答案需要能夠查回文件。'),
    projectEvidence: () => criterion('project-evidence', '用紀錄支持成果與限制', [
      '(?:紀錄|記錄|錯例|例子|對照|測試表|測試集|人工核對|record|log|example|comparison|test set|test case|manual review)',
      '(?:顯示|發現|觀察|改善|仍|限制|不足|未|核對|比較|show|found|observ|improv|limit|still|check|compar)'
    ], '補一個實際觀察或可展示的紀錄；只說「效果不錯」不夠。未有驗證結果時，直接說明尚未驗證。', negativeCompletion),
    testCoverage: () => criterion('test-coverage', '安排不同類型的測試問題', [
      '(?:正常|常見|可回答|known|normal|answerable|typical)',
      '(?:缺資料|資料不足|無來源|過期|矛盾|越界|模糊|無法回答|missing|out.of.scope|outdated|contradict|ambig|unanswerable)'
    ], '同時說出正常問題與邊界案例，例如文件沒有答案、來源互相矛盾、問題含糊或資料過期。'),
    testGrounding: () => criterion('test-grounding', '把回答、來源與判準一起核對', [
      '(?:來源|原文|文件|標準答案|reference|source|document|ground.truth)',
      '(?:核對|對照|一致|支持|正確|人工檢查|人工覆核|比較|check|compar|support|correct|review|consistent)'
    ], '說清誰核對甚麼：用原始文件檢查答案是否獲支持，並記錄引用錯誤、遺漏條件及應轉人工的情況。'),
    testAction: () => criterion('test-action', '發現問題後有明確下一步', [
      '(?:錯誤|失敗|不足|缺|風險|問題|error|fail|missing|risk|issue)',
      '(?:暫停|限制|轉人工|修正|重測|重做|重新測試|記錄|紀錄|再測|補|hold|pause|limit|human|fix|retest|record|log|escalat)'
    ], '補上測試不通過時的處理：記錄錯例、限制試用範圍、修正後重測，並交給合適同事覆核。'),
    riskData: () => criterion('risk-data', '檢查資料來源與測試切分', [
      '(?:來源|版本|時間|重複|訓練|source|version|time|duplicat|train)',
      '(?:洩漏|泄漏|分開|切分|獨立|重疊|leak|split|separat|independent|overlap)'
    ], '說清資料來自哪裏、是否重複，以及訓練與測試資料怎樣分開，避免把看過的例子當成新測試。'),
    riskSlice: () => criterion('risk-slice', '拆開檢查不同情況的表現', [
      '(?:分組|分開|分別|各類|不同|slice|segment|separat|different)',
      '(?:語言|粵語|中文|英文|來源|問題類型|例外|缺|language|Cantonese|English|Chinese|source|question type|edge|missing)'
    ], '不要只看整體結果。補上按語言、問題類型、來源完整度分組查看，並列出容易漏掉的情況。'),
    privacy: () => criterion('responsible-privacy', '先減少不必要的個人資料', [
      '(?:不(?:應|會|可以)?(?:直接)?(?:上傳|使用|輸入|貼上|收集)|移除|遮蓋|遮擋|刪除|最少|最小|合成|虛構|去識別|anonym|synthetic|redact|minimi[sz]|remove|do not upload|don.t upload|avoid uploading)',
      '(?:資料|身份|姓名|電話|客戶|個人|data|identity|name|phone|customer|personal)'
    ], '說清先移除哪些不必要資料、改用合成或去識別資料，以及在合適環境內處理。'),
    human: () => criterion('responsible-human', '不確定時保留人工接手', [
      '(?:不足|不確定|無法|缺|敏感|例外|高風險|越界|uncertain|missing|insufficient|sensitive|exception|high.risk|out.of.scope)',
      '(?:人工|同事|主管|覆核|轉交|接手|human|review|supervisor|colleague|escalat|handover)'
    ], '講一個清楚的接手條件，例如來源不足便停止自動回答，交前線或指定同事覆核。'),
    audit: () => criterion('responsible-trace', '留下可追溯紀錄並限制使用範圍', [
      '(?:記錄|紀錄|版本|來源|權限|範圍|log|record|version|source|access|scope)',
      '(?:覆核|追溯|查回|查證|檢查|批准|限制|負責|review|trace|check|approv|limit|responsib)'
    ], '補上記錄甚麼、由誰覆核，以及試用的範圍；不要用一句「符合要求」代替具體安排。'),
    plain: () => criterion('communication-plain', '用白話解釋模型限制', [
      '(?:來源|文件|資料|答案|source|document|data|answer)',
      '(?:不代表|不等於|未必|不能保證|不保證|不一定|可能|會出錯|不完整|may|might|does not mean|doesn.t mean|not guarantee|not always|can be wrong|incomplete)'
    ], '用一句不用技術縮寫的說法，例如「找到文件，不代表答案一定正確，仍要核對有沒有漏條件」。'),
    propose: () => criterion('communication-propose', '提出可執行的替代安排', [
      '(?:先|建議|可以|安排|改為|不如|propose|suggest|first|instead|could|arrange)',
      '(?:小範圍|內部|試用|人工|覆核|測試|文件|補充|再確認|limited|internal|pilot|human|review|test|document|confirm)'
    ], '給對方一個可以前進的安排，例如先做內部小範圍試用，待指定測試與人工覆核完成再討論擴展。'),
    clarify: () => criterion('communication-clarify', '確認對方需要及下一步責任', [
      '(?:確認|想了解|請問|需要|關心|對齊|confirm|clarif|understand|need|concern|align)',
      '(?:誰|哪|甚麼|什麼|目的|使用者|同事|負責|下一步|回覆|who|which|what|purpose|user|colleague|owner|next step|reply)'
    ], '先確認同事最關心的需要，再約定誰負責補資料或覆核，以及何時回來對齊下一步。')
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
  function personalExample(profile, kind) {
    if (profile.custom) {
      const background = [profile.school, profile.focus].filter(Boolean).join('，');
      const project = profile.project ? '我想以這項已確認的專題作例子：「' + profile.project + '」。' : '我想用【一件實際做過的工作、課堂或自學任務】作例子。';
      if (kind === 'pitch') return (background ? '我的背景是「' + background + '」。' : '我的背景是【已確認的學習或工作背景】。') + '我曾在【真實任務】親自負責【個人工作】，這段經驗可以連到本職位的【工作內容】。目前尚未掌握的是【能力或經驗邊界】，我希望透過【具體學習安排】補足。';
      return project + '我實際負責【個人工作】，選擇這個做法是因為【當時的理由】，可以用【已有紀錄】說明。目前尚未驗證的是【限制】；我建議的下一步是【尚未完成的驗證安排】。';
    }
    if (profile.id === 'finance-graduate') {
      return kind === 'pitch'
        ? '我有金融學習背景，想由使用者需要切入金融科技。課堂專題中，我負責整理虛構訪談記錄，把申請流程的常見誤解改寫成白話說明。這令我想進一步做需求分析與測試。我的 AI 實作仍在累積，尚未參與銀行部署，希望先把資料整理與驗證基本功做好。'
        : '在課堂流程研究中，我負責把虛構訪談記錄分成「文件看不懂」和「下一步不清楚」等問題。先做分類，是因為不能只憑自己的感覺改文案。我用原訪談對照改寫說明，記錄仍有歧義的句子；這只是一個課堂研究，沒有真實客戶成效或上線結果。';
    }
    if (profile.id === 'career-switcher') {
      return kind === 'pitch'
        ? '我由一般客戶服務轉向資料分析。自學專題中，我用自己編寫的虛構查詢做分類小工具，負責整理問題與建立測試表。前線經驗讓我留意到，同一句說明也可能被不同人理解錯。我的 Python 能力仍在累積，未有銀行工作或正式部署經驗，希望由整理資料和核對錯例做起。'
        : '自學分類工具中，我負責編寫虛構查詢、整理類別與建立測試表。我先把相近問題分開，因為同一個關鍵字未必代表同一個需要。我以手動分類對照工具結果，記錄容易混淆的例子；這只是小型練習，不能代表真實服務環境的表現。';
    }
    return kind === 'pitch'
      ? '我在香港科技大學完成學習，背景結合 AI 與金融。畢業專題做的是 RAG 金融服務 FAQ 助手，我負責整理虛構服務文件、檢索測試與來源標示。實習時也用合成查詢資料協助分類及清理。我希望把這些工作連到產品需求與驗證，讓使用者知道答案從哪裏來。尚未在真實銀行環境部署，是我需要繼續學習的部分。'
      : '我的 FAQ 專題用虛構服務文件作知識庫。我主要負責整理文件、檢索測試及答案來源標示；團隊共同處理整體介面。我們先處理來源，是因為只調提示詞不能確保答案有根據。我以測試表對照原文，記錄引用不對及漏掉條件的錯例；資料不足時轉人工。這是課堂示範，沒有正式部署，也未能證明真實使用成效。';
  }

  function rounds(input, roleId) {
    const profile = confirmedProfile(input);
    const risk = roleId === 'risk';
    const role = roles.find(x => x.id === roleId) || roles[0];
    const projectReference = profile.project ? '你確認的專題是：「' + profile.project + '」' : '可用你實際做過的工作、課堂或自學任務作例子；沒有相關經驗也可以直接說明。';
    const general = {name: '何穎', role: '招聘同事 · 虛構角色'};
    const technical = {name: '陳朗', role: risk ? '模型驗證主管 · 虛構角色' : 'AI 產品主管 · 虛構角色'};
    const partner = {name: '梁欣', role: '前線服務同事 · 虛構角色'};
    const sampleTech = risk
      ? '我會先核對資料來源、文件版本與時間，檢查重複例子，讓訓練和測試資料分開，避免洩漏。測試要按中文、英文及問題類型分組，包含正常問題、文件過期、缺資料和互相矛盾的案例。由同事用原始文件核對答案和引用是否一致，記錄錯例與限制。若出現嚴重錯誤，先限制試用，再修正重測，交模型驗證同事覆核。'
      : '我會先整理正常可回答、資料不足、文件過期和問題含糊的測試問題，再由同事以原始文件核對答案與引用是否一致。除了看有沒有答對，也記錄漏條件、引用錯誤，以及本來應轉人工的情況。若仍有關鍵錯誤，先限制內部試用、修正錯例後重測，讓產品與前線同事一起確認下一步。';
    const sampleResponsible = risk
      ? '先不要把真實客戶資料放進未確認的工具，改用合成資料或移除不必要的姓名、電話。核對環境、存取權限和使用範圍，由負責同事確認。來源不足或涉及敏感情況，轉交人工覆核；保留模型版本、資料來源與錯例紀錄以便追溯。趕時間也不應省略這些檢查。'
      : '先不用真實客戶對話做示範，移除姓名、電話等不必要資料，改用合成查詢，並確認團隊允許的處理環境。答案來源不足或問題涉及敏感資料時，停止自動回答，轉交人工同事。試用範圍和覆核負責人要先確認，保留版本、來源及錯誤紀錄，方便追溯。';
    const sampleCommunication = risk
      ? '找到文件，不代表答案一定正確，也可能漏掉條件。我想先確認同事需要的是內部示範，還是讓使用者依賴的回覆。建議先做小範圍內部試用，由我補上來源核對和錯例測試，請前線同事覆核看不懂的說法。我會整理仍未解決的限制，再一起確認下一步由誰負責。'
      : '有來源的答案仍可能漏掉條件，所以我們不能把它說成一定正確。我想先確認，你最需要它幫同事查文件，還是直接回答客戶？建議先做內部小範圍試用，讓同事核對答案；資料不足就轉人工。我負責整理錯例，請你幫忙確認前線最常遇到的問題，再對齊下一步。';
    return [
      {id: 'pitch', label: '背景與動機', interviewer: general,
        question: '先用大約一分鐘介紹自己。你的背景，怎樣連到「' + role.title + '」這份工作？',
        context: '從已確認的背景出發，揀一個例子便夠；不需要逐行背履歷。',
        promptHints: ['一項相關背景', '自己做過的一件事', '想補足的能力'],
        sampleKind: profile.custom ? 'structure' : 'fictional-example',
        sampleAnswer: personalExample(profile, 'pitch'), strongExample: personalExample(profile, 'pitch'),
        criteria: [c.pitchLink(), c.pitchEvidence(), c.pitchLimit()]},
      {id: 'project', label: '專題深挖', interviewer: technical,
        question: risk ? '挑一個你實際做過的專題。哪些資料或測試工作是你親自負責？你用甚麼紀錄知道結果可信到哪一步？' : '挑一個你實際做過的專題。它解決甚麼問題、你負責哪部分，為甚麼選這個做法？',
        context: projectReference,
        promptHints: ['我負責的部分', '一個做法及理由', '證據與未驗證之處'],
        sampleKind: profile.custom ? 'structure' : 'fictional-example',
        sampleAnswer: personalExample(profile, 'project'), strongExample: personalExample(profile, 'project'),
        criteria: [c.ownership(), c.projectMethod(), c.projectEvidence()]},
      {id: 'technical_validation', label: risk ? '模型驗證設計' : '產品驗證設計', interviewer: technical,
        question: risk ? '一個虛構 FAQ 助手在展示時答得流暢。你接到驗證任務，會怎樣檢查資料切分、不同情況及錯誤，才向團隊匯報？' : '團隊想試用一個 RAG 金融服務 FAQ 助手。你會怎樣測試，才知道它不只答得流暢，也沒有漏掉重要條件？',
        context: '假設題：文件與查詢均為虛構，尚未對外使用。可以解釋你會怎樣做，不需要聲稱已做過。',
        promptHints: risk ? ['資料來源與切分', '按情況拆開測試', '錯例與覆核安排'] : ['正常及邊界問題', '答案與原文對照', '不通過時怎樣處理'],
        sampleAnswer: sampleTech, strongExample: sampleTech,
        criteria: risk ? [c.riskData(), c.riskSlice(), c.testGrounding(), c.testAction()] : [c.testCoverage(), c.testGrounding(), c.testAction()]},
      {id: 'responsible_AI', label: '負責任 AI', interviewer: technical,
        question: risk ? '同事想直接用真實客戶查詢測試新工具，並省略部分紀錄來趕示範。你會先確認甚麼，怎樣提出替代安排？' : '同事想把真實客戶對話貼入一個未確認的 AI 工具，說只是做內部示範。你會怎樣處理，同時讓工作繼續？',
        context: '假設題：重點是具體處理步驟；不需要背誦法例，也不要自行宣布已符合法規。',
        promptHints: ['哪些資料不需要', '何時交人工接手', '範圍、權限與紀錄'],
        sampleAnswer: sampleResponsible, strongExample: sampleResponsible,
        criteria: [c.privacy(), c.human(), c.audit()]},
      {id: 'communication', label: '跨團隊溝通', interviewer: partner,
        question: risk ? '我不是技術同事。既然助手每個答案都有來源，為甚麼你還說要覆核？請直接向我解釋，並講一個可以前進的安排。' : '「有來源就應該冇問題啦，點解仲唔可以直接畀客用？」假設我是一位前線同事，你會怎樣回覆我？',
        context: '直接把這裏當成對話，用同事聽得明的說法回答。可以先問清楚需要。',
        promptHints: ['一句白話解釋', '一個可行替代安排', '確認需要與負責人'],
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
    'pitch-link': '我曾在【真實任務】負責【個人工作】，這項工作可以連到職位的【相關工作內容】。我想進一步學習【需要補足的能力】。',
    'pitch-evidence': '這項任務中，我親自負責【實際工作】；團隊其他成員負責【其他分工】。我可以拿【已有交付物或紀錄】作為工作紀錄。',
    'pitch-limit': '我目前還未做過【經驗邊界】，所以不會把現有練習等同正式環境。入職後我想先請教【合適同事】，透過【具體學習安排】逐步補足。',
    'project-ownership': '我親自負責的輸入是【輸入資料或材料】，做了【實際工作】，交付了【交付物】。其他部分由【實際負責人或團隊】處理。',
    'project-method': '我選【實際做法】，因為當時需要解決【問題】。另一個考慮過的做法是【替代方案】，但它的限制是【當時的取捨理由】。',
    'project-evidence': '目前只有【實際已有的紀錄】，未能證明【尚未驗證的成效】。下一步我建議建立獨立測試案例，對照原始資料，記錄錯例後再判斷。',
    'test-coverage': '我會同時準備正常可回答、文件找不到答案、來源過期、內容互相矛盾及問題含糊的案例，分開觀察回答或轉人工是否合適。',
    'test-grounding': '我會請同事用原始文件核對答案與引用是否一致，特別檢查有沒有漏掉適用條件；把不一致的地方記錄成錯例。',
    'test-action': '若仍有關鍵錯誤，我會先限制試用範圍，記錄錯例與原因；修正後以相同判準重測，再交負責同事覆核。',
    'risk-data': '我會核對資料來源、文件版本及時間，檢查重複例子，讓訓練與測試資料保持分開，避免測試答案已經出現在訓練內容。',
    'risk-slice': '我會把中文、英文、正常問題及缺資料問題分開檢查，列出各類錯例，不用一個整體結果掩蓋某類問題的不足。',
    'responsible-privacy': '先不要把真實客戶資料放進未確認的工具。移除不必要的姓名、電話，改用合成查詢，並向負責同事確認處理環境及存取權限。',
    'responsible-human': '來源不足、答案互相矛盾或涉及敏感情況時，我會停止自動回答，清楚說明限制，轉交指定人工同事覆核。',
    'responsible-trace': '我會記錄使用的文件來源、模型版本、錯例及修改理由，確認誰負責覆核，並限制試用範圍，方便日後追溯。',
    'communication-plain': '找到文件，不代表答案一定正確；它也可能漏掉條件。就像找到一頁說明，仍需要核對這頁是否真的回答了現在的問題。',
    'communication-propose': '不如先安排內部小範圍試用，由同事核對答案；有關鍵錯誤便先修正重測，整理結果後再一起確認下一步。',
    'communication-clarify': '我想先確認，你最需要的是幫同事查文件，還是直接回覆客戶？我可以負責整理測試錯例，請你確認前線最常見的問題，再約定下一次對齊。'
  };
  function assess(round, rawAnswer) {
    const answer = typeof rawAnswer === 'string' ? rawAnswer.trim().slice(0, 12000) : '';
    const incompleteTemplate = /【[^】]*】/u.test(answer);
    const evidence = round.criteria.map(item => ({item, quote: incompleteTemplate ? '' : evaluateEvidence(item, answer)}));
    const recognizedWords = /(?:資料|文件|來源|產品|服務|客戶|專題|工作|測試|驗證|人工|背景|溝通|風險|經驗|Python|SQL|RAG|AI|data|document|source|product|service|customer|project|test|validat|human|background|communicat|risk|experience)/iu.test(answer);
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
        ? '如果再做一次這個專題，你會先改善哪一處？請分清你已有的觀察，以及仍需要驗證的想法。'
        : round.id === 'communication'
          ? '如果對方仍然說「但我哋趕時間」，你會用哪兩句說話，確認需要又守住你提出的安排？'
          : '如果時間有限，你會先保留哪一步，哪一步稍後再做？請說明理由與仍需交代的限制。';
    }
    return {items, recognised,
      summary: !recognised ? '暫未辨認到足夠具體內容；這不代表你的回答錯誤。' : '以下只標示這段回答中可辨認的表達線索，不代表已驗證你的經驗或能力。',
      followUp: {question: followQuestion,
        sampleAnswer: missing ? followSamples[missing.id] || missing.guidance : '我會先保留核對來源與重要條件，因為這決定回覆是否有根據。其餘安排會清楚列成待辦，確認負責人及下一次覆核；不把未完成的工作說成已完成。',
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
      guidance: '先挑一個缺少具體例子的回答重寫，再挑一個技術解釋練習用白話講；保留真實經驗與假設方案的分別。',
      limitation: '這是表達練習回饋，沒有錄取機率、適任分數或招聘結論；有限文字規則不能代替專業面試評估。'};
  }
  global.HKInterviewContent = {profiles, roles, rounds, assess, report};
})(typeof window !== 'undefined' ? window : globalThis);
