import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import confetti from "canvas-confetti";
import { useParams } from "react-router-dom";
import { useModuleStore } from "../../store/module";
import { useAuthStore } from "../../store/auth";

const CourseCompletionCertificate = () => {
  const { moduleId } = useParams();
  const { currentModule } = useModuleStore();
  const { currentUser } = useAuthStore();

  const studentName = currentUser?.name || "Student";
  const courseTitle = currentModule?.title || "Course";
  const completionDate = new Date().toLocaleDateString();

  const [showCongrats, setShowCongrats] = useState(false);
  const [finalScore, setFinalScore] = useState(null);
  const [passed, setPassed] = useState(null);

  useEffect(() => {
    const fetchGrade = async () => {
      try {
        const res = await fetch(`/api/modules/${moduleId}/enrollment`, {
          headers: { Authorization: `Bearer ${currentUser?.token}` },
        });
        const data = await res.json();
        if (data.success && data.data) {
          setFinalScore(Math.round(data.data.finalScore));
          setPassed(data.data.passed);
        }
      } catch (err) {
        console.error("Failed to fetch grade", err);
      }
    };

    fetchGrade();

    setTimeout(() => {
      setShowCongrats(true);
      celebrate();
      generateCertificate();
    }, 1000);
  }, [moduleId]);

console.log(finalScore, passed);

  const celebrate = () => {
    const duration = 5000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 2000 };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 5 + (timeLeft / duration) * 100;
      confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() * 0.6 } });
    }, 250);
  };

  const generateCertificate = async () => {
    const certificateElement = document.getElementById("certificate");
    const canvas = await html2canvas(certificateElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`${studentName}_Certificate.pdf`);
  };

  return (
    <div
      id="certificate"
      style={{
        width: "1122px",
        height: "794px",
        padding: "50px",
        textAlign: "center",
        backgroundColor: "#f8f9fa",
        fontFamily: "'Roboto', sans-serif",
        position: "relative",
        color: "#003366",
        overflow: "hidden",
      }}
    >
      {/* Wavy Border & Background */}
      <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}>
        <defs>
          <linearGradient id="borderGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#004A9F" />
            <stop offset="100%" stopColor="#DAA520" />
          </linearGradient>
        </defs>
        <path
          d="M20,50 C50,0 1072,0 1102,50 L1102,744 C1072,794 50,794 20,744 Z"
          stroke="url(#borderGradient)"
          strokeWidth="8"
          fill="none"
        />
        {[...Array(30)].map((_, i) => {
          const yOffset = i * 25 + 25;
          return <path key={i} d={`M0 ${yOffset} C 100 10, 300 40, 1122 ${yOffset}`} stroke="rgba(74,144,226,0.15)" strokeWidth="1" fill="none" />;
        })}
        {[...Array(45)].map((_, i) => {
          const xOffset = i * 25 + 25;
          return <path key={i + 100} d={`M${xOffset} 0 C 10 100, 40 300, ${xOffset} 794`} stroke="rgba(218,165,32,0.15)" strokeWidth="1" fill="none" />;
        })}
      </svg>

      {/* Centered Certificate Content */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 1, textAlign: "center" }}>
        <h1 style={{ fontSize: "60px", color: "#004A9F", fontFamily: "'Crimson Text', serif", marginBottom: "20px" }}>
          Certificate of Completion
        </h1>
        <h2 style={{ fontSize: "40px", margin: "20px 0", fontWeight: "600" }}>{courseTitle}</h2>
        <p style={{ fontSize: "24px", marginBottom: "15px" }}>This certificate is proudly presented to</p>
        <p style={{ fontSize: "38px", fontWeight: "bold", color: "#DAA520", margin: "20px 0" }}>{studentName}</p>
        <p style={{ fontSize: "22px", marginBottom: "20px" }}>for successfully completing the course.</p>

        {/* Final Grade Badge */}
        {finalScore !== null && (
          <p style={{ fontSize: "24px", marginTop: "30px", fontWeight: "600" }}>
            Final Score: {finalScore}% {passed ? "✅ Passed" : "❌ Not Passed"}
          </p>
        )}
      </div>

      {/* Footer */}
      <p style={{ fontSize: "18px", position: "absolute", bottom: "50px", left: "50px", color: "#003366" }}>Date: {completionDate}</p>
      <p style={{ fontSize: "18px", position: "absolute", bottom: "50px", right: "50px", color: "#003366" }}>Signature</p>
    </div>
  );
};

export default CourseCompletionCertificate;