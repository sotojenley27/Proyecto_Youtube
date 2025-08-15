
// ===== util =====
const $ = (q, el=document) => el.querySelector(q);
const $$ = (q, el=document) => Array.from(el.querySelectorAll(q));
const LS = {
  USERS: "ys_users",
  SESSION: "ys_session",
  VIDEOS: "ys_videos",
  COMMENTS: "ys_comments",
  CHANNELS: "ys_channels" // {username: {name,color,banner,about,avatar}}
};

function load(key, fallback){ try{ return JSON.parse(localStorage.getItem(key)) ?? fallback } catch(e){ return fallback } }
function save(key, value){ localStorage.setItem(key, JSON.stringify(value)) }

function requireAuth(){
  const session = load(LS.SESSION, null);
  if(!session){ location.href = "index.html"; return null; }
  return session.username;
}
function fmtViews(n){ if(n>=1e6) return (n/1e6).toFixed(1)+" M"; if(n>=1e3) return (n/1e3).toFixed(1)+" k"; return String(n) }
function uid(){ return 'v-' + Math.random().toString(36).slice(2,9) }
async function fileToDataURL(file){ return await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }) }

// ===== seed videos (global) =====
const SEED = [
  {id:"seed1", title:"HTML básico", channel:"Web 101", views:125000, thumb:"img/thumb_default.jpg", src:"https://www.youtube.com/embed/sBzRwzY7G-k", desc:"Introducción a HTML."},
  {id:"seed2", title:"CSS Flexbox", channel:"Web 101", views:820000, thumb:"img/thumb_default.jpg", src:"https://www.youtube.com/embed/JJSoEo8JSnc", desc:"Curso rápido de Flexbox."},
  {id:"seed3", title:"JavaScript rápido", channel:"Web 101", views:231000, thumb:"img/thumb_default.jpg", src:"https://www.youtube.com/embed/W6NZfCO5SIk", desc:"JS moderno en 60 minutos."}
];

function allVideos(){
  const userV = load(LS.VIDEOS, {});
  const arr = [...SEED];
  Object.values(userV).forEach(list => list.forEach(v => arr.push(v)));
  return arr;
}

// ===== auth =====
function registerUser(username, password){
  const users = load(LS.USERS, {});
  if(users[username]) return {ok:false, msg:"El usuario ya existe"};
  users[username] = { password: btoa(password) };
  save(LS.USERS, users);
  // canal por defecto
  const ch = load(LS.CHANNELS, {});
  ch[username] = { name:"GRUPO #2", color:"#e50914", about:"Canal del grupo", banner:"img/banner_default.jpg", avatar:"" };
  save(LS.CHANNELS, ch);
  return {ok:true};
}

function loginUser(username, password){
  const users = load(LS.USERS, {});
  if(!users[username]) return {ok:false, msg:"Usuario no encontrado"};
  if(users[username].password !== btoa(password)) return {ok:false, msg:"Contraseña incorrecta"};
  save(LS.SESSION, {username});
  return {ok:true};
}

function logout(){
  localStorage.removeItem(LS.SESSION);
  location.href = "index.html";
}

// ===== channel =====
function getChannel(username){
  const ch = load(LS.CHANNELS, {});
  return ch[username];
}
function saveChannel(username, data){
  const ch = load(LS.CHANNELS, {});
  ch[username] = {...(ch[username]||{}), ...data};
  save(LS.CHANNELS, ch);
}

// ===== videos =====
function addVideo(username, payload){
  const all = load(LS.VIDEOS, {});
  all[username] = all[username] || [];
  all[username].push(payload);
  save(LS.VIDEOS, all);
}
function myVideos(username){
  return (load(LS.VIDEOS, {})[username] || []);
}

// ===== comments =====
function listComments(videoId){ return (load(LS.COMMENTS, {})[videoId] || []) }
function addComment(videoId, comment){
  const bag = load(LS.COMMENTS, {});
  bag[videoId] = (bag[videoId] || []).concat([comment]);
  save(LS.COMMENTS, bag);
}

// ===== helpers for pages =====
function fillSidebar(username){
  const name = getChannel(username)?.name || username;
  $("#side-name").textContent = name;
}
