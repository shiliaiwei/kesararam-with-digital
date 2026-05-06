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

// Word-wrap helper
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

const CATEGORY_SLUG: Record<string, string> = {
    'Prohibitory Signs': 'road-sign', 'Mandatory Signs': 'road-sign', 'Priority Signs': 'road-sign',
    'Warning Signs': 'road-sign', 'Temporary Signs': 'road-sign', 'Direction Signs': 'road-sign',
    'Buildup Area Boundary Signs': 'road-sign', 'Street Name Signs': 'road-sign',
    'Informative Signs': 'road-sign', 'Supplementary Signs': 'road-sign', 'Sign Posts': 'road-sign',
    'Transverse Markings': 'road-sign', 'Longitudinal Markings': 'road-sign',
    'Arrows Markings': 'road-sign', 'Other Road Markings': 'road-sign',
    'Traffic Lights': 'road-sign', 'Traffic Police Signals': 'road-sign',
    'Traffic Rules': 'road-traffic', 'Speed Limits': 'road-traffic', 'Parking': 'road-traffic', 'Overtaking': 'road-traffic',
    'Intersections': 'priority', 'Intersection Priority – Left Turn': 'priority',
    'Intersection Priority – Sequential': 'priority', 'Intersection Priority – Simultaneous': 'priority',
    'Roundabouts': 'priority', 'Pedestrian Crossings': 'priority',
    'Basic Maneuvers': 'driving', 'Advanced Techniques': 'driving', 'Defensive Driving': 'driving',
    'Engine': 'technical', 'Brakes': 'technical', 'Lights': 'technical', 'Safety Systems': 'technical',
    'Weight Limits': 'loading-people-goods', 'Passenger Safety': 'loading-people-goods', 'Cargo Securing': 'loading-people-goods',
    'Road Safety': 'general-knowledge', 'Environmental': 'general-knowledge', 'Legal': 'general-knowledge',
    'Accidents': 'emergency', 'Breakdowns': 'emergency', 'First Aid': 'emergency', 'Emergency Contacts': 'emergency',
};

