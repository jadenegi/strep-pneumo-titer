const SEROTYPES = [
  { label: "Type 1 (1)", key: "1" },
  { label: "Type 2 (2)", key: "2" },
  { label: "Type 3 (3)", key: "3" },
  { label: "Type 4 (4)", key: "4" },
  { label: "Type 5 (5)", key: "5" },
  { label: "Type 8 (8)", key: "8" },
  { label: "Type 9N (9)", key: "9N" },
  { label: "Type 12F (12)", key: "12F" },
  { label: "Type 14 (14)", key: "14" },
  { label: "Type 17F (17)", key: "17F" },
  { label: "Type 19F (19)", key: "19F" },
  { label: "Type 20 (20)", key: "20" },
  { label: "Type 22F (22)", key: "22F" },
  { label: "Type 23F (23)", key: "23F" },
  { label: "Type 6B (26)", key: "6B" },
  { label: "Type 10A (34)", key: "10A" },
  { label: "Type 11A (43)", key: "11A" },
  { label: "Type 7F (51)", key: "7F" },
  { label: "Type 15B (54)", key: "15B" },
  { label: "Type 18C (56)", key: "18C" },
  { label: "Type 19A (57)", key: "19A" },
  { label: "Type 9V (68)", key: "9V" },
  { label: "Type 33F (70)", key: "33F" },
];

const VACCINES = {
  PCV13: ["1", "3", "4", "5", "6A", "6B", "7F", "9V", "14", "18C", "19A", "19F", "23F"],
  PCV20: [
    "1",
    "3",
    "4",
    "5",
    "6A",
    "6B",
    "7F",
    "8",
    "9V",
    "10A",
    "11A",
    "12F",
    "14",
    "15B",
    "18C",
    "19A",
    "19F",
    "22F",
    "23F",
    "33F",
  ],
  PCV21: [
    "3",
    "6A",
    "7F",
    "8",
    "9N",
    "10A",
    "11A",
    "12F",
    "15A",
    "15B",
    "15C",
    "16F",
    "17F",
    "19A",
    "20A",
    "22F",
    "23A",
    "23B",
    "24F",
    "31",
    "33F",
    "35B",
  ],
  PPSV23: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6B",
    "7F",
    "8",
    "9N",
    "9V",
    "10A",
    "11A",
    "12F",
    "14",
    "15B",
    "17F",
    "18C",
    "19A",
    "19F",
    "20",
    "22F",
    "23F",
    "33F",
  ],
};

const DEFAULT_CUTOFFS = {
  child: 1.0,
  older: 1.3,
};

const RESPONSE_RULES = {
  child: 50,
  older: 70,
};

const els = {
  ageGroup: document.getElementById("ageGroup"),
  cutoffInput: document.getElementById("cutoffInput"),
  vaccineSelect: document.getElementById("vaccineSelect"),
  prePostToggle: document.getElementById("prePostToggle"),
  resetCutoff: document.getElementById("resetCutoff"),
  clearValues: document.getElementById("clearValues"),
  positiveCount: document.getElementById("positiveCount"),
  vaccineSummary: document.getElementById("vaccineSummary"),
  responseSummary: document.getElementById("responseSummary"),
  panelResult: document.getElementById("panelResult"),
  vaccineResult: document.getElementById("vaccineResult"),
  adequacyRule: document.getElementById("adequacyRule"),
  foldRiseBlock: document.getElementById("foldRiseBlock"),
  foldRiseResult: document.getElementById("foldRiseResult"),
  tableHeader: document.getElementById("tableHeader"),
  titerRows: document.getElementById("titerRows"),
  tableNote: document.getElementById("tableNote"),
};

let cutoffWasManuallyEdited = false;

renderTable();
calculate();

els.ageGroup.addEventListener("change", () => {
  cutoffWasManuallyEdited = false;
  setAgeCutoff();
  calculate();
});

els.cutoffInput.addEventListener("input", () => {
  cutoffWasManuallyEdited = true;
  calculate();
});

els.vaccineSelect.addEventListener("change", calculate);

els.prePostToggle.addEventListener("change", () => {
  renderTable();
  calculate();
});

els.resetCutoff.addEventListener("click", () => {
  cutoffWasManuallyEdited = false;
  setAgeCutoff();
  calculate();
});

els.clearValues.addEventListener("click", () => {
  document.querySelectorAll("input[data-role='post'], input[data-role='pre']").forEach((input) => {
    input.value = "";
  });
  calculate();
});

function renderTable() {
  const isPrePost = els.prePostToggle.checked;
  els.foldRiseBlock.hidden = !isPrePost;
  els.tableNote.textContent = isPrePost
    ? "Enter pre and post vaccine values. The post value is used for positive-response percentages."
    : "Enter titer values from the report. Blank selected-vaccine fields count as not positive.";

  els.tableHeader.innerHTML = [
    "<th>Serotype</th>",
    isPrePost ? "<th>Pre</th>" : "",
    `<th>${isPrePost ? "Post" : "Titer"}</th>`,
    "<th>Status</th>",
    isPrePost ? "<th>2-fold rise</th>" : "",
  ].join("");

  els.titerRows.innerHTML = SEROTYPES.map((serotype) => {
    const storedPre = getStoredValue(serotype.key, "pre");
    const storedPost = getStoredValue(serotype.key, "post");
    return `
      <tr data-serotype="${serotype.key}">
        <th scope="row">${serotype.label}</th>
        ${
          isPrePost
            ? `<td><input class="titer-input" data-role="pre" data-serotype="${serotype.key}" type="text" inputmode="decimal" value="${storedPre}" /></td>`
            : ""
        }
        <td><input class="titer-input" data-role="post" data-serotype="${serotype.key}" type="text" inputmode="decimal" value="${storedPost}" /></td>
        <td class="status-cell" data-status></td>
        ${isPrePost ? `<td class="status-cell" data-fold></td>` : ""}
      </tr>
    `;
  }).join("");

  els.titerRows.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", calculate);
  });
}

