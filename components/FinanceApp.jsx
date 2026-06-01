"use client";
import { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const INCOME_CATS = [
  { id:"salary", label:"Μισθός", icon:"💵" },
  { id:"tips",   label:"Tips",   icon:"🤑" },
  { id:"bonus",  label:"Bonus",  icon:"🎯" },
  { id:"other",  label:"Άλλο",   icon:"💰" },
];

const EXPENSE_CATS = [
  { id:"supermarket", label:"Σούπερ Μάρκετ",    icon:"🛒" },
  { id:"fuel",        label:"Βενζίνη",           icon:"⛽" },
  { id:"food",        label:"Φαγητό / Delivery", icon:"🍛" },
  { id:"coffee",      label:"Καφές",             icon:"☕" },
  { id:"drinks",      label:"Ποτά / Νυχτερινή",  icon:"🍺" },
  { id:"beach",       label:"Παραλία",            icon:"🏖️" },
  { id:"transport",   label:"Πλοίο / Μεταφορά",  icon:"🛥️" },
  { id:"health",      label:"Φαρμακείο",          icon:"💊" },
  { id:"shopping",    label:"Ψώνια",             icon:"🛍️" },
  { id:"rent",        label:"Ενοίκιο",            icon:"🏠" },
  { id:"bills",       label:"Λογαριασμοί",        icon:"💡" },
  { id:"other",       label:"Άλλο",              icon:"📌" },
];

const PIE_COLORS = ["#e8a85f","#6b9fd4","#a78bfa","#f0c060","#e07878","#5bbfb5","#ec899a","#84cc16","#fb923c","#60a5fa","#f472b6","#34d399"];

// ─── THEMES ──────────────────────────────────────────────────────────────────

const DARK = {
  bg:"#0b1123", card:"#111d33", card2:"#162038",
  border:"rgba(232,168,95,0.1)", borderSoft:"rgba(240,230,204,0.06)",
  accent:"#e8a85f", accentGlow:"rgba(232,168,95,0.18)",
  red:"#e07878",    redGlow:"rgba(224,120,120,0.15)",
  blue:"#6b9fd4",   blueGlow:"rgba(107,159,212,0.15)",
  gold:"#f0c060",   goldGlow:"rgba(240,192,96,0.15)",
  t1:"#f0e6cc", t2:"#7d90aa", t3:"#3a4f6a",
};

const LIGHT = {
  bg:"#defffe", card:"#f0fffe", card2:"#ffffff",
  border:"rgba(138,171,114,0.25)", borderSoft:"rgba(138,171,114,0.15)",
  accent:"#8aab72", accentGlow:"rgba(138,171,114,0.18)",
  red:"#c0392b",    redGlow:"rgba(192,57,43,0.12)",
  blue:"#2d7a8f",   blueGlow:"rgba(45,122,143,0.12)",
  gold:"#c9a84c",   goldGlow:"rgba(201,168,76,0.15)",
  t1:"#1a2e2e", t2:"#4a6b6b", t3:"#7a9a9a",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt     = (n) => new Intl.NumberFormat("el-GR",{style:"currency",currency:"EUR",maximumFractionDigits:0}).format(n);
const fmtDay  = (d) => new Date(d+"T12:00:00").toLocaleDateString("el-GR",{day:"2-digit",month:"short"});
const fmtFull = (d) => new Date(d+"T12:00:00").toLocaleDateString("el-GR",{day:"2-digit",month:"short",year:"2-digit"});
const mLabel  = (ym) => new Date(ym+"-15").toLocaleDateString("el-GR",{month:"long",year:"numeric"});
const genId   = () => Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const allCats = [...INCOME_CATS,...EXPENSE_CATS];
const getCat  = (id) => allCats.find(c=>c.id===id)||{icon:"📌",label:id};

const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
};
const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
};
const monthStart = (ym) => `${ym}-01`;
const monthEnd   = (ym) => {
  const [y,m] = ym.split("-").map(Number);
  return `${ym}-${String(new Date(y,m,0).getDate()).padStart(2,"0")}`;
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const makeSeed = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const day = (mo,dd) => {
    const d = new Date(y,m+mo,1);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
  };
  return [
    {id:"m01",type:"income", amount:1400,date:day(0,5), description:"Μισθός",           category:"salary"},
    {id:"m02",type:"income", amount:85,  date:day(0,5), description:"Tips",              category:"tips"},
    {id:"m03",type:"income", amount:120, date:day(0,6), description:"Tips",              category:"tips"},
    {id:"m04",type:"expense",amount:55,  date:day(0,6), description:"Σούπερ Μάρκετ",    category:"supermarket"},
    {id:"m05",type:"income", amount:95,  date:day(0,7), description:"Tips",              category:"tips"},
    {id:"m06",type:"expense",amount:30,  date:day(0,7), description:"Βενζίνη",           category:"fuel"},
    {id:"m07",type:"income", amount:140, date:day(0,8), description:"Tips",              category:"tips"},
    {id:"m08",type:"expense",amount:22,  date:day(0,8), description:"Καφές",             category:"coffee"},
    {id:"m09",type:"income", amount:200, date:day(0,9), description:"Tips",              category:"tips"},
    {id:"m10",type:"expense",amount:45,  date:day(0,9), description:"Φαγητό",            category:"food"},
    {id:"m11",type:"income", amount:180, date:day(0,10),description:"Tips",              category:"tips"},
    {id:"m12",type:"expense",amount:60,  date:day(0,10),description:"Ποτά",              category:"drinks"},
    {id:"m13",type:"income", amount:160, date:day(0,14),description:"Tips",              category:"tips"},
    {id:"m14",type:"expense",amount:35,  date:day(0,14),description:"Φαρμακείο",         category:"health"},
    {id:"m15",type:"income", amount:210, date:day(0,16),description:"Tips",              category:"tips"},
    {id:"m16",type:"expense",amount:40,  date:day(0,17),description:"Παραλία",           category:"beach"},
    {id:"m17",type:"income", amount:190, date:day(0,17),description:"Tips",              category:"tips"},
    {id:"a01",type:"income", amount:1400,date:day(-1,5),description:"Μισθός",            category:"salary"},
    {id:"a02",type:"income", amount:680, date:day(-1,7),description:"Tips εβδομάδας",    category:"tips"},
    {id:"a03",type:"expense",amount:120, date:day(-1,8),description:"Σούπερ Μάρκετ",    category:"supermarket"},
    {id:"a04",type:"income", amount:720, date:day(-1,14),description:"Tips εβδομάδας",  category:"tips"},
    {id:"a05",type:"expense",amount:70,  date:day(-1,15),description:"Μεταφορά",         category:"transport"},
    {id:"a06",type:"expense",amount:90,  date:day(-1,20),description:"Νύχτα έξω",       category:"drinks"},
    {id:"r01",type:"income", amount:1400,date:day(-2,5),description:"Μισθός",            category:"salary"},
    {id:"r02",type:"income", amount:550, date:day(-2,5),description:"Tips εβδομάδας",    category:"tips"},
    {id:"r03",type:"expense",amount:80,  date:day(-2,6),description:"Σούπερ Μάρκετ",    category:"supermarket"},
    {id:"r04",type:"income", amount:600, date:day(-2,12),description:"Tips εβδομάδας",  category:"tips"},
    {id:"r05",type:"expense",amount:65,  date:day(-2,15),description:"Φαγητό",           category:"food"},
  ];
};

