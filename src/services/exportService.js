
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
    async exportToPDF(element, fileName = "report.pdf") {
        try {
            const report = element?._reportData;
            if (!report) {
                window.print();
                return true;
            }
            return await this.exportReportToPDF(report, fileName);
        } catch (e) {
            console.error(e);
            return false;
        }
    },

    async exportReportToPDF(report, fileName = "report.pdf") {
        try {
            // Sanitize filename: remove illegal characters for Windows/Mac/Linux
            const sanitizedFileName = (fileName || 'report.pdf').replace(/[<>:"/\\|?*]/g, '_');

            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const PW = 210, PH = 297;
            const marginL = 20, marginR = 20, marginT = 25, marginB = 25;
            const contentW = PW - marginL - marginR;
            let y = marginT;

            // --- HELPER FUNCTIONS ---
            const checkPage = (needed = 12) => {
                if (y + needed > PH - marginB) {
                    pdf.addPage();
                    y = marginT;
                    drawGlobalHeader();
                }
            };

            const writeLines = (text, opts = {}) => {
                const safeText = String(text || "");
                const { fontSize = 10, bold = false, color = [30, 41, 59], indent = 0, lineHeightMult = 1.6, gap = 2.5 } = opts;
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', bold ? 'bold' : 'normal');
                pdf.setTextColor(...color);
                const splitText = pdf.splitTextToSize(safeText, contentW - indent);
                const lineH = (fontSize / 72) * 25.4 * lineHeightMult;
                checkPage(splitText.length * lineH + gap);
                pdf.text(splitText, marginL + indent, y);
                y += splitText.length * lineH + gap;
            };

            const drawGlobalHeader = () => {
                pdf.setDrawColor(226, 232, 240); // slate-200
                pdf.setLineWidth(0.2);
                pdf.line(marginL, 15, PW - marginR, 15);
                pdf.setFontSize(8);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(148, 163, 184); // slate-400
                const headerTitle = String(report.project_name || 'STRATEGIC REPORT').toUpperCase();
                pdf.text(headerTitle, marginL, 12);
                pdf.text('CONFIDENTIAL — CAPABLE INTELLIGENCE', PW - marginR, 12, { align: 'right' });
            };

            const drawScoreBar = (label, score, maxScore = 10) => {
                const safeScore = Number(score) || 0;
                checkPage(15);
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(71, 85, 105);
                pdf.text(String(label).toUpperCase(), marginL, y);
                
                const barY = y + 2;
                const barW = contentW;
                const barH = 2;
                
                // Track
                pdf.setFillColor(241, 245, 249);
                pdf.rect(marginL, barY, barW, barH, 'F');
                
                // Fill
                const fillW = Math.max(0, Math.min(barW, (safeScore / maxScore) * barW));
                pdf.setFillColor(79, 70, 229); // indigo
                pdf.rect(marginL, barY, fillW, barH, 'F');
                
                pdf.setFontSize(9);
                pdf.setTextColor(15, 23, 42);
                pdf.text(`${safeScore}/${maxScore}`, PW - marginR, y, { align: 'right' });
                y += 12;
            };

            const drawCard = (title, body, footer = null) => {
                const safeTitle = String(title || "");
                const safeBody = String(body || "");
                const bodyLines = pdf.splitTextToSize(safeBody, contentW - 10);
                const height = 15 + (bodyLines.length * 5) + (footer ? 8 : 0);
                checkPage(height);
                
                // Background
                pdf.setFillColor(248, 250, 252);
                pdf.rect(marginL, y, contentW, height, 'F');
                
                // Accent Line
                pdf.setDrawColor(79, 70, 229);
                pdf.setLineWidth(0.5);
                pdf.line(marginL, y, marginL, y + height);

                // Content
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(15, 23, 42);
                pdf.text(safeTitle, marginL + 5, y + 7);
                
                pdf.setFontSize(9);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(51, 65, 85);
                pdf.text(bodyLines, marginL + 5, y + 14);
                
                if (footer) {
                    pdf.setFontSize(8);
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(79, 70, 229);
                    pdf.text(`Focus: ${footer}`, marginL + 5, y + height - 4);
                }
                
                y += height + 5;
            };

            const drawMiniChart = (data) => {
                if (!data || !Array.isArray(data) || data.length === 0) return;
                const chartH = 40;
                checkPage(chartH + 10);
                
                const count = data.length;
                const barW = (contentW / count) * 0.7;
                const spacing = (contentW / count) * 0.3;
                const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 10);
                
                pdf.setDrawColor(226, 232, 240);
                pdf.line(marginL, y + chartH, PW - marginR, y + chartH); // X axis
                
                data.forEach((d, i) => {
                    const val = Number(d.value) || 0;
                    const h = Math.max(0.5, (val / maxVal) * (chartH - 5)); // Ensure bar has minimum height
                    const bx = marginL + (i * (barW + spacing)) + (spacing / 2);
                    const by = y + chartH - h;
                    
                    const label = String(d.label || "");
                    if (label.toLowerCase().includes('you')) {
                        pdf.setFillColor(79, 70, 229);
                    } else {
                        pdf.setFillColor(165, 180, 252); // Lighter indigo
                    }
                    pdf.rect(bx, by, barW, h, 'F');
                    
                    pdf.setFontSize(7);
                    pdf.setTextColor(100, 116, 139);
                    pdf.text(label, bx + (barW/2), y + chartH + 4, { align: 'center', maxWidth: barW + 2 });
                });
                
                y += chartH + 15;
            };

            // --- COVER PAGE ---
            // Full background color
            pdf.setFillColor(15, 23, 42); // slate-900
            pdf.rect(0, 0, PW, PH, 'F');
            
            // Geometric Accents
            pdf.setFillColor(30, 41, 59); // Slightly lighter slate
            pdf.rect(PW - 100, PH - 80, 100, 80, 'F');
            pdf.circle(0, 0, 90, 'F');
            
            // Top Accent Line
            pdf.setFillColor(79, 70, 229);
            pdf.rect(marginL, 40, 15, 1.5, 'F');

            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(79, 70, 229);
            pdf.text('MISSION-READY STRATEGIC ANALYSIS', marginL, 55);

            pdf.setFontSize(42);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text(String(report.project_name || 'Venture Blueprint'), marginL, 75, { maxWidth: contentW });

            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(148, 163, 184); // slate-400
            pdf.text('Intelligence-Led Foundation for High-Growth Ventures', marginL, 95);

            // Confidence Badge
            const badgeX = PW - 60;
            const badgeY = PH - 60;
            pdf.setDrawColor(79, 70, 229);
            pdf.setLineWidth(0.5);
            pdf.circle(badgeX, badgeY, 20, 'D');
            pdf.setFontSize(8);
            pdf.setTextColor(79, 70, 229);
            pdf.text('AUDITED BY', badgeX, badgeY - 5, { align: 'center' });
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('CAPABLE', badgeX, badgeY + 2, { align: 'center' });
            pdf.setFontSize(7);
            pdf.text('INTERNAL ENGINE V1.0', badgeX, badgeY + 6, { align: 'center' });

            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(71, 85, 105);
            pdf.text('DATE GENERATED', marginL, PH - 35);
            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255);
            pdf.text(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).toUpperCase(), marginL, PH - 28);

            pdf.addPage();
            y = marginT;
            drawGlobalHeader();
            y += 10;

            // --- SECTIONS ---
            for (const page of (report.pages || [])) {
                if (!page.content) continue;
                
                checkPage(30);
                // Section Title Block
                pdf.setFillColor(248, 250, 252);
                pdf.rect(marginL, y, contentW, 12, 'F');
                pdf.setFillColor(79, 70, 229);
                pdf.rect(marginL, y, 1.5, 12, 'F');
                
                pdf.setFontSize(12);
                pdf.setFont('helvetica', 'bold');
                pdf.setTextColor(15, 23, 42);
                pdf.text(page.title.toUpperCase(), marginL + 6, y + 8);
                y += 20;

                const content = page.content;
                
                if (page.id === 'executive') {
                    writeLines("Vision Overview", { fontSize: 8, bold: true, color: [148, 163, 184] });
                    writeLines(content.explanation || "", { fontSize: 10, gap: 10 });
                    
                    if (content.market_demand) {
                        drawScoreBar("Current Market Demand", content.market_demand.score || 0);
                        writeLines(content.market_demand.analysis || "", { fontSize: 9.5, color: [71, 85, 105], gap: 10 });
                    }
                    if (content.chart_data) {
                        writeLines("Growth Projection", { fontSize: 8, bold: true, color: [148, 163, 184], gap: 5 });
                        drawMiniChart(content.chart_data);
                    }
                } 
                else if (page.id === 'market') {
                    if (content.competitors) {
                        writeLines("Primary Ecosystem Players", { fontSize: 8, bold: true, color: [148, 163, 184], gap: 5 });
                        content.competitors.forEach(comp => {
                            drawCard(comp.name, comp.analysis, comp.weakness_to_exploit);
                        });
                    }
                    if (content.chart_data) {
                        writeLines("Market Share Distribution", { fontSize: 8, bold: true, color: [148, 163, 184], gap: 5 });
                        drawMiniChart(content.chart_data);
                    }
                    if (content.the_gap) {
                        writeLines("The Structural Gap", { fontSize: 8, bold: true, color: [148, 163, 184] });
                        writeLines(content.the_gap, { fontSize: 9.5, gap: 8 });
                    }
                } 
                else if (page.id === 'technical') {
                    if (content.viability_score) {
                        drawScoreBar("Technical Viability Audit", content.viability_score);
                    }
                    
                    checkPage(40);
                    writeLines("Infrastructure Blueprint", { fontSize: 8, bold: true, color: [148, 163, 184] });
                    writeLines(content.architecture || "", { fontSize: 9.5, gap: 8 });
                    
                    if (content.chart_data) {
                        writeLines("Budget Allocation", { fontSize: 8, bold: true, color: [148, 163, 184], gap: 5 });
                        drawMiniChart(content.chart_data);
                    }
                    
                    writeLines("MVP Development Strategy", { fontSize: 8, bold: true, color: [148, 163, 184] });
                    writeLines(content.complexity || "", { fontSize: 9.5, gap: 8 });
                } 
                else if (page.id === 'risk') {
                    writeLines("Strategic Risk Assessment", { fontSize: 8, bold: true, color: [148, 163, 184], gap: 5 });
                    if (content.risks) {
                        Object.entries(content.risks).forEach(([key, val]) => {
                            writeLines(`${key.toUpperCase()}: ${val}`, { fontSize: 9, color: [30, 41, 59], indent: 5, gap: 3 });
                        });
                    }
                    y += 10;
                    if (content.mentor_advice) {
                        drawCard("Strategic Advisor Take", content.mentor_advice.advice, content.mentor_advice.criticize);
                    }
                }
                else {
                    // Fallback for custom or unknown pages
                    const lines = extractText(content);
                    for (const line of lines) {
                        if (line.type === 'label') {
                            y += 2;
                            writeLines(line.text.toUpperCase(), { fontSize: 7, bold: true, color: [148, 163, 184], gap: 1 });
                        } else if (line.type === 'body') {
                            writeLines(line.text, { fontSize: 10, color: [51, 65, 85], gap: 6 });
                        } else if (line.type === 'bullet') {
                            writeLines(line.text, { fontSize: 9.5, color: [71, 85, 105], indent: 5, gap: 2.5 });
                        }
                    }
                }
                
                y += 10; // Extra spacing between sections
            }

            // --- FINAL PAGE ---
            pdf.addPage();
            pdf.setFillColor(15, 23, 42); // slate-900
            pdf.rect(0, 0, PW, PH, 'F');
            
            pdf.setFontSize(24);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(255, 255, 255);
            pdf.text('Next Steps: From Analysis to Action', marginL, 60);
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(148, 163, 184);
            pdf.text('This strategic report is the first step in your journey. The foundation has been laid.', marginL, 75);
            
            pdf.setFillColor(79, 70, 229);
            pdf.rect(marginL, 90, 40, 10, 'F');
            pdf.setFontSize(10);
            pdf.setTextColor(255, 255, 255);
            pdf.text('GO CAPABLE', marginL + 20, 96.5, { align: 'center' });

            // Footer numbering on all pages except cover and end
            const totalPages = pdf.internal.getNumberOfPages();
            for (let i = 2; i < totalPages; i++) {
                pdf.setPage(i);
                pdf.setFontSize(7);
                pdf.setTextColor(148, 163, 184);
                pdf.text(`REPORT ID: CP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`, marginL, PH - 10);
                pdf.text(`Page ${i-1} of ${totalPages-2}`, PW - marginR, PH - 10, { align: 'right' });
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
