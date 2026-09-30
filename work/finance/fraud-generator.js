/* Local topic matcher. It assembles an authored demonstration; it is not a live AI service. */
window.HKFinanceFraudGenerator=Object.freeze({
 select(topic,seed,domain,cases,domains){
  const patterns={bank:/銀行|戶口|短訊|密碼|驗證|裝置|螢幕|支援|登入|客服/,insurance:/保險|保單|理賠|核保|承保|保障|代辦|文件/,group:/群|海報|官方|見證|截圖|理財|投資|平台|認可/};
  const chosen=domain||Object.keys(patterns).find(id=>patterns[id].test(topic))||domains[(seed>>>0)%domains.length].id;
  const candidates=domains.find(d=>d.id===chosen).cases.map(e=>e.key);
  const favored=/螢幕|工具|權限|支援/.test(topic)?'bank-screen':/密碼|短訊|驗證/.test(topic)?'bank-code':/核保|承保|生效/.test(topic)?'insurance-cover':/理賠|代辦/.test(topic)?'insurance-claim':/見證|同稿|示範/.test(topic)?'group-testimony':/海報|官方|認可/.test(topic)?'group-logo':null;
  const key=candidates.includes(favored)?favored:candidates[(seed>>>0)%candidates.length];
  return {key,domain:chosen};
 }
});
