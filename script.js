const $ = (id) => document.getElementById(id);

// Smoothly reveal sections as they enter the screen.
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(section => observer.observe(section));

document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("hello").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

// Photo preview: select a picture from your device to preview it in its card.
// For the live site, copy the same image into assets/photo1.jpg, photo2.jpg, photo3.jpg.
document.querySelectorAll(".photo-upload").forEach(input => {
  input.addEventListener("change", event => {
    const file = event.target.files[0];
    if (!file) return;
    const image = $(input.dataset.target);
    image.src = URL.createObjectURL(file);
    image.style.display = "block";
    input.parentElement.querySelector(".photo-placeholder").style.display = "none";
    showToast("Photo preview added! Add the file to assets before publishing.");
  });
});

const reasons = [
  "You make ordinary days feel like stories worth remembering.",
  "You understand my nonsense without requiring a user manual.",
  "You make me laugh even when I am determined not to.",
  "I can be completely myself around you. That is rare and priceless.",
  "You are strong, thoughtful, wonderfully weird, and so easy to love.",
  "No matter the distance, you still feel like my person."
];
let reasonIndex = 0;
$("nextReason").addEventListener("click", () => {
  reasonIndex = (reasonIndex + 1) % reasons.length;
  $("reasonNumber").textContent = `${String(reasonIndex + 1).padStart(2, "0")} / ${String(reasons.length).padStart(2, "0")}`;
  $("reasonText").textContent = reasons[reasonIndex];
});


const quiz = [
  {
    q: "What's our most powerful friendship skill?",
    options: [
      "Reading each other's minds",
      "Making a simple plan chaotic",
      "Laughing at absolutely nothing"
    ],
    answer: 2,
    feedback: "Correct. Our chaos is a talent."
  },
  {
    q: "What's my favourite colour?",
    options: [
      "Purple + Black",
      "Black + Red",
      "Black + White"
    ],
    answer: 0,
    feedback: "Correct. You sure do know me."
  },
  {
    q: "What's one thing that instantly makes me happy?",
    options: [
      "Good food",
      "My bestie",
      "Kdrama"
    ],
    answer: 1,
    feedback: "Correct. Nothing can be better than my bestie."
  },
  {
    q: "What does 'bestie' mean here?",
    options: [
      "A very normal friendship",
      "My favourite human and partner in crime",
      "Someone who has to tolerate me"
    ],
    answer: 1,
    feedback: "Exactly. No further explanation needed."
  },
  {
    q: "How far can distance put us apart?",
    options: [
      "A few time zones",
      "A lot of kilometres",
      "Not far enough to change this friendship"
    ],
    answer: 2,
    feedback: "That's the answer. Always."
  },
  {
    q: "If we were arrested together, what would be the reason?",
    type: "text",
    placeholder: "Tell me our crime 😂"
  },
  {
    q: "What's one promise you think we should make to each other?",
    type: "text",
    placeholder: "A promise for us... ♡"
  }
];

let quizIndex = 0;
let score = 0;
let writtenAnswers = {};

function escapeHTML(value) {
  const div = document.createElement("div");
  div.textContent = value;
  return div.innerHTML;
}

function renderQuiz() {
  if (quizIndex >= quiz.length) {
    showQuizResult();
    return;
  }

  const item = quiz[quizIndex];

  $("quizCount").textContent =
    `QUESTION ${quizIndex + 1} OF ${quiz.length}`;

  $("quizQuestion").textContent = item.q;
  $("quizFeedback").textContent = "";
  $("quizOptions").innerHTML = "";

  // TEXT QUESTIONS
  if (item.type === "text") {
    const textarea = document.createElement("textarea");
    textarea.className = "quiz-textbox";
    textarea.placeholder = item.placeholder;
    textarea.rows = 3;

    const submitButton = document.createElement("button");
    submitButton.className = "quiz-option submit-answer";
    submitButton.textContent = "Submit my answer ♡";

    submitButton.addEventListener("click", () => {
      const answer = textarea.value.trim();

      if (!answer) {
        $("quizFeedback").textContent =
          "You have to answer this one! ♡";
        return;
      }

      writtenAnswers[quizIndex] = answer;
      textarea.disabled = true;
      submitButton.disabled = true;

      $("quizFeedback").textContent =
        "Aww! Answer saved in our little memory book. ♡";

      setTimeout(() => {
        quizIndex++;
        renderQuiz();
      }, 1500);
    });

    $("quizOptions").appendChild(textarea);
    $("quizOptions").appendChild(submitButton);
    return;
  }

  // MULTIPLE-CHOICE QUESTIONS
  item.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "quiz-option";
    button.textContent = option;

    button.addEventListener("click", () => {
      const buttons = [...$("quizOptions").children];

      buttons.forEach(b => b.disabled = true);

      if (index === item.answer) {
        score++;
        button.classList.add("correct");
        $("quizFeedback").textContent = item.feedback;
      } else {
        button.classList.add("wrong");
        buttons[item.answer].classList.add("correct");

        $("quizFeedback").textContent =
          "Not quite! But you still get full bestie points. ♡";
      }

      setTimeout(() => {
        quizIndex++;
        renderQuiz();
      }, 1500);
    });

    $("quizOptions").appendChild(button);
  });
}


