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

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines = 99): number {
    const words = text.split(' ');
    let line = '';
    let lineCount = 0;
    for (const word of words) {
        if (lineCount >= maxLines) break;
        const test = line + word + ' ';
        if (ctx.measureText(test).width > maxWidth && line !== '') {
            ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
            line = word + ' ';
            lineCount++;
        } else {
            line = test;
        }
    }
    if (lineCount < maxLines && line.trim()) {
        ctx.fillText(line.trim(), x, y + lineCount * lineHeight);
        lineCount++;
    }
    return lineCount;
}

interface SaveCardButtonProps {
    topic: {
        topic_code: string;
        name_en: string;
        name_km: string;
        description_en: string;
        description_km: string;
        primary_image_url: string;
        sub_group: string;
        audio_url_en?: string;
        audio_url_km?: string;
    };
    isKh: boolean;
    size?: 'sm' | 'md' | 'lg';
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

export function SaveCardButton({ topic, isKh, size = 'md' }: SaveCardButtonProps) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // ── Canvas: 1200 × 900 — taller to fit full description ───────────────
            const W = 1200, H = 900;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            const cfg = CATEGORY_CONFIG[topic.sub_group] || DEFAULT_CONFIG;
            const siteUrl = 'kesararamwithdigital.tech';
            // Card shows only the selected language (same as web UI)
            const title = isKh ? topic.name_km : topic.name_en;
            const answer = isKh ? topic.description_km : topic.description_en;

            // ── Force-load brand fonts so canvas ignores device fonts ─────────────
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

            await Promise.all([
                loadFont('Inter', 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', 'bold'),
                loadFont('GoogleSansKhmer', '/Google_Sans/static/GoogleSans-Bold.ttf', 'bold'),
                loadFont('GoogleSansKhmer', '/Google_Sans/static/GoogleSans-Regular.ttf', 'normal'),
                loadFont('GoogleSansKhmer', '/Google_Sans/static/GoogleSans-Medium.ttf', '500'),
            ]);

            const fontEN = (size: number, weight = 'bold') => `${weight} ${size}px Inter, system-ui, Arial, sans-serif`;
            const fontKH = (size: number, weight = 'bold') => `${weight} ${size}px GoogleSansKhmer, "Google Sans", Inter, sans-serif`;
            const font = (size: number, weight = 'bold') => isKh ? fontKH(size, weight) : fontEN(size, weight);

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
            const rx = leftW + 44, ry = 40, rw = W - rx - 44;

            // ── Pre-measure description to calculate dynamic height ───────────────
            // We need to know how many lines the description takes BEFORE drawing
            // so we can size the box correctly.
            const descFontSize = 16;
            const descLineH = 26;
            const descPadX = 16, descPadY = 20;

            // Measure title lines
            ctx.font = font(34);
            const titleLineH = 44;
            // Count title lines by simulating wrapText
            const countLines = (text: string, maxW: number, fontSize: number, lh: number, fnt: string): number => {
                ctx.font = fnt;
                const words = text.split(' ');
                let line = '', count = 0;
                for (const word of words) {
                    const test = line + word + ' ';
                    if (ctx.measureText(test).width > maxW && line !== '') {
                        count++;
                        line = word + ' ';
                    } else {
                        line = test;
                    }
                }
                if (line.trim()) count++;
                return count;
            };

            const titleLineCount = countLines(title, rw, 34, titleLineH, font(34));
            const titleBottom = ry + 68 + titleLineCount * titleLineH;

            // Measure description lines (no cap — show ALL text)
            const descLineCount = answer
                ? countLines(answer, rw - descPadX * 2, descFontSize, descLineH, font(descFontSize, 'normal'))
                : 0;
            const descBoxH = descLineCount > 0
                ? descPadY * 2 + descLineCount * descLineH
                : 0;

            // Calculate total right-panel content height needed
            const descLabelY = titleBottom + 52;
            const answerBoxY = descLabelY + 28;
            const contentBottom = answerBoxY + descBoxH + 20;

            // Dynamic canvas height: enough for content + footer, minimum 675
            const neededH = Math.max(675, contentBottom + footerH + 20);
            canvas.height = neededH;
            const FH = neededH; // final height

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
            ctx.font = fontEN(12);
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
            ctx.font = fontEN(12);
            ctx.fillText(catLabel, 38, 44);

            // ── 4. Topic code ─────────────────────────────────────────────────────
            ctx.fillStyle = cfg.accentDark;
            ctx.font = fontEN(11);
            ctx.textAlign = 'left';
            ctx.fillText(topic.topic_code, 24, 76);

            // ── 5. Image area ─────────────────────────────────────────────────────
            const imgAreaX = 24, imgAreaY = 96;
            const imgAreaW = leftW - 48;
            // Image takes up to 60% of left panel height, leaving room for footer
            const imgAreaH = Math.min(FH - 96 - footerH - 40, 480);

            if (topicImg) {
                ctx.fillStyle = cfg.accent;
                ctx.globalAlpha = 0.3;
                roundRect(ctx, imgAreaX + 6, imgAreaY + 6, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();

                const pad = 28;
                const maxW = imgAreaW - pad * 2, maxH = imgAreaH - pad * 2;
                const aspect = topicImg.naturalWidth / topicImg.naturalHeight;
                let dw = maxW, dh = maxW / aspect;
                if (dh > maxH) { dh = maxH; dw = maxH * aspect; }
                const dx = imgAreaX + pad + (maxW - dw) / 2;
                const dy = imgAreaY + pad + (maxH - dh) / 2;
                ctx.drawImage(topicImg, dx, dy, dw, dh);

                if (cfg.slug !== 'road-sign' && cfg.slug !== 'priority') {
                    ctx.fillStyle = 'rgba(0,0,0,0.25)';
                    ctx.font = fontEN(9, 'normal');
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
                ctx.font = fontEN(64);
                ctx.textAlign = 'center';
                ctx.fillText('🚦', imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH / 2 + 20);
            }

            // ── 6. Right panel ────────────────────────────────────────────────────

            // 6a. SIGN CATEGORY micro-label
            ctx.fillStyle = cfg.accentDark;
            ctx.font = fontEN(11);
            ctx.textAlign = 'left';
            ctx.fillText('SIGN CATEGORY', rx, ry + 14);

            // 6b. Accent underline
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, ry + 22, 64, 4);

            // 6c. Title — full text, no line cap
            ctx.fillStyle = '#000000';
            ctx.font = font(34);
            wrapText(ctx, title, rx, ry + 68, rw, titleLineH, 99);

            // 6d. Metadata
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = fontEN(13);
            const metaText = topic.sub_group ? `${topic.topic_code}  ·  ${topic.sub_group}` : topic.topic_code;
            ctx.fillText(metaText, rx, titleBottom + 22);

            // 6e. Divider
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, titleBottom + 36, rw, 4);

            // 6f. DESCRIPTION label bar
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(rx, descLabelY, rw, 28);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, descLabelY, rw, 28);
            ctx.fillStyle = '#fff';
            ctx.font = fontEN(11);
            ctx.textAlign = 'left';
            ctx.fillText('DESCRIPTION', rx + 14, descLabelY + 18);

