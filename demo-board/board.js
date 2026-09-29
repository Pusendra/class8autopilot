(function () {
  const EQUIP = { V: 'Van', R: 'Reefer', F: 'Flatbed' };
  const base = new Date();
  base.setMinutes(base.getMinutes() < 30 ? 30 : 60, 0, 0); // next half hour

  const pad = (n) => String(n).padStart(2, '0');
  const at = (h) => new Date(base.getTime() + h * 3600000);
  const md = (d) => `${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
  const hm = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const window_ = ([a, b]) => {
    const s = at(a), e = at(b);
    return md(s) === md(e) ? `${md(s)} ${hm(s)}–${hm(e)}` : `${md(s)} ${hm(s)}–${md(e)} ${hm(e)}`;
  };
  const money = (n) => '$' + n.toLocaleString('en-US');

  function row(l, fresh) {
    const tr = document.createElement('tr');
    tr.dataset.loadId = l.id;
    if (fresh) tr.className = 'new';
    tr.innerHTML = `
      <td class="muted">${l.age}m</td>
      <td>${window_(l.pu)}</td>
      <td>${EQUIP[l.eq]}</td>
      <td>${l.o}</td>
      <td>${l.d}</td>
      <td>${l.mi}</td>
      <td>${l.len} ft</td>
      <td>${l.wt.toLocaleString('en-US')} lbs</td>
      <td>${l.co}</td>
      <td><a href="tel:${l.ph}">${l.ph}</a><br><a href="mailto:${l.em}" class="muted">${l.em}</a></td>
      <td class="rate">${l.rate == null ? '<span class="muted">—</span>' : money(l.rate)}</td>`;
    return tr;
  }

  const body = document.querySelector('#loads tbody');
  const count = document.getElementById('count');
  window.LOADLINE_LOADS.forEach((l) => body.appendChild(row(l)));
  count.textContent = body.rows.length;
  document.getElementById('pickupRange').value = `${md(at(0))} – ${md(at(48))}`;

  let fresh = window.LOADLINE_FRESH.slice();
  document.getElementById('refresh').addEventListener('click', () => {
    const l = fresh.shift();
    if (!l) return;
    body.insertBefore(row(l, true), body.firstChild);
    count.textContent = body.rows.length;
  });
})();
