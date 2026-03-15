
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";

const SKIP_KEYS = new Set(['chart_data', 'radar_data', 'score', 'value', 'values']);

const extractText = (obj, lines = [], depth = 0) => {
    for (const [key, val] of Object.entries(obj || {})) {
        if (SKIP_KEYS.has(key) || key === 'chart_data' || key === 'radar_data') continue;
        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (typeof val === 'string' && val.trim()) {
            lines.push({ type: 'label', text: label });
            lines.push({ type: 'body', text: val });
        } else if (Array.isArray(val)) {
            if (val.length > 0 && typeof val[0] === 'object' && ('value' in val[0] || 'label' in val[0])) continue;
            lines.push({ type: 'label', text: label });
            val.forEach(item => {
                const t = typeof item === 'string' ? item
                    : typeof item === 'object' ? Object.values(item).filter(v => typeof v === 'string').join(' — ')
                    : String(item);
                if (t.trim()) lines.push({ type: 'bullet', text: '• ' + t });
            });
        } else if (typeof val === 'object' && val !== null) {
            extractText(val, lines, depth + 1);
        }
    }
    return lines;
};

export const ExportService = {
    /**
     * Text-based PDF using jsPDF — real selectable text, proper pages, no image artifacts.
     */
    async exportToPDF(element, fileName = "report.pdf") {
        try {
            const report = element?._reportData;
            // If no report data attached, fallback signal
            if (!report) {
                // Trigger print as fallback
                window.print();
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    /**
     * Accepts the raw report object directly for text-based PDF
     */
    async exportReportToPDF(report, fileName = "report.pdf") {
        try {
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const PW = 210, PH = 297;
            const marginL = 18, marginR = 18, marginT = 20, marginB = 20;
            const contentW = PW - marginL - marginR;
            let y = marginT;

            const checkPage = (needed = 10) => {
                if (y + needed > PH - marginB) {
                    pdf.addPage();
                    y = marginT;
                }
            };

            const writeLine = (text, opts = {}) => {
                const { fontSize = 10, bold = false, color = [30, 41, 59], indent = 0, lineHeightMult = 1.5 } = opts;
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setTextColor(...color);
                const lines = pdf.splitTextToSize(text, contentW - indent);
                const lineH = (fontSize / 72) * 25.4 * lineHeightMult;
                checkPage(lines.length * lineH + 2);
                pdf.text(lines, marginL + indent, y);
                y += lines.length * lineH + (opts.gap ?? 2);
            };

            const drawRule = (opacity = 0.08) => {
                pdf.setDrawColor(100, 116, 139);
                pdf.setLineWidth(0.3);
                pdf.setGState(new pdf.GState({ opacity }));
                pdf.line(marginL, y, PW - marginR, y);
                pdf.setGState(new pdf.GState({ opacity: 1 }));
                y += 4;
            };

            // Cover
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, PW, 55, 'F');
            pdf.setFontSize(22);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(241, 245, 249);
            pdf.text(report.project_name || 'Venture Report', marginL, 28);
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(148, 163, 184);
            pdf.text('SYSTEM-GENERATED ANALYSIS  •  CAPABLE INTELLIGENCE', marginL, 38);
            pdf.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase(), marginL, 45);
            y = 65;

            for (const page of (report.pages || [])) {
                checkPage(20);

                // Section heading
                writeLine(page.title.toUpperCase(), { fontSize: 11, bold: true, color: [15, 23, 42], gap: 3 });
                drawRule();

                const lines = extractText(page.content);
                for (const line of lines) {
                    if (line.type === 'label') {
                        writeLine(line.text.toUpperCase(), { fontSize: 7.5, bold: true, color: [100, 116, 139], gap: 1.5 });
                    } else if (line.type === 'body') {
                        writeLine(line.text, { fontSize: 10, color: [51, 65, 85], gap: 6 });
                    } else if (line.type === 'bullet') {
                        writeLine(line.text, { fontSize: 9.5, color: [71, 85, 105], indent: 4, gap: 2.5 });
                    }
                }
                y += 8;
            }

            // Footer on every page
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(7);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(148, 163, 184);
                pdf.text('Capable Intelligence • Confidential', marginL, PH - 10);
                pdf.text(`${i} / ${totalPages}`, PW - marginR, PH - 10, { align: 'right' });
            }

            pdf.save(fileName);
            return true;
        } catch (error) {
            console.error("PDF Export failed:", error);
            return false;
        }
    },

    async exportToDocx(report, fileName = "report.docx") {
        try {
            const children = [
                new Paragraph({ text: report.project_name || "Venture Blueprint", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: "" }),
            ];

            for (const page of (report.pages || [])) {
                children.push(new Paragraph({ text: page.title, heading: HeadingLevel.HEADING_1, spacing: { before: 500, after: 200 } }));
                const addContent = (obj) => {
                    for (const [key, val] of Object.entries(obj || {})) {
                        if (SKIP_KEYS.has(key) || key === 'chart_data' || key === 'radar_data') continue;
                        const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                        if (typeof val === 'string' && val.trim()) {
                            children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
                            children.push(new Paragraph({ text: val }));
                        } else if (Array.isArray(val)) {
                            if (val.length > 0 && typeof val[0] === 'object' && 'value' in val[0]) continue;
                            children.push(new Paragraph({ text: label, heading: HeadingLevel.HEADING_3, spacing: { before: 200 } }));
                            val.forEach(item => {
                                const text = typeof item === 'string' ? item
                                    : typeof item === 'object' ? Object.values(item).filter(v => typeof v === 'string').join(' — ')
                                    : String(item);
                                if (text.trim()) children.push(new Paragraph({ text, bullet: { level: 0 } }));
                            });
                        } else if (typeof val === 'object' && val !== null) {
                            addContent(val);
                        }
                    }
                };
                addContent(page.content);
                children.push(new Paragraph({ text: "" }));
            }

            const doc = new Document({ sections: [{ properties: {}, children }] });
            const blob = await Packer.toBlob(doc);
            saveAs(blob, fileName);
            return true;
        } catch (error) {
            console.error("DOCX Export failed:", error);
            return false;
        }
    },

    async copyToClipboard(report) {
        try {
            let text = `${report.project_name || 'Venture Report'}\n${'='.repeat(50)}\n\n`;
            for (const page of (report.pages || [])) {
                text += `\n## ${page.title}\n\n`;
                const lines = extractText(page.content);
                for (const line of lines) {
                    if (line.type === 'label') text += `\n${line.text}:\n`;
                    else if (line.type === 'body') text += `${line.text}\n`;
                    else if (line.type === 'bullet') text += `${line.text}\n`;
                }
            }
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error("Copy failed:", error);
            return false;
        }
    }
};
