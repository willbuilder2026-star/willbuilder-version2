// Shared data shaping + SVG drawing for the Family & Estate Map, used by
// both the live Stage 9 page and the Document Pack PDF export, so the two
// can never drift out of sync — one function decides what the map looks
// like, and both places just call it.

// Turns the raw fetchWillData() result into the shape the map needs: one
// row per residuary beneficiary, each knowing what actually happens to
// their share if they predecease the Will-writer.
export function buildFamilyMapModel(data) {
  const testatorName = data.about?.full_name || "You";
  const hasPartner = !!(data.partner?.has_partner && data.partner?.partner_name);
  const partnerName = data.partner?.partner_name || "";

  // Named per beneficiary — despite the table name, these can be anyone
  // the person chooses (their own children, a niece and nephew, a
  // friend), not necessarily the beneficiary's own children.
  const namedByBeneficiary = {};
  (data.residuaryChildren || []).forEach((c) => {
    if (!namedByBeneficiary[c.beneficiary_id]) namedByBeneficiary[c.beneficiary_id] = [];
    namedByBeneficiary[c.beneficiary_id].push(c);
  });

  const beneficiaries = (data.beneficiaries || []).map((b) => {
    // `contingency` is the new field; `deceased` is the old one-off
    // checkbox this replaces — read it as a fallback so a will that
    // hasn't had the new migration applied yet still shows something
    // sensible rather than breaking.
    const contingency = b.contingency || (b.deceased ? "to_children" : "none");
    const namedRaw = namedByBeneficiary[b.id] || [];

    // If "passes to people they choose" was chosen but nobody's actually
    // been named, there's nobody for the share to go to — treat it the
    // same as "redistribute" rather than showing an empty dead end on
    // the map.
    const effectiveContingency = contingency === "to_children" && namedRaw.length === 0 ? "redistribute" : contingency;

    let named = [];
    if (effectiveContingency === "to_children") {
      const withShare = namedRaw.filter((k) => k.share_percent !== null && k.share_percent !== undefined);
      const unnamedCount = namedRaw.length - withShare.length;
      const namedTotal = withShare.reduce((sum, k) => sum + Number(k.share_percent), 0);
      const remaining = Math.max(0, (b.share_percent || 0) - namedTotal);
      const perUnnamed = unnamedCount > 0 ? remaining / unnamedCount : 0;
      named = namedRaw.map((k) =>
        k.share_percent !== null && k.share_percent !== undefined
          ? { name: k.name, share: Number(k.share_percent) }
          : { name: k.name, share: Math.round(perUnnamed * 100) / 100 }
      );
    }

    return {
      id: b.id,
      name: b.name,
      share: Number(b.share_percent) || 0,
      contingency,
      effectiveContingency,
      // Kept as `children` for backward compatibility with existing
      // callers (willText.js, this file) — the people themselves can be
      // anyone the beneficiary chose, not only their children.
      children: named,
    };
  });

  return { testatorName, hasPartner, partnerName, beneficiaries };
}