const SEED = makeSeed();
const DEFAULT_SETTINGS = { name:"", island:"Σέριφος", job:"Bartender", theme:"dark" };

// ─── CSS ─────────────────────────────────────────────────────────────────────

const makeCSS = (isDark) => `
  *,*::before,*::after{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0}
  ::-webkit-scrollbar{width:0}
  input,button,textarea{font-family:'DM Sans',sans-serif}
  input:focus,textarea:focus{outline:none}
  input[type=date]::-webkit-calendar-picker-indicator{filter:${isDark?"invert(.4) sepia(1) saturate(.5)":"invert(0)"}}
  .app-wrap::before{
    content:'';position:fixed;inset:0;pointer-events:none;z-index:0;
    opacity:${isDark?1:0};transition:opacity .4s ease;
    background-image:
      radial-gradient(1px 1px at 20% 15%,rgba(240,230,204,.55) 0%,transparent 100%),
      radial-gradient(1px 1px at 55% 8%, rgba(240,230,204,.4)  0%,transparent 100%),
      radial-gradient(1px 1px at 78% 22%,rgba(240,230,204,.5)  0%,transparent 100%),
      radial-gradient(1px 1px at 35% 35%,rgba(240,230,204,.3)  0%,transparent 100%),
      radial-gradient(1px 1px at 88% 40%,rgba(240,230,204,.45) 0%,transparent 100%),
      radial-gradient(2px 2px at 75% 85%,rgba(232,168,95,.35)  0%,transparent 100%),
      radial-gradient(2px 2px at 28% 92%,rgba(232,168,95,.25)  0%,transparent 100%);
  }
  .app-wrap>*{position:relative;z-index:1}
  @keyframes spin   {to{transform:rotate(360deg)}}
  @keyframes fadeUp {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shim   {0%,100%{opacity:.35}50%{opacity:.85}}
  .fu {animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
  .fu1{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .06s both}
  .fu2{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .12s both}
  .fu3{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .18s both}
  .fu4{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .24s both}
  .fu5{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) .30s both}
  .spin{animation:spin 1.4s linear infinite;display:inline-block}
  .shim{animation:shim 2s ease infinite}
  .hov{transition:transform .2s cubic-bezier(.16,1,.3,1),box-shadow .2s ease}
  .hov:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(0,0,0,.12)}
  .scale:active{transform:scale(.97)}
  .txrow{transition:background .15s ease}
  .txrow:hover{background:rgba(0,0,0,.03)}
`;

// ─── ROOT ────────────────────────────────────────────────────────────────────

