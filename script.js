/* ===== DONNÉES (sauvegardées dans le navigateur) ===== */
const KEY = "ecole_v1";
const MODELE = [
  { n: "Récitation", c: 1, g: "Français" },
  { n: "Rédaction", c: 2, g: "Français" },
  { n: "Texte suivi de questions", c: 1, g: "Français" },
  { n: "Orthographe", c: 1, g: "Français" },
  { n: "Mathématiques", c: 3, g: "" },
  { n: "Anglais", c: 2, g: "" },
  { n: "Histoire Géographie", c: 2, g: "" },
  { n: "Sciences de la Vie et de la Terre", c: 2, g: "" },
  { n: "Éducation Physique et Sportive", c: 2, g: "" },
  { n: "Conduite", c: 1, g: "" },
  { n: "Éducation Civique", c: 1, g: "" },
];
function lire() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "null");
  } catch (e) {
    return null;
  }
}
let DB = lire() || {
  school: "Mon École",
  code: "1234",
  annee: "2026-2027",
  classes: [
    "CI",
    "CP",
    "CE1",
    "CE2",
    "CM1",
    "CM2",
    "6ème",
    "5ème",
    "4ème",
    "3ème",
    "2nde",
    "1ère",
    "Terminale",
  ],
  matieres: MODELE,
  tel: "",
  email: "",
  ministere: "Ministère de l’Éducation nationale",
  logo: "",
  eleves: [],
  profs: [],
  notes: {},
  paiements: [],
  bull: {},
};
DB.bull = DB.bull || {};
DB.ninea = DB.ninea || "";
DB.web = DB.web || "";
DB.adresse = DB.adresse || "";
DB.signataire = DB.signataire || "";
DB.slogan = DB.slogan || "";
DB.tel = DB.tel || "";
DB.email = DB.email || "";
DB.logo = DB.logo || "";
DB.ministere = DB.ministere || "Ministère de l’Éducation nationale";
Object.keys(DB.notes).forEach((k) => {
  if (k.split("|").length === 2) {
    DB.notes[k + "|S1"] = DB.notes[k];
    delete DB.notes[k];
  }
});
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(DB));
  } catch (e) {}
};
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
const fmt = (n) => Number(n).toLocaleString("fr-FR");

/* ===== CONNEXION ===== */
function majNom() {
  document.title = DB.school;
  $("loginName").textContent = DB.school;
  $("menuName").textContent = "🎓 " + DB.school;
}
function connexion() {
  if ($("codeIn").value.trim() === String(DB.code).trim()) {
    $("login").classList.add("hidden");
    $("app").classList.remove("hidden");
    go("dash");
  } else $("loginErr").textContent = "Code incorrect";
}
majNom();

/* ===== NAVIGATION ===== */
const VUES = {
  dash: vDash,
  inscr: vInscr,
  classes: vClasses,
  profs: vProfs,
  notes: vNotes,
  bull: vBull,
  pay: vPay,
  param: vParam,
};
function go(v) {
  document
    .querySelectorAll("aside a[data-v]")
    .forEach((a) => a.classList.toggle("on", a.dataset.v === v));
  VUES[v]();
}
document
  .querySelectorAll("aside a[data-v]")
  .forEach((a) => (a.onclick = () => go(a.dataset.v)));
const optClasses = (sel) =>
  DB.classes
    .map((c) => `<option ${c === sel ? "selected" : ""}>${esc(c)}</option>`)
    .join("");
const nbClasse = (c) => DB.eleves.filter((e) => e.classe === c).length;

/* ===== TABLEAU DE BORD ===== */
function vDash() {
  const max = Math.max(1, ...DB.classes.map(nbClasse));
  const total = DB.paiements.reduce((s, p) => s + p.montant, 0);
  $("main").innerHTML =
    `<h2 class="t">Tableau de bord — ${esc(DB.school)} (${esc(DB.annee)})</h2>
  <div class="cards">
   <div class="card">Élèves<b>${DB.eleves.length}</b></div>
   <div class="card">Professeurs<b>${DB.profs.length}</b></div>
   <div class="card">Classes<b>${DB.classes.length}</b></div>
   <div class="card">Matières<b>${DB.matieres.length}</b></div>
   <div class="card">Total encaissé<b style="font-size:22px">${fmt(total)} F</b></div>
  </div>
  <div class="panel"><h3>Nombre d’élèves par classe</h3>
  ${DB.classes.map((c) => `<div class="stat"><span>${esc(c)}</span><div class="bar" style="width:${(nbClasse(c) / max) * 60}%;min-width:3px"></div><span>${nbClasse(c)}</span></div>`).join("")}</div>`;
}

