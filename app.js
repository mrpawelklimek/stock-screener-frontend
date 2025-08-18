// Threshold states
let thresholds = {
  min5: 10,
  daily: 25,
  weekly: 15,
  monthly: 20,
  quarter: 30,
  halfyear: 35,
  year: 50
};

let currentData = [];
let alerted5min = new Set();
const ding = document.getElementById('ding');

// Slider bindings
const bindSlider = (id, key, labelId) => {
  const slider = document.getElementById(id);
  const label = document.getElementById(labelId);
  label.textContent = thresholds[key];
  slider.value = thresholds[key];
  slider.addEventListener('input', () => {
    thresholds[key] = parseInt(slider.value);
    label.textContent = thresholds[key];
    renderTable();
  });
};

bindSlider('min5Slider','min5','min5Val');
bindSlider('dailySlider','daily','dailyVal');
bindSlider('weeklySlider','weekly','weeklyVal');
bindSlider('monthlySlider','monthly','monthlyVal');
bindSlider('quarterSlider','quarter','quarterVal');
bindSlider('halfyearSlider','halfyear','halfyearVal');
bindSlider('yearSlider','year','yearVal');

async function fetchData(){
  try{
    const resp = await fetch('/api/stocks');
    const data = await resp.json();
    currentData = data;
    renderTable();
  }catch(e){
    console.error('Fetch error', e);
  }
}

// Filters
function passesFilter(val, raw){
  if(!val) return true;
  val = val.trim();
  const opMatch = val.match(/^\s*(>=|<=|>|<|=)?\s*(-?\d+(?:\.\d+)?)\s*$/);
  if(opMatch && typeof raw === 'number'){
    const op = opMatch[1] || '=';
    const num = parseFloat(opMatch[2]);
    if(op === '>') return raw > num;
    if(op === '>=') return raw >= num;
    if(op === '<') return raw < num;
    if(op === '<=') return raw <= num;
    return raw === num;
  }
  return (String(raw||'').toLowerCase().includes(val.toLowerCase()));
}

// Coloring: green if >= threshold, yellow if >0<threshold, red if <0
function colorFor(value, threshold){
  if(value == null || isNaN(value)) return '';
  if(value < 0){
    // red gradient: stronger red for more negative
    const mag = Math.min(Math.abs(value)/threshold, 2); // cap
    const light = 95 - Math.min(55, mag*25); // 95 -> 40
    return `background-color:hsl(0,85%,${light}%);`;
  }
  if(value === 0) return 'background-color:#f5f5f5;';
  if(value < threshold){
    // yellow band
    const ratio = Math.min(value/threshold, 1);
    const light = 92 - ratio*22; // 92 -> 70
    return `background-color:hsl(50,90%,${light}%);`;
  }
  // green band >= threshold
  const extra = Math.min((value-threshold)/threshold, 2); // 0..2
  const light = 88 - Math.min(48, extra*24); // 88 -> 40
  return `background-color:hsl(135,50%,${light}%);`;
}

function tdNum(val, cls, style=''){
  return `<td class="num cell ${cls||''}" style="${style}">${val}</td>`;
}

function renderTable(){
  const tbody = document.querySelector('#stocksTable tbody');
  const f = Array.from(document.querySelectorAll('thead tr.filters input')).map(i=>i.value);
  tbody.innerHTML='';

  const filtered = currentData.filter(r=>{
    return passesFilter(f[0], r.symbol)
        && passesFilter(f[1], r.name)
        && passesFilter(f[2], r.priceNum)
        && passesFilter(f[3], r.change5minNum)
        && passesFilter(f[4], r.todayChangeNum)
        && passesFilter(f[5], r.weeklyChangeNum)
        && passesFilter(f[6], r.monthlyChangeNum)
        && passesFilter(f[8], r.quarterChangeNum)
        && passesFilter(f[9], r.halfYearChangeNum)
        && passesFilter(f[10], r.yearChangeNum);
  });

  for(const s of filtered){
    const tr = document.createElement('tr');

    // 5min alert
    if(s.change5minNum != null && s.change5minNum >= thresholds.min5){
      tr.classList.add('spike');
      if(!alerted5min.has(s.symbol)){
        try{ ding.currentTime = 0; ding.play(); }catch(e){}
        alerted5min.add(s.symbol);
      }
    }

    const c5 = colorFor(s.change5minNum, thresholds.min5);
    const cd = colorFor(s.todayChangeNum, thresholds.daily);
    const cw = colorFor(s.weeklyChangeNum, thresholds.weekly);
    const cm = colorFor(s.monthlyChangeNum, thresholds.monthly);
    const cq = colorFor(s.quarterChangeNum, thresholds.quarter);
    const ch = colorFor(s.halfYearChangeNum, thresholds.halfyear);
    const cy = colorFor(s.yearChangeNum, thresholds.year);

    tr.innerHTML = `
      <td>${s.symbol}</td>
      <td>${s.name || ''}</td>
      <td class="num">${s.price}</td>
      ${tdNum(s.change5min ?? '-', '', c5)}
      ${tdNum(s.todayChange, '', cd)}
      ${tdNum(s.weeklyChange, '', cw)}
      ${tdNum(s.monthlyChange, '', cm)}
      <td><img class="chart" src="${s.monthlyChart}" alt="monthly ${s.symbol}"/></td>
      ${tdNum(s.quarterChange, '', cq)}
      ${tdNum(s.halfYearChange, '', ch)}
      ${tdNum(s.yearChange, '', cy)}
      <td><img class="chart" src="${s.intradayChart}" alt="intraday ${s.symbol}"/></td>
      <td><img class="chart" src="${s.weeklyChart}" alt="weekly ${s.symbol}"/></td>
    `;
    tbody.appendChild(tr);
  }
}

// Sorting
let sortState = { key:null, dir:1 };
document.querySelectorAll('th[data-key]').forEach(th=>{
  th.addEventListener('click', ()=>{
    const key = th.getAttribute('data-key');
    if(sortState.key === key){ sortState.dir *= -1; } else { sortState.key = key; sortState.dir = 1; }
    currentData.sort((a,b)=>{
      const ka = a[key+'Num'] ?? a[key];
      const kb = b[key+'Num'] ?? b[key];
      if(ka < kb) return -1*sortState.dir;
      if(ka > kb) return 1*sortState.dir;
      return 0;
    });
    renderTable();
  });
});

// Live filter inputs
document.querySelectorAll('thead tr.filters input').forEach(inp=>{
  inp.addEventListener('input', ()=> renderTable());
});

setInterval(fetchData, 10000);
fetchData();
