let chart;
let studentName = "";
let lastResult = null;

/* ---------- SAVE NAME ---------- */
document.getElementById("saveNameBtn").addEventListener("click", () => {
  const name = document.getElementById("studentNameInput").value.trim();
  if (!name) return alert("Enter student name");
  studentName = name;
  document.getElementById("namePopup").style.display = "none";
});

/* ---------- VALIDATION ---------- */
function validate(a, i, s) {
  if (a > 100) return "Attendance max 100";
  if (i > 50) return "Internal max 50";
  if (s > 20) return "Assignment max 20";
  return null;
}

/* ---------- STATUS ---------- */
function getStatus(p) {
  if (p >= 80) return { text: "High Academic Potential Identified 🌟", pass: true, color: "#15803d" };
  if (p >= 50) return { text: "Consistent Performance, Needs Enhancement ⚡", pass: true, color: "#ca8a04" };
  return { text: "Performance Below Expected Level ⚠️", pass: false, color: "#dc2626" };
}

/* ---------- CONFETTI ---------- */
function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.top = "-10px";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.width = "8px";
    confetti.style.height = "8px";
    confetti.style.backgroundColor =
      ["#22c55e", "#14b8a6", "#5eead4", "#facc15", "#fb7185"][Math.floor(Math.random() * 5)];
    confetti.style.opacity = "0.9";
    confetti.style.borderRadius = "50%";
    confetti.style.zIndex = "9999";
    confetti.style.animation = `fall ${2 + Math.random() * 2}s linear`;

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 4000);
  }

  if (!document.getElementById("confettiAnim")) {
    const style = document.createElement("style");
    style.id = "confettiAnim";
    style.innerHTML = `
      @keyframes fall {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(720deg); }
      }
    `;
    document.head.appendChild(style);
  }
}

/* ---------- PREDICT ---------- */
document.getElementById("predictBtn").addEventListener("click", async () => {
  const attendance = Number(document.getElementById("attendance").value);
  const internal = Number(document.getElementById("internal").value);
  const assignment = Number(document.getElementById("assignment").value);
  const result = document.getElementById("result");

  if (!attendance || !internal || !assignment) {
    result.textContent = "Enter all values";
    return;
  }

  const err = validate(attendance, internal, assignment);
  if (err) {
    result.textContent = err;
    return;
  }

  const res = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attendance, internal, assignment })
  });

  const data = await res.json();
  const status = getStatus(data.probability);

  lastResult = {
    "Student Name": studentName,
    "Attendance (%)": attendance,
    "Internal Marks": internal,
    "Assignment Score": assignment,
    "Prediction Probability": data.probability + "%",
    "Status": status.text,
    "Result": status.pass ? "PASS" : "FAIL"
  };

  result.innerHTML = `
    <strong>${studentName}</strong><br>
    Probability: ${data.probability}%<br>
    <span style="color:${status.color}; font-size:18px">${status.text}</span>
    <div style="
      margin:16px auto;
      width:140px;
      padding:12px;
      border-radius:30px;
      font-weight:800;
      letter-spacing:2px;
      color:${status.pass ? "#16a34a" : "#dc2626"};
      background:${status.pass ? "rgba(22,163,74,.15)" : "rgba(220,38,38,.15)"};
      animation: pop 0.6s ease;
    ">
      ${status.pass ? "PASS" : "FAIL"}
    </div>
  `;

  if (!document.getElementById("animStyle")) {
    const s = document.createElement("style");
    s.id = "animStyle";
    s.innerHTML = `
      @keyframes pop {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(s);
  }

  if (status.pass) launchConfetti();

  const ctx = document.getElementById("myChart").getContext("2d");
  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Attendance", "Internal", "Assignment"],
      datasets: [{
        data: [attendance, internal * 2, assignment * 5],
        backgroundColor: ["#14b8a6", "#0f766e", "#5eead4"],
        borderRadius: 8
      }]
    },
    options: { scales: { y: { beginAtZero: true, max: 100 } } }
  });
});

/* ---------- DOWNLOAD PDF ---------- */
document.getElementById("downloadPdfBtn").addEventListener("click", async () => {
  if (!lastResult) return alert("Generate prediction first");

  const res = await fetch("http://127.0.0.1:5000/download-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lastResult)
  });

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "Student_Performance_Report.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