/* ===== INSCRIPTIONS ===== */
function vInscr() {
  $("main").innerHTML = `<h2 class="t">Inscriptions</h2>
  <div class="panel noprint"><h3>Nouvelle inscription</h3>
   <div class="row">
    <input id="eNom" placeholder="Nom"><input id="ePre" placeholder="Prénom">
    <select id="eSexe"><option>M</option><option>F</option></select>
    <input id="eNaiss" type="date" title="Date de naissance"><input id="eLieu" placeholder="Lieu de naissance"><select id="eDbl"><option value="NEANT">Non redoublant</option><option value="OUI">Redoublant</option></select>
    <select id="eClasse">${optClasses()}</select>
    <input id="eTel" placeholder="Téléphone parent"><input id="eAdr" placeholder="Adresse"><input id="eMail" placeholder="Email parent">
    <button onclick="addEleve()">Inscrire</button>
   </div></div>
  <div class="panel"><div class="row noprint"><select id="fCl" onchange="listEleves()"><option value="">Toutes les classes</option>${optClasses()}</select>
  <input id="fQ" placeholder="Rechercher…" oninput="listEleves()"></div><div id="lEleves"></div></div>`;
  listEleves();
}
function addEleve() {
  const nom = $("eNom").value.trim(),
    pre = $("ePre").value.trim();
  if (!nom || !pre) return alert("Nom et prénom obligatoires");
  const n = DB.eleves.length + 1;
  DB.eleves.push({
    id: uid(),
    matricule: "MAT" + String(n).padStart(4, "0"),
    nom,
    prenom: pre,
    sexe: $("eSexe").value,
    naiss: $("eNaiss").value,
    classe: $("eClasse").value,
    tel: $("eTel").value,
    lieu: $("eLieu").value,
    adr: $("eAdr").value,
    mail: $("eMail").value,
    dbl: $("eDbl").value,
  });
  save();
  vInscr();
}
function listEleves() {
  const c = $("fCl").value,
    q = $("fQ").value.toLowerCase();
  const l = DB.eleves.filter(
    (e) =>
      (!c || e.classe === c) &&
      (e.nom + " " + e.prenom).toLowerCase().includes(q),
  );
  $("lEleves").innerHTML =
    `<p style="margin-bottom:8px"><b>${l.length}</b> élève(s)</p><table><tr><th>Matricule</th><th>Nom</th><th>Prénom</th><th>Sexe</th><th>Classe</th><th>Tél.</th><th class="noprint"></th></tr>
  ${l.map((e) => `<tr><td>${e.matricule}</td><td>${esc(e.nom)}</td><td>${esc(e.prenom)}</td><td>${e.sexe}</td><td>${esc(e.classe)}</td><td>${esc(e.tel)}</td><td class="noprint"><button class="red" onclick="delEleve('${e.id}')">Supprimer</button></td></tr>`).join("")}</table>`;
}
function delEleve(id) {
  if (!confirm("Supprimer cet élève ?")) return;
  DB.eleves = DB.eleves.filter((e) => e.id !== id);
  Object.keys(DB.notes)
    .filter((k) => k.startsWith(id + "|"))
    .forEach((k) => delete DB.notes[k]);
  Object.keys(DB.bull)
    .filter((k) => k.startsWith(id + "|"))
    .forEach((k) => delete DB.bull[k]);
  save();
  listEleves();
}

/* ===== CLASSES ===== */
function vClasses() {
  $("main").innerHTML = `<h2 class="t">Classes</h2>
  <div class="panel"><div class="row"><input id="cNom" placeholder="Nouvelle classe (ex : 6ème B)"><button onclick="addClasse()">Ajouter</button></div>
  <table><tr><th>Classe</th><th>Nombre d’élèves</th><th>Garçons</th><th>Filles</th><th></th></tr>
  ${DB.classes
    .map((c, i) => {
      const l = DB.eleves.filter((e) => e.classe === c);
      return `<tr><td>${esc(c)}</td><td><b>${l.length}</b></td><td>${l.filter((e) => e.sexe === "M").length}</td><td>${l.filter((e) => e.sexe === "F").length}</td><td><button class="red" onclick="delClasse(${i})">Supprimer</button></td></tr>`;
    })
    .join("")}</table></div>`;
}
function addClasse() {
  const v = $("cNom").value.trim();
  if (v && !DB.classes.includes(v)) {
    DB.classes.push(v);
    save();
    vClasses();
  }
}
function delClasse(i) {
  if (nbClasse(DB.classes[i]))
    return alert("Cette classe contient des élèves.");
  DB.classes.splice(i, 1);
  save();
  vClasses();
}

