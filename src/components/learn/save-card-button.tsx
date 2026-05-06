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
const CATEGORY_CONFIG: Record<string, { slug: string; accent: string; accentDark: string; label: string; quote: string }> = {
    // Road Signs — yellow
    'Prohibitory Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Mandatory Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Priority Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Warning Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Temporary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Direction Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Buildup Area Boundary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Street Name Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Informative Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Supplementary Signs': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Sign Posts': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Transverse Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Longitudinal Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Arrows Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Other Road Markings': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Traffic Lights': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    'Traffic Police Signals': { slug: 'road-sign', accent: '#eab308', accentDark: '#ca8a04', label: 'Traffic Signs', quote: 'Know the sign. Own the road.' },
    // Road Traffic — blue
    'Traffic Rules': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', label: 'Road Traffic Law', quote: 'Rules protect everyone on the road.' },
    'Speed Limits': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', label: 'Road Traffic Law', quote: 'Rules protect everyone on the road.' },
    'Parking': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', label: 'Road Traffic Law', quote: 'Rules protect everyone on the road.' },
    'Overtaking': { slug: 'road-traffic', accent: '#3b82f6', accentDark: '#1d4ed8', label: 'Road Traffic Law', quote: 'Rules protect everyone on the road.' },
    // Priority — orange
    'Intersections': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    'Intersection Priority – Left Turn': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    'Intersection Priority – Sequential': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    'Intersection Priority – Simultaneous': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    'Roundabouts': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    'Pedestrian Crossings': { slug: 'priority', accent: '#f97316', accentDark: '#c2410c', label: 'Right of Way', quote: 'Priority saves lives at every crossing.' },
    // Driving — green
    'Basic Maneuvers': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', label: 'Driving Skills', quote: 'Skill and confidence, every kilometre.' },
    'Advanced Techniques': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', label: 'Driving Skills', quote: 'Skill and confidence, every kilometre.' },
    'Defensive Driving': { slug: 'driving', accent: '#22c55e', accentDark: '#15803d', label: 'Driving Skills', quote: 'Skill and confidence, every kilometre.' },
    // Technical — indigo
    'Engine': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', label: 'Vehicle Technology', quote: 'Understand your machine. Drive smarter.' },
    'Brakes': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', label: 'Vehicle Technology', quote: 'Understand your machine. Drive smarter.' },
    'Lights': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', label: 'Vehicle Technology', quote: 'Understand your machine. Drive smarter.' },
    'Safety Systems': { slug: 'technical', accent: '#6366f1', accentDark: '#4338ca', label: 'Vehicle Technology', quote: 'Understand your machine. Drive smarter.' },
    // Loading — cyan
    'Weight Limits': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', label: 'Loading People & Goods', quote: 'Safe loads, safe roads.' },
    'Passenger Safety': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', label: 'Loading People & Goods', quote: 'Safe loads, safe roads.' },
    'Cargo Securing': { slug: 'loading-people-goods', accent: '#06b6d4', accentDark: '#0e7490', label: 'Loading People & Goods', quote: 'Safe loads, safe roads.' },
    // General — purple
    'Road Safety': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', label: 'General Knowledge', quote: 'Knowledge is the safest vehicle.' },
    'Environmental': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', label: 'General Knowledge', quote: 'Knowledge is the safest vehicle.' },
    'Legal': { slug: 'general-knowledge', accent: '#a855f7', accentDark: '#7e22ce', label: 'General Knowledge', quote: 'Knowledge is the safest vehicle.' },
    // Emergency — red
    'Accidents': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', label: 'Emergency', quote: 'Stay calm. Act fast. Save lives.' },
    'Breakdowns': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', label: 'Emergency', quote: 'Stay calm. Act fast. Save lives.' },
    'First Aid': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', label: 'Emergency', quote: 'Stay calm. Act fast. Save lives.' },
    'Emergency Contacts': { slug: 'emergency', accent: '#ef4444', accentDark: '#b91c1c', label: 'Emergency', quote: 'Stay calm. Act fast. Save lives.' },
};

