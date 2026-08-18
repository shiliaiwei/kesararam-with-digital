"use client";

import { useState } from "react";
import { Download } from "lucide-react";

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function wrapTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    if (!text) return [];
    const lines: string[] = [];
    const paragraphs = text.split('\n');

    for (const para of paragraphs) {
        if (!para.trim()) {
            lines.push('');
            continue;
        }

        const words = para.split(' ');
        let currentLine = '';

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;

            if (ctx.measureText(testLine).width <= maxWidth) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = '';
                }

                // Handle single words/unbroken Khmer phrases wider than maxWidth
                if (ctx.measureText(word).width > maxWidth) {
                    let charLine = '';
                    for (const char of Array.from(word)) {
                        const testCharLine = charLine + char;
                        if (ctx.measureText(testCharLine).width <= maxWidth) {
                            charLine = testCharLine;
                        } else {
                            if (charLine) lines.push(charLine);
                            charLine = char;
                        }
                    }
                    if (charLine) currentLine = charLine;
                } else {
                    currentLine = word;
                }
            }
        }
        if (currentLine) {
            lines.push(currentLine);
        }
    }
    return lines;
}

function renderWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines = 999
): number {
    const lines = wrapTextLines(ctx, text, maxWidth).slice(0, maxLines);
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y + i * lineHeight);
    }
    return lines.length;
}

interface SaveCardButtonProps {
    topic: {
        topic_code: string;
        name_en: string;
        name_km: string;
        description_en: string;
        description_km: string;
        primary_image_url?: string | null;
        sub_group?: string | null;
        law_reference?: string | null;
        audio_url_en?: string | null;
        audio_url_km?: string | null;
    };
    isKh: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

// Category accent colours — matches web UI per category
// Updated with education-focused quotes and premium design psychology
const CATEGORY_CONFIG: Record<string, { slug: string; accent: string; accentDark: string; bgLight: string; label: string; quote: string }> = {
    // Road Signs — yellow
    'Prohibitory Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Mandatory Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Priority Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Warning Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Temporary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Direction Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Buildup Area Boundary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Street Name Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Informative Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Supplementary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Sign Posts': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Transverse Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Longitudinal Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Arrows Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Other Road Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Traffic Lights': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    'Traffic Police Signals': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Traffic Signs', quote: 'Education starts with knowing the signs.' },
    // Road Traffic — blue
    'Traffic Rules': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', bgLight: '#dbeafe', label: 'Road Traffic Law', quote: 'Learn the rules. Protect every life.' },
    'Speed Limits': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', bgLight: '#dbeafe', label: 'Road Traffic Law', quote: 'Learn the rules. Protect every life.' },
    'Parking': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', bgLight: '#dbeafe', label: 'Road Traffic Law', quote: 'Learn the rules. Protect every life.' },
    'Overtaking': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', bgLight: '#dbeafe', label: 'Road Traffic Law', quote: 'Learn the rules. Protect every life.' },
    // Priority — orange
    'Intersections': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    'Intersection Priority – Left Turn': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    'Intersection Priority – Sequential': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    'Intersection Priority – Simultaneous': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    'Roundabouts': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    'Pedestrian Crossings': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', bgLight: '#ffedd5', label: 'Right of Way', quote: 'Know priority. Save lives at crossings.' },
    // Driving — green
    'Basic Maneuvers': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', bgLight: '#dcfce7', label: 'Driving Skills', quote: 'Master skills through education.' },
    'Advanced Techniques': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', bgLight: '#dcfce7', label: 'Driving Skills', quote: 'Master skills through education.' },
    'Defensive Driving': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', bgLight: '#dcfce7', label: 'Driving Skills', quote: 'Master skills through education.' },
    // Technical — indigo
    'Engine': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', bgLight: '#e0e7ff', label: 'Vehicle Technology', quote: 'Technical knowledge builds confidence.' },
    'Brakes': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', bgLight: '#e0e7ff', label: 'Vehicle Technology', quote: 'Technical knowledge builds confidence.' },
    'Lights': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', bgLight: '#e0e7ff', label: 'Vehicle Technology', quote: 'Technical knowledge builds confidence.' },
    'Safety Systems': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', bgLight: '#e0e7ff', label: 'Vehicle Technology', quote: 'Technical knowledge builds confidence.' },
    // Loading — cyan
    'Weight Limits': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', bgLight: '#cffafe', label: 'Loading People & Goods', quote: 'Learn safe loading. Protect passengers.' },
    'Passenger Safety': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', bgLight: '#cffafe', label: 'Loading People & Goods', quote: 'Learn safe loading. Protect passengers.' },
    'Cargo Securing': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', bgLight: '#cffafe', label: 'Loading People & Goods', quote: 'Learn safe loading. Protect passengers.' },
    // General — purple
    'Road Safety': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', bgLight: '#f3e8ff', label: 'General Knowledge', quote: 'Education is the foundation of safety.' },
    'Environmental': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', bgLight: '#f3e8ff', label: 'General Knowledge', quote: 'Education is the foundation of safety.' },
    'Legal': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', bgLight: '#f3e8ff', label: 'General Knowledge', quote: 'Education is the foundation of safety.' },
    // Emergency — red
    'Accidents': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', bgLight: '#fee2e2', label: 'Emergency', quote: 'Know emergency response. Save lives.' },
    'Breakdowns': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', bgLight: '#fee2e2', label: 'Emergency', quote: 'Know emergency response. Save lives.' },
    'First Aid': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', bgLight: '#fee2e2', label: 'Emergency', quote: 'Know emergency response. Save lives.' },
    'Emergency Contacts': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', bgLight: '#fee2e2', label: 'Emergency', quote: 'Know emergency response. Save lives.' },
};

