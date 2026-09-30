const CASES=[
 {id:'service',title:'銀行服務助理',tag:'將經驗講具體',desc:'你做過校園活動接待，而家要解釋點樣將經驗帶到服務崗位。',person:'你係阿晴，虛構應屆畢業生。你曾喺校園活動做接待，用一張清單核對參加者登記，亦試過遇到姓名唔喺名單上嘅訪客。',opening:'你做過校園接待。揀一件事，講吓點樣幫到你做服務助理？',presets:[['我會耐心聆聽，清楚解釋。之前做接待時，我會先問清楚對方需要。','有位訪客嘅姓名唔喺登記清單上。我先請佢等候，核對登記記錄，再向負責同學確認，最後解釋安排。'],['我會再核對清單，唔會憑印象答應。若然資料對唔上，我會記低差異，再交畀負責同學確認。','我會先講清楚而家知道嘅資料，同未確認嘅部分，再請對方覆述下一步，睇吓有冇誤會。'],['我明白對方趕時間。我會解釋仍然要核對嘅部分，提供等候安排，同時向負責人求助，唔會先答應未確認嘅結果。','我會先問清楚對方最急嘅需要，再講我可以即刻做嘅事，同需要由負責人確認嘅事。']]},
 {id:'operations',title:'保單行政助理',tag:'將處理步驟講清楚',desc:'兩份虛構文件版本唔同。你要交代會點核對、記錄同交接。',person:'你係阿朗，虛構轉職應徵者。你曾幫社區中心整理活動文件，發現報名表同出席表嘅版本日期唔同；你有保留原檔同記錄差異。今次應徵保單行政助理。',opening:'你發現兩份文件嘅版本日期唔同。你會點處理，點樣畀同事接手？',presets:[['我會細心核對，確保唔會出錯，再通知同事。','我會保留原檔，記錄兩個版本日期同有差異嘅欄位，再向文件負責人確認。確認之前，唔會自行覆蓋原檔。'],['我會將未確認嘅欄位列成清單，寫明已問邊位同事、仍欠咩資料，交接時逐項講清楚。','我會再問文件負責人，並將回覆連同版本日期記錄，方便其他同事知道依據。'],['我會向主管交代已核對同未核對嘅部分，請佢決定處理次序；唔會為咗趕時間當作已確認。','我會先保留原檔，標記待確認欄位，再約定交接時間，等接手同事知道邊啲仍需跟進。']]}
];
const fresh=()=>({version:1,view:'home',caseId:null,round:0,answers:[],draft:'',question:'',coaches:[]});
let s=R.load(fresh());
if(!['home','answer','feedback','result'].includes(s.view)||!Array.isArray(s.answers)||s.round>2||s.round<0||(!CASES.some(c=>c.id===s.caseId)&&s.view!=='home'))s=fresh();
const current=()=>CASES.find(c=>c.id===s.caseId)||CASES[0];
function scan(text){
 if(/唔使核對|不用核對|毋須核對|跳過核對|直接答應|隨便答/.test(text))return {kind:'shortcut',label:'直接略過確認',quote:text.match(/唔使核對|不用核對|毋須核對|跳過核對|直接答應|隨便答/)[0]};
 const groups=[['record','記錄同交接',/原檔|版本|日期|記錄|紀錄|交接|差異/],['check','核對資料',/清單|核對|逐項|確認|名單/],['listen','聆聽同解釋',/聆聽|解釋|問清楚|需要|覆述/],['support','請人協助',/主管|負責人|求助|同事|同學/]];
 for(const [kind,label,re] of groups){const m=text.match(re);if(m)return {kind,label,quote:m[0]}}
 return {kind:'unknown',label:'未配對到情境重點',quote:''};
}
function coach(text,round){
 const m=scan(text), context=current().id==='service';
 const start=m.kind==='unknown'?'呢段自由輸入未配對到預設情境重點，演示未能判斷意思。保留咗你嘅原文，下面係本輪可用嘅整理提示。':m.kind==='shortcut'?'你寫咗「'+m.quote+'」。呢個做法會令尚未確認嘅資料被當作確定；試吓補寫你會先查證嘅一步。':'你提到「'+m.quote+'」，今輪會沿住「'+m.label+'」追問。關鍵字只幫手配對話題，唔代表答案已經完整。';
 const tips=context?['補齊一件事：訪客遇到咩問題、你親自做咗咩、下一步交畀邊個確認。唔使加一個背景冇講過嘅成功結果。','將「我會核對／解釋」拆成一句實際會講嘅說話，再寫清楚仍然未知道嘅部分。','一邊回應趕時間嘅心情，一邊講清楚可即刻做嘅事，同需要等待確認嘅事。']:['用「保留原檔 → 記低差異 → 找負責人確認」交代流程；版本日期可以比「細心」更具體。','交接記錄可寫：邊個欄位有差異、向邊位查詢、未回覆之前點標記。','交代處理次序同交接安排，並清楚標示待確認項目；唔好替未完成嘅核對作結論。'];
 return {kind:m.kind,label:m.label,reflection:start,tip:tips[round]};
}
function nextQuestion(text,next){
 const m=scan(text), c=current();
 if(next===2)return c.id==='service'?'訪客話：「我趕時間，你直接畀我入去啦。」你會點答？':'主管話：「快啲交，未核對嘅先當冇問題。」你會點交代而家嘅狀態？';
 if(m.kind==='unknown')return '我想更了解你嘅處理步驟。請用上面嘅虛構背景，補一個你會親自做嘅動作。';
 if(m.kind==='shortcut')return '如果直接答應之後先發現資料唔一致，你要點同對方解釋？你會喺邊一步先確認？';
 if(m.kind==='record')return '你提到「'+m.quote+'」。如果下一位同事未在場，你會喺交接記錄寫低邊幾樣嘢？';
 if(m.kind==='check')return '你提到「'+m.quote+'」。如果核對後仍然對唔上，你會點做，同點向對方解釋？';
 if(m.kind==='listen')return '你提到「'+m.quote+'」。試講一句你會對對方講嘅說話，再講你點確認佢明白。';
 return '你提到「'+m.quote+'」。請人協助之前，你會先整理邊啲已知同未知嘅資料？';
}
function context(){return '<aside class="cv-panel cv-soft cv-context"><strong>只用呢份虛構背景</strong><p>'+E(current().person)+'</p></aside>'}
function home(){R.render(R.hero()+'<h2 class="cv-home-heading">揀一份工，坐低傾吓</h2><div class="cv-cases">'+CASES.map((c,i)=>'<button class="cv-case" data-case="'+c.id+'"><span>面試 '+String(i+1).padStart(2,'0')+' · '+E(c.tag)+'</span><strong>'+E(c.title)+'</strong><small>'+E(c.desc)+'</small><span class="cv-start-hint">用虛構背景開始 →</span></button>').join('')+'</div><p class="cv-note">唔使真實履歷。三輪練習，最後帶走自己嘅回答。</p>'+R.note())}
function answer(){
 const c=current();R.render(R.top(c.title)+R.steps(['講經驗','接追問','應對變化'],s.round)+'<h1>第 '+(s.round+1)+' 輪面試</h1>'+context()+'<section class="cv-question"><span>面試官</span><h2>'+E(s.question)+'</h2></section>'+R.field('interview-answer','你會點答？',s.draft,'用上面嘅虛構背景，講出你會點做。',700)+'<div class="cv-presets"><button class="cv-chip" data-preset="0">用一個簡短方向起稿</button><button class="cv-chip" data-preset="1">用具體步驟起稿</button></div><div class="cv-actions">'+R.btn('講完，聽吓追問','submit')+'</div>'+R.note());R.bindField('interview-answer',v=>{s.draft=v;R.save(s)})
}
function feedback(){
 const a=s.answers[s.round],co=s.coaches[s.round];if(!a||!co){s.view='answer';answer();return}
 R.render(R.top(current().title)+R.steps(['講經驗','接追問','應對變化'],s.round)+'<h1>將回答講實一步</h1><div class="cv-panel"><p class="cv-kicker">你喺第 '+(s.round+1)+' 輪嘅回答</p><p class="cv-answer cv-gap-sm">'+E(a.text)+'</p></div><div class="cv-coach"><strong>回應線索</strong><p>'+E(co.reflection)+'</p><strong class="cv-gap-sm">可以點講得更具體</strong><p>'+E(co.tip)+'</p></div><div class="cv-actions">'+R.btn(s.round===2?'收好今次面試筆記':'接住面試官嘅追問','next')+R.btn('改一改呢輪回答','edit',true)+'</div><p class="cv-note">呢度整理表達內容，唔設招聘分數或錄取預測。</p>'+R.note())
}
function result(){
 R.render(R.top(current().title)+'<section class="cv-result-title"><span class="cv-kicker">三輪面試完成</span><h1>你嘅面試練習簿</h1><p class="cv-muted">留低三次回答，同每輪值得補清楚嘅地方。</p></section><div class="cv-transcript">'+s.answers.map((a,i)=>'<article><span class="cv-kicker">第 '+(i+1)+' 輪</span><h3>'+E(a.question)+'</h3><p class="cv-answer">'+E(a.text)+'</p><div class="cv-coach"><strong>下一次可以再練</strong><p>'+E(s.coaches[i].tip)+'</p></div></article>').join('')+'</div><div class="cv-actions">'+R.btn('複製面試筆記','copy')+R.btn('重新試呢份工','restart',true)+R.btn('試另一份工','home',true)+'</div><p class="cv-note">虛構應徵情境 · 只供表達練習</p>'+R.note())
}
function render(){({home,answer,feedback,result}[s.view]||home)()}
function start(id){s={...fresh(),view:'answer',caseId:id,question:CASES.find(c=>c.id===id).opening};R.save(s);R.prepare('面試官準備好喇',render)}
main.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;if(b.dataset.case){start(b.dataset.case);return}
 if(b.dataset.preset!==undefined){R.fill('interview-answer',current().presets[s.round][Number(b.dataset.preset)]);return}
 const a=b.dataset.action;
 if(a==='home'){s=fresh();R.save(s);home()}
 if(a==='submit'){const text=s.draft.trim();if(text.length<4){R.error('寫低一句你會點做，或者用提示起稿。');return}s.answers[s.round]={question:s.question,text};s.coaches[s.round]=coach(text,s.round);s.view='feedback';R.save(s);R.prepare('整理你提到嘅線索',render)}
 if(a==='edit'){s.view='answer';s.draft=s.answers[s.round].text;R.save(s);answer()}
 if(a==='next'){if(s.round===2){s.view='result'}else{s.question=nextQuestion(s.answers[s.round].text,s.round+1);s.round++;s.draft='';s.view='answer'}R.save(s);render()}
 if(a==='restart')start(s.caseId);
 if(a==='copy')R.copy('中環見工記｜'+current().title+'\n虛構情境面試筆記\n\n'+s.answers.map((a,i)=>'第 '+(i+1)+' 輪：'+a.question+'\n我：'+a.text+'\n再練：'+s.coaches[i].tip).join('\n\n'),b);
});
render();
