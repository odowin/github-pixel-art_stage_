// ====== CONFIG ======
const year = new Date().getFullYear(); // année automatique
const rows = 7;
const grid = document.getElementById("grid");

// Titre dynamique
document.getElementById("title").textContent =
  `Clique sur les cases pour créer ton dessin — jours hors ${year} sont grisées`;

// utilitaires
function cloneDate(d){ return new Date(d.getTime()); }
function addDays(d, n){ const x = cloneDate(d); x.setDate(x.getDate()+n); return x; }

// Calculer le dimanche avant le 1er janvier
let firstDay = new Date(year, 0, 1);
while (firstDay.getDay() !== 0) { // 0 = dimanche
  firstDay = addDays(firstDay, -1);
}

// Calculer le samedi après le 31 décembre
let lastDay = new Date(year, 11, 31);
while (lastDay.getDay() !== 6) { // 6 = samedi
  lastDay = addDays(lastDay, 1);
}

// Nombre de jours et colonnes (semaines)
const totalDays = Math.round((lastDay - firstDay) / (1000*60*60*24)) + 1;
const cols = Math.ceil(totalDays / 7);

// Matrice
const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

// -------- calcul numéro de semaine ISO --------
function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

// -------- entête colonnes --------
const headerRow = document.createElement("tr");
const corner = document.createElement("th");
headerRow.appendChild(corner);
for (let c = 0; c < cols; c++) {
  const th = document.createElement("th");
  const weekStart = addDays(firstDay, c * 7);
  const iso = isoWeekNumber(addDays(weekStart, 1));
  th.textContent = (c + 1).toString().padStart(2, "0");
  th.title = `Semaine ISO ${iso}\nDébute: ${weekStart.toISOString().slice(0, 10)}`;
  headerRow.appendChild(th);
}
grid.appendChild(headerRow);

// -------- corps de la grille --------
const today = new Date();
today.setHours(0,0,0,0); // ignorer l'heure

for (let r = 0; r < rows; r++) {
  const tr = document.createElement("tr");
  const dayHeader = document.createElement("th");
  dayHeader.textContent = days[r];
  tr.appendChild(dayHeader);

  for (let c = 0; c < cols; c++) {
    const cellDate = addDays(firstDay, r + c * 7);
    const td = document.createElement("td");

    td.title = `${cellDate.toISOString().slice(0, 10)} (ISO wk ${isoWeekNumber(addDays(cellDate, 1))})`;

    // mettre en évidence la case d'aujourd'hui
    if (cellDate.getTime() === today.getTime()) {
      td.classList.add("today");
    }

    if (cellDate.getFullYear() !== year) {
      td.classList.add("disabled");
    } else {
      td.addEventListener("click", () => {
        td.classList.toggle("active");
        matrix[r][c] = td.classList.contains("active") ? 1 : 0;
      });
    }
    tr.appendChild(td);
  }
  grid.appendChild(tr);
}

// -------- export matrice --------
document.getElementById("export").addEventListener("click", () => {
  let output = `// year: ${year}  cols: ${cols}\npattern = [\n`;
  for (let r = 0; r < rows; r++) {
    output += "  " + JSON.stringify(matrix[r]) + ",  # " + days[r].toLowerCase() + "\n";
  }
  output += "]";
  document.getElementById("output").value = output;
});
