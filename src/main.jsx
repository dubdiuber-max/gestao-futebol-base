import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Users, Wallet, Trophy, CalendarDays, LogOut, Plus, Search, Menu, X, ShieldCheck, UserRound, Trash2, CircleDollarSign } from "lucide-react";
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "./firebase";
import "./style.css";

const demoAthletes = [
  { id:"demo1", name:"Davi Rodrigues", category:"Sub-12", position:"Zagueiro", phone:"", status:"Ativo" },
  { id:"demo2", name:"Atleta exemplo", category:"Sub-14", position:"Meio-campo", phone:"", status:"Ativo" }
];

function App() {
  const [user,setUser] = useState(null);
  const [authLoading,setAuthLoading] = useState(firebaseReady);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [isRegister,setIsRegister] = useState(false);
  const [authError,setAuthError] = useState("");
  const [active,setActive] = useState("Visão geral");
  const [athletes,setAthletes] = useState(demoAthletes);
  const [search,setSearch] = useState("");
  const [showForm,setShowForm] = useState(false);
  const [name,setName] = useState("");
  const [category,setCategory] = useState("Sub-12");
  const [position,setPosition] = useState("Zagueiro");
  const [phone,setPhone] = useState("");
  const [mobileMenu,setMobileMenu] = useState(false);
  const demoMode = !firebaseReady;

  useEffect(() => {
    if (!firebaseReady) return;
    return onAuthStateChanged(auth, current => { setUser(current); setAuthLoading(false); });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const q = query(collection(db,"athletes"),orderBy("createdAt","desc"));
    return onSnapshot(q,snap => setAthletes(snap.docs.map(d => ({id:d.id,...d.data()}))), () => {});
  }, [user]);

  const filtered = useMemo(() => athletes.filter(a => (a.name||"").toLowerCase().includes(search.toLowerCase()) || (a.category||"").toLowerCase().includes(search.toLowerCase())),[athletes,search]);
  const activeCount = athletes.filter(a => a.status !== "Inativo").length;

  async function handleAuth(e) {
    e.preventDefault(); setAuthError("");
    try {
      if (isRegister) await createUserWithEmailAndPassword(auth,email,password);
      else await signInWithEmailAndPassword(auth,email,password);
    } catch (err) { setAuthError(err.code === "auth/invalid-credential" ? "E-mail ou senha incorretos." : err.message); }
  }
  async function googleLogin() {
    setAuthError("");
    try { await signInWithPopup(auth,new GoogleAuthProvider()); } catch(err) { setAuthError(err.message); }
  }
  async function addAthlete(e) {
    e.preventDefault();
    if (!name.trim()) return;
    const athlete = {name:name.trim(),category,position,phone,status:"Ativo",createdAt:serverTimestamp()};
    if (user && db) await addDoc(collection(db,"athletes"),athlete);
    else setAthletes(old => [{...athlete,id:crypto.randomUUID()},...old]);
    setName("");setPhone("");setShowForm(false);
  }
  async function removeAthlete(id) {
    if (!confirm("Deseja excluir este atleta?")) return;
    if (user && db && !id.startsWith("demo")) await deleteDoc(doc(db,"athletes",id));
    else setAthletes(old => old.filter(a => a.id !== id));
  }

  if (authLoading) return <div className="loading">Carregando Gestão Futebol de Base...</div>;
  if (firebaseReady && !user) return <div className="login-wrap"><div className="login-card"><div className="brand-mark"><Trophy size={28}/></div><p className="eyebrow">GESTÃO ESPORTIVA</p><h1>Gestão Futebol de Base</h1><p className="muted">Organize sua escolinha em um só lugar.</p><form onSubmit={handleAuth}><label>E-mail</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="seu@email.com"/><label>Senha</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength="6" placeholder="Mínimo de 6 caracteres"/>{authError && <p className="error">{authError}</p>}<button className="primary full">{isRegister?"Criar conta":"Entrar"}</button></form><button className="google full" onClick={googleLogin}>Continuar com Google</button><p className="switch-auth">{isRegister?"Já tem conta?":"Ainda não tem conta?"} <button onClick={()=>setIsRegister(!isRegister)}>{isRegister?"Fazer login":"Criar acesso"}</button></p></div></div>;

  const nav = [{label:"Visão geral",icon:Activity},{label:"Atletas",icon:Users},{label:"Mensalidades",icon:Wallet},{label:"Competições",icon:Trophy},{label:"Convocações",icon:CalendarDays}];
  return <div className="app-shell">
    <aside className={mobileMenu?"sidebar open":"sidebar"}><div className="side-brand"><div className="brand-mark small"><Trophy size={21}/></div><div><b>GESTÃO</b><span>FUTEBOL DE BASE</span></div><button className="close-menu" onClick={()=>setMobileMenu(false)}><X/></button></div><p className="nav-caption">MENU PRINCIPAL</p><nav>{nav.map(item=><button key={item.label} className={active===item.label?"nav-item selected":"nav-item"} onClick={()=>{setActive(item.label);setMobileMenu(false)}}><item.icon size={18}/>{item.label}</button>)}</nav><div className="side-bottom"><div className="admin-chip"><ShieldCheck size={18}/><div><b>Administrador</b><small>{demoMode?"Modo demonstração":user.email}</small></div></div>{!demoMode&&<button className="logout" onClick={()=>signOut(auth)}><LogOut size={17}/> Sair</button>}</div></aside>
    <main className="main-area"><header className="topbar"><button className="menu-toggle" onClick={()=>setMobileMenu(true)}><Menu/></button><div><span className="crumb">Painel /</span> <b>{active}</b></div><div className="top-user"><span className="online-dot"></span>{demoMode?"Prévia do sistema":user.email}</div></header>
      <section className="content"><div className="welcome-row"><div><p className="eyebrow">CENTRAL DE GESTÃO</p><h1>{active==="Visão geral"?"Visão geral":active}</h1><p className="muted">Acompanhe e organize sua escolinha de futebol.</p></div>{active==="Atletas"&&<button className="primary" onClick={()=>setShowForm(true)}><Plus size={18}/> Novo atleta</button>}</div>
      {demoMode&&<div className="demo-alert"><ShieldCheck size={18}/> Você está visualizando a demonstração. Configure as variáveis Firebase na Vercel para ativar login e salvar os dados na nuvem.</div>}
      {active==="Visão geral"&&<><div className="stats-grid"><Stat icon={Users} title="Atletas cadastrados" value={athletes.length} tone="blue"/><Stat icon={Activity} title="Atletas ativos" value={activeCount} tone="green"/><Stat icon={Wallet} title="Mensalidades" value="Em breve" tone="orange"/><Stat icon={Trophy} title="Competições" value="0" tone="purple"/></div><div className="panel"><div className="panel-head"><div><h2>Atletas recentes</h2><p className="muted">Últimos atletas cadastrados</p></div><button className="text-button" onClick={()=>setActive("Atletas")}>Ver todos</button></div><AthleteTable athletes={athletes.slice(0,5)} onDelete={removeAthlete}/></div></>}
      {active==="Atletas"&&<div className="panel"><div className="panel-head"><div><h2>Cadastro de atletas</h2><p className="muted">{filtered.length} atleta(s) encontrado(s)</p></div><div className="searchbox"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar atleta ou categoria"/></div></div><AthleteTable athletes={filtered} onDelete={removeAthlete}/></div>}
      {active==="Mensalidades"&&<Empty icon={CircleDollarSign} title="Controle de mensalidades" text="A próxima etapa será cadastrar valores, vencimentos, pagamentos e chave PIX da escolinha."/>}
      {active==="Competições"&&<Empty icon={Trophy} title="Competições" text="Em breve: campeonatos, tabela de jogos, resultados e classificação."/>}
      {active==="Convocações"&&<Empty icon={CalendarDays} title="Convocações" text="Em breve: selecione uma partida e monte a lista de atletas convocados."/>}
      </section><footer>Gestão Futebol de Base <span>•</span> Organização e desenvolvimento dentro de campo.</footer>
    </main>
    {showForm&&<div className="modal-backdrop" onClick={()=>setShowForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="panel-head"><div><h2>Novo atleta</h2><p className="muted">Preencha os dados básicos.</p></div><button className="icon-button" onClick={()=>setShowForm(false)}><X/></button></div><form onSubmit={addAthlete}><label>Nome completo</label><input value={name} onChange={e=>setName(e.target.value)} required placeholder="Nome do atleta"/><div className="form-row"><div><label>Categoria</label><select value={category} onChange={e=>setCategory(e.target.value)}>{["Sub-7","Sub-9","Sub-11","Sub-12","Sub-13","Sub-14","Sub-15","Sub-17","Sub-20"].map(v=><option>{v}</option>)}</select></div><div><label>Posição</label><select value={position} onChange={e=>setPosition(e.target.value)}>{["Goleiro","Zagueiro","Lateral","Volante","Meio-campo","Atacante"].map(v=><option>{v}</option>)}</select></div></div><label>Telefone do responsável (opcional)</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="(00) 00000-0000"/><div className="modal-actions"><button type="button" className="secondary" onClick={()=>setShowForm(false)}>Cancelar</button><button className="primary">Salvar atleta</button></div></form></div></div>}
  </div>;
}

function Stat({icon:Icon,title,value,tone}) { return <div className="stat-card"><div className={"stat-icon "+tone}><Icon size={21}/></div><div><p>{title}</p><strong>{value}</strong></div></div>; }
function AthleteTable({athletes,onDelete}) { return <div className="table-wrap"><table><thead><tr><th>ATLETA</th><th>CATEGORIA</th><th>POSIÇÃO</th><th>STATUS</th><th></th></tr></thead><tbody>{athletes.length?athletes.map(a=><tr key={a.id}><td><div className="athlete-name"><span className="avatar"><UserRound size={17}/></span><b>{a.name}</b></div></td><td>{a.category}</td><td>{a.position}</td><td><span className="status">{a.status||"Ativo"}</span></td><td><button className="delete-btn" title="Excluir atleta" onClick={()=>onDelete(a.id)}><Trash2 size={16}/></button></td></tr>):<tr><td colSpan="5" className="empty-cell">Nenhum atleta cadastrado ainda.</td></tr>}</tbody></table></div>; }
function Empty({icon:Icon,title,text}) { return <div className="empty-panel"><div className="empty-icon"><Icon size={30}/></div><h2>{title}</h2><p>{text}</p></div>; }

createRoot(document.getElementById("root")).render(<React.StrictMode><App/></React.StrictMode>);