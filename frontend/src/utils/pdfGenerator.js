/**
 * AI Medical Report PDF Generator
 * Generates professional PDF reports with medical analysis data
 */

export const generateReportPDF = async (report) => {
  try {
    if (!report?.analysis) throw new Error("No analysis data available")

    // Dynamic imports
    const jsPDFModule = await import("jspdf")
    const autoTable = (await import("jspdf-autotable")).default
    const jsPDF = jsPDFModule.default

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    let yPosition = margin

    // Color palette
    const colors = {
      primary: [44, 102, 255],
      secondary: [99, 102, 241],
      success: [16, 185, 129],
      warning: [251, 191, 36],
      danger: [239, 68, 68],
      gray: [107, 114, 128],
      lightGray: [243, 244, 246],
      darkGray: [31, 41, 55],
      subtleBlue: [240, 248, 255],
    }

    // HEADER
    createHeader(doc, pageWidth, colors, report)
    yPosition = 65

    // SUMMARY
    createSummaryCards(doc, margin, yPosition, colors, report)
    yPosition += 40

    const { entities = {}, recommendations = [], warnings = [] } = report.analysis

    // ENTITIES
    yPosition = createEntitiesSection(doc, autoTable, margin, yPosition, pageWidth, pageHeight, colors, entities)

    // RECOMMENDATIONS
    yPosition = createRecommendationsSection(doc, autoTable, margin, yPosition, pageWidth, pageHeight, colors, recommendations)

    // WARNINGS
    if (warnings.length > 0) {
      yPosition = createWarningsSection(doc, autoTable, margin, yPosition, pageWidth, pageHeight, colors, warnings)
    }

    // FOOTER
    addFooterToAllPages(doc, pageWidth, pageHeight, margin, colors)
    addWatermark(doc, pageWidth, pageHeight)

    doc.save(`${report.name || "Patient"}_Medical_Report.pdf`)
    return { success: true }

  } catch (err) {
    console.error("PDF generation error:", err)
    throw err
  }
}

// HEADER SECTION
const createHeader = (doc, pageWidth, colors, report) => {
  doc.setFillColor(...colors.primary)
  doc.rect(0, 0, pageWidth, 55, "F")

  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.text("AI Medical Report", pageWidth / 2, 20, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.text(report.name || "Patient Report", pageWidth / 2, 32, { align: "center" })

  doc.setFontSize(9)
  doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 44, { align: "center" })
}

// SUMMARY CARDS SECTION
const createSummaryCards = (doc, margin, y, colors, report) => {
  const score = report.confidence / 100 || 0
  const barWidth = 170
  const barHeight = 8

  doc.setFillColor(...colors.lightGray)
  doc.roundedRect(margin, y, barWidth, 25, 3, 3, "F")

  const filledWidth = (barWidth * score) / 100
  const color = score >= 85 ? colors.success : score >= 70 ? colors.warning : colors.danger
  doc.setFillColor(...color)
  doc.roundedRect(margin, y, filledWidth, barHeight, 3, 3, "F")

  doc.setTextColor(...colors.darkGray)
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("AI Confidence Level:", margin + 3, y + 20)

  doc.setFontSize(12)
  doc.text(`${score.toFixed(1)}%`, margin + 60, y + 20)

  doc.setFont("helvetica", "normal")
  doc.text("Date:", margin + 110, y + 20)
  doc.setFont("helvetica", "bold")
  doc.text(report.date || new Date().toLocaleDateString(), margin + 125, y + 20)
}

