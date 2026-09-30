function conversationQuestions(id,round=state.round){return currentCase().questions.filter(q=>q.suspectId===id&&q.round===round);}
function wasAsked(id){return state.interviews.some(e=>e.kind==='preset'&&e.questionId===id&&e.round===state.round);}
function replyFor(entry){
 if(entry.kind==='preset')return {text:question(entry.questionId).response,matched:true};
 const normalized=s=>s.replace(/[\s，。！？,.!?]/g,'');
 const candidates=currentCase().questions.filter(q=>q.suspectId===entry.suspectId&&q.round<=entry.round);
 const exact=candidates.find(q=>normalized(q.question)===normalized(entry.text));
 const ranked=candidates.map(q=>({q,score:q.keywords.filter(w=>entry.text.includes(w)).length})).sort((a,b)=>b.score-a.score||b.q.round-a.q.round);
 const match=exact||((ranked[0]?.score||0)>0?ranked[0].q:null);
 return match?{text:match.response,matched:true}:{text:person(entry.suspectId).rounds[entry.round-1],matched:false};
}
function interviewHTML(entry){const p=person(entry.suspectId),q=entry.kind==='preset'?question(entry.questionId).question:entry.text,reply=replyFor(entry);return '<div class="d-interview-entry"><div class="d-player d-interview-player"><small>你問 '+esc(p.name)+'</small>'+esc(q)+'</div>'+(entry.kind==='custom'?'<p class="d-demo-note">'+(reply.matched?'按問題關鍵字配對嘅預設回應。':'呢個問題未有對應示範回應，以下係呢位角色本輪可補充嘅資料。')+'</p>':'')+speech(p.id,reply.text)+'</div>';}
function followupForm(p){const draft=state.questionDrafts[p.id]||'';return '<form id="d-question-form" class="d-followup"><label for="d-question-input">自己問 '+esc(p.name)+'</label><textarea id="d-question-input" name="question" rows="3" maxlength="500" placeholder="例如：你呢句說法有咩依據？">'+esc(draft)+'</textarea><p class="d-demo-note">示範會按關鍵字配對角色回應，唔係即時 AI 對話。</p><div class="d-followup-actions"><button class="d-primary" type="submit" id="d-question-send"'+(draft.trim()?'':' disabled')+'>發送追問 '+icon('send')+'</button></div></form>';}
function afterInterview(){state.interviews=state.interviews.slice(-60);notice=person(state.target).name+'嘅示範回應已顯示。';save();render();root.querySelector('#d-interview-log .d-interview-entry:last-child')?.scrollIntoView({block:'nearest',behavior:'instant'});}
function submitFollowup(){if(state.screen!=='case'||state.stage!==1)return;const value=cleanText(root.querySelector('#d-question-input').value,500);if(!value)return;state.interviews.push({kind:'custom',suspectId:state.target,text:value,round:state.round});state.questionDrafts[state.target]='';afterInterview();}
