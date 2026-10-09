"use client";

import { useEffect, useState } from "react";
import { fetchWillData, JURISDICTION_LABELS } from "../../../lib/willData";
import { buildWillText, buildWillSections, openingLines } from "../../../lib/willText";
import { buildFamilyMapModel, buildFamilyMapSvg } from "../../../lib/familyMap";
import { SIGNING_INSTRUCTIONS, SIGNING_WARNINGS } from "../../../lib/signingInstructions";
import WillStageShell from "../../../components/WillStageShell";
import WillPageFrame from "../../../components/WillPageFrame";
import FamilyEstateMap from "../../../components/FamilyEstateMap";
import { btn, btnSmall } from "../../../components/styles";

// Turns an SVG string into a PNG data URL by drawing it into an offscreen
// canvas — this is how the same map that's drawn live on Stage 9 ends up
// as an image inside the PDF, rather than needing two separate drawings.
function svgToPngDataUrl(svgString, scale = 2) {
  return new Promise((resolve, reject) => {
    const match = svgString.match(/width="(\d+(?:\.\d+)?)".*?height="(\d+(?:\.\d+)?)"/);
    const width = match ? parseFloat(match[1]) : 640;
    const height = match ? parseFloat(match[2]) : 360;
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve({ dataUrl: canvas.toDataURL("image/png"), width, height });
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

function Document({ willId }) {
  const [text, setText] = useState("");
  const [built, setBuilt] = useState(null); // { jurisdiction, name, sections }
  const [willData, setWillData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [makingPdf, setMakingPdf] = useState(false);

  useEffect(() => {
    fetchWillData(willId).then((data) => {
      setWillData(data);
      setText(buildWillText(data.will?.jurisdiction, data));
      setBuilt({
        jurisdiction: data.will?.jurisdiction,
        name: data.about?.full_name || "",
        opening: openingLines(data.about),
        sections: buildWillSections(data.will?.jurisdiction, data),
      });
    });
  }, [willId]);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-will-draft.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function downloadPdf() {
    setMakingPdf(true);
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });

    const margin = 56;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 15;
    const jurLabel = JURISDICTION_LABELS[built.jurisdiction] || built.jurisdiction;

    // ---- Cover page: centered horizontally AND vertically ----
    doc.setFont("times", "bold");
    doc.setFontSize(24);
    doc.text("LAST WILL AND TESTAMENT", pageWidth / 2, pageHeight / 2 - 36, { align: "center" });
    doc.setFont("times", "normal");
    doc.setFontSize(15);
    doc.text(`(${jurLabel})`, pageWidth / 2, pageHeight / 2 - 6, { align: "center" });
    doc.setFontSize(13);
    doc.text(`This is the last Will and Testament of ${built.name}`, pageWidth / 2, pageHeight / 2 + 26, { align: "center" });

    // ---- Family & Estate Summary page ----
    const mapModel = buildFamilyMapModel(willData);
    if (mapModel.beneficiaries.length > 0) {
      doc.addPage();
      let my = margin;
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("FAMILY & ESTATE SUMMARY", pageWidth / 2, my, { align: "center" });
      my += 26;
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      const summaryIntro = doc.splitTextToSize(
        "A visual summary of who inherits what under this Will, generated from the answers given in this document pack. This page is for clarity only — it does not itself form part of the legal Will above.",
        maxWidth
      );
      summaryIntro.forEach((line) => {
        doc.text(line, margin, my);
        my += 13;
      });
      my += 10;

      try {
        const svg = buildFamilyMapSvg(mapModel);
        const { dataUrl, width, height } = await svgToPngDataUrl(svg, 2);
        const drawWidth = Math.min(maxWidth, width);
        const drawHeight = (height / width) * drawWidth;
        doc.addImage(dataUrl, "PNG", margin, my, drawWidth, drawHeight);
      } catch (e) {
        doc.text("(Family & Estate Map could not be generated for this PDF.)", margin, my);
      }
    }

    // ---- Estate Administration Notes page (only if any notes exist) ----
    const adminNotes = willData.adminNotes || [];
    if (adminNotes.length > 0) {
      doc.addPage();
      let ny = margin;
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text("ESTATE ADMINISTRATION NOTES", pageWidth / 2, ny, { align: "center" });
      ny += 20;
      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.text("NOT PART OF THE WILL", pageWidth / 2, ny, { align: "center" });
      ny += 22;
      doc.setFont("times", "normal");
      doc.setFontSize(10.5);
      const adminIntro = doc.splitTextToSize(
        "These are practical notes for whoever administers the estate — they do not amend, override or form part of the legal Will above. They are provided for guidance only.",
        maxWidth
      );
      adminIntro.forEach((line) => {
        doc.text(line, margin, ny);
        ny += 13;
      });
      ny += 12;
      doc.setFontSize(11);
      adminNotes.forEach((note) => {
        const lines = doc.splitTextToSize(`•  ${note.note_text}`, maxWidth - 10);
        lines.forEach((line) => {
          if (ny > pageHeight - margin) {
            doc.addPage();
            ny = margin;
          }
          doc.text(line, margin, ny);
          ny += 15;
        });
        ny += 6;
      });
    }

    // ---- Content pages ----
    doc.addPage();
    let y = margin;

    function runningHeading() {
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.text("LAST WILL AND TESTAMENT", pageWidth / 2, y, { align: "center" });
      y += 18;
      doc.setFont("times", "normal");
      doc.setFontSize(11);
      doc.text(`(${jurLabel})`, pageWidth / 2, y, { align: "center" });
      y += 16;
      doc.text(`This is the last Will and Testament of ${built.name}`, pageWidth / 2, y, { align: "center" });
      y += 26;
    }
    runningHeading();

    function ensureSpace(extra = 0) {
      if (y + extra > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    }

    // Splits on real line breaks FIRST (a multi-line address box has actual
    // "\n" characters in it), then word-wraps each of those lines to width.
    // Doing the "\n" split ourselves — rather than trusting splitTextToSize
    // to handle it — is what actually fixes lines overlapping.
    function wrapText(text, width) {
      return text.split("\n").flatMap((part) => doc.splitTextToSize(part, width));
    }

    // opening lines (born / address), left-aligned under the centered heading
    doc.setFont("times", "normal");
    doc.setFontSize(11);
    built.opening.slice(1).forEach((line) => {
      wrapText(line, maxWidth).forEach((wrapped) => {
        ensureSpace(lineHeight);
        doc.text(wrapped, margin, y);
        y += lineHeight;
      });
    });
    y += 10;

    built.sections.forEach((s) => {
      if (s.type === "para" && s.text === "") {
        y += lineHeight * 0.6;
        return;
      }
      if (s.type === "heading") {
        ensureSpace(lineHeight * 2);
        y += 8;
        doc.setFont("times", "bold");
        doc.setFontSize(12);
        wrapText(s.text, maxWidth).forEach((line) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
        y += 2;
      } else if (s.type === "bullet") {
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        const bulletIndent = 16;
        wrapText(s.text, maxWidth - bulletIndent).forEach((line, i) => {
          ensureSpace(lineHeight);
          if (i === 0) doc.text("•", margin, y);
          doc.text(line, margin + bulletIndent, y);
          y += lineHeight;
        });
      } else {
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        wrapText(s.text, maxWidth).forEach((line) => {
          ensureSpace(lineHeight);
          doc.text(line, margin, y);
          y += lineHeight;
        });
      }
    });

    // ---- Signing & Witnessing Guide page ----
    doc.addPage();
    let sy = margin;
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("SIGNING & WITNESSING GUIDE", pageWidth / 2, sy, { align: "center" });
    sy += 20;
    doc.setFont("times", "italic");
    doc.setFontSize(10.5);
    doc.text(`For ${jurLabel}`, pageWidth / 2, sy, { align: "center" });
    sy += 24;

    doc.setFont("times", "normal");
    doc.setFontSize(11);
    (SIGNING_INSTRUCTIONS[built.jurisdiction] || []).forEach((step, i) => {
      const lines = doc.splitTextToSize(`${i + 1}.  ${step}`, maxWidth - 10);
      lines.forEach((line) => {
        if (sy > pageHeight - margin) {
          doc.addPage();
          sy = margin;
        }
        doc.text(line, margin, sy);
        sy += 15;
      });
      sy += 6;
    });

    sy += 10;
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.text("Before you sign — important", margin, sy);
    sy += 18;
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    SIGNING_WARNINGS.forEach((w) => {
      const lines = doc.splitTextToSize(`•  ${w}`, maxWidth - 10);
      lines.forEach((line) => {
        if (sy > pageHeight - margin) {
          doc.addPage();
          sy = margin;
        }
        doc.text(line, margin, sy);
        sy += 14;
      });
      sy += 4;
    });

    doc.save("my-will-draft.pdf");
    setMakingPdf(false);
  }

  if (!text) return <p>Building your document…</p>;

  return (
    <div>
      <p style={{ fontSize: 13.5, color: "#7a7266" }}>
        This is a first draft built from your answers, for {JURISDICTION_LABELS[built?.jurisdiction] || built?.jurisdiction}.
        Read it carefully — if anything looks wrong, go back and fix that stage rather than editing this text
        directly, so your answers stay in sync.
      </p>

      <h3 style={{ fontSize: 15, margin: "18px 0 8px" }}>Family &amp; Estate Summary</h3>
      <FamilyEstateMap data={willData} />
      <p style={{ fontSize: 12.5, color: "#7a7266", margin: "8px 0 18px" }}>
        This is included as its own page in the PDF, right after the cover page — it's for clarity only and isn't
        part of the legal Will itself.
      </p>

      <pre
        style={{
          background: "#faf7f1",
          border: "1px solid #e3d9c8",
          borderRadius: 10,
          padding: 18,
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
          maxHeight: 420,
          overflowY: "auto",
          fontFamily: "ui-monospace, Menlo, monospace",
        }}
      >
        {text}
      </pre>
      <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
        <button type="button" style={btn} onClick={downloadPdf} disabled={makingPdf}>
          {makingPdf ? "Building PDF…" : "Download PDF"}
        </button>
        <button type="button" style={btnSmall} onClick={copy}>
          {copied ? "Copied ✓" : "Copy text"}
        </button>
        <button type="button" style={btnSmall} onClick={downloadTxt}>
          Download .txt
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: "#7a7266", marginTop: 12 }}>
        The PDF is your full document pack: a cover page, the Family &amp; Estate Summary, your Estate
        Administration Notes (if you've added any — clearly marked as not part of the Will), the Will itself with
        dates shown UK-style (DD/MM/YYYY), and a Signing &amp; Witnessing Guide at the end. It's for printing and
        signing (see the next stage), not a substitute for the physical, signed paper original once witnessed.
      </p>
    </div>
  );
}

export default function DocumentPage() {
  return (
    <WillStageShell>
      {(willId) => (
        <WillPageFrame willId={willId} current={13} desc="Your draft Will document, generated from everything you've entered." nextLabel="Continue to Stage 14: Signing">
          <Document willId={willId} />
        </WillPageFrame>
      )}
    </WillStageShell>
  );
}
