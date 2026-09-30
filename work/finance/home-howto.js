const root = document.getElementById('hkhome');
const dialog = root.querySelector('#home-howto');
const title = root.querySelector('#home-howto-title');
const intro = root.querySelector('#home-howto-intro');
const steps = root.querySelector('#home-howto-steps');
const start = root.querySelector('#home-howto-start');
const label = dialog.querySelector('.home-sheet-label');
const choices = document.createElement('div');
choices.className = 'home-role-options';
choices.setAttribute('aria-label', '選擇角色體驗');
steps.after(choices);
let trigger = null;

function open(key, details, button) {
  const copy = HOWTO[key];
  const card = root.querySelector(`.home-app[data-app="${key}"]`);
  if (!copy || !card) return;
  trigger?.setAttribute('aria-expanded', 'false');
  trigger = button || card.querySelector('.home-card-link');
  title.textContent = card.querySelector('h2').textContent;
  label.textContent = details ? '玩法說明' : '今次想試邊個角色？';
  intro.textContent = copy.intro;
  steps.hidden = !details;
  steps.replaceChildren(...copy.steps.map(([headingText, text], index) => {
    const item = document.createElement('li');
    const number = document.createElement('span');
    number.className = 'home-step-number';
    number.textContent = index + 1;
    number.setAttribute('aria-hidden', 'true');
    const body = document.createElement('div');
    const heading = document.createElement('h3');
    heading.textContent = headingText;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    body.append(heading, paragraph);
    item.append(number, body);
    return item;
  }));
  choices.replaceChildren(...(copy.modes || []).map(mode => {
    const link = document.createElement('a');
    link.className = 'home-role-option';
    link.href = `hkchat-${mode.key}-mobile.html`;
    link.dataset.role = mode.key;
    const body = document.createElement('span');
    const name = document.createElement('strong');
    name.textContent = mode.title;
    const description = document.createElement('small');
    description.textContent = mode.description;
    const arrow = document.createElement('span');
    arrow.className = 'home-role-arrow';
    arrow.textContent = '→';
    arrow.setAttribute('aria-hidden', 'true');
    body.append(name, description);
    link.append(body, arrow);
    return link;
  }));
  choices.hidden = !copy.modes?.length;
  start.hidden = !!copy.modes?.length;
  start.href = card.querySelector('.home-card-link').href;
  trigger.setAttribute('aria-expanded', 'true');
  if (!dialog.open) dialog.showModal();
  title.focus({preventScroll:true});
  document.documentElement.classList.add('home-howto-open');
  dialog.scrollTop = 0;
}

root.addEventListener('click', event => {
  const howto = event.target.closest('[data-howto]');
  if (howto) open(howto.dataset.howto, true, howto);
  const group = event.target.closest('[data-role-group]');
  if (group) {
    event.preventDefault();
    const hash = '#role-' + group.dataset.roleGroup;
    if (location.hash !== hash) history.pushState(null, '', hash);
    open(group.dataset.roleGroup, false, group);
  }
});
root.addEventListener('hkchat:open-role-group', event => open(event.detail, false));
dialog.querySelector('.home-sheet-close').addEventListener('click', () => dialog.close());
start.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
});
dialog.addEventListener('close', () => {
  document.documentElement.classList.remove('home-howto-open');
  trigger?.setAttribute('aria-expanded', 'false');
  trigger?.focus({preventScroll:true});
  if (location.hash.startsWith('#role-')) history.replaceState(null, '', '#roles');
});