/* ===== PROFESSEURS ===== */
function vProfs() {
  $("main").innerHTML = `<h2 class="t">Professeurs</h2>
  <div class="panel"><div class="row">
   <input id="pNom" placeholder="Nom complet"><input id="pTel" placeholder="Téléphone">
   <select id="pMat">${DB.matieres.map((m) => `<option>${esc(m.n)}</option>`).join("")}</select>
   <select id="pCl">${optClasses()}</select><button onclick="addProf()">Ajouter</button></div>
  <table><tr><th>Nom</th><th>Téléphone</th><th>Matière</th><th>Classe</th><th></th></tr>
  ${DB.profs.map((p, i) => `<tr><td>${esc(p.nom)}</td><td>${esc(p.tel)}</td><td>${esc(p.matiere)}</td><td>${esc(p.classe)}</td><td><button class="red" onclick="DB.profs.splice(${i},1);save();vProfs()">Supprimer</button></td></tr>`).join("")}</table></div>`;
}
function addProf() {
  const nom = $("pNom").value.trim();
  if (!nom) return;
  DB.profs.push({
    nom,
    tel: $("pTel").value,
    matiere: $("pMat").value,
    classe: $("pCl").value,
  });
  save();
  vProfs();
}

/* ===== NOTES : 2 devoirs + 1 composition, par semestre ===== */
const SEM = { S1: "Premier semestre", S2: "Second semestre" };
const semOpts = () =>
  Object.keys(SEM)
    .map((k) => `<option value="${k}">${SEM[k]}</option>`)
    .join("");
const noteOf = (id, mat, sem) => DB.notes[id + "|" + mat + "|" + sem];
function vNotes() {
  $("main").innerHTML = `<h2 class="t">Saisie des notes</h2><div class="panel">
  <div class="row"><select id="nSem" onchange="tabNotes()">${semOpts()}</select><select id="nCl" onchange="tabNotes()">${optClasses()}</select>
  <select id="nMat" onchange="tabNotes()">${DB.matieres.map((m, i) => `<option value="${i}">${m.g ? esc(m.g) + " — " : ""}${esc(m.n)}</option>`).join("")}</select></div>
  <div id="tNotes"></div></div>`;
  tabNotes();
}
function tabNotes() {
  const cl = $("nCl").value,
    i = $("nMat").value,
    sem = $("nSem").value;
  if (!DB.matieres[i])
    return ($("tNotes").innerHTML =
      "<p>Ajoutez d’abord des matières dans Paramètres.</p>");
  const mat = DB.matieres[i].n,
    l = DB.eleves.filter((e) => e.classe === cl);
  $("tNotes").innerHTML = l.length
    ? `<table><tr><th>Élève</th><th>Devoir 1 /20</th><th>Devoir 2 /20</th><th>Composition /20</th><th>Moyenne</th></tr>
  ${l
    .map((e) => {
      const n = noteOf(e.id, mat, sem) || {};
      return `<tr><td>${esc(e.prenom)} ${esc(e.nom)}</td>${["d1", "d2", "c"].map((k) => `<td><input class="n" type="number" min="0" max="20" step="0.25" value="${n[k] ?? ""}" onchange="setNote('${e.id}',${i},'${k}',this.value)"></td>`).join("")}<td id="m_${e.id}">${moy(n) ?? "-"}</td></tr>`;
    })
    .join("")}</table>`
    : "<p>Aucun élève dans cette classe.</p>";
}
function setNote(id, i, k, v) {
  const key = id + "|" + DB.matieres[i].n + "|" + $("nSem").value;
  DB.notes[key] = DB.notes[key] || {};
  if (v === "") delete DB.notes[key][k];
  else DB.notes[key][k] = Math.min(20, Math.max(0, +v));
  save();
  $("m_" + id).textContent = moy(DB.notes[key]) ?? "-";
}
/* Moyenne de la matière = ( moyenne des devoirs + composition ) / 2 ; sans composition = moyenne des devoirs */
function devoirs(n) {
  const d = [n.d1, n.d2].filter((v) => v !== undefined);
  return d.length ? d.reduce((a, b) => a + b, 0) / d.length : null;
}
function moy(n) {
  if (!n) return null;
  const d = devoirs(n);
  if (d === null) return n.c ?? null;
  return n.c === undefined ? +d.toFixed(2) : +((d + n.c) / 2).toFixed(2);
}
const appr = (m) =>
  m >= 18
    ? "Excellent"
    : m >= 16
      ? "Très Bien"
      : m >= 14
        ? "Bien"
        : m >= 12
          ? "Assez Bien"
          : m >= 10
            ? "Passable"
            : "Insuffisant";
