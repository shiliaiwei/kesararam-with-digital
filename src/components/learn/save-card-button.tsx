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
            // ── Canvas: 1200 × 675 (16:9) ─────────────────────────────────────────
            const W = 1200, H = 675;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            const cfg = CATEGORY_CONFIG[topic.sub_group] || DEFAULT_CONFIG;
            const siteUrl = 'kesararamwithdigital.tech';
            const title = isKh ? topic.name_km : topic.name_en;
            const answer = isKh ? topic.description_km : topic.description_en;

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

            // ── 1. Background — Premium light gradient ────────────────────────────
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, H);

            // ── 2. Left panel — Category brand color (light) ─────────────────────
            const leftW = 460;
            ctx.fillStyle = cfg.bgLight;
            ctx.fillRect(0, 0, leftW, H);

            // Accent stripe on left edge — bold brand color
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, 0, 12, H);

            // ── 3. Category label pill (top-left) — Premium badge ─────────────────
            ctx.fillStyle = cfg.accent;
            ctx.font = 'bold 12px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            const catLabel = isKh ? cfg.label : cfg.label.toUpperCase();
            const catW = ctx.measureText(catLabel).width + 28;
            roundRect(ctx, 24, 24, catW, 32, 6);
            ctx.fill();
            // Neo-brutalism shadow
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            roundRect(ctx, 24, 24, catW, 32, 6);
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px system-ui, Arial, sans-serif';
            ctx.fillText(catLabel, 38, 44);

            // ── 4. Topic code badge — Subtle, professional ────────────────────────
            ctx.fillStyle = cfg.accentDark;
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(topic.topic_code, 24, 76);

            // ── 5. Image area (centered in left panel) — Premium card ─────────────
            if (topicImg) {
                const imgAreaX = 24, imgAreaY = 96, imgAreaW = leftW - 48, imgAreaH = H - 96 - 120;
                // White premium card with shadow
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();
                // Neo-brutalism border
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.stroke();
                // Hard shadow (Neo-brutalism)
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.fillRect(imgAreaX + 6, imgAreaY + 6, imgAreaW, imgAreaH);
                // Redraw white card on top
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.stroke();

                // Draw image centered, filling most of the card
                const pad = 28;
                const maxW = imgAreaW - pad * 2, maxH = imgAreaH - pad * 2;
                const aspect = topicImg.naturalWidth / topicImg.naturalHeight;
                let dw = maxW, dh = maxW / aspect;
                if (dh > maxH) { dh = maxH; dw = maxH * aspect; }
                const dx = imgAreaX + pad + (maxW - dw) / 2;
                const dy = imgAreaY + pad + (maxH - dh) / 2;
                ctx.drawImage(topicImg, dx, dy, dw, dh);

                // AI disclaimer — subtle, bottom of image card
                ctx.fillStyle = 'rgba(0,0,0,0.25)';
                ctx.font = '9px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(isKh ? 'AI-generated image' : 'AI-generated image', imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH - 12);
            } else {
                // Placeholder with premium styling
                const imgAreaX = 24, imgAreaY = 96, imgAreaW = leftW - 48, imgAreaH = H - 96 - 120;
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.fill();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 4;
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 8);
                ctx.stroke();
                ctx.fillStyle = cfg.accent;
                ctx.font = 'bold 64px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🚦', imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH / 2 + 20);
            }

            // ── 6. Right panel content — Premium hierarchy ────────────────────────
            const rx = leftW + 44, ry = 40, rw = W - rx - 40;

            // 6a. KNOWLEDGE CATEGORY micro-label — Premium styling
            ctx.fillStyle = cfg.accentDark;
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.letterSpacing = '0.1em';
            ctx.fillText('KNOWLEDGE CATEGORY', rx, ry + 14);

            // 6b. Accent underline — Bold brand element
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, ry + 22, 64, 4);

            // 6c. Title — Large, bold, premium hierarchy
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 42px system-ui, Arial, sans-serif';
            const titleLines = wrapText(ctx, title, rx, ry + 72, rw, 52, 3);
            const titleBottom = ry + 72 + titleLines * 52;

            // 6d. Topic code + subgroup — Professional metadata
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = 'bold 13px monospace';
            const metaText = topic.sub_group ? `${topic.topic_code}  ·  ${topic.sub_group}` : topic.topic_code;
            ctx.fillText(metaText, rx, titleBottom + 22);

            // 6e. Divider — Strong visual separator
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, titleBottom + 36, rw, 4);

            // 6f. DESCRIPTION label bar — Premium design
            const descLabelY = titleBottom + 52;
            ctx.fillStyle = '#22c55e'; // emerald — trust signal
            ctx.fillRect(rx, descLabelY, rw, 28);
            // Neo-brutalism border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, descLabelY, rw, 28);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('DESCRIPTION', rx + 14, descLabelY + 18);

            // 6g. Answer text box — Premium card
            const answerBoxY = descLabelY + 28;
            const answerBoxH = 120;
            ctx.fillStyle = '#f0fdf4'; // emerald-50
            ctx.fillRect(rx, answerBoxY, rw, answerBoxH);
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeRect(rx, answerBoxY, rw, answerBoxH);
            if (answer) {
                ctx.fillStyle = '#14532d'; // emerald-900
                ctx.font = 'bold 18px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';
                wrapText(ctx, answer, rx + 16, answerBoxY + 32, rw - 32, 28, 3);
            }

            // 6h. Quote — Education-focused, premium typography
            const quoteY = answerBoxY + answerBoxH + 28;
            ctx.fillStyle = cfg.accentDark;
            ctx.font = 'italic bold 16px Georgia, serif';
            ctx.textAlign = 'left';
            ctx.fillText(`"${cfg.quote}"`, rx, quoteY);

            // ── 7. Footer bar — Premium brand section ─────────────────────────────
            const footerH = 88;
            const footerY = H - footerH;

            // Footer bg — White with brand accent
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, footerY, W, footerH);

            // Accent top border on footer — Bold brand stripe
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, footerY, W, 6);

            // Logo — Premium placement
            if (logo) {
                ctx.globalAlpha = 1;
                ctx.drawImage(logo, 28, footerY + 18, 48, 48);
                ctx.globalAlpha = 1;
            }

            // Brand name — Bold, black, premium
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 18px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('KESARARAM WITH DIGITAL', 88, footerY + 36);

            // Tagline — Education-focused
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.font = '12px system-ui, Arial, sans-serif';
            ctx.fillText(isKh
                ? 'ចំណេះដឹងសុវត្ថិភាពចរាចរ — Learn. Know the signs. Pass.'
                : 'Master Cambodia\'s driving theory — Learn. Know the signs. Pass.',
                88, footerY + 56);

            // URL — Professional, readable
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.fillText(`${siteUrl}/learn/${cfg.slug}`, 88, footerY + 74);

            // Copyright — Professional
            ctx.fillStyle = 'rgba(0,0,0,0.35)';
            ctx.font = '10px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`© ${new Date().getFullYear()} Kesararam With Digital. All rights reserved.`, W - (qr ? 110 : 28), footerY + 74);

            // QR code — Premium placement with white background
            if (qr) {
                // White background for QR
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(W - 100, footerY + 6, 76, 76);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(W - 100, footerY + 6, 76, 76);
                ctx.drawImage(qr, W - 96, footerY + 10, 68, 68);
            }

            // ── 8. Outer border — Neo-brutalism premium frame ─────────────────────
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, W - 6, H - 6);
            // Inner accent border
            ctx.strokeStyle = cfg.accent;
            ctx.lineWidth = 2;
            ctx.strokeRect(9, 9, W - 18, H - 18);

            // ── 9. Download ───────────────────────────────────────────────────────
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

    return (
        <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center justify-center border-2 border-slate-400 transition-all shrink-0 ${size === 'lg' ? 'w-9 h-9' :
                size === 'sm' ? 'w-6 h-6' :
                    'w-8 h-8'
                } ${saving
                    ? 'bg-slate-100 text-slate-300 cursor-wait border-slate-200'
                    : 'bg-slate-200 text-slate-500 hover:bg-slate-300 hover:text-slate-700 shadow-[2px_2px_0_#94a3b8] hover:shadow-[3px_3px_0_#64748b]'
                }`}
            title={isKh ? 'រក្សាទុកកាត' : 'Save Card'}
            aria-label={isKh ? 'រក្សាទុកកាត' : 'Save Card'}
        >
            {saving
                ? <span className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                : <Download size={size === 'lg' ? 14 : size === 'sm' ? 10 : 12} />
            }
        </button>
    );
}