const DEFAULT_CONFIG = { slug: 'learn', accent: '#eab308', accentDark: '#ca8a04', bgLight: '#fef9c3', label: 'Learn', quote: 'Learn. Play. Pass.' };

export function SaveCardButton({ topic, isKh, size = 'md', showLabel = false, className = '' }: SaveCardButtonProps) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // ── Canvas Base Width: 1200px ─────────────────────────────────────────
            const W = 1200;
            const canvas = document.createElement('canvas');
            canvas.width = W;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            const cfg = (topic.sub_group && CATEGORY_CONFIG[topic.sub_group]) ? CATEGORY_CONFIG[topic.sub_group] : DEFAULT_CONFIG;
            const siteUrl = 'kesararamwithdigital.tech';
            const title = isKh ? topic.name_km : topic.name_en;
            const answer = isKh ? topic.description_km : topic.description_en;
            const lawRefText = topic.law_reference ? topic.law_reference.trim() : '';

            // ── Load Google Sans font for ALL text (Khmer + English) per user spec ─────
            const loadFont = async (name: string, url: string, weight = 'normal') => {
                try {
                    const f = new FontFace(name, `url(${url})`, { weight });
                    const loaded = await f.load();
                    document.fonts.add(loaded);
                    return true;
                } catch (e) {
                    console.warn(`Failed to load font ${name}:`, e);
                    return false;
                }
            };

            await loadFont('KWDGoogleSans', '/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf', '100 900');

            // Google Sans font for all card text (Khmer & English) exclusively
            const font = (size: number, weight = 'bold') => `${weight} ${size}px KWDGoogleSans, sans-serif`;

            const loadImg = (src: string, timeout = 4000) => new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image(); img.crossOrigin = 'anonymous';
                const t = setTimeout(() => resolve(null), timeout);
                img.onload = () => { clearTimeout(t); resolve(img); };
                img.onerror = () => { clearTimeout(t); resolve(null); };
                img.src = src;
            });

            const [logo, qr, topicImg] = await Promise.all([
                loadImg('https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg'),
                loadImg('/brand/qrcode-kwd.png'),
                topic.primary_image_url ? loadImg(topic.primary_image_url, 6000) : Promise.resolve(null),
            ]);

            // ── Layout constants ──────────────────────────────────────────────────
            const footerH = 88;
            const leftW = 420;
            const rx = leftW + 44, ry = 40, rw = W - rx - 44; // 692px text area width

            // ── Pre-measure title lines (38px font size for maximum clarity) ─────────────
            ctx.font = font(38, 'bold');
            const titleLineH = 48;
            const titleLines = wrapTextLines(ctx, title, rw);
            const titleLineCount = Math.max(1, titleLines.length);
            const titleBottom = ry + 68 + titleLineCount * titleLineH;

            // ── Pre-measure Law Reference (if present) ────────────────────────────
            const lawFontSize = 14;
            const lawLineH = 24;
            const lawPadX = 18, lawPadY = 14;
            ctx.font = font(lawFontSize, 'normal');
            const lawLines = lawRefText ? wrapTextLines(ctx, lawRefText, rw - lawPadX * 2) : [];
            const lawBoxH = lawLines.length > 0 ? lawPadY * 2 + 24 + lawLines.length * lawLineH : 0;

            // ── Pre-measure Description box (20px font size for prominent reading) ──────
            const descFontSize = 20;
            const descLineH = 32;
            const descPadX = 22, descPadY = 22;
            ctx.font = font(descFontSize, 'bold');
            const descLines = answer ? wrapTextLines(ctx, answer, rw - descPadX * 2) : [];
            const descBoxH = descLines.length > 0 ? descPadY * 2 + descLines.length * descLineH : 0;

            // ── Compute positions & dynamic height ────────────────────────────────
            const lawBoxY = titleBottom + 36;
            const descLabelY = lawBoxH > 0 ? lawBoxY + lawBoxH + 24 : titleBottom + 40;
            const answerBoxY = descLabelY + 32;
            const contentBottom = answerBoxY + descBoxH + 36;

            // Dynamic canvas height: expands so zero text is truncated or hidden
            const neededH = Math.max(760, contentBottom + footerH + 30);
            canvas.height = neededH;
            const FH = neededH; // final canvas height

            // ── 1. Background ─────────────────────────────────────────────────────
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, FH);

            // ── 2. Left panel ─────────────────────────────────────────────────────
            ctx.fillStyle = cfg.bgLight;
            ctx.fillRect(0, 0, leftW, FH);
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, 0, 12, FH);

            // ── 3. Category label pill ────────────────────────────────────────────
            ctx.fillStyle = cfg.accent;
            ctx.font = font(12, 'bold');
            ctx.textAlign = 'left';
            const catLabel = isKh ? cfg.label : cfg.label.toUpperCase();
            const catW = ctx.measureText(catLabel).width + 28;
            roundRect(ctx, 24, 24, catW, 32, 6);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            roundRect(ctx, 24, 24, catW, 32, 6);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = font(12, 'bold');
            ctx.fillText(catLabel, 38, 44);

            // ── 4. Topic code ─────────────────────────────────────────────────────
            ctx.fillStyle = cfg.accentDark;
            ctx.font = font(11, 'bold');
            ctx.textAlign = 'left';
            ctx.fillText(topic.topic_code, 24, 76);

            // ── 5. Image area (larger focal display for the sign) ─────────────────
            const imgAreaX = 20, imgAreaY = 96;
            const imgAreaW = leftW - 40;
            const imgAreaH = Math.min(FH - 96 - footerH - 40, 520);

            if (topicImg) {
                ctx.fillStyle = cfg.accent;
                ctx.globalAlpha = 0.3;
                roundRect(ctx, imgAreaX + 6, imgAreaY + 6, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();

                const pad = 24;
                const maxW = imgAreaW - pad * 2, maxH = imgAreaH - pad * 2;
                const aspect = topicImg.naturalWidth / topicImg.naturalHeight;
                let dw = maxW, dh = maxW / aspect;
                if (dh > maxH) { dh = maxH; dw = maxH * aspect; }
                const dx = imgAreaX + pad + (maxW - dw) / 2;
                const dy = imgAreaY + pad + (maxH - dh) / 2;
                ctx.drawImage(topicImg, dx, dy, dw, dh);

                if (cfg.slug !== 'road-sign' && cfg.slug !== 'priority') {
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.font = font(9, 'normal');
                    ctx.textAlign = 'center';
                    ctx.fillText(
                        isKh ? 'រូបភាពបង្កើតដោយ AI · គ្រាន់តែជារូបភាពយោង' : 'AI-generated image · Reference illustration only',
                        imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH - 12
                    );
                }
            } else {
                ctx.fillStyle = cfg.accent;
                ctx.globalAlpha = 0.3;
                roundRect(ctx, imgAreaX + 6, imgAreaY + 6, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.fillStyle = cfg.accent;
                ctx.font = font(64, 'bold');
                ctx.textAlign = 'center';
                ctx.fillText('🚦', imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH / 2 + 20);
            }

            // ── 6. Right panel ────────────────────────────────────────────────────

            // 6a. SIGN CATEGORY micro-label
            ctx.fillStyle = cfg.accentDark;
            ctx.font = font(11, 'bold');
            ctx.textAlign = 'left';
            ctx.fillText('SIGN CATEGORY', rx, ry + 14);

            // 6b. Accent underline
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, ry + 22, 64, 4);

            // 6c. Title — 38px bold Google Sans font
            ctx.fillStyle = '#000000';
            ctx.font = font(38, 'bold');
            renderWrappedText(ctx, title, rx, ry + 68, rw, titleLineH);

            // 6d. Metadata
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.font = font(13, 'normal');
            const metaText = topic.sub_group ? `${topic.topic_code}  ·  ${topic.sub_group}` : topic.topic_code;
            ctx.fillText(metaText, rx, titleBottom + 22);

            // 6e. Divider
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, titleBottom + 32, rw, 4);

            // 6f. Law Reference box (if present)
            if (lawRefText && lawLines.length > 0) {
                ctx.fillStyle = '#eff6ff';
                ctx.fillRect(rx, lawBoxY, rw, lawBoxH);
                ctx.strokeStyle = '#3b82f6';
                ctx.lineWidth = 2;
                ctx.strokeRect(rx, lawBoxY, rw, lawBoxH);

                ctx.fillStyle = '#1e40af';
                ctx.font = font(12, 'bold');
                ctx.textAlign = 'left';
                ctx.fillText(isKh ? 'ឯកសារយោងច្បាប់' : 'LAW REFERENCE', rx + lawPadX, lawBoxY + 20);

                ctx.fillStyle = '#1e3a8a';
                ctx.font = font(lawFontSize, 'normal');
                renderWrappedText(ctx, lawRefText, rx + lawPadX, lawBoxY + 42, rw - lawPadX * 2, lawLineH);
            }

            // 6g. DESCRIPTION label bar
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(rx, descLabelY, rw, 32);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, descLabelY, rw, 32);
            ctx.fillStyle = '#fff';
            ctx.font = font(13, 'bold');
            ctx.textAlign = 'left';
            ctx.fillText('DESCRIPTION', rx + 16, descLabelY + 21);

            // 6h. Description box — Prominent 20px bold Google Sans font
            if (answer && descLines.length > 0) {
                ctx.fillStyle = '#f0fdf4';
                ctx.fillRect(rx, answerBoxY, rw, descBoxH);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(rx, answerBoxY, rw, descBoxH);
                ctx.fillStyle = '#052e16';
                ctx.font = font(descFontSize, 'bold');
                ctx.textAlign = 'left';
                renderWrappedText(ctx, answer, rx + descPadX, answerBoxY + descPadY + descLineH - 8, rw - descPadX * 2, descLineH);
            }

            // ── 7. Footer ─────────────────────────────────────────────────────────
            const footerY = FH - footerH;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, footerY, W, footerH);
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, footerY, W, 6);

            if (logo) {
                ctx.globalAlpha = 1;
                ctx.drawImage(logo, 28, footerY + 18, 48, 48);
            }

            ctx.fillStyle = '#000000';
            ctx.font = font(18, 'bold');
            ctx.textAlign = 'left';
            ctx.fillText('KESARARAM WITH DIGITAL', 88, footerY + 34);

            // Updated quote per user request: "វិថី សុវត្ថិភាព — The Way of Safety"
            ctx.fillStyle = '#000000';
            ctx.font = font(13, 'bold');
            ctx.fillText('វិថី សុវត្ថិភាព — The Way of Safety', 88, footerY + 56);

            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.font = font(11, 'normal');
            ctx.fillText(`${siteUrl}/learn/${cfg.slug}`, 88, footerY + 74);

            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.font = font(10, 'normal');
            ctx.textAlign = 'right';
            ctx.fillText(`© ${new Date().getFullYear()} Kesararam With Digital. All rights reserved.`, W - (qr ? 110 : 28), footerY + 74);

            if (qr) {
                ctx.drawImage(qr, W - 96, footerY + 10, 68, 68);
            }

            // ── 8. Download PNG ───────────────────────────────────────────────────
            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Failed to create image');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topic.topic_code}-Kesararam With Digital.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png', 1.0);

        } catch (err) {
            console.error('Save failed:', err);
            alert(isKh ? 'មានបញ្ហាក្នុងការរក្សាទុក' : 'Failed to save card');
        } finally {
            setSaving(false);
        }
    };

    const kf = isKh ? { fontFamily: 'var(--font-learning)' } : {};
    const labelText = isKh ? 'ទាញយកកាត' : 'Save Card';
    const savingText = isKh ? 'កំពុងរក្សាទុក...' : 'Saving...';

    return (
        <button
            onClick={handleSave}
            disabled={saving}
            style={kf}
            className={`inline-flex items-center justify-center gap-2 border-2 border-black font-black text-xs transition-all shrink-0 select-none ${
                saving
                    ? 'bg-zinc-100 text-zinc-400 border-zinc-300 cursor-wait'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-black shadow-[3px_3px_0_#000] hover:shadow-[4px_4px_0_#000] active:translate-y-0.5 active:shadow-[1px_1px_0_#000]'
            } ${
                showLabel
                    ? 'px-4 py-2.5'
                    : size === 'lg'
                    ? 'w-10 h-10'
                    : size === 'sm'
                    ? 'w-7 h-7'
                    : 'w-8 h-8'
            } ${className}`}
            title={saving ? savingText : (isKh ? 'ទាញយកកាតរូបភាព' : 'Save Card Image')}
            aria-label={saving ? savingText : (isKh ? 'ទាញយកកាតរូបភាព' : 'Save Card Image')}
        >
            {saving ? (
                <span className="flex gap-0.5 items-end h-3">
                    {[60, 100, 75].map((h, i) => (
                        <span
                            key={i}
                            className="w-0.5 bg-zinc-400 rounded-sm animate-pulse"
                            style={{ height: `${h}%`, animationDelay: `${i * 120}ms` }}
                        />
                    ))}
                </span>
            ) : (
                <Download size={size === 'lg' ? 16 : size === 'sm' ? 12 : 14} />
            )}
            {showLabel && <span>{saving ? savingText : labelText}</span>}
        </button>
    );
}