const COLORS = {
  ink: "#1c2b3a",
  inkSoft: "#4a5867",
  paperRaised: "#ffffff",
  accent: "#9c6b32",
  accentDeep: "#7a5225",
  line: "#e3d9c8",
  muted: "#7a7266",
  warn: "#a8541f",
  warnSoft: "#f6e6dc",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Rough (but reliable across renderers, since SVG text has no layout
// engine of its own) character-width estimate for wrapping plain text at
// a given font size/weight, in this font stack.
function wrapLines(text, maxWidthPx, fontSize, bold) {
  const charWidth = fontSize * (bold ? 0.54 : 0.5);
  const maxChars = Math.max(8, Math.floor(maxWidthPx / charWidth));
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = "";
  words.forEach((w) => {
    const candidate = cur ? `${cur} ${w}` : w;
    if (candidate.length > maxChars && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  });
  if (cur) lines.push(cur);
  // Hard-break any single word/line still too long for the box (a very
  // long double-barrelled name with no spaces) — break after a hyphen
  // where there is one, rather than mid-word, and only fall back to a
  // raw character split if that still doesn't fit.
  return lines.length
    ? lines.flatMap((line) => {
        if (line.length <= maxChars) return [line];
        const hyphenParts = line.split(/(?<=-)/);
        if (hyphenParts.length > 1 && hyphenParts.every((p) => p.length <= maxChars)) {
          const out = [];
          let chunk = "";
          hyphenParts.forEach((p) => {
            if ((chunk + p).length > maxChars && chunk) {
              out.push(chunk);
              chunk = p;
            } else {
              chunk += p;
            }
          });
          if (chunk) out.push(chunk);
          return out;
        }
        const parts = [];
        for (let i = 0; i < line.length; i += maxChars) parts.push(line.slice(i, i + maxChars));
        return parts;
      })
    : [""];
}

// Measures a box's required height for wrapped label + sub text, without
// drawing anything — used for layout, before we know each node's final y.
function measureBox(label, sub, w) {
  const padX = 14;
  const availW = w - padX * 2;
  const labelLines = wrapLines(label, availW, 13, true);
  const subLines = sub ? wrapLines(sub, availW, 11, false) : [];
  const lineH1 = 15;
  const lineH2 = 13;
  const contentH = labelLines.length * lineH1 + subLines.length * lineH2;
  const h = Math.max(46, contentH + 20);
  return { labelLines, subLines, h };
}

function nodeBox(x, cy, label, sub, opts = {}) {
  const w = opts.w || 168;
  const padX = 14;
  const { labelLines, subLines, h: measuredH } = measureBox(label, sub, w);
  const h = opts.h || measuredH;
  const y = cy - h / 2;
  const fill = opts.deceased ? COLORS.warnSoft : COLORS.paperRaised;
  const stroke = opts.deceased ? COLORS.warn : opts.root ? COLORS.accent : COLORS.line;
  const dash = opts.deceased ? ' stroke-dasharray="5,3"' : "";
  const strokeW = opts.root ? 2 : 1.4;
  const lineH1 = 15;
  const lineH2 = 13;
  const blockH = labelLines.length * lineH1 + subLines.length * lineH2;
  let ty = cy - blockH / 2 + lineH1 - 3;

  let out = "<g>";
  out += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"${dash}/>`;
  labelLines.forEach((line) => {
    out += `<text x="${x + padX}" y="${ty}" font-size="13" font-weight="600" fill="${COLORS.ink}">${esc(line)}</text>`;
    ty += lineH1;
  });
  subLines.forEach((line) => {
    out += `<text x="${x + padX}" y="${ty}" font-size="11" fill="${opts.deceased ? COLORS.warn : COLORS.muted}">${esc(line)}</text>`;
    ty += lineH2;
  });
  out += "</g>";
  return { svg: out, h };
}

function elbow(x1, y1, x2, y2, color) {
  const midX = x1 + (x2 - x1) * 0.45;
  return `<path d="M${x1} ${y1} L${midX} ${y1} L${midX} ${y2} L${x2} ${y2}" fill="none" stroke="${color || COLORS.line}" stroke-width="1.6"/>`;
}

// Builds a full standalone <svg>…</svg> string — used directly in the live
// page (dangerouslySetInnerHTML) and rasterised to a PNG for the PDF, so
// both show exactly the same drawing. Box sizes and heights are computed
// from the actual text (with wrapping), so a long name or a long list of
// named people grows the box instead of overflowing it.
export function buildFamilyMapSvg(model) {
  const rootX = 16;
  const childX = 330;
  const grandX = 540;
  const nodeW1 = 230;
  const nodeW2 = 195;
  const nodeW3 = 205;
  const rowGap = 8;
  const blockGap = 16;

  // Pass 1: measure every node so we know how tall each block needs to be
  // before we start positioning anything.
  const blocks = model.beneficiaries.map((b) => {
    const deceased = b.effectiveContingency !== "none";
    let shareLabel;
    if (b.effectiveContingency === "none") shareLabel = `${b.share}% of residue`;
    else shareLabel = "if deceased";
    const benef = measureBox(b.name || "Unnamed", shareLabel, nodeW2);

    let rightNodes = [];
    if (b.effectiveContingency === "to_children") {
      rightNodes = b.children.map((g) => ({
        label: g.name || "Unnamed",
        sub: `${g.share}% of residue`,
        ...measureBox(g.name || "Unnamed", `${g.share}% of residue`, nodeW3),
      }));
    } else if (b.effectiveContingency === "redistribute") {
      rightNodes = [
        {
          label: "Redistributed",
          sub: "among surviving beneficiaries",
          ...measureBox("Redistributed", "among surviving beneficiaries", nodeW3),
        },
      ];
    }

    const rightStackH = rightNodes.reduce((sum, n) => sum + n.h, 0) + Math.max(0, rightNodes.length - 1) * rowGap;
    const blockH = Math.max(benef.h, rightStackH || 0);
    return { b, deceased, shareLabel, benef, rightNodes, blockH };
  });

  const totalBlocksH = blocks.reduce((a, blk) => a + blk.blockH, 0) + Math.max(0, blocks.length - 1) * blockGap;
  const rootBoxH = measureBox(model.testatorName || "Will creator", "Will creator", nodeW1).h;
  const partnerBoxH = model.hasPartner ? measureBox(model.partnerName || "Partner", "Partner", nodeW1).h : 0;
  const rootStackH = model.hasPartner ? rootBoxH + partnerBoxH + 12 : rootBoxH;

  const height = Math.max(220, totalBlocksH + 48, rootStackH + 48);
  const rootCy = height / 2;

  let y = (height - totalBlocksH) / 2;
  const parts = [];

  blocks.forEach(({ b, deceased, shareLabel, blockH, rightNodes }) => {
    const cy = y + blockH / 2;
    const benefNode = nodeBox(childX, cy, b.name || "Unnamed", shareLabel, { w: nodeW2, deceased });
    parts.push(benefNode.svg);
    parts.push(elbow(rootX + nodeW1, rootCy, childX, cy));

    if (rightNodes.length > 0) {
      const rightStackH = rightNodes.reduce((sum, n) => sum + n.h, 0) + Math.max(0, rightNodes.length - 1) * rowGap;
      let gy = cy - rightStackH / 2;
      rightNodes.forEach((n) => {
        const gcy = gy + n.h / 2;
        const node = nodeBox(grandX, gcy, n.label, n.sub, { w: nodeW3 });
        parts.push(node.svg);
        parts.push(elbow(childX + nodeW2, cy, grandX, gcy, COLORS.warn));
        gy += n.h + rowGap;
      });
    }
    y += blockH + blockGap;
  });

  if (model.hasPartner) {
    const meCy = rootCy - (rootBoxH + partnerBoxH + 12) / 2 + rootBoxH / 2;
    const partnerCy = meCy + rootBoxH / 2 + 12 + partnerBoxH / 2;
    parts.push(nodeBox(rootX, meCy, model.testatorName || "Will creator", "Will creator", { w: nodeW1, root: true, h: rootBoxH }).svg);
    parts.push(nodeBox(rootX, partnerCy, model.partnerName || "Partner", "Partner", { w: nodeW1, h: partnerBoxH }).svg);
    parts.unshift(
      `<line x1="${rootX + nodeW1 / 2}" y1="${meCy + rootBoxH / 2}" x2="${rootX + nodeW1 / 2}" y2="${partnerCy - partnerBoxH / 2}" stroke="${COLORS.line}" stroke-width="1.6"/>`
    );
  } else {
    parts.push(nodeBox(rootX, rootCy, model.testatorName || "Will creator", "Will creator", { w: nodeW1, root: true, h: rootBoxH }).svg);
  }

  const width = grandX + nodeW3 + 16;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="max-width:100%;height:auto;background:#fff">${parts.join("")}</svg>`;
}