function gen(id, sem) {
  let s = 0,
    c = 0;
  DB.matieres.forEach((m) => {
    const v = moy(noteOf(id, m.n, sem));
    if (v !== null) {
      s += v * m.c;
      c += m.c;
    }
  });
  return c ? +(s / c).toFixed(2) : null;
}
function annuel(id) {
  const a = gen(id, "S1"),
    b = gen(id, "S2");
  return a !== null && b !== null
    ? +((a + b) / 2).toFixed(2)
    : a !== null
      ? a
      : b;
}
function rang(L, id, f) {
  const v = L.map((e) => ({ id: e.id, v: f(e.id) })).filter(
      (x) => x.v !== null,
    ),
    me = v.find((x) => x.id === id);
  if (!me) return null;
  return {
    r: 1 + v.filter((x) => x.v > me.v).length,
    ex: v.filter((x) => x.v === me.v).length > 1,
  };
}
const fr = (r) => (r ? r.r + (r.ex ? "ex" : "") : "");
const moyClasse = (L, f) => {
  const v = L.map((e) => f(e.id)).filter((x) => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};
const f2 = (v) =>
  v === null || v === undefined || v === "" ? "" : Number(v).toFixed(2);
const fd = (d) => (d ? d.split("-").reverse().join("-") : "");

/* ===== BULLETINS (modèle officiel : 2 semestres) ===== */
function vBull() {
  $("main").innerHTML =
    `<h2 class="t noprint">Bulletins</h2><div class="panel noprint"><div class="row">
  <select id="bSem" onchange="showBull()">${semOpts()}</select><select id="bCl" onchange="selEl()">${optClasses()}</select><select id="bEl"></select>
  <input id="bNiv" placeholder="Niveau" oninput="paper()"><input id="bSer" value="NON APPLICABLE" placeholder="Série" oninput="paper()">
  <button onclick="showBull()">Afficher</button><button class="gray" onclick="window.print()">Imprimer</button></div></div><div id="bOut"></div>`;
  selEl();
}
function selEl() {
  $("bEl").innerHTML = DB.eleves
    .filter((e) => e.classe === $("bCl").value)
    .map(
      (e) => `<option value="${e.id}">${esc(e.prenom)} ${esc(e.nom)}</option>`,
    )
    .join("");
  $("bNiv").value = $("bCl").value.toUpperCase();
}
function showBull() {
  const id = $("bEl").value;
  if (!id) return alert("Choisissez un élève");
  const b = DB.bull[id + "|" + $("bSem").value] || {};
  const sel = (f, arr) =>
    `<select onchange="setB('${f}',this.value)"><option value="">—</option>${arr.map((o) => `<option ${b[f] === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
  $("bOut").innerHTML =
    `<div class="panel noprint"><h3>Informations du bulletin</h3><div class="row">
   <input type="number" min="0" placeholder="Retards (heures)" value="${b.rh ?? ""}" onchange="setB('rh',this.value)">
   <input type="number" min="0" placeholder="Retards (minutes)" value="${b.rm ?? ""}" onchange="setB('rm',this.value)">
   <input type="number" min="0" placeholder="Absences" value="${b.abs ?? ""}" onchange="setB('abs',this.value)">
   <input type="number" min="0" placeholder="Justifiées" value="${b.just ?? ""}" onchange="setB('just',this.value)">
   ${sel("dist", ["Félicitations", "Encouragements", "Tableau d’honneur", "Passable", "Insuffisant"])}
   ${sel("dec", ["Passe en classe supérieure", "Autorisé(e) à redoubler", "Exclu(e) de l’établissement"])}
   <input id="bObs" style="min-width:260px" placeholder="Observations du conseil des professeurs" value="${esc(b.obs || "")}" onchange="setB('obs',this.value)"></div></div><div id="paper"></div>`;
  paper();
}
function setB(f, v) {
  const k = $("bEl").value + "|" + $("bSem").value;
  DB.bull[k] = DB.bull[k] || {};
  DB.bull[k][f] = v;
  save();
  paper();
}
function paper() {
  const e = DB.eleves.find((x) => x.id === $("bEl").value);
  if (!e || !$("paper")) return;
  const sem = $("bSem").value,
    L = DB.eleves.filter((x) => x.classe === e.classe),
    b = DB.bull[e.id + "|" + sem] || {};
  let tot = 0,
    totC = 0,
    rows = "",
    last = null;
  DB.matieres.forEach((m) => {
    const n = noteOf(e.id, m.n, sem) || {},
      v = moy(n),
      g = m.g || "";
    if (g && g !== last)
      rows += `<tr class="gr"><td colspan="8" style="text-align:left">${esc(g)}</td></tr>`;
    last = g;
    if (v !== null) {
      tot += v * m.c;
      totC += m.c;
    }
    rows += `<tr><td class="${g ? "sub" : ""}" style="text-align:left">${esc(m.n)}</td><td>${f2(devoirs(n))}</td><td>${f2(n.c)}</td><td>${f2(v)}</td><td>${m.c}</td><td>${v !== null ? f2(v * m.c) : ""}</td><td>${v !== null ? fr(rang(L, e.id, (i) => moy(noteOf(i, m.n, sem)))) : ""}</td><td style="text-align:left">${v !== null ? appr(v) : ""}</td></tr>`;
  });
  const sum =
    ["S1", "S2"]
      .map((s) => {
        const f = (i) => gen(i, s);
        return `<tr><td style="text-align:left"><b>${SEM[s]}</b></td><td>${f2(f(e.id))}</td><td>${fr(rang(L, e.id, f))}</td><td>${f2(moyClasse(L, f))}</td></tr>`;
      })
      .join("") +
    `<tr><td style="text-align:left"><b>Moyenne générale</b></td><td>${f2(annuel(e.id))}</td><td>${fr(rang(L, e.id, annuel))}</td><td>${f2(moyClasse(L, annuel))}</td></tr>`;
  const cell = (lab, ok) =>
    `<tr><td>${lab}</td><td style="width:24px;text-align:center">${ok ? "✕" : ""}</td></tr>`;
  const dist = [
    "Félicitations",
    "Encouragements",
    "Tableau d’honneur",
    "Passable",
    "Insuffisant",
  ]
    .map((x) => cell(x, b.dist === x))
    .join("");
  const dec = [
    "Passe en classe supérieure",
    "Autorisé(e) à redoubler",
    "Exclu(e) de l’établissement",
  ]
    .map((x) => cell(x, b.dec === x))
    .join("");
  $("paper").innerHTML = `<div id="bulletin">
  <div class="head"><div class="flag"><i style="background:#00853f"></i><i style="background:#fdef42;color:#00853f;display:flex;align-items:center;justify-content:center;font-size:20px">★</i><i style="background:#e31b23"></i></div>
   <div>République du Sénégal<br>${esc(DB.ministere)}<br>${esc(DB.school.toUpperCase())}<br>ANNEE SCOLAIRE: ${esc(DB.annee)}</div>
   <div class="logo">${DB.logo ? `<img src="${DB.logo}" style="max-width:100%;max-height:100%">` : ""}</div></div>
  <div class="info"><div>Tel: <b>${esc(DB.tel)}</b><br>Email: <b>${esc(DB.email)}</b><br>Niveau: <b>${esc($("bNiv").value.toUpperCase())}</b><br>Série: <b>${esc($("bSer").value.toUpperCase())}</b><br>Effectif: <b>${L.length}</b><br>Moyenne classe: <b>${f2(moyClasse(L, (i) => gen(i, sem)))}</b></div>
   <div>IEN: <b>${esc(e.matricule)}</b> &nbsp; SEXE: <b>${e.sexe === "F" ? "FEMININ" : "MASCULIN"}</b><br>Classe: <b>${esc(e.classe)}</b><br>Classe doublée: <b>${esc(e.dbl || "NEANT")}</b><br>Prénom(s): <b>${esc(e.prenom.toUpperCase())}</b><br>Nom: <b>${esc(e.nom.toUpperCase())}</b><br>Né(e) le: <b>${fd(e.naiss)}${e.lieu ? " à " + esc(e.lieu.toUpperCase()) : ""}</b></div></div>
  <div class="titre">BULLETIN DU ${SEM[sem].toUpperCase().replace("PREMIER", "PREMIER").replace("SECOND", "SECOND")}</div>
  <table><tr><th style="text-align:left">Disciplines</th><th>Devoirs</th><th>Composi.</th><th>Moy</th><th>Coeff</th><th>Moy×Coef</th><th>Rang</th><th style="text-align:left">Appréciations</th></tr>${rows}
   <tr class="tot"><td style="text-align:left">Totaux</td><td></td><td></td><td></td><td>${totC}</td><td>${f2(tot)}</td><td></td><td></td></tr></table>
  <div class="info" style="margin-top:12px"><table class="box" style="flex:1"><tr><th></th><th>Moyennes</th><th>Rangs</th><th>Moy classe</th></tr>${sum}</table>
   <table class="box" style="flex:1;height:fit-content"><tr><th colspan="3" style="text-align:left">Absences &amp; Retards ${SEM[sem].toLowerCase()}</th></tr>
   <tr><td>Retards</td><td>${b.rh || 0} heure(s) ${b.rm || 0} minute(s)</td><td>NEANT</td></tr><tr><td>Absences</td><td>${b.abs || 0} absence(s)</td><td>${b.just || 0} justifiée(s)</td></tr></table></div>
  <div class="info"><div style="border:0;padding:0;display:flex;gap:6px"><table class="box" style="flex:1">${dist}</table><table class="box" style="flex:1;height:fit-content">${dec}</table></div>
   <div class="box" style="min-height:90px"><u><b>Observations du conseil des professeurs</b></u><br>${esc(b.obs || "")}</div></div>
  <p style="text-align:right;margin:10px 40px 30px 0"><u><b>Le Chef d’établissement</b></u></p>
  <p style="font-size:10px"><b>N.B.:</b> Ce bulletin n’est délivré qu’une seule fois. Toute demande de duplicata pourrait faire l’objet d’une contrepartie financière.</p>
  <div class="foot">Ce bulletin est édité le ${new Date().toLocaleString("fr-FR")}</div></div>`;
}

/* ===== PAIEMENTS / REÇUS ===== */
const MODES = [
  "Espèces",
  "Wave",
  "Orange Money",
  "Virement",
  "Chèque",
  "Carte bancaire",
];
function vPay() {
  $("main").innerHTML =
    `<h2 class="t">Paiements et reçus</h2><div class="panel"><div class="row">
  <select id="yCl" onchange="selPay()">${optClasses()}</select><select id="yEl"></select>
  <input id="yMot" placeholder="Description (ex : Scolarité octobre)" style="min-width:230px">
  <input id="yQte" type="number" min="1" value="1" title="Quantité" style="width:80px"><input id="yPu" type="number" min="0" placeholder="Prix unitaire (F)"></div>
  <div class="row"><select id="yMode">${MODES.map((m) => `<option>${m}</option>`).join("")}</select><input id="yRef" placeholder="Référence / n° transaction">
  <select id="yStat"><option>Payé en totalité</option><option>Paiement partiel</option></select><input id="yNote" placeholder="Notes" style="min-width:240px">
  <button onclick="addPay()">Encaisser</button></div>
  <table><tr><th>N° reçu</th><th>Date</th><th>Élève</th><th>Description</th><th>Mode</th><th>Montant</th><th></th></tr>
  ${DB.paiements.map((p) => `<tr><td>${p.num}</td><td>${p.date}</td><td>${esc(p.eleve)}</td><td>${esc(p.motif)}</td><td>${esc(p.mode || "Espèces")}</td><td>${fmt(p.montant)} F</td><td><button onclick="recu('${p.id}')">Reçu</button></td></tr>`).join("")}</table></div>`;
  selPay();
}
function selPay() {
  $("yEl").innerHTML = DB.eleves
    .filter((e) => e.classe === $("yCl").value)
    .map(
      (e) => `<option value="${e.id}">${esc(e.prenom)} ${esc(e.nom)}</option>`,
    )
    .join("");
}
function addPay() {
  const e = DB.eleves.find((x) => x.id === $("yEl").value),
    q = +$("yQte").value || 1,
    pu = +$("yPu").value;
  if (!e || pu <= 0) return alert("Élève et prix unitaire obligatoires");
  DB.paiements.push({
    id: uid(),
    num: "R" + String(DB.paiements.length + 1).padStart(5, "0"),
    date: new Date().toLocaleDateString("fr-FR"),
    eleve: e.prenom + " " + e.nom,
    classe: e.classe,
    mat: e.matricule,
    adr: e.adr || "",
    mail: e.mail || "",
    tel: e.tel || "",
    motif: $("yMot").value || "Scolarité",
    qte: q,
    pu,
    montant: q * pu,
    mode: $("yMode").value,
    ref: $("yRef").value,
    stat: $("yStat").value,
    note: $("yNote").value,
  });
  save();
  vPay();
}
/* Montant en lettres (français) */
function enLettres(n) {
  n = Math.floor(n);
  if (n === 0) return "zéro";
  const u = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const d = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante"];
  const c99 = (x, fin) => {
    if (x < 20) return u[x];
    if (x < 70) {
      const t = Math.floor(x / 10),
        r = x % 10;
      return d[t] + (r === 1 ? " et un" : r ? "-" + u[r] : "");
    }
    if (x < 80) {
      const r = x - 60;
      return "soixante" + (r === 11 ? " et onze" : "-" + u[r]);
    }
    const r = x - 80;
    return "quatre-vingt" + (r === 0 ? (fin ? "s" : "") : "-" + u[r]);
  };
  const c999 = (x, fin) => {
    const h = Math.floor(x / 100),
      r = x % 100;
    let t = "";
    if (h > 0)
      t = h === 1 ? "cent" : u[h] + " cent" + (r === 0 && fin ? "s" : "");
    if (r > 0) t += (t ? " " : "") + c99(r, fin);
    return t;
  };
  const m = Math.floor(n / 1e6),
    th = Math.floor((n % 1e6) / 1000),
    r = n % 1000,
    p = [];
  if (m) p.push(m === 1 ? "un million" : c999(m, false) + " millions");
  if (th) p.push(th === 1 ? "mille" : c999(th, false) + " mille");
  if (r) p.push(c999(r, true));
  return p.join(" ");
}
function recu(id) {
  const p = DB.paiements.find((x) => x.id === id),
    q = p.qte || 1,
    mode = p.mode || "Espèces";
  const modes = ["Espèces", "Chèque", "Wave", "Orange Money"];
  if (!modes.includes(mode)) modes.push(mode);
  const ini =
    DB.school
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "É";
  const lettres = enLettres(p.montant);
  const L = lettres.charAt(0).toUpperCase() + lettres.slice(1);
  const w = window.open("", "_blank", "width=900,height=760");
  w.document
    .write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reçu ${p.num}</title><style>
  @page{size:A5 landscape;margin:0}
  *{-webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
  body{margin:0;padding:20px;background:#ececec;font-family:Calibri,Segoe UI,Arial,sans-serif;color:#14206b}
  .c{position:relative;width:820px;min-height:700px;margin:auto;background:#fff;overflow:hidden;box-shadow:0 2px 10px #0004;padding:150px 44px 40px}
  .a1{position:absolute;left:0;top:0;width:190px;height:290px;background:#1d3c9e;clip-path:polygon(0 0,60% 0,0 100%)}
  .a2{position:absolute;left:0;top:30px;width:400px;height:110px;background:linear-gradient(90deg,#161616,#a5a7aa);clip-path:polygon(0 0,100% 0,88% 100%,0 100%)}
  .a3{position:absolute;left:60px;top:0;width:200px;height:130px;background:#2a2a2a;opacity:.55;clip-path:polygon(35% 0,100% 0,60% 100%,0 100%)}
  .b1{position:absolute;right:0;bottom:0;width:90px;height:150px;background:#1d3c9e;clip-path:polygon(100% 0,100% 100%,0 100%)}
  .b2{position:absolute;right:30px;bottom:0;width:80px;height:50px;background:#8a8c8f;opacity:.8;clip-path:polygon(40% 0,100% 0,60% 100%,0 100%)}
  .h{position:absolute;top:22px;left:0;right:0;text-align:center}
  .lg{width:112px;height:112px;border-radius:50%;border:7px solid #1d3c9e;margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font:bold 34px Arial;color:#1d3c9e;overflow:hidden;background:#fff}
  .lg img{max-width:100%;max-height:100%}
  .h b{display:block;font-size:25px;color:#1d3c9e;letter-spacing:.5px;padding:0 120px}
  .h i{font:italic 15px 'Brush Script MT','Segoe Script',cursive;color:#14206b}
  .ln{display:flex;align-items:baseline;gap:8px;margin:22px 0;font-size:19px}
  .ln .v{flex:1;border-bottom:2px dotted #333;min-height:24px;padding:0 6px;font-size:18px}
  .sc{font:italic 24px 'Brush Script MT','Segoe Script',cursive}
  .bx{display:inline-block;border:1px solid #14206b;border-radius:8px;padding:9px 14px;font-size:15px}
  .bt{display:flex;justify-content:space-between;align-items:flex-end;margin-top:28px;font-size:19px}
  .g{opacity:.55}.s{font:26px 'Brush Script MT','Segoe Script',cursive}
  </style></head><body><div class="c"><div class="a1"></div><div class="a2"></div><div class="a3"></div><div class="b1"></div><div class="b2"></div>
  <div class="h"><div class="lg">${DB.logo ? `<img src="${DB.logo}">` : esc(ini)}</div><b>${esc(DB.school.toUpperCase())}</b>${DB.slogan ? `<i>${esc(DB.slogan)}</i>` : ""}</div>
  <div style="display:flex;justify-content:space-between;font-size:19px"><div><span class="sc">N°</span> <b>${p.num}</b></div><div><b>Date :</b> ${p.date}</div></div>
  <div class="ln"><span class="sc">Référence élève :</span><span class="v">${esc(p.mat || "")} — ${esc(p.classe)}</span></div>
  <div class="ln"><span class="sc">Reçu de</span><span class="v">${esc(p.eleve)}</span></div>
  <div class="ln"><span>La somme de (francs CFA)</span><span class="v">${esc(L)} francs CFA</span></div>
  <div class="ln"><span>Pour paiement de</span><span class="v">${esc(p.motif)}${q > 1 ? " (×" + q + ")" : ""}${p.stat === "Paiement partiel" ? " — paiement partiel" : ""}</span></div>
  <div class="ln"><span class="v">${esc([p.ref ? "Réf. " + p.ref : "", p.note].filter(Boolean).join(" — "))}</span></div>
  <div style="text-align:right;font-size:15px;margin-top:-14px">Avec nos remerciements</div>
  <div class="bt"><div>F CFA <b style="font-size:22px">${fmt(p.montant)}</b> &nbsp;<span class="bx">${modes.map((m) => (m === mode ? `<b><u>${esc(m)}</u></b>` : `<span class="g">${esc(m)}</span>`)).join(" – ")}</span></div>
   <div style="display:flex;align-items:flex-end;gap:12px">Signature <span class="bx" style="width:190px;height:54px;padding:4px 10px"><span class="s">${esc(DB.signataire)}</span></span></div></div>
  </div><script>setTimeout(function(){print()},400)<\/script></body></html>`);
  w.document.close();
}

/* ===== PARAMÈTRES ===== */
function vParam() {
  $("main").innerHTML = `<h2 class="t">Paramètres</h2>
  <div class="panel"><h3>École (apparaît sur les bulletins)</h3><div class="row"><input id="sNom" value="${esc(DB.school)}" placeholder="Nom de l’école"><input id="sAn" value="${esc(DB.annee)}" placeholder="Année scolaire"><input id="sMin" value="${esc(DB.ministere)}" placeholder="Ministère" style="min-width:240px"></div>
   <div class="row"><input id="sTel" value="${esc(DB.tel)}" placeholder="Téléphone"><input id="sMail" value="${esc(DB.email)}" placeholder="Email"><input id="sAdr" value="${esc(DB.adresse)}" placeholder="Adresse de l’école"></div>
   <div class="row"><input id="sWeb" value="${esc(DB.web)}" placeholder="Site web"><input id="sNin" value="${esc(DB.ninea)}" placeholder="NINEA"><input id="sSlo" value="${esc(DB.slogan)}" placeholder="Slogan de l’école"><input id="sSig" value="${esc(DB.signataire)}" placeholder="Nom du signataire des reçus"><button onclick="saveEcole()">Enregistrer</button></div>
   <div class="row"><label>Logo de l’école : <input type="file" accept="image/*" onchange="setLogo(this)"></label>${DB.logo ? `<button class="red" onclick="DB.logo='';save();vParam()">Retirer le logo</button>` : ""}</div></div>
  <div class="panel"><h3>Code d’accès</h3><div class="row"><input id="sCode" type="password" placeholder="Nouveau code"><button onclick="saveCode()">Changer le code</button></div></div>
  <div class="panel"><h3>Matières et coefficients</h3><div class="row"><input id="mNom" placeholder="Matière"><input id="mGr" placeholder="Groupe (ex : Français)"><input id="mCoef" type="number" value="1" min="1" style="width:80px"><button onclick="addMat()">Ajouter</button>
   <button class="gray" onclick="if(confirm('Remplacer les matières par celles du modèle officiel ?')){DB.matieres=JSON.parse(JSON.stringify(MODELE));save();vParam()}">Charger le modèle officiel</button></div>
  <p style="font-size:13px;color:#64748b;margin-bottom:8px">Les matières d’un même groupe doivent se suivre dans la liste (comme Français sur le bulletin).</p>
  <table>${DB.matieres.map((m, i) => `<tr><td>${m.g ? esc(m.g) + " — " : ""}${esc(m.n)}</td><td>Coef ${m.c}</td><td><button class="red" onclick="DB.matieres.splice(${i},1);save();vParam()">Supprimer</button></td></tr>`).join("")}</table></div>`;
}
function saveEcole() {
  DB.school = $("sNom").value.trim() || DB.school;
  DB.annee = $("sAn").value.trim() || DB.annee;
  DB.ministere = $("sMin").value.trim() || DB.ministere;
  DB.tel = $("sTel").value.trim();
  DB.email = $("sMail").value.trim();
  DB.adresse = $("sAdr").value.trim();
  DB.web = $("sWeb").value.trim();
  DB.ninea = $("sNin").value.trim();
  DB.signataire = $("sSig").value.trim();
  DB.slogan = $("sSlo").value.trim();
  save();
  majNom();
  alert("Enregistré");
}
function setLogo(inp) {
  const f = inp.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    DB.logo = r.result;
    save();
    vParam();
  };
  r.readAsDataURL(f);
}
function saveCode() {
  const c = $("sCode").value;
  if (c.length < 4) return alert("Minimum 4 caractères");
  DB.code = c;
  save();
  alert("Code modifié");
}
function addMat() {
  const n = $("mNom").value.trim();
  if (!n) return;
  DB.matieres.push({ n, c: +$("mCoef").value || 1, g: $("mGr").value.trim() });
  save();
  vParam();
}