export function SaveCardButton({ topic, isKh, size = 'md' }: SaveCardButtonProps) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            // ── Canvas: 1200 × 675 (16:9, social-share friendly) ──────────────────
            const W = 1200, H = 675;
            const canvas = document.createElement('canvas');
            canvas.width = W; canvas.height = H;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas not supported');

            const slug = CATEGORY_SLUG[topic.sub_group] || 'learn';
            const siteUrl = 'kesararamwithdigital.tech';

            // ── 1. WHITE background ───────────────────────────────────────────────
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, W, H);

            // ── 2. BLACK outer border (neobrutalist) ──────────────────────────────
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 6;
            ctx.strokeRect(3, 3, W - 6, H - 6);

            // ── 3. YELLOW top accent bar ──────────────────────────────────────────
            ctx.fillStyle = '#eab308';
            ctx.fillRect(3, 3, W - 6, 8);

            // ── 4. Load assets in parallel ────────────────────────────────────────
            const loadImg = (src: string, timeout = 3000) => new Promise<HTMLImageElement | null>((resolve) => {
                const img = new Image(); img.crossOrigin = 'anonymous';
                const t = setTimeout(() => resolve(null), timeout);
                img.onload = () => { clearTimeout(t); resolve(img); };
                img.onerror = () => { clearTimeout(t); resolve(null); };
                img.src = src;
            });

            const [logo, qr, topicImg] = await Promise.all([
                loadImg('https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg'),
                loadImg('/brand/qrcode-kwd.png'),
                topic.primary_image_url ? loadImg(topic.primary_image_url, 5000) : Promise.resolve(null),
            ]);

            // ── 5. LEFT COLUMN — image area (x: 20..460, y: 20..H-20) ────────────
            const imgX = 20, imgY = 20, imgW = 440, imgH = H - 40;

            if (topicImg) {
                // Image background card — black border + shadow
                ctx.fillStyle = '#f4f4f5'; // zinc-100
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.fill();
                ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.stroke();
                // Shadow
                ctx.fillStyle = '#000';
                roundRect(ctx, imgX + 6, imgY + 6, imgW, imgH, 8);
                ctx.fill();
                // Re-draw card on top
                ctx.fillStyle = '#f4f4f5';
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.fill();
                ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.stroke();

                // Draw image centered inside card with padding
                // Image takes up 20% of card height (centered), rest is whitespace
                const pad = 20;
                const maxW = imgW - pad * 2;
                const maxH = Math.floor((imgH - pad * 2) * 0.20); // 20% of available height
                const aspect = topicImg.naturalWidth / topicImg.naturalHeight;
                let dw = maxW, dh = maxW / aspect;
                if (dh > maxH) { dh = maxH; dw = maxH * aspect; }
                const dx = imgX + pad + (maxW - dw) / 2;
                const dy = imgY + pad + ((imgH - pad * 2) * 0.5 - dh / 2); // vertically centered in upper 70%
                ctx.drawImage(topicImg, dx, dy, dw, dh);

                // AI disclaimer — bottom of image card, 30% cap width
                const disclaimerText = isKh ? '⚠ រូបភាពបង្កើតដោយ AI' : '⚠ AI-generated image';
                const disclaimerMaxW = imgW * 0.30; // 30% of card width
                ctx.font = 'bold 10px system-ui, Arial, sans-serif';
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                ctx.textAlign = 'center';
                // Clip text to 30% width
                ctx.save();
                ctx.rect(imgX + imgW / 2 - disclaimerMaxW / 2, imgY + imgH - 28, disclaimerMaxW, 20);
                ctx.clip();
                ctx.fillText(disclaimerText, imgX + imgW / 2, imgY + imgH - 14);
                ctx.restore();
            } else {
                // Placeholder card
                ctx.fillStyle = '#fef9c3';
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.fill();
                ctx.strokeStyle = '#000'; ctx.lineWidth = 3;
                roundRect(ctx, imgX, imgY, imgW, imgH, 8);
                ctx.stroke();
                ctx.fillStyle = '#000'; ctx.font = 'bold 48px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('📷', imgX + imgW / 2, imgY + imgH / 2 + 16);
            }

            // ── 6. RIGHT COLUMN — content (x: 480..W-20) ─────────────────────────
            const rx = 480, ry = 28, rw = W - rx - 20;

            // 6a. KNOWLEDGE CATEGORY badge
            ctx.fillStyle = '#000';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            const badgeText = 'KNOWLEDGE CATEGORY';
            const bw = ctx.measureText(badgeText).width + 20;
            ctx.fillRect(rx, ry, bw, 22);
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.fillText(badgeText, rx + 10, ry + 15);

            // 6b. Topic code + subgroup — small, muted
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'left';
            const metaText = topic.sub_group ? `${topic.topic_code} · ${topic.sub_group}` : topic.topic_code;
            ctx.fillText(metaText, rx, ry + 44);

            // 6c. Title — large, black, bold
            const title = isKh ? topic.name_km : topic.name_en;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 36px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            const titleLines = wrapText(ctx, title, rx, ry + 72, rw, 46, 3);
            const titleBottom = ry + 72 + titleLines * 46;

            // 6d. Answer label bar
            const answerLabelY = titleBottom + 16;
            ctx.fillStyle = '#000';
            ctx.fillRect(rx, answerLabelY, rw, 26);
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 10px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('ANSWER', rx + 8, answerLabelY + 17);

            // 6e. Answer text — inside a light box
            const answerBoxY = answerLabelY + 26;
            const answer = isKh ? topic.description_km : topic.description_en;
            const answerBoxH = 100;
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(rx, answerBoxY, rw, answerBoxH);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
            ctx.strokeRect(rx, answerBoxY, rw, answerBoxH);
            if (answer) {
                ctx.fillStyle = '#000';
                ctx.font = 'bold 18px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';
                wrapText(ctx, answer, rx + 10, answerBoxY + 26, rw - 20, 26, 3);
            }

            // ── 7. FOOTER BAR ─────────────────────────────────────────────────────
            const footerY = H - 90;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, footerY, W, 90);

            // Logo in footer
            if (logo) {
                ctx.globalAlpha = 1;
                ctx.drawImage(logo, 20, footerY + 15, 52, 52);
            }

            // Brand name
            ctx.fillStyle = '#eab308';
            ctx.font = 'bold 18px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('KESARARAM WITH DIGITAL', 84, footerY + 32);

            // Promo text
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '12px system-ui, Arial, sans-serif';
            ctx.fillText(isKh
                ? 'រៀនបើកបរ ប្រកបដោយសុវត្ថិភាព — Learn to drive safely'
                : 'Master Cambodia\'s driving theory — Learn. Play. Pass.',
                84, footerY + 52);

            // URL
            ctx.fillStyle = 'rgba(255,255,255,0.35)';
            ctx.font = 'bold 11px system-ui, Arial, sans-serif';
            ctx.fillText(`${siteUrl}/learn/${slug}`, 84, footerY + 70);

            // QR code — bottom right
            if (qr) {
                ctx.drawImage(qr, W - 100, footerY + 5, 80, 80);
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
