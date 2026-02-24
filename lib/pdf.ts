/**
 * Generate a verifiable credential certificate as a downloadable PDF.
 * Uses jsPDF for layout + the `qrcode` library for embedded QR codes.
 */

import { credentialTypeLabel } from "./program";
import type { CredentialMetadata } from "./metadata";

export interface CertificateData {
  hash: string;
  issuer: string;
  recipient: string;
  issuedAt: number;
  credentialType: number;
  revoked: boolean;
  pda: string;
  metadata?: CredentialMetadata | null;
}

export async function generateCertificatePDF(
  data: CertificateData
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const { jsPDF } = await import("jspdf");
  const QRCode = (await import("qrcode")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Background ──
  doc.setFillColor(17, 17, 17);
  doc.rect(0, 0, W, H, "F");

  // ── Double border ──
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.rect(8, 8, W - 16, H - 16);
  doc.setLineWidth(0.2);
  doc.rect(11, 11, W - 22, H - 22);

  // ── Top left logo ──
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text("CREDIBLY\u00A9", 18, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("BLOCKCHAIN-VERIFIED ACADEMIC CREDENTIAL", 18, 30);

  // ── Status pill (top right) ──
  const isRevoked = data.revoked;
  const statusLabel = isRevoked ? "REVOKED" : "VERIFIED ON SOLANA";
  doc.setFontSize(8);
  if (isRevoked) {
    doc.setTextColor(255, 107, 107);
  } else {
    doc.setTextColor(20, 241, 149);
  }
  doc.text(statusLabel, W - 18, 24, { align: "right" });

  // ── Divider ──
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  doc.line(18, 36, W - 18, 36);

  // ── Left column ──
  const LEFT = 18;
  let y = 46;

  // Credential Type
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("CREDENTIAL TYPE", LEFT, y);
  y += 8;
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(credentialTypeLabel(data.credentialType).toUpperCase(), LEFT, y);
  y += 12;

  // Metadata fields
  if (data.metadata?.title) {
    doc.setFontSize(7);
    doc.setTextColor(136, 136, 136);
    doc.text("TITLE", LEFT, y);
    y += 6;
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    const titleLines = doc.splitTextToSize(data.metadata.title, W / 2 - 30);
    doc.text(titleLines, LEFT, y);
    y += titleLines.length * 6 + 6;
  }

  if (data.metadata?.studentName) {
    doc.setFontSize(7);
    doc.setTextColor(136, 136, 136);
    doc.text("AWARDED TO", LEFT, y);
    y += 6;
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(data.metadata.studentName, LEFT, y);
    y += 12;
  }

  if (data.metadata?.institution) {
    doc.setFontSize(7);
    doc.setTextColor(136, 136, 136);
    doc.text("INSTITUTION", LEFT, y);
    y += 6;
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text(data.metadata.institution, LEFT, y);
    y += 12;
  }

  // Issue date
  doc.setFontSize(7);
  doc.setTextColor(136, 136, 136);
  doc.text("DATE ISSUED", LEFT, y);
  y += 6;
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(
    new Date(data.issuedAt * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    LEFT,
    y
  );

  // ── Right column — cryptographic details ──
  const RIGHT = W / 2 + 10;
  let ry = 46;

  const drawField = (label: string, value: string) => {
    doc.setFontSize(7);
    doc.setTextColor(136, 136, 136);
    doc.text(label, RIGHT, ry);
    ry += 5;
    doc.setFontSize(6.5);
    doc.setTextColor(255, 255, 255);
    // Split long strings across two lines
    if (value.length > 44) {
      doc.text(value.slice(0, 44), RIGHT, ry);
      ry += 4;
      doc.text(value.slice(44), RIGHT, ry);
    } else {
      doc.text(value, RIGHT, ry);
    }
    ry += 8;
  };

  drawField("DOCUMENT SHA-256 HASH", data.hash);
  drawField("ISSUER PUBLIC KEY", data.issuer);
  drawField("RECIPIENT PUBLIC KEY", data.recipient);
  drawField("PDA ACCOUNT", data.pda);

  // IPFS CID (if available)
  if (data.metadata?.ipfsCid) {
    drawField("IPFS CID", data.metadata.ipfsCid);
  }

  // ── QR Code ──
  const shareUrl = `${window.location.origin}/credential/${data.hash}`;
  try {
    const qrDataUrl = await QRCode.toDataURL(shareUrl, {
      width: 240,
      margin: 1,
      color: { dark: "#111111", light: "#ffffff" },
    });

    const qrSize = 28;
    const qrX = RIGHT;
    const qrY = Math.min(ry + 2, H - 52);
    doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);

    doc.setFontSize(7);
    doc.setTextColor(136, 136, 136);
    doc.text("Scan to verify on Solana", qrX + qrSize + 4, qrY + 10);
    doc.setFontSize(5.5);
    doc.text(shareUrl, qrX + qrSize + 4, qrY + 15);
  } catch (err) {
    console.error("QR generation error:", err);
  }

  // ── Footer divider + legal ──
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.1);
  doc.line(18, H - 22, W - 18, H - 22);

  doc.setFontSize(5.5);
  doc.setTextColor(68, 68, 68);
  doc.text(
    "This credential is cryptographically verified on the Solana blockchain. The document hash is permanently anchored on-chain and can be independently verified by anyone.",
    18,
    H - 17
  );
  doc.text(
    `Credibly\u00A9 \u2014 Tamper-Proof Academic Credentials \u2014 ${new Date().getFullYear()}`,
    W - 18,
    H - 17,
    { align: "right" }
  );

  // ── Save ──
  const filename = data.metadata?.title
    ? `credential-${data.metadata.title.replace(/\s+/g, "-").toLowerCase().slice(0, 40)}.pdf`
    : `credential-${data.hash.slice(0, 16)}.pdf`;

  doc.save(filename);
}