// ENTITIES SECTION
const createEntitiesSection = (doc, autoTable, margin, y, width, height, colors, entities) => {
  const sections = [
    { key: "symptoms", label: "Symptoms", icon: "Symptoms", color: colors.danger },
    { key: "diagnoses", label: "Diagnoses", icon: "Diagnoses", color: colors.warning },
    { key: "medications", label: "Medications", icon: "Medications", color: colors.secondary },
    { key: "tests", label: "Tests", icon: "Tests", color: colors.primary },
    { key: "vitals", label: "Vitals", icon: "Vitals", color: colors.success },
  ]

  doc.setFont("helvetica", "bold")
  doc.setTextColor(...colors.primary)
  doc.setFontSize(14)
  doc.text("Extracted Medical Entities", margin, y)
  y += 10

  for (const { key, label, icon, color } of sections) {
    const items = entities[key] || []
    if (!items.length) continue

    doc.setFillColor(...color)
    doc.roundedRect(margin, y, width - margin * 2, 8, 2, 2, "F")
    doc.setTextColor(255, 255, 255)
    doc.text(`${icon} (${items.length})`, margin + 3, y + 6)
    y += 10

    autoTable(doc, {
      startY: y,
      head: [["#", "Description"]],
      body: items.map((v, i) => [i + 1, v]),
      theme: "striped",
      styles: { fontSize: 9 },
      headStyles: { fillColor: color, textColor: [255, 255, 255], fontStyle: "bold" },
      bodyStyles: { textColor: colors.darkGray },
      alternateRowStyles: { fillColor: colors.subtleBlue },
      margin: { left: margin, right: margin },
    })

    y = doc.lastAutoTable.finalY + 8
    if (y > height - 40) {
      doc.addPage()
      y = margin
    }
  }

  return y
}

// RECOMMENDATIONS SECTION
const createRecommendationsSection = (doc, autoTable, margin, y, width, height, colors, recs) => {
  if (!recs.length) return y
  if (y > height - 60) {
    doc.addPage()
    y = margin
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(...colors.secondary)
  doc.text("AI Recommendations", margin, y)
  y += 8

  const data = recs.map((r, i) => [
    i + 1,
    r.test || "N/A",
    r.reason || "N/A",
    (r.urgency || "Routine").toUpperCase(),
    `${(r.confidence || 0).toFixed(0)}%`,
  ])

  autoTable(doc, {
    startY: y,
    head: [["#", "Test/Procedure", "Reason", "Urgency", "Confidence"]],
    body: data,
    theme: "grid",
    headStyles: { fillColor: colors.secondary, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { fontSize: 8, textColor: colors.darkGray },
    alternateRowStyles: { fillColor: colors.lightGray },
    margin: { left: margin, right: margin },
  })

  return doc.lastAutoTable.finalY + 10
}

// WARNINGS SECTION
const createWarningsSection = (doc, autoTable, margin, y, width, height, colors, warnings) => {
  if (y > height - 50) {
    doc.addPage()
    y = margin
  }
  
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(...colors.danger)
  doc.text("Warnings & Alerts", margin, y)
  y += 8

  autoTable(doc, {
    startY: y,
    head: [["#", "Description"]],
    body: warnings.map((w, i) => [i + 1, w]),
    theme: "grid",
    headStyles: { fillColor: colors.danger, textColor: [255, 255, 255], fontStyle: "bold" },
    bodyStyles: { textColor: colors.darkGray },
    alternateRowStyles: { fillColor: [255, 238, 238] },
    margin: { left: margin, right: margin },
  })

  return doc.lastAutoTable.finalY + 10
}

// FOOTER SECTION
const addFooterToAllPages = (doc, width, height, margin, colors) => {
  const pages = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(...colors.gray)
    doc.line(margin, height - 20, width - margin, height - 20)

    doc.setFontSize(8)
    doc.setFont("helvetica", "italic")
    doc.setTextColor(...colors.gray)
    doc.text(
      "AI-generated analysis - please consult a doctor before making decisions.",
      width / 2, 
      height - 12, 
      { align: "center" }
    )

    doc.text(`Page ${i} of ${pages}`, width - margin, height - 12, { align: "right" })
  }
}

// WATERMARK SECTION
const addWatermark = (doc, width, height) => {
  doc.setTextColor(200, 200, 200)
  doc.setFontSize(40)
  doc.setFont("helvetica", "bold")
  doc.text("CONFIDENTIAL", width / 2, height / 2, { align: "center", angle: 45 })
}