const DEFAULT_CONFIG = { slug: 'learn', accent: '#eab308', accentDark: '#ca8a04', label: 'Learn', quote: 'Learn. Play. Pass.' };

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

            // ── 1. Background ─────────────────────────────────────────────────────
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(0, 0, W, H);

            // ── 2. Left panel — dark bg ───────────────────────────────────────────
            const leftW = 460;
            ctx.fillStyle = '#111827'; // gray-900
            ctx.fillRect(0, 0, leftW, H);

            // Accent stripe on left edge
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, 0, 8, H);

            // ── 3. Category label pill (top-left) ─────────────────────────────────
            ctx.fillStyle = cfg.accent;
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            const catLabel = isKh ? cfg.label : cfg.label.toUpperCase();
            const catW = ctx.measureText(catLabel).width + 24;
            roundRect(ctx, 20, 20, catW, 26, 4);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.fillText(catLabel, 32, 37);

            // ── 4. Topic code badge ───────────────────────────────────────────────
            ctx.fillStyle = 'rgba(255,255,255,0.08)';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left';
            ctx.fillText(topic.topic_code, 20, 72);

            // ── 5. Image area (centered in left panel) ────────────────────────────
            if (topicImg) {
                const imgAreaX = 20, imgAreaY = 90, imgAreaW = leftW - 40, imgAreaH = H - 90 - 110;
                // White card behind image
                ctx.fillStyle = '#ffffff';
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 6);
                ctx.fill();
                ctx.strokeStyle = cfg.accent; ctx.lineWidth = 3;
                roundRect(ctx, imgAreaX, imgAreaY, imgAreaW, imgAreaH, 6);
                ctx.stroke();

                // Draw image centered, filling most of the card
                const pad = 24;
                const maxW = imgAreaW - pad * 2, maxH = imgAreaH - pad * 2;
                const aspect = topicImg.naturalWidth / topicImg.naturalHeight;
                let dw = maxW, dh = maxW / aspect;
                if (dh > maxH) { dh = maxH; dw = maxH * aspect; }
                const dx = imgAreaX + pad + (maxW - dw) / 2;
                const dy = imgAreaY + pad + (maxH - dh) / 2;
                ctx.drawImage(topicImg, dx, dy, dw, dh);

                // AI disclaimer — very subtle, bottom of image card
                ctx.fillStyle = 'rgba(255,255,255,0.18)';
                ctx.font = '9px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(isKh ? 'AI-generated image' : 'AI-generated image', imgAreaX + imgAreaW / 2, imgAreaY + imgAreaH - 8);
            } else {
                // Placeholder
                ctx.fillStyle = 'rgba(255,255,255,0.06)';
                roundRect(ctx, 20, 90, leftW - 40, H - 200, 6);
                ctx.fill();
                ctx.fillStyle = cfg.accent;
                ctx.font = 'bold 48px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('🚦', leftW / 2, H / 2);
            }

            // ── 6. Right panel content ────────────────────────────────────────────
            const rx = leftW + 36, ry = 32, rw = W - rx - 32;

            // 6a. KNOWLEDGE CATEGORY micro-label
            ctx.fillStyle = cfg.accentDark;
            ctx.font = 'bold 10px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('KNOWLEDGE CATEGORY', rx, ry + 12);

            // 6b. Accent underline
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, ry + 18, 48, 3);

            // 6c. Title — large, black, bold
            ctx.fillStyle = '#111827';
            ctx.font = 'bold 38px system-ui, Arial, sans-serif';
            const titleLines = wrapText(ctx, title, rx, ry + 62, rw, 48, 3);
            const titleBottom = ry + 62 + titleLines * 48;

            // 6d. Topic code + subgroup — muted
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.font = '12px monospace';
            const metaText = topic.sub_group ? `${topic.topic_code}  ·  ${topic.sub_group}` : topic.topic_code;
            ctx.fillText(metaText, rx, titleBottom + 18);

            // 6e. Divider
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(rx, titleBottom + 30, rw, 3);

            // 6f. DESCRIPTION label bar
            const descLabelY = titleBottom + 44;
            ctx.fillStyle = '#22c55e'; // emerald — matches web UI description bar
            ctx.fillRect(rx, descLabelY, rw, 24);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 9px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('DESCRIPTION', rx + 10, descLabelY + 16);

            // 6g. Answer text box
            const answerBoxY = descLabelY + 24;
            const answerBoxH = 110;
            ctx.fillStyle = '#f0fdf4'; // emerald-50
            ctx.fillRect(rx, answerBoxY, rw, answerBoxH);
            ctx.strokeStyle = '#86efac'; ctx.lineWidth = 2; // emerald-300
            ctx.strokeRect(rx, answerBoxY, rw, answerBoxH);
            if (answer) {
                ctx.fillStyle = '#14532d'; // emerald-900
                ctx.font = 'bold 17px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';
                wrapText(ctx, answer, rx + 12, answerBoxY + 28, rw - 24, 26, 3);
            }

            // 6h. Quote
            const quoteY = answerBoxY + answerBoxH + 20;
            ctx.fillStyle = cfg.accent;
            ctx.font = 'italic bold 14px Georgia, serif';
            ctx.textAlign = 'left';
            ctx.fillText(`"${cfg.quote}"`, rx, quoteY);

            // ── 7. Footer bar ─────────────────────────────────────────────────────
            const footerH = 80;
            const footerY = H - footerH;

            // Footer bg — dark
            ctx.fillStyle = '#000';
            ctx.fillRect(0, footerY, W, footerH);

            // Accent top border on footer
            ctx.fillStyle = cfg.accent;
            ctx.fillRect(0, footerY, W, 4);

            // Logo
            if (logo) {
                ctx.globalAlpha = 0.95;
                ctx.drawImage(logo, 20, footerY + 14, 44, 44);
                ctx.globalAlpha = 1;
            }

            // Brand name
            ctx.fillStyle = cfg.accent;
            ctx.font = 'bold 16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('KESARARAM WITH DIGITAL', 76, footerY + 30);

            // Tagline
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.font = '11px system-ui, Arial, sans-serif';
            ctx.fillText(isKh
                ? 'រៀនបើកបរ ប្រកបដោយសុវត្ថិភាព — Learn to drive safely'
                : 'Master Cambodia\'s driving theory — Learn. Play. Pass.',
                76, footerY + 50);

            // URL
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.font = 'bold 10px system-ui, Arial, sans-serif';
            ctx.fillText(`${siteUrl}/learn/${cfg.slug}`, 76, footerY + 68);

            // Copyright
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.font = '10px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`© ${new Date().getFullYear()} Kesararam With Digital. All rights reserved.`, W - (qr ? 110 : 20), footerY + 68);

            // QR code
            if (qr) {
                ctx.drawImage(qr, W - 96, footerY + 4, 72, 72);
            }

            // ── 8. Outer border ───────────────────────────────────────────────────
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, W - 4, H - 4);

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
            className={`inline-flex items-center gap-1.5 border-2 border-black font-black transition-all ${size === 'lg' ? 'px-4 py-2 text-xs' :
                size === 'sm' ? 'px-2 py-1 text-[9px]' :
                    'px-3 py-1.5 text-[10px]'
                } ${saving
                    ? 'bg-zinc-100 text-zinc-400 cursor-wait'
                    : 'bg-yellow-400 hover:bg-yellow-300 shadow-[2px_2px_0_#000] hover:shadow-[3px_3px_0_#000]'
                }`}
            title={isKh ? 'រក្សាទុកកាត' : 'Save Card'}
        >
            <Download size={size === 'lg' ? 13 : size === 'sm' ? 9 : 11} />
            {saving ? (isKh ? 'កំពុងរក្សា...' : 'Saving...') : (isKh ? 'រក្សាទុក' : 'Save Card')}
        </button>
    );
}
