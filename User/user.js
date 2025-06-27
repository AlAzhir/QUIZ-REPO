const sessionUser = localStorage.getItem("sessionUser");
if (!sessionUser) {
  alert("Unauthorized access. Please login first.");
  window.location.href = "../Front/Front.html";
} else if (sessionUser === "admin") {
  alert("Admins cannot access the user page.");
  window.location.href = "../Admin/admin.html";
}

const userForm = document.getElementById("userQuizForm");
const resultDiv = document.getElementById("result");
const progressDiv = document.getElementById("quizProgress");
const startBtn = document.getElementById("startBtn");
const visualTimerContainer = document.getElementById("visual-timer-container");
const visualTimer = document.getElementById("visual-timer");

// Only parse inside try-catch, and use let
let questions = [];
try {
  const raw = localStorage.getItem("quizQuestions");
  questions = raw ? JSON.parse(raw) : [];
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No quiz questions found.");
  }
} catch (e) {
  alert("Quiz data is missing or corrupted. Please contact admin or reload the quiz.");
  localStorage.removeItem("quizQuestions");
  window.location.reload();
}

const timePerQuestion = 40; // seconds per question
const totalQuizTime = questions.length * timePerQuestion; // total time in seconds

let timeLeft = totalQuizTime;
let timerInterval;
let current = 0;
let answers = [];

function updateVisualTimer() {
  const min = Math.floor(timeLeft / 60);
  const sec = timeLeft % 60;
  visualTimer.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

function startVisualTimer() {
  updateVisualTimer();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateVisualTimer();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function showQuestion(i) {
  if (!questions[i]) {
    alert("Question data missing. Please contact admin.");
    return;
  }
  const q = questions[i];
  progressDiv.innerHTML = `<p>Question ${i + 1} of ${questions.length}</p>`;
  userForm.innerHTML = `<div><h3>${q.question}</h3>`;
  Object.entries(q.options).forEach(([k, v]) => {
    userForm.innerHTML += `
      <label><input type="${q.type === 'single' ? 'radio' : 'checkbox'}" name="q" value="${k}"> ${v}</label><br>`;
  });

  // Restore previous answers if any
  userForm.innerHTML += `<br>`;
  if (i > 0) {
    userForm.innerHTML += `<button type="button" id="prevBtn">Previous</button>`;
  }
  userForm.innerHTML += `<button type="submit">${i === questions.length - 1 ? 'Finish' : 'Next'}</button></div>`;

  // Restore checked state after rendering all options
  const prevAnswers = answers[i] || [];
  prevAnswers.forEach(val => {
    const input = userForm.querySelector(`input[value="${val}"]`);
    if (input) input.checked = true;
  });

  // Attach Previous button event
  if (i > 0) {
    document.getElementById("prevBtn").onclick = function () {
      saveCurrentAnswer();
      current--;
      showQuestion(current);
    };
  }
}

function saveCurrentAnswer() {
  const q = questions[current];
  const selected = q.type === "single"
    ? [userForm.querySelector("input[name='q']:checked")?.value].filter(Boolean)
    : Array.from(userForm.querySelectorAll("input[name='q']:checked")).map(x => x.value);
  answers[current] = selected;
}

userForm.onsubmit = function (e) {
  e.preventDefault();
  saveCurrentAnswer();
  current++;
  if (current < questions.length) {
    showQuestion(current);
  } else {
    clearInterval(timerInterval);
    finishQuiz();
  }
};

function finishQuiz() {
  userForm.style.display = "none";
  visualTimerContainer.style.display = "none";
  clearInterval(timerInterval);
  let score = 0;
  questions.forEach((q, i) => {
    const correct = q.answer.sort().join(',');
    const user = (answers[i] || []).sort().join(',');
    if (correct === user) score++;
  });
  const passMark = Math.ceil(questions.length * 0.8);
  const passed = score >= passMark;
  resultDiv.innerHTML = `<h2>Your Score: ${score}/${questions.length}</h2>
    <h3>${passed ? '✅ Passed' : '❌ Failed'} (Pass Mark: ${passMark})</h3>
    <button type="button" onclick="location.reload()">🔄 Retry</button>
    <button type="button" id="reviewBtn">🔍 Review</button>`;

  // Add event listener for review button
  document.getElementById("reviewBtn").onclick = function() {
    showReview(0);
  };
}

// Review mode: show one question at a time with Previous/Next
function showReview(reviewIndex) {
  resultDiv.innerHTML = `<h2>Quiz Review</h2>`;
  const q = questions[reviewIndex];
  const userAns = answers[reviewIndex] || [];
  const correctAns = q.answer;
  let optionsHtml = "";
  Object.entries(q.options).forEach(([key, value]) => {
    let className = "";
    if (userAns.includes(key) && correctAns.includes(key)) {
      className = "correct";
    } else if (userAns.includes(key) && !correctAns.includes(key)) {
      className = "wrong";
    } else if (!userAns.includes(key) && correctAns.includes(key)) {
      className = "missed";
    }
    optionsHtml += `<div class="${className}">${key}: ${value}</div>`;
  });

  resultDiv.innerHTML += `
    <div class="review-block">
      <h4>Q${reviewIndex + 1}: ${q.question}</h4>
      ${optionsHtml}
    </div>
  `;

  // Navigation buttons
  let navBtns = '<div class="review-nav">';
  if (reviewIndex > 0) {
    navBtns += `<button type="button" id="reviewPrevBtn">Previous</button>`;
  }
  if (reviewIndex < questions.length - 1) {
    navBtns += `<button type="button" id="reviewNextBtn">Next</button>`;
  }
  navBtns += `<button type="button" onclick="location.reload()">🔄 Retry</button>`;
  resultDiv.innerHTML += navBtns;

  // Attach navigation events
  if (reviewIndex > 0) {
    document.getElementById("reviewPrevBtn").onclick = function () {
      showReview(reviewIndex - 1);
    };
  }
  if (reviewIndex < questions.length - 1) {
    document.getElementById("reviewNextBtn").onclick = function () {
      showReview(reviewIndex + 1);
    };
  }
}

// Start button logic
startBtn.onclick = function () {
  if (!questions.length) {
    alert("No quiz questions found. Please contact admin.");
    return;
  }
  startBtn.style.display = "none";
  userForm.style.display = "block";
  visualTimerContainer.style.display = "flex";
  timeLeft = totalQuizTime; // reset timer
  current = 0;              // reset question index
  answers = [];             // reset answers
  showQuestion(current);
  startVisualTimer();
};

// Hide quiz form and timer initially
userForm.style.display = "none";
visualTimerContainer.style.display = "none";
// Show initial timer value before quiz starts
visualTimer.textContent = `${Math.floor(totalQuizTime/60)}:${(totalQuizTime%60).toString().padStart(2, '0')}`;

// Logout function
function logout() {
  localStorage.removeItem("sessionUser");
  window.location.href = "../Front/Front.html";
}