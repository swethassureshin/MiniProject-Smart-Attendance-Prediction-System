from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pickle
import io

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

app = Flask(__name__)
CORS(app)

# ---------------- LOAD TRAINED ML MODEL ----------------
model = pickle.load(open("model.pkl", "rb"))

# ---------------- HOME ROUTE ----------------
@app.route("/")
def home():
    return "Student Performance Prediction Backend Running"

# ---------------- ML PREDICTION ROUTE ----------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    attendance = int(data["attendance"])
    internal = int(data["internal"])
    assignment = int(data["assignment"])

    # ML prediction (probability of PASS)
    probability = model.predict_proba(
        [[attendance, internal, assignment]]
    )[0][1]

    return jsonify({
        "attendance": attendance,
        "internal": internal,
        "assignment": assignment,
        "probability": int(probability * 100)
    })

# ---------------- PDF GENERATION ROUTE ----------------
@app.route("/download-pdf", methods=["POST"])
def download_pdf():
    data = request.get_json()

    buffer = io.BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawCentredString(width / 2, height - 60, "Student Performance Report")

    pdf.setFont("Helvetica", 12)
    y = height - 120

    for key, value in data.items():
        pdf.drawString(80, y, f"{key}: {value}")
        y -= 28

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="Student_Performance_Report.pdf",
        mimetype="application/pdf"
    )

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)