function getStoredValue(serotype, role) {
  const input = document.querySelector(`input[data-serotype="${serotype}"][data-role="${role}"]`);
  return input ? input.value : "";
}

function setAgeCutoff() {
  els.cutoffInput.value = DEFAULT_CUTOFFS[els.ageGroup.value].toFixed(1);
}

function calculate() {
  const cutoff = Number.parseFloat(els.cutoffInput.value);
  const usableCutoff = Number.isFinite(cutoff) ? cutoff : DEFAULT_CUTOFFS[els.ageGroup.value];
  const vaccineName = els.vaccineSelect.value;
  const selectedKeys = new Set(VACCINES[vaccineName]);
  const measuredVaccineSerotypes = SEROTYPES.filter((serotype) => selectedKeys.has(serotype.key));
  const responseThreshold = RESPONSE_RULES[els.ageGroup.value];
  const isPrePost = els.prePostToggle.checked;

  let positive = 0;
  let entered = 0;
  let vaccinePositive = 0;
  let vaccineEntered = 0;
  let foldRiseCount = 0;

  for (const serotype of SEROTYPES) {
    const row = els.titerRows.querySelector(`tr[data-serotype="${serotype.key}"]`);
    if (!row) continue;

    const postValue = readValue(serotype.key, "post");
    const preValue = readValue(serotype.key, "pre");
    const isEntered = Number.isFinite(postValue);
    const isPositive = isEntered && postValue >= usableCutoff;
    const inVaccine = selectedKeys.has(serotype.key);
    const hasFoldRise =
      isPrePost && Number.isFinite(preValue) && Number.isFinite(postValue) && preValue > 0 && postValue / preValue >= 2;

    row.classList.toggle("row-positive", isPositive);
    row.classList.toggle("row-vaccine", inVaccine);
    row.querySelector("[data-status]").innerHTML = statusBadge(isEntered, isPositive, inVaccine);

    const foldCell = row.querySelector("[data-fold]");
    if (foldCell) {
      foldCell.innerHTML = foldBadge(preValue, postValue, hasFoldRise);
    }

    if (isEntered) {
      entered += 1;
      if (isPositive) positive += 1;
    }
    if (inVaccine && isEntered) {
      vaccineEntered += 1;
      if (isPositive) vaccinePositive += 1;
    }
    if (hasFoldRise) {
      foldRiseCount += 1;
    }
  }

  const denominator = measuredVaccineSerotypes.length;
  const percent = denominator ? Math.round((vaccinePositive / denominator) * 100) : 0;
  const isAdequate = denominator > 0 && percent >= responseThreshold;
  const hasAnyValue = entered > 0;
  const vaccineMissing = denominator - vaccineEntered;

  els.positiveCount.textContent = `${positive} / ${SEROTYPES.length}`;
  els.vaccineSummary.textContent = `${vaccineName} (${denominator} measured)`;
  els.responseSummary.textContent = hasAnyValue ? (isAdequate ? "Adequate response" : "Poor response") : "Enter titers";
  els.responseSummary.className = hasAnyValue ? (isAdequate ? "good" : "poor") : "";
  els.panelResult.textContent = `${positive} positive of ${entered || SEROTYPES.length} ${entered ? "entered" : "serotypes"}`;
  els.vaccineResult.textContent = `${percent}% positive (${vaccinePositive}/${denominator})`;
  els.adequacyRule.textContent = `≥${responseThreshold}% positive`;
  els.foldRiseResult.textContent = `${foldRiseCount} serotype${foldRiseCount === 1 ? "" : "s"}`;

  if (vaccineMissing > 0) {
    els.vaccineResult.textContent += `, ${vaccineMissing} blank`;
  }
}

function readValue(serotype, role) {
  const input = document.querySelector(`input[data-serotype="${serotype}"][data-role="${role}"]`);
  const value = Number.parseFloat(input?.value ?? "");
  return Number.isFinite(value) ? value : NaN;
}

function statusBadge(isEntered, isPositive, inVaccine) {
  const positivity = isEntered
    ? `<span class="badge ${isPositive ? "badge-positive" : "badge-negative"}">${isPositive ? "Positive" : "Negative"}</span>`
    : `<span class="badge">Blank</span>`;
  const vaccine = inVaccine ? `<span class="badge badge-vaccine">Vaccine</span>` : "";
  return `${positivity}${vaccine}`;
}

function foldBadge(preValue, postValue, hasFoldRise) {
  if (!Number.isFinite(preValue) || !Number.isFinite(postValue)) {
    return `<span class="badge">Blank</span>`;
  }
  if (preValue <= 0) {
    return `<span class="badge">Pre is 0</span>`;
  }
  const ratio = postValue / preValue;
  return `<span class="badge ${hasFoldRise ? "badge-positive" : "badge-negative"}">${
    hasFoldRise ? "Yes" : "No"
  } (${formatRatio(ratio)}x)</span>`;
}

function formatRatio(value) {
  if (!Number.isFinite(value)) return "";
  if (value >= 10) return value.toFixed(0);
  return value.toFixed(1);
}
