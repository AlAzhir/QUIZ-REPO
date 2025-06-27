const sessionUser = localStorage.getItem("sessionUser");
if (!sessionUser) {
  alert("Unauthorized access. Please login first.");
  window.location.href = "../Front/Front.html";
} else if (sessionUser !== "admin") {
  alert("Only admin can access this page.");
  // Stay on the current page (user.html)
  window.location.href = "../User/user.html";
}

const form = document.getElementById("quizForm");
const addBtn = document.getElementById("addQuestion");
const saveBtn = document.getElementById("saveQuestion");
const message = document.getElementById("message");

let questionData = JSON.parse(localStorage.getItem("quizQuestions")) || [];
let isEditing = false;
let editingIndex = -1;

// Validate stored JSON
try {
  if (!Array.isArray(questionData)) throw new Error("Corrupt data");
} catch (e) {
  localStorage.removeItem("quizQuestions");
  questionData = [];
}

// Reset form UI
function resetForm() {
  form.innerHTML = `
    <h4>${isEditing ? `Editing Question ${editingIndex + 1}` : 'Add New Question'}</h4>
    <label>Question</label>
    <input type="text" id="qText" required><br>

    <label><input type="radio" name="qType" value="single" checked> Single Answer</label>
    <label><input type="radio" name="qType" value="multiple"> Multiple Answer</label><br>

    <label>Option A</label><input type="text" id="optA" required><br>
    <label>Option B</label><input type="text" id="optB" required><br>
    <label>Option C</label><input type="text" id="optC" required><br>
    <label>Option D</label><input type="text" id="optD" required><br>

    <label>Correct Answer(s)</label>
    <input type="text" id="ansText" placeholder="a,b,..." required><br><br>
  `;

  saveBtn.textContent = isEditing ? "Update Question" : "Save Question";

  if (isEditing) {
    const q = questionData[editingIndex];
    document.getElementById("qText").value = q.question;
    document.querySelector(`input[name='qType'][value='${q.type}']`).checked = true;
    document.getElementById("optA").value = q.options.a;
    document.getElementById("optB").value = q.options.b;
    document.getElementById("optC").value = q.options.c;
    document.getElementById("optD").value = q.options.d;
    document.getElementById("ansText").value = q.answer.join(',');
  }
}

// Save / Update
saveBtn.onclick = () => {
  const question = document.getElementById("qText").value.trim();
  const type = document.querySelector("input[name='qType']:checked").value;
  const options = {
    a: document.getElementById("optA").value.trim(),
    b: document.getElementById("optB").value.trim(),
    c: document.getElementById("optC").value.trim(),
    d: document.getElementById("optD").value.trim()
  };
  const answer = document.getElementById("ansText").value.trim().split(',').map(a => a.trim());

  if (!question || !options.a || !options.b || !options.c || !options.d || answer.length === 0) {
    message.innerHTML = '<p style="color:red">Please fill all fields correctly.</p>';
    return;
  }

  const newQuestion = { question, type, options, answer };

  if (isEditing) {
    questionData[editingIndex] = newQuestion;
    message.innerHTML = '<p style="color:green">Question updated!</p>';
    isEditing = false;
    editingIndex = -1;
  } else {
    questionData.push(newQuestion);
    message.innerHTML = '<p style="color:green">Question saved!</p>';
  }

  localStorage.setItem("quizQuestions", JSON.stringify(questionData));
  resetForm();
};

// Start new question
addBtn.onclick = () => {
  isEditing = false;
  editingIndex = -1;
  resetForm();
  message.innerHTML = "";
};

// Support editing from another page
const editFromOtherPage = localStorage.getItem("editIndex");
if (editFromOtherPage !== null) {
  editingIndex = parseInt(editFromOtherPage);
  isEditing = true;
  localStorage.removeItem("editIndex");
}

// Logout function
function logout() {
  localStorage.removeItem("sessionUser");
  window.location.href = "../Front/Front.html";
}
// Initial load
resetForm();
