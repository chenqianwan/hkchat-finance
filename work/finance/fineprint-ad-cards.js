// Authored demonstration copy; photographs are presentation assets only.
const AD_IMAGES=__FINEPRINT_AD_IMAGES__;
function adCard(c){
 const art=AD_IMAGES[c.artworkKey];
 const lines=c.headline.split(/<br\s*\/?\s*>/i);
 return '<article class="fp-ad" data-ad="'+esc(c.artworkKey)+'">'+
  '<img class="fp-ad-photo" src="'+art.src+'" alt="'+esc(art.alt)+'" width="640" height="480" decoding="async">'+
  '<div class="fp-ad-brand">'+esc(c.brand)+'<span>· '+esc(c.label)+'</span></div>'+
  '<h1 data-focus><span class="fp-ad-offer">'+esc(lines.shift())+'</span><span class="fp-ad-promise">'+lines.map(esc).join('<br>')+'</span></h1>'+
  '<div class="fp-ad-details"><div class="fp-ad-pills">'+c.promises.map(p=>'<span>'+esc(p)+'</span>').join('')+'</div>'+
  '<div class="fp-ad-footer">'+esc(c.receipt)+'</div></div></article>';
}
function sourcesHTML(c){
 const insurance=c&&c.sourceGroup==='insurance';
 const source=insurance?'<a href="https://www.ifec.org.hk/web/tc/blog/2025/05/understanding-medical-and-critical-illness-insurance.page" target="_blank" rel="noopener noreferrer">投委會｜看懂醫療及危疾保險</a><a href="https://www.ifec.org.hk/web/common/pdf/publication/sc/tips-buying-insurance-tc.pdf" target="_blank" rel="noopener noreferrer">投委會及保監局｜投保錦囊（PDF）</a>':'<a href="https://www.hkma.gov.hk/chi/smart-consumers/frequently-asked-questions/" target="_blank" rel="noopener noreferrer">金管局｜銀行服務常見問題</a><a href="https://www.hkma.gov.hk/chi/smart-consumers/" target="_blank" rel="noopener noreferrer">金管局｜智醒消費者</a>';
 return '<details class="fp-sources"><summary>閱讀條款的參考資料</summary><div><p>'+(insurance?'完整保單的條款、等候期及不保事項，需要逐項閱讀。':'銀行服務的申請要求、條款及通知安排，需要向有關機構核對。')+'本局的宣傳和條件均屬虛構，官方資料只提供一般閱讀原則。</p>'+source+'<small>資料核對：2026年9月30日</small></div></details>';
}