export default function FinanceApp() {
  const [txs,      setTxs]      = useState([]);
  const [view,     setView]     = useState("dashboard");
  const [showAdd,  setShowAdd]  = useState(false);
  const [addType,  setAddType]  = useState("expense");
  const [insights, setInsights] = useState([]);
  const [aiLoad,   setAiLoad]   = useState(false);
  const [ready,    setReady]    = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  // Period state: mode = "month" | "custom"
  const [periodMode,   setPeriodMode]   = useState("month");
  const [month,        setMonth]        = useState(currentMonth());
  const [customFrom,   setCustomFrom]   = useState(localDate());
  const [customTo,     setCustomTo]     = useState(localDate());

  const isDark = settings.theme === "dark";
  const T = isDark ? DARK : LIGHT;

  // Derived period dates
  const periodFrom = periodMode==="month" ? monthStart(month) : customFrom;
  const periodTo   = periodMode==="month" ? monthEnd(month)   : customTo;
  const periodLabel = periodMode==="month"
    ? mLabel(month)
    : `${fmtFull(periodFrom)} – ${fmtFull(periodTo)}`;

  useEffect(() => {
    (async () => {
      try {
        const s = localStorage.getItem("fin_v7"); setTxs(s?JSON.parse(s):SEED);
        const r = localStorage.getItem("fin_settings"); if (r) setSettings(JSON.parse(r));
      } catch { setTxs(SEED); }
      setReady(true);
    })();
  }, []);

  useEffect(() => { if (ready) localStorage.setItem("fin_v7", JSON.stringify(txs)); }, [txs,ready]);
  useEffect(() => { if (ready) localStorage.setItem("fin_settings", JSON.stringify(settings)); }, [settings,ready]);

  const updSetting = (k,v) => setSettings(p=>({...p,[k]:v}));

  // ── Derived ──────────────────────────────────────────────────────────────
  const periodTxs  = useMemo(() => txs.filter(t=>t.date>=periodFrom && t.date<=periodTo), [txs,periodFrom,periodTo]);
  const totalInc   = useMemo(() => periodTxs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),  [periodTxs]);
  const totalExp   = useMemo(() => periodTxs.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0), [periodTxs]);
  const totalTips  = useMemo(() => periodTxs.filter(t=>t.category==="tips").reduce((s,t)=>s+t.amount,0),[periodTxs]);
  const totalSal   = useMemo(() => periodTxs.filter(t=>t.category==="salary").reduce((s,t)=>s+t.amount,0),[periodTxs]);
  const totalExtra = useMemo(() => periodTxs.filter(t=>t.type==="income"&&t.category!=="salary"&&t.category!=="tips").reduce((s,t)=>s+t.amount,0),[periodTxs]);
  const balance    = useMemo(() => txs.reduce((s,t)=>t.type==="income"?s+t.amount:s-t.amount,0),[txs]);
  const tipBal     = totalTips - totalExp;
  const isPos      = tipBal >= 0;
  const salUsed    = tipBal<0 ? Math.min(Math.abs(tipBal),totalSal) : 0;

  const catData = useMemo(() => {
    const map = {};
    periodTxs.filter(t=>t.type==="expense").forEach(t=>{
      const c = getCat(t.category);
      if (!map[c.label]) map[c.label]={name:c.label,icon:c.icon,value:0};
      map[c.label].value += t.amount;
    });
    return Object.values(map).sort((a,b)=>b.value-a.value);
  }, [periodTxs]);

  // Cumulative (income - expenses) over time
  const chartData = useMemo(() => {
    const allDates = [...new Set(periodTxs.map(t=>t.date))].sort();
    let running = 0;
    return allDates.map(date => {
      const dayTxs = periodTxs.filter(t=>t.date===date);
      dayTxs.forEach(t => { running += t.type==="income" ? t.amount : -t.amount; });
      return { lbl: fmtDay(date), Υπόλοιπο: Math.round(running) };
    });
  }, [periodTxs]);

  const [splitIncome, setSplitIncome] = useState(false);

  const allMonths = useMemo(() => [...new Set(txs.map(t=>t.date.slice(0,7)))].sort().reverse(), [txs]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const addTx    = (tx) => { setTxs(p=>[{...tx,id:genId()},...p].sort((a,b)=>b.date.localeCompare(a.date))); setShowAdd(false); };
  const delTx    = (id) => setTxs(p=>p.filter(t=>t.id!==id));
  const clearTxs = ()   => { setTxs([]); localStorage.removeItem("fin_v7"); };

  const genInsights = async () => {
    setInsights([]); setAiLoad(true); setView("insights");
    try {
      const payload = {
        περίοδος: periodLabel,
        μισθός: totalSal, tips: totalTips,
        έκτακτα: totalExtra>0?totalExtra:undefined,
        έξοδα: totalExp, tips_μείον_έξοδα: tipBal,
        μισθός_που_χρησιμοποιήθηκε: salUsed,
        κατανομή_εξόδων: catData.map(c=>({
          κατηγορία:c.name, ποσό:c.value,
          ποσοστό:totalExp>0?`${Math.round((c.value/totalExp)*100)}%`:"0%"
        }))
      };
      const res = await fetch("/api/insights",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({payload, month:periodLabel, island:settings.island, job:settings.job})});
      const data = await res.json();
      setInsights(Array.isArray(data.insights)&&data.insights.length>0
        ? data.insights
        : [{type:"warning",title:"Κενή απάντηση",message:"Δοκίμασε ξανά.",icon:"⚠️"}]);
    } catch { setInsights([{type:"warning",title:"Σφάλμα",message:"Δοκίμασε ξανά.",icon:"⚠️"}]); }
    setAiLoad(false);
  };

  if (!ready) return (
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span className="spin" style={{fontSize:"28px",color:T.accent}}>◌</span>
    </div>
  );

  const periodProps = {periodFrom,periodTo,periodLabel,periodMode,setPeriodMode,month,setMonth,customFrom,setCustomFrom,customTo,setCustomTo,allMonths};

  return (
    <div className="app-wrap" style={{fontFamily:"'DM Sans',sans-serif",background:T.bg,minHeight:"100vh",color:T.t1,maxWidth:"430px",margin:"0 auto",position:"relative",overflow:"hidden",transition:"background .4s,color .4s"}}>
      <style>{makeCSS(isDark)}</style>
      <div style={{paddingBottom:"88px",overflowY:"auto",minHeight:"100vh"}}>
        <AppHeader view={view} setView={setView} periodProps={periodProps} settings={settings} T={T}/>
        {view==="dashboard"    && <Dashboard T={T} balance={balance} totalExp={totalExp} totalTips={totalTips} totalSal={totalSal} totalExtra={totalExtra} salUsed={salUsed} isPos={isPos} tipBal={tipBal} catData={catData} chartData={chartData} recentTxs={periodTxs.slice(0,6)} periodLabel={periodLabel} onViewAll={()=>setView("transactions")} onInsights={genInsights}/>}
        {view==="transactions" && <Transactions T={T} txs={periodTxs} onDelete={delTx} periodProps={periodProps}/>}
        {view==="insights"     && <InsightsView T={T} insights={insights} loading={aiLoad} onRegen={genInsights} periodLabel={periodLabel}/>}
        {view==="settings"     && <SettingsView T={T} settings={settings} onUpdate={updSetting} onClear={clearTxs}/>}
      </div>
      <BottomNav T={T} view={view} setView={setView} onAdd={()=>{setAddType("expense");setShowAdd(true);}}/>
      {showAdd && <AddModal T={T} type={addType} setType={setAddType} onAdd={addTx} onClose={()=>setShowAdd(false)}/>}
    </div>
  );
}

// ─── HEADER ──────────────────────────────────────────────────────────────────

