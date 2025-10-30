const checklistEl = document.getElementById("checklist");
const addCheckpointBtn = document.getElementById("addCheckpointBtn");

const participantsListEl = document.getElementById("participants-list");
const newParticipantInput = document.getElementById("new-participant");
const addParticipantBtn = document.getElementById("addParticipantBtn");

// Load or initialize participants
let participants = JSON.parse(localStorage.getItem("participants") || "[]");

// Load or initialize checkpoints
let checkpoints = JSON.parse(localStorage.getItem("checkpoints") || "[]");

renderParticipants();
render();

// ---------------- PARTICIPANTS ----------------

addParticipantBtn.onclick = () => {
  const name = newParticipantInput.value.trim();
  if (!name || participants.includes(name)) return;
  participants.push(name);
  newParticipantInput.value = "";
  saveParticipants();
  renderParticipants();
  render(); // Re-render checklist to include new participant checkboxes
};

function removeParticipant(name) {
  participants = participants.filter(p => p !== name);
  // Remove participant from all subtasks
  checkpoints.forEach(c => c.subtasks.forEach(s => delete s.participants[name]));
  saveParticipants();
  saveCheckpoints();
  renderParticipants();
  render();
}

function saveParticipants() {
  localStorage.setItem("participants", JSON.stringify(participants));
}

function renderParticipants() {
  participantsListEl.innerHTML = "";
  participants.forEach(name => {
    const span = document.createElement("span");
    span.textContent = name;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.onclick = () => removeParticipant(name);
    span.appendChild(removeBtn);
    participantsListEl.appendChild(span);
  });
}

// ---------------- CHECKPOINTS ----------------

addCheckpointBtn.onclick = () => {
  const name = prompt("Checkpoint name:");
  if (!name) return;
  checkpoints.push({ id: Date.now(), name, done: false, subtasks: [] });
  saveCheckpoints();
  render();
};

function toggleCheckpoint(id) {
  const c = checkpoints.find(c => c.id === id);
  c.done = !c.done;
  saveCheckpoints();
  render();
}

function addSubtask(checkpointId) {
  const name = prompt("Subtask name:");
  if (!name) return;
  const cp = checkpoints.find(c => c.id === checkpointId);
  const participantsObj = {};
  participants.forEach(p => (participantsObj[p] = false));
  cp.subtasks.push({ id: Date.now(), name, participants: participantsObj });
  saveCheckpoints();
  render();
}

function toggleParticipant(checkpointId, subtaskId, participantName) {
  const cp = checkpoints.find(c => c.id === checkpointId);
  const st = cp.subtasks.find(s => s.id === subtaskId);
  st.participants[participantName] = !st.participants[participantName];
  saveCheckpoints();
  render();
}

function checkAllParticipants(checkpointId, subtaskId) {
  const cp = checkpoints.find(c => c.id === checkpointId);
  const st = cp.subtasks.find(s => s.id === subtaskId);
  participants.forEach(p => (st.participants[p] = true));
  saveCheckpoints();
  render();
}

function deleteCheckpoint(id) {
  checkpoints = checkpoints.filter(c => c.id !== id);
  saveCheckpoints();
  render();
}

function saveCheckpoints() {
  localStorage.setItem("checkpoints", JSON.stringify(checkpoints));
}

function confirmDelete(id) {
  if (confirm("Are you sure you want to delete this checkpoint?")) {
    deleteCheckpoint(id);
  }
}

function render() {
  checklistEl.innerHTML = "";
  checkpoints.forEach(c => {
    const div = document.createElement("div");
    div.className = "checkpoint";
    div.innerHTML = `
      <h2>
        <input type="checkbox" ${c.done ? "checked" : ""} onchange="toggleCheckpoint(${c.id})">
        ${c.name}
        <button style="margin-left:auto" onclick="confirmDelete(${c.id})">🗑</button>
      </h2>
      <div class="subtasks">
        ${c.subtasks
          .map(st => {
            let participantCheckboxes = Object.keys(st.participants)
              .map(p => {
                const checked = st.participants[p] ? "checked" : "";
                return `<label>
                  <input type="checkbox" class="participant-checkbox" ${checked} onchange="toggleParticipant(${c.id}, ${st.id}, '${p}')">
                  ${p}
                </label>`;
              })
              .join("");
            return `
              <div>
                <strong>${st.name}</strong>
                <button class="check-all-btn" onclick="checkAllParticipants(${c.id}, ${st.id})">Check All</button>
                <div>${participantCheckboxes}</div>
              </div>`;
          })
          .join("")}
        <div class="add-subtask" onclick="addSubtask(${c.id})">+ Add subtask</div>
      </div>
    `;
    checklistEl.appendChild(div);
  });
}

// ---------------- EXPOSE FUNCTIONS TO GLOBAL SCOPE ----------------
window.toggleCheckpoint = toggleCheckpoint;
window.addSubtask = addSubtask;
window.toggleParticipant = toggleParticipant;
window.checkAllParticipants = checkAllParticipants;
window.deleteCheckpoint = deleteCheckpoint;