const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxzCnw0WitsiZIXvSN17oHErQ7i0_3l9CEl6nk6FbrLOAsYgcfGSN6sYDN_TE7oAYU/exec";

let answersSent = false;

function saveQuizAnswers() {
    if (answersSent) return;

    const quizData = {
        name: "Jiya",
        score: score,
        crime: writtenAnswers[5] || "",
        promise: writtenAnswers[6] || ""
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
            "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(quizData)
    })
    .then(() => {
        answersSent = true;
        console.log("Quiz submission sent.");
    })
    .catch(error => {
        console.error("Quiz submission failed:", error);
    });
}


// FINAL SCORE SCREEN
function showQuizResult() {
  const percentage = Math.round((score / 5) * 100);
  const answer1 = writtenAnswers[5] || "No answer given";
  const answer2 = writtenAnswers[6] || "No answer given";

  let title;
  let message;
  let emoji;

  if (score === 5) {
    title = "BESTIE TELEPATHY LEVEL: 1000!";
    message = "You know me better than I know myself! 💗";
    emoji = "👑";
  } else if (score >= 4) {
    title = "CERTIFIED SOUL SISTER!";
    message = "Almost a perfect score! You know me so well.";
    emoji = "💗";
  } else if (score >= 3) {
    title = "BESTIE IN TRAINING!";
    message = "We clearly need more bestie dates and gossip sessions! 🤣";
    emoji = "🌸";
  } else {
    title = "WHO ARE YOU? 😂";
    message = "Excuse me, we need to revise our friendship history!";
    emoji = "🤣";
  }

  $("quizCount").textContent = "QUIZ COMPLETED ✨";
  $("quizQuestion").textContent = "Look at you, birthday girl!";

  $("quizOptions").innerHTML = `
    <div class="result-screen">
      <div class="result-emoji">${emoji}</div>

      <div class="score-circle">
        <span>${score}/5</span>
        <small>${percentage}%</small>
      </div>

      <h2 class="result-title">${title}</h2>
      <p class="result-message">${message}</p>

      <div class="result-stars">✦ ✧ ★ ✧ ✦</div>

      <div class="answer-keepsake">
        <h3>💌 Your little promises</h3>

        <p><strong>Our crime:</strong><br>
        ${escapeHTML(writtenAnswers[5] || "")}</p>

        <p><strong>Our promise:</strong><br>
        ${escapeHTML(writtenAnswers[6] || "")}</p>
      </div>

      <p class="result-footer">
        No matter the score, you're stuck with me forever. ♡
      </p>

      <button class="primary-button" id="replayQuiz">
        Play again ↻
      </button>
    </div>
  `;

  $("quizFeedback").textContent = "";

  launchConfetti();

  $("replayQuiz").addEventListener("click", () => {
    quizIndex = 0;
    score = 0;
    writtenAnswers = {};
    renderQuiz();
  });
  saveQuizAnswers();
}

renderQuiz();



$("envelopeButton").addEventListener("click", () => {
  $("hiddenLetter").classList.toggle("show");
  $("envelopeButton").querySelector(".envelope-hint").textContent =
    $("hiddenLetter").classList.contains("show") ? "your letter is open ♡" : "tap to open";
});

const music = $("birthdayMusic");
$("musicButton").addEventListener("click", async () => {
  if (music.paused) {
    try {
      await music.play();
      $("musicStatus").textContent = "Now playing ♡";
      $("musicButton").textContent = "Ⅱ";
    } catch {
      showToast("Add assets/song.mp3 first, then try again.");
    }
  } else {
    music.pause();
    $("musicStatus").textContent = "A little soundtrack";
    $("musicButton").textContent = "♫";
  }
});

$("confettiButton").addEventListener("click", () => {
    // Big central explosion
    launchConfetti();

    // Extra bursts from both sides
    setTimeout(() => {
        launchConfetti();
    }, 300);

    setTimeout(() => {
        launchConfetti();
    }, 650);

    // Final celebration
    setTimeout(() => {
        launchConfetti();
    }, 1000);
});

function launchConfetti() {
  const colors = ["#ef9fc3", "#c2a9eb", "#f7d5e5", "#a88bd4", "#f6c5a8"];
  for (let i = 0; i < 100; i++) {
    const piece = document.createElement("span");
    piece.style.cssText = `position:fixed;z-index:30;left:${Math.random()*100}vw;top:-15px;width:${5+Math.random()*7}px;height:${8+Math.random()*9}px;background:${colors[i%colors.length]};border-radius:2px;pointer-events:none;`;
    document.body.appendChild(piece);
    const drift = (Math.random() - .5) * 260;
    const duration = 1800 + Math.random() * 1800;
    piece.animate([
      { transform: "translate3d(0,0,0) rotate(0deg)", opacity: 1 },
      { transform: `translate3d(${drift}px,105vh,0) rotate(${Math.random()*900}deg)`, opacity: .2 }
    ], { duration, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => piece.remove();
  }
}
function showToast(message) {
  $("toast").textContent = message;
  $("toast").classList.add("show");
  setTimeout(() => $("toast").classList.remove("show"), 3000);
}