function AppHeader({view,setView,periodProps,settings,T}) {
  const [open,setOpen] = useState(false);
  const {periodMode,setPeriodMode,month,setMonth,customFrom,setCustomFrom,customTo,setCustomTo,allMonths,periodLabel} = periodProps;
  const months = allMonths.length>0 ? allMonths : [currentMonth()];

  return (
    <div style={{padding:"52px 22px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",zIndex:10}}>
      {view!=="dashboard"
        ? <button onClick={()=>setView("dashboard")} style={{background:"none",border:"none",color:T.t2,cursor:"pointer",fontSize:"22px",lineHeight:1}}>←</button>
        : <div>
            <div style={{fontSize:"11px",color:T.t3,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"3px"}}>{settings.island||"Wallet"} 🏝️</div>
            <div style={{fontSize:"24px",fontWeight:700,fontFamily:"'Cormorant Garamond',serif",color:T.t1,lineHeight:1}}>
              {settings.name?`Γεια, ${settings.name}`:"Seasonινστας"}
            </div>
          </div>
      }
      {view!=="dashboard" && (
        <span style={{fontSize:"18px",fontWeight:600,fontFamily:"'Cormorant Garamond',serif",color:T.t1}}>
          {view==="transactions"?"Συναλλαγές":view==="insights"?"AI Insights":"Ρυθμίσεις"}
        </span>
      )}
      {view==="dashboard" ? (
        <div style={{position:"relative"}}>
          <button onClick={()=>setOpen(p=>!p)} className="scale"
            style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"14px",padding:"8px 14px",color:T.t1,fontSize:"12px",fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:"6px"}}
          >
            <span>📅</span>
            <span style={{maxWidth:"120px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
              {periodMode==="custom"?"Προσαρμοσμένο":mLabel(month)}
            </span>
          </button>
          {open && (
            <div style={{position:"absolute",right:0,top:"44px",background:T.card2,border:`1px solid ${T.border}`,borderRadius:"18px",zIndex:200,minWidth:"230px",overflow:"hidden",boxShadow:"0 24px 60px rgba(0,0,0,.2)"}}>
              {/* Month options */}
              {months.slice(0,8).map(m=>(
                <button key={m} onClick={()=>{setPeriodMode("month");setMonth(m);setOpen(false);}}
                  style={{width:"100%",padding:"11px 16px",background:periodMode==="month"&&month===m?T.accentGlow:"none",border:"none",color:periodMode==="month"&&month===m?T.accent:T.t2,cursor:"pointer",textAlign:"left",fontSize:"13px",fontWeight:periodMode==="month"&&month===m?600:400,transition:"background .15s"}}
                >{mLabel(m)}</button>
              ))}
              {/* Divider */}
              <div style={{height:"1px",background:T.borderSoft,margin:"4px 0"}}/>
              {/* Custom range */}
              <div style={{padding:"12px 16px"}}>
                <div style={{fontSize:"11px",color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"10px"}}>Προσαρμοσμένο</div>
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  <div>
                    <div style={{fontSize:"10px",color:T.t3,marginBottom:"3px"}}>Από</div>
                    <input type="date" value={customFrom} onChange={e=>{
                      setCustomFrom(e.target.value);
                      if (e.target.value > customTo) setCustomTo(e.target.value);
                    }}
                      style={{background:T.card,border:`1px solid ${T.borderSoft}`,borderRadius:"8px",padding:"6px 10px",color:T.t1,fontSize:"12px",width:"100%",colorScheme:"dark"}}
                    />
                  </div>
                  <div>
                    <div style={{fontSize:"10px",color:T.t3,marginBottom:"3px"}}>Έως</div>
                    <input type="date" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}
                      style={{background:T.card,border:`1px solid ${T.borderSoft}`,borderRadius:"8px",padding:"6px 10px",color:T.t1,fontSize:"12px",width:"100%",colorScheme:"dark"}}
                    />
                  </div>
                  <button onClick={()=>{setPeriodMode("custom");setOpen(false);}} className="scale"
                    style={{padding:"9px",borderRadius:"10px",border:"none",background:T.accent,color:"white",fontSize:"12px",fontWeight:600,cursor:"pointer"}}
                  >Εφαρμογή</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : <div style={{width:"32px"}}/>}
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

function Dashboard({T,balance,totalExp,totalTips,totalSal,totalExtra,salUsed,isPos,tipBal,catData,chartData,recentTxs,periodLabel,onViewAll,onInsights}) {

  return (
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:"14px"}}>

      {/* ── Hero: Expenses + Tips vs Expenses ── */}
      <div className="fu hov" style={{background:T.card,borderRadius:"28px",padding:"28px 26px 24px",border:`1px solid ${T.borderSoft}`,boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
        <div style={{fontSize:"11px",color:T.t3,letterSpacing:".12em",textTransform:"uppercase",marginBottom:"10px"}}>Έξοδα Περιόδου</div>
        <div style={{fontSize:"52px",fontWeight:700,fontFamily:"'Cormorant Garamond',serif",letterSpacing:"-1px",color:T.red,lineHeight:1,marginBottom:"4px"}}>{fmt(totalExp)}</div>
        <div style={{fontSize:"12px",color:T.t3,marginBottom:"22px"}}>{periodLabel}</div>

        {/* Tips vs Expenses */}
        <div style={{paddingTop:"18px",borderTop:`1px solid ${T.borderSoft}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"10px"}}>
            <div>
              <div style={{fontSize:"10px",color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"4px"}}>Tips vs Έξοδα</div>
              <div style={{fontSize:"22px",fontWeight:700,fontFamily:"'Cormorant Garamond',serif",color:isPos?T.accent:T.red}}>
                {isPos?"+":"-"}{fmt(Math.abs(tipBal))}
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:"12px",color:isPos?T.accent:T.red,fontWeight:600,marginBottom:"4px"}}>
                {isPos?"Τα tips καλύπτουν τα έξοδα 🎯":"Έλλειμμα από τον μισθό ⚠️"}
              </div>
              {totalSal>0 && (
                <div style={{fontSize:"12px",color:salUsed===0?T.accent:T.red,fontWeight:600}}>
                  {salUsed===0?"Μισθός ανέπαφος 💰":`Πρόσεχε! -${fmt(salUsed)} από τον μισθό`}
                </div>
              )}
            </div>
          </div>

          {/* Bar */}
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
            <span style={{fontSize:"10px",color:T.t3}}>Tips {fmt(totalTips)}</span>
            <span style={{fontSize:"10px",color:T.t3}}>Έξοδα {fmt(totalExp)}</span>
          </div>
          <div style={{height:"3px",borderRadius:"2px",background:T.borderSoft,position:"relative"}}>
            <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:"2px",background:T.gold,opacity:.85,width:`${Math.min(100,(totalTips/Math.max(totalTips,totalExp,1))*100)}%`,transition:"width 1.2s cubic-bezier(.16,1,.3,1)"}}/>
            <div style={{position:"absolute",left:0,top:0,height:"100%",borderRadius:"2px",background:T.red,opacity:.35,width:`${Math.min(100,(totalExp/Math.max(totalTips,totalExp,1))*100)}%`,transition:"width 1.2s cubic-bezier(.16,1,.3,1)"}}/>
          </div>
        </div>

        {/* Balance small */}
        <div style={{marginTop:"16px",paddingTop:"12px",borderTop:`1px solid ${T.borderSoft}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:"11px",color:T.t3,textTransform:"uppercase",letterSpacing:".06em"}}>Συνολικό Υπόλοιπο</span>
          <span style={{fontSize:"15px",fontWeight:600,color:balance>=0?T.accent:T.red,fontFamily:"'Cormorant Garamond',serif"}}>{fmt(balance)}</span>
        </div>
      </div>

      {/* AI CTA */}
      <button className="fu1 hov scale" onClick={onInsights}
        style={{width:"100%",padding:"16px 20px",background:T.card,border:`1px solid ${T.borderSoft}`,borderRadius:"20px",cursor:"pointer",display:"flex",alignItems:"center",gap:"14px",color:T.t1,textAlign:"left",boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}
      >
        <span style={{fontSize:"22px"}}>✨</span>
        <div style={{flex:1}}>
          <div style={{fontSize:"15px",fontWeight:600,color:T.t1,fontFamily:"'Cormorant Garamond',serif"}}>AI Οικονομική Ανάλυση</div>
          <div style={{fontSize:"12px",color:T.t2,marginTop:"2px"}}>Insights βασισμένα στα δεδομένα σου</div>
        </div>
        <span style={{color:T.accent,fontSize:"18px",opacity:.8}}>→</span>
      </button>

      {/* Cumulative Balance Chart */}
      {chartData.length > 1 && (
        <div className="fu2 hov" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`,boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
          <STitle T={T}>Εξέλιξη Υπολοίπου</STitle>
          <div style={{marginTop:"16px"}}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={chartData} margin={{left:0,right:0,top:4,bottom:0}}>
                <XAxis dataKey="lbl" axisLine={false} tickLine={false} tick={{fill:T.t3,fontSize:10}}/>
                <YAxis hide/>
                <Tooltip
                  contentStyle={{background:T.card2,border:`1px solid ${T.border}`,borderRadius:"12px",color:T.t1,fontSize:"11px",padding:"8px 12px"}}
                  formatter={(v)=>[fmt(v),"Υπόλοιπο"]}
                  cursor={{stroke:T.borderSoft,strokeWidth:1}}
                />
                <Line
                  type="monotone" dataKey="Υπόλοιπο"
                  stroke={T.accent} strokeWidth={2.5}
                  dot={{r:3,fill:T.accent,strokeWidth:0}}
                  activeDot={{r:5}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Donut */}
      {catData.length > 0 && (
        <div className="fu3 hov" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`,boxShadow:"0 4px 24px rgba(0,0,0,.06)"}}>
          <STitle T={T}>Κατανομή Εξόδων</STitle>
          <div style={{display:"flex",alignItems:"center",gap:"14px",marginTop:"16px"}}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={34} outerRadius={54} stroke="none" paddingAngle={2}>
                  {catData.map((_,i)=><Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{flex:1,display:"flex",flexDirection:"column",gap:"8px"}}>
              {catData.slice(0,5).map((c,i)=>(
                <div key={c.name} style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"6px",height:"6px",borderRadius:"50%",background:PIE_COLORS[i%PIE_COLORS.length],flexShrink:0}}/>
                  <span style={{fontSize:"11px",color:T.t2,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.icon} {c.name}</span>
                  <span style={{fontSize:"11px",fontWeight:600,color:T.t1,flexShrink:0}}>{fmt(c.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent */}
      <div className="fu4 hov" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`,boxShadow:"0 4px 24px rgba(0,0,0,.06)",marginBottom:"4px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <STitle T={T}>Πρόσφατες</STitle>
          <button onClick={onViewAll} style={{background:"none",border:"none",color:T.accent,fontSize:"13px",cursor:"pointer",fontWeight:500}}>Όλες →</button>
        </div>
        <div style={{marginTop:"14px",display:"flex",flexDirection:"column",gap:"2px"}}>
          {recentTxs.length===0?<Empty T={T} msg="Δεν υπάρχουν συναλλαγές"/>:recentTxs.map(tx=><TxRow key={tx.id} tx={tx} T={T}/>)}
        </div>
      </div>
    </div>
  );
}

// ─── TX ROW ──────────────────────────────────────────────────────────────────

function TxRow({tx,onDelete,T}) {
  const cat   = getCat(tx.category);
  const isInc = tx.type==="income";
  const isTip = tx.category==="tips";
  const [pend,setPend] = useState(false);

  return (
    <div className="txrow" onClick={()=>onDelete&&setPend(p=>!p)}
      style={{display:"flex",alignItems:"center",gap:"12px",padding:"10px 6px",borderRadius:"14px",cursor:onDelete?"pointer":"default"}}
    >
      <div style={{width:"38px",height:"38px",borderRadius:"12px",background:isInc?(isTip?T.goldGlow:T.accentGlow):T.redGlow,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",flexShrink:0}}>
        {cat.icon}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:"13px",fontWeight:500,color:T.t1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tx.description}</div>
        <div style={{fontSize:"11px",color:T.t3,marginTop:"2px"}}>{cat.label} · {fmtDay(tx.date)}</div>
      </div>
      {pend&&onDelete
        ? <button onClick={e=>{e.stopPropagation();onDelete(tx.id);}} style={{background:T.red,border:"none",color:"white",borderRadius:"9px",padding:"5px 12px",fontSize:"12px",cursor:"pointer",fontWeight:600,flexShrink:0}}>Διαγραφή</button>
        : <div style={{fontSize:"14px",fontWeight:600,color:isInc?(isTip?T.gold:T.accent):T.t1,flexShrink:0,fontFamily:"'Cormorant Garamond',serif"}}>{isInc?"+":"-"}{fmt(tx.amount)}</div>
      }
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────

function Transactions({T,txs,onDelete,periodProps}) {
  const [tab,setTab] = useState("all");
  const {periodMode,setPeriodMode,month,setMonth,customFrom,setCustomFrom,customTo,setCustomTo,allMonths} = periodProps;
  const months = allMonths.length>0 ? allMonths : [currentMonth()];

  const shown  = tab==="all"?txs:tab==="tips"?txs.filter(t=>t.category==="tips"):txs.filter(t=>t.type===tab);
  const expSum = shown.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const incSum = shown.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);

  return (
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:"12px"}}>
      {/* Month chips */}
      <div style={{display:"flex",gap:"8px",overflowX:"auto",paddingBottom:"2px"}}>
        {months.slice(0,12).map(m=>{
          const lbl=new Date(m+"-15").toLocaleDateString("el-GR",{month:"short",year:"2-digit"});
          return (
            <button key={m} onClick={()=>{setPeriodMode("month");setMonth(m);}} className="scale"
              style={{flexShrink:0,padding:"7px 14px",borderRadius:"12px",border:`1px solid ${periodMode==="month"&&month===m?T.accent:T.borderSoft}`,background:periodMode==="month"&&month===m?T.accentGlow:T.card,color:periodMode==="month"&&month===m?T.accent:T.t2,fontSize:"12px",fontWeight:500,cursor:"pointer",transition:"all .25s"}}
            >{lbl}</button>
          );
        })}
        <button onClick={()=>setPeriodMode("custom")} className="scale"
          style={{flexShrink:0,padding:"7px 14px",borderRadius:"12px",border:`1px solid ${periodMode==="custom"?T.accent:T.borderSoft}`,background:periodMode==="custom"?T.accentGlow:T.card,color:periodMode==="custom"?T.accent:T.t2,fontSize:"12px",fontWeight:500,cursor:"pointer",transition:"all .25s"}}
        >⚙ Custom</button>
      </div>

      {/* Custom date range */}
      {periodMode==="custom" && (
        <div className="fu" style={{background:T.card,borderRadius:"16px",padding:"14px 16px",border:`1px solid ${T.accent}40`,display:"flex",gap:"10px",alignItems:"center"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:"10px",color:T.t3,marginBottom:"3px"}}>Από</div>
            <input type="date" value={customFrom} onChange={e=>setCustomFrom(e.target.value)}
              style={{background:"none",border:"none",color:T.t1,fontSize:"13px",width:"100%",colorScheme:"dark"}}
            />
          </div>
          <div style={{color:T.t3,fontSize:"12px"}}>→</div>
          <div style={{flex:1}}>
            <div style={{fontSize:"10px",color:T.t3,marginBottom:"3px"}}>Έως</div>
            <input type="date" value={customTo} min={customFrom} onChange={e=>setCustomTo(e.target.value)}
              style={{background:"none",border:"none",color:T.t1,fontSize:"13px",width:"100%",colorScheme:"dark"}}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",background:T.card,borderRadius:"14px",padding:"4px",gap:"4px",border:`1px solid ${T.borderSoft}`}}>
        {[["all","Όλες"],["income","Έσοδα"],["expense","Έξοδα"],["tips","Tips 🤑"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)}
            style={{flex:1,padding:"8px 4px",borderRadius:"10px",border:"none",background:tab===v?T.card2:"none",color:tab===v?T.t1:T.t3,fontSize:"12px",fontWeight:tab===v?600:400,cursor:"pointer",transition:"all .2s"}}
          >{l}</button>
        ))}
      </div>

      {shown.length===0
        ? <div style={{textAlign:"center",padding:"60px 20px"}}><Empty T={T} msg="Δεν βρέθηκαν συναλλαγές" icon="💸"/></div>
        : <div className="fu" style={{background:T.card,borderRadius:"20px",border:`1px solid ${T.borderSoft}`,overflow:"hidden"}}>
            {shown.map((tx,i)=>(
              <div key={tx.id} style={{borderBottom:i<shown.length-1?`1px solid ${T.borderSoft}`:"none"}}>
                <TxRow tx={tx} onDelete={onDelete} T={T}/>
              </div>
            ))}
          </div>
      }
      {shown.length>0 && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"4px"}}>
          {tab!=="income"&&tab!=="tips"&&expSum>0&&<SumCard T={T} label="Σύνολο Εξόδων" value={`-${fmt(expSum)}`} color={T.red}/>}
          {tab!=="expense"&&incSum>0&&<SumCard T={T} label={tab==="tips"?"Σύνολο Tips":"Σύνολο Εσόδων"} value={`+${fmt(incSum)}`} color={tab==="tips"?T.gold:T.accent}/>}
        </div>
      )}
    </div>
  );
}

// ─── INSIGHTS ────────────────────────────────────────────────────────────────

function InsightsView({T,insights,loading,onRegen,periodLabel}) {
  const INS = {
    positive:{bg:T.accentGlow,border:`${T.accent}40`,clr:T.accent},
    warning: {bg:T.redGlow,   border:`${T.red}40`,   clr:T.red},
    tip:     {bg:T.blueGlow,  border:`${T.blue}40`,  clr:T.blue},
    insight: {bg:T.goldGlow,  border:`${T.gold}40`,  clr:T.gold},
  };
  return (
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:"12px"}}>
      <div style={{fontSize:"12px",color:T.t3,textAlign:"center",letterSpacing:".06em",marginBottom:"2px"}}>Ανάλυση για {periodLabel}</div>
      {loading ? (
        <div style={{textAlign:"center",padding:"64px 20px"}}>
          <div className="spin" style={{fontSize:"30px",marginBottom:"20px",color:T.accent}}>✦</div>
          <div style={{color:T.t2,fontSize:"15px",fontWeight:500,fontFamily:"'Cormorant Garamond',serif"}}>Ο Claude αναλύει τα δεδομένα σου…</div>
          <div className="shim" style={{color:T.t3,fontSize:"12px",marginTop:"10px"}}>Μερικά δευτερόλεπτα…</div>
        </div>
      ) : insights.length===0 ? (
        <div style={{textAlign:"center",padding:"60px 20px"}}>
          <div style={{fontSize:"48px",marginBottom:"18px"}}>🧠</div>
          <div style={{fontSize:"22px",fontWeight:600,fontFamily:"'Cormorant Garamond',serif",color:T.t1,marginBottom:"10px"}}>Έτοιμος για Ανάλυση;</div>
          <div style={{color:T.t3,fontSize:"13px",lineHeight:1.7,maxWidth:"260px",margin:"0 auto 28px"}}>Ο Claude θα αναλύσει τις συναλλαγές σου και θα σου δώσει προσωποποιημένα insights.</div>
          <button onClick={onRegen} className="scale"
            style={{background:T.accent,border:"none",color:"white",padding:"14px 32px",borderRadius:"16px",fontSize:"15px",fontWeight:700,cursor:"pointer",fontFamily:"'Cormorant Garamond',serif",boxShadow:`0 6px 24px ${T.accentGlow}`}}
          >Δημιουργία Insights ✨</button>
        </div>
      ) : (
        <>
          {insights.map((ins,i)=>{
            const s=INS[ins.type]||INS.insight;
            return (
              <div key={i} className={`fu${Math.min(i+1,5)} hov`} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:"20px",padding:"18px 20px"}}>
                <div style={{display:"flex",gap:"14px",alignItems:"flex-start"}}>
                  <span style={{fontSize:"26px",lineHeight:1,flexShrink:0}}>{ins.icon}</span>
                  <div>
                    <div style={{fontSize:"15px",fontWeight:600,color:s.clr,fontFamily:"'Cormorant Garamond',serif",marginBottom:"6px"}}>{ins.title}</div>
                    <div style={{fontSize:"13px",color:T.t2,lineHeight:1.7}}>{ins.message}</div>
                  </div>
                </div>
              </div>
            );
          })}
          <button onClick={onRegen} className="scale"
            style={{width:"100%",padding:"14px",background:T.card,border:`1px solid ${T.borderSoft}`,borderRadius:"14px",color:T.t2,fontSize:"13px",cursor:"pointer",marginBottom:"4px"}}
          >↺ Ανανέωση</button>
        </>
      )}
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────

function SettingsView({T,settings,onUpdate,onClear}) {
  const [confirmClear,setConfirmClear] = useState(false);
  return (
    <div style={{padding:"0 16px",display:"flex",flexDirection:"column",gap:"14px"}}>
      <div className="fu" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`}}>
        <STitle T={T}>Προφίλ</STitle>
        <div style={{display:"flex",flexDirection:"column",gap:"12px",marginTop:"16px"}}>
          <SettingInput T={T} label="Όνομα"   placeholder="π.χ. Γιώργης"   value={settings.name}   onChange={v=>onUpdate("name",v)}/>
          <SettingInput T={T} label="Νησί"    placeholder="π.χ. Σέριφος"   value={settings.island} onChange={v=>onUpdate("island",v)}/>
          <SettingInput T={T} label="Δουλειά" placeholder="π.χ. Bartender" value={settings.job}    onChange={v=>onUpdate("job",v)}/>
        </div>
      </div>
      <div className="fu1" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`}}>
        <STitle T={T}>Εμφάνιση</STitle>
        <div style={{display:"flex",gap:"10px",marginTop:"16px"}}>
          {[["dark","🌙 Dark"],["light","☀️ Light"]].map(([val,lbl])=>(
            <button key={val} onClick={()=>onUpdate("theme",val)} className="scale"
              style={{flex:1,padding:"14px",borderRadius:"14px",border:`1px solid ${settings.theme===val?T.accent:T.borderSoft}`,background:settings.theme===val?T.accentGlow:T.card2,color:settings.theme===val?T.accent:T.t2,fontSize:"14px",fontWeight:settings.theme===val?600:400,cursor:"pointer",transition:"all .25s"}}
            >{lbl}</button>
          ))}
        </div>
      </div>
      <div className="fu2" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`}}>
        <STitle T={T}>Feedback</STitle>
        <div style={{marginTop:"16px"}}>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLScQeJKHYKCLqtagkxV1I_u05ioWtPPkbrEl_PxEcbGf1K0scg/viewform?usp=dialog"
            target="_blank" rel="noopener noreferrer"
            style={{display:"block",width:"100%",padding:"13px",borderRadius:"14px",border:`1px solid ${T.accent}40`,background:T.accentGlow,color:T.accent,fontSize:"13px",fontWeight:600,cursor:"pointer",textAlign:"center",textDecoration:"none"}}
          >💬 Στείλε Feedback</a>
          <div style={{fontSize:"11px",color:T.t3,textAlign:"center",marginTop:"8px"}}>Η γνώμη σου μετράει!</div>
        </div>
      </div>
      <div className="fu3" style={{background:T.card,borderRadius:"22px",padding:"22px",border:`1px solid ${T.borderSoft}`}}>
        <STitle T={T}>Δεδομένα</STitle>
        <div style={{marginTop:"16px"}}>
          {!confirmClear ? (
            <button onClick={()=>setConfirmClear(true)}
              style={{width:"100%",padding:"13px",borderRadius:"14px",border:`1px solid ${T.red}40`,background:T.redGlow,color:T.red,fontSize:"13px",fontWeight:600,cursor:"pointer"}}
            >🗑️ Διαγραφή όλων των δεδομένων</button>
          ) : (
            <div style={{background:T.redGlow,borderRadius:"14px",padding:"16px"}}>
              <div style={{fontSize:"13px",color:T.t1,fontWeight:600,marginBottom:"6px"}}>Είσαι σίγουρος;</div>
              <div style={{fontSize:"12px",color:T.t3,marginBottom:"14px"}}>Δεν μπορεί να αναιρεθεί.</div>
              <div style={{display:"flex",gap:"8px"}}>
                <button onClick={()=>setConfirmClear(false)} style={{flex:1,padding:"10px",borderRadius:"10px",border:`1px solid ${T.borderSoft}`,background:"none",color:T.t2,fontSize:"13px",cursor:"pointer"}}>Άκυρο</button>
                <button onClick={()=>{onClear();setConfirmClear(false);}} style={{flex:1,padding:"10px",borderRadius:"10px",border:"none",background:T.red,color:"white",fontSize:"13px",fontWeight:600,cursor:"pointer"}}>Διαγραφή</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{textAlign:"center",padding:"8px 0 4px"}}>
        <div style={{fontSize:"11px",color:T.t3}}>Tutto Passa</div>
      </div>
    </div>
  );
}

function SettingInput({T,label,placeholder,value,onChange}) {
  return (
    <div style={{background:T.card2,borderRadius:"14px",padding:"12px 16px",border:`1px solid ${T.borderSoft}`}}>
      <div style={{fontSize:"10px",color:T.t3,textTransform:"uppercase",letterSpacing:".08em",marginBottom:"5px"}}>{label}</div>
      <input type="text" placeholder={placeholder} value={value} onChange={e=>onChange(e.target.value)}
        style={{background:"none",border:"none",color:T.t1,fontSize:"15px",width:"100%"}}
      />
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────

function BottomNav({T,view,setView,onAdd}) {
  const items = [
    {id:"dashboard",    icon:"⊞", label:"Αρχική"},
    {id:"transactions", icon:"≡", label:"Κινήσεις"},
    {id:"__add__",      icon:"+", fab:true},
    {id:"insights",     icon:"✦", label:"AI"},
    {id:"settings",     icon:"⚙", label:"Ρυθμίσεις"},
  ];
  return (
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:"430px",background:T.card,borderTop:`1px solid ${T.border}`,backdropFilter:"blur(20px)",display:"flex",alignItems:"center",paddingBottom:"18px",zIndex:100}}>
      {items.map(item=>(
        <button key={item.id} onClick={()=>item.fab?onAdd():setView(item.id)}
          style={{flex:1,padding:"12px 0 4px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",color:item.fab?T.accent:view===item.id?T.t1:T.t3}}
        >
          {item.fab
            ? <div className="scale" style={{width:"44px",height:"44px",borderRadius:"14px",background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"22px",color:"white",marginTop:"-20px",boxShadow:`0 6px 20px ${T.accentGlow}`,fontWeight:700}}>{item.icon}</div>
            : <>
                <div style={{fontSize:"17px",lineHeight:1,opacity:view===item.id?1:.4,transition:"opacity .25s"}}>{item.icon}</div>
                <div style={{fontSize:"9px",fontWeight:view===item.id?600:400,opacity:view===item.id?1:.5,transition:"opacity .25s"}}>{item.label}</div>
              </>
          }
        </button>
      ))}
    </div>
  );
}

// ─── ADD MODAL ───────────────────────────────────────────────────────────────

function AddModal({T,type,setType,onAdd,onClose}) {
  const [amount,setAmount] = useState("");
  const [desc,  setDesc]   = useState("");
  const [cat,   setCat]    = useState("");
  const [date,  setDate]   = useState(localDate());
  const cats    = type==="income"?INCOME_CATS:EXPENSE_CATS;
  const canSave = amount && parseFloat(amount)>0 && cat;

  const submit = () => {
    if (!canSave) return;
    onAdd({type, amount:parseFloat(amount), description:desc||(cats.find(c=>c.id===cat)?.label??cat), category:cat, date});
  };

  return (
    <div onClick={e=>e.target===e.currentTarget&&onClose()}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",display:"flex",alignItems:"flex-end",zIndex:300,backdropFilter:"blur(10px)"}}
    >
      <div className="fu" style={{width:"100%",maxWidth:"430px",margin:"0 auto",background:T.card2,borderRadius:"28px 28px 0 0",padding:"20px 22px 44px",border:`1px solid ${T.border}`,boxShadow:"0 -8px 40px rgba(0,0,0,.15)"}}>
        <div style={{width:"36px",height:"3px",borderRadius:"2px",background:T.borderSoft,margin:"0 auto 24px"}}/>
        <div style={{fontSize:"22px",fontWeight:600,fontFamily:"'Cormorant Garamond',serif",color:T.t1,marginBottom:"22px"}}>Νέα Καταχώρηση</div>

        <div style={{display:"flex",background:T.card,borderRadius:"14px",padding:"4px",marginBottom:"22px",gap:"4px",border:`1px solid ${T.borderSoft}`}}>
          {[["expense","↑ Έξοδο"],["income","↓ Έσοδο"]].map(([v,l])=>(
            <button key={v} onClick={()=>{setType(v);setCat("");}} className="scale"
              style={{flex:1,padding:"11px",borderRadius:"10px",border:"none",fontWeight:600,fontSize:"14px",cursor:"pointer",transition:"all .25s",fontFamily:"'Cormorant Garamond',serif",
                background:type===v?(v==="expense"?T.red:T.accent):"none",
                color:type===v?"white":T.t3,
                boxShadow:type===v?"0 4px 14px rgba(0,0,0,.15)":"none"}}
            >{l}</button>
          ))}
        </div>

        <div style={{background:T.card,borderRadius:"16px",padding:"16px 20px",border:`1px solid ${T.borderSoft}`,marginBottom:"20px",display:"flex",alignItems:"center",gap:"10px"}}>
          <span style={{fontSize:"24px",color:T.t3,fontFamily:"'Cormorant Garamond',serif"}}>€</span>
          <input type="number" placeholder="0" value={amount} onChange={e=>setAmount(e.target.value)}
            style={{flex:1,background:"none",border:"none",color:T.t1,fontSize:"36px",fontWeight:700,fontFamily:"'Cormorant Garamond',serif",letterSpacing:"-1px"}}
          />
        </div>

        <Lbl T={T}>Κατηγορία</Lbl>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px",margin:"10px 0 20px"}}>
          {cats.map(c=>(
            <button key={c.id} onClick={()=>setCat(c.id)} className="scale"
              style={{padding:"12px 8px",borderRadius:"14px",border:`1px solid ${cat===c.id?T.accent:T.borderSoft}`,background:cat===c.id?T.accentGlow:T.card,color:cat===c.id?T.accent:T.t2,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",transition:"all .2s"}}
            >
              <span style={{fontSize:"20px"}}>{c.icon}</span>
              <span style={{fontSize:"10px",textAlign:"center",lineHeight:1.2}}>{c.label}</span>
            </button>
          ))}
        </div>

        <div style={{display:"flex",gap:"10px",marginBottom:"24px"}}>
          <div style={{flex:1,background:T.card,borderRadius:"14px",padding:"12px 16px",border:`1px solid ${T.borderSoft}`}}>
            <Lbl T={T} small>Περιγραφή</Lbl>
            <input type="text" placeholder="π.χ. Tips Σάββατο" value={desc} onChange={e=>setDesc(e.target.value)}
              style={{background:"none",border:"none",color:T.t1,fontSize:"13px",width:"100%",marginTop:"4px"}}
            />
          </div>
          <div style={{background:T.card,borderRadius:"14px",padding:"12px 14px",border:`1px solid ${T.borderSoft}`,flexShrink:0}}>
            <Lbl T={T} small>Ημ/νία</Lbl>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              style={{background:"none",border:"none",color:T.t1,fontSize:"12px",marginTop:"4px",colorScheme:"dark"}}
            />
          </div>
        </div>

        <button onClick={submit} disabled={!canSave} className="scale"
          style={{width:"100%",padding:"17px",borderRadius:"16px",border:"none",fontWeight:700,fontSize:"16px",fontFamily:"'Cormorant Garamond',serif",cursor:canSave?"pointer":"not-allowed",transition:"all .25s",
            background:!canSave?T.card:(type==="expense"?T.red:T.accent),
            color:!canSave?T.t3:"white",
            boxShadow:canSave?`0 6px 24px ${type==="expense"?T.redGlow:T.accentGlow}`:"none"}}
        >
          {type==="expense"?"− Καταγραφή Εξόδου":"+ Καταγραφή Εσόδου"}
        </button>
      </div>
    </div>
  );
}

// ─── MICRO ───────────────────────────────────────────────────────────────────

function STitle({children,T}){
  return <div style={{fontSize:"15px",fontWeight:600,fontFamily:"'Cormorant Garamond',serif",color:T.t1}}>{children}</div>;
}
function Lbl({children,small,T}){
  return <div style={{fontSize:small?"10px":"11px",color:T.t3,textTransform:"uppercase",letterSpacing:".08em"}}>{children}</div>;
}
function SumCard({label,value,color,T}){
  return (
    <div style={{background:T.card,borderRadius:"16px",padding:"14px 16px",border:`1px solid ${T.borderSoft}`}}>
      <div style={{fontSize:"11px",color:T.t3,marginBottom:"5px"}}>{label}</div>
      <div style={{fontSize:"20px",fontWeight:600,color,fontFamily:"'Cormorant Garamond',serif"}}>{value}</div>
    </div>
  );
}
function Empty({msg,icon="📭",T}){
  return (
    <div style={{textAlign:"center",color:T.t3,fontSize:"14px",padding:"24px"}}>
      <div style={{fontSize:"28px",marginBottom:"10px"}}>{icon}</div>
      {msg}
    </div>
  );
}
