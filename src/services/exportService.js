
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
            const marginL = 20, marginR = 20, marginT = 25, marginB = 25;
            const contentW = PW - marginL - marginR;
            let y = marginT;

            const checkPage = (needed = 12) => {
                if (y + needed > PH - marginB) {
                    pdf.addPage();
                    y = marginT;
                    // Draw header line on new page too
                    pdf.setDrawColor(241, 245, 249);
                    pdf.setLineWidth(0.2);
                    pdf.line(marginL, y - 10, PW - marginR, y - 10);
                }
            };

            const writeLine = (text, opts = {}) => {
                const { fontSize = 10, bold = false, color = [30, 41, 59], indent = 0, lineHeightMult = 1.6 } = opts;
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setTextColor(...color);
                const lines = pdf.splitTextToSize(text, contentW - indent);
                const lineH = (fontSize / 72) * 25.4 * lineHeightMult;
                checkPage(lines.length * lineH + 2);
                pdf.text(lines, marginL + indent, y);
                y += lines.length * lineH + (opts.gap ?? 2.5);
            };

            const drawSectionHeader = (title) => {
                checkPage(25);
                y += 5;
                // Accent Bar
                pdf.setFillColor(79, 70, 229); // Indigo-600
                pdf.rect(marginL, y, 3, 6, 'F');
                
                pdf.setFontSize(11);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(15, 23, 42); // Slate-900
                pdf.text(title.toUpperCase(), marginL + 6, y + 4.5);
                y += 10;
                
                pdf.setDrawColor(241, 245, 249);
                pdf.setLineWidth(0.4);
                pdf.line(marginL, y - 2, PW - marginR, y - 2);
                y += 4;
            };

            // --- COVER PAGE ---
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, PW, PH, 'F');
            
            // Decorative elements
            pdf.setFillColor(79, 70, 229, 0.1);
            pdf.circle(PW, 0, 80, 'F');

            pdf.setFontSize(32);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(report.project_name || 'Venture Blueprint', marginL, 80);
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(79, 70, 229);
            pdf.text('PRECISION MARKET ANALYSIS & EXECUTION ROADMAP', marginL, 65);

            pdf.setDrawColor(255, 255, 255, 0.1);
            pdf.line(marginL, 95, 60, 95);

            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(148, 163, 184);
            pdf.text(`Generated for ${report.project_name || 'the project'}`, marginL, 110);
            pdf.text(new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), marginL, 118);

            pdf.setFontSize(8);
            pdf.setTextColor(71, 85, 105);
            pdf.text('CAPABLE INTELLIGENCE ENGINE V1.0', marginL, PH - 20);

            pdf.addPage();
            y = marginT;

            // --- CONTENT PAGES ---
            for (const page of (report.pages || [])) {
                if (!page.content) continue;
                drawSectionHeader(page.title);

                const lines = extractText(page.content);
                for (const line of lines) {
                    if (line.type === 'label') {
                        y += 2;
                        writeLine(line.text.toUpperCase(), { fontSize: 7, bold: true, color: [100, 116, 139], gap: 1 });
                    } else if (line.type === 'body') {
                        writeLine(line.text, { fontSize: 10, color: [51, 65, 85], gap: 6 });
                    } else if (line.type === 'bullet') {
                        writeLine(line.text, { fontSize: 9.5, color: [71, 85, 105], indent: 5, gap: 2.5 });
                    }
                }
                y += 10;
            }

            // Footer numbering
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 2; i <= totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(7);
                pdf.setTextColor(148, 163, 184);
                pdf.text(`Page ${i-1} of ${totalPages-1}`, PW - marginR, PH - 10, { align: 'right' });
                pdf.text(`${report.project_name} — Capable Intelligence`, marginL, PH - 10);
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
                if (!page.content) continue;
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
                if (!page.content) continue;
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