            // 6g. Description box — dynamic height, full text, no truncation
            if (answer && descBoxH > 0) {
                ctx.fillStyle = '#f0fdf4';
                ctx.fillRect(rx, answerBoxY, rw, descBoxH);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 3;
                ctx.strokeRect(rx, answerBoxY, rw, descBoxH);
                ctx.fillStyle = '#14532d';
                ctx.font = font(descFontSize, 'normal');
                ctx.textAlign = 'left';
                // No maxLines cap — show ALL text
                wrapText(ctx, answer, rx + descPadX, answerBoxY + descPadY + descLineH - 6, rw - descPadX * 2, descLineH, 99);
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
            ctx.font = fontEN(18);
            ctx.textAlign = 'left';
            ctx.fillText('KESARARAM WITH DIGITAL', 88, footerY + 36);

            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.font = isKh ? fontKH(12, 'normal') : fontEN(12, 'normal');
            ctx.fillText(
                isKh ? 'ចំណេះដឹងសុវត្ថិភាពចរាចរ — Learn. Know the signs. Pass.'
                    : "Master Cambodia's driving theory — Learn. Know the signs. Pass.",
                88, footerY + 56
            );

            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = fontEN(11);
            ctx.fillText(`${siteUrl}/learn/${cfg.slug}`, 88, footerY + 74);

            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.font = fontEN(10, 'normal');
            ctx.textAlign = 'right';
            ctx.fillText(`© ${new Date().getFullYear()} Kesararam With Digital. All rights reserved.`, W - (qr ? 110 : 28), footerY + 74);

            if (qr) {
                ctx.drawImage(qr, W - 96, footerY + 10, 68, 68);
            }

            // ── 8. Download ───────────────────────────────────────────────────────
            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Failed to create image');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topic.topic_code}-KWD.png`;
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

    // TEMPORARILY DISABLED — to re-enable, remove the `disabled` prop and restore onClick={handleSave}
    return (
        <button
            disabled
            className={`inline-flex items-center justify-center border-2 border-slate-200 transition-all shrink-0 cursor-not-allowed opacity-40 ${
                size === 'lg' ? 'w-9 h-9' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'
            } bg-slate-100 text-slate-300`}
            title={isKh ? 'រក្សាទុកកាតមិនអាចប្រើបានបណ្តោះអាសន្ន' : 'Save Card temporarily unavailable'}
            aria-label={isKh ? 'រក្សាទុកកាតមិនអាចប្រើបានបណ្តោះអាសន្ន' : 'Save Card temporarily unavailable'}
            aria-disabled="true"
        >
            <Download size={size === 'lg' ? 14 : size === 'sm' ? 10 : 12} />
        </button>
    );
}
