"use client";

import { useState } from "react";
import { Download } from "lucide-react";

interface SaveCardButtonProps {
    topic: {
        topic_code: string;
        name_en: string;
        name_km: string;
        description_en: string;
        description_km: string;
        primary_image_url: string;
        sub_group: string;
    };
    isKh: boolean;
}

export function SaveCardButton({ topic, isKh }: SaveCardButtonProps) {
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');

            if (!ctx) throw new Error('Canvas not supported');

            // Pure white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1920, 1080);

            // Load KWD logo at full size (no resize)
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = () => resolve(null);
                logo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(null), 3000);
            }).catch(() => null);

            // Draw KWD logo at full original size (top-left)
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 60, 40);
            }

            // Sign code (top-right)
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 36px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(topic.topic_code, 1860, 80);

            // Website URL (top-right, below sign code)
            ctx.fillStyle = '#666666';
            ctx.font = '16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('kesararamwithdigital.tech', 1860, 110);

            // Load and draw sign image (center-left, NO BORDERS)
            if (topic.primary_image_url) {
                const signImg = new Image();
                signImg.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    signImg.onload = resolve;
                    signImg.onerror = reject;
                    signImg.src = topic.primary_image_url;
                    setTimeout(reject, 5000);
                });

                // Sign image area (center-left, no borders)
                const signAreaX = 100;
                const signAreaY = 200;
                const signAreaSize = 400;

                // Center the sign image (no borders, no background)
                const imgAspect = signImg.width / signImg.height;
                let drawWidth = signAreaSize;
                let drawHeight = signAreaSize;

                if (imgAspect > 1) {
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawWidth = drawHeight * imgAspect;
                }

                const x = signAreaX + (signAreaSize - drawWidth) / 2;
                const y = signAreaY + (signAreaSize - drawHeight) / 2;
                ctx.drawImage(signImg, x, y, drawWidth, drawHeight);
            }

            // Title (right side) - bilingual based on user language
            const name = isKh ? topic.name_km : topic.name_en;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 52px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';

            // Handle long titles with proper wrapping
            const titleStartX = 550;
            const titleStartY = 250;
            const maxTitleWidth = 1300;

            // Split title into words for wrapping
            const titleWords = name.split(' ');
            let titleLine = '';
            let titleY = titleStartY;
            const titleLineHeight = 65;

            for (let word of titleWords) {
                const testLine = titleLine + word + ' ';
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxTitleWidth && titleLine !== '') {
                    ctx.fillText(titleLine.trim(), titleStartX, titleY);
                    titleLine = word + ' ';
                    titleY += titleLineHeight;
                } else {
                    titleLine = testLine;
                }
            }
            if (titleLine.trim()) {
                ctx.fillText(titleLine.trim(), titleStartX, titleY);
            }

            // Description (right side, below title) - bilingual
            const description = isKh ? topic.description_km : topic.description_en;
            if (description) {
                ctx.fillStyle = '#000000';
                ctx.font = '28px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';

                // Word wrap description
                const words = description.split(' ');
                let line = '';
                let y = titleY + 80; // Start below title
                const maxWidth = 1300;
                const lineHeight = 40;
                let lineCount = 0;
                const maxLines = 10;

                for (let word of words) {
                    if (lineCount >= maxLines) break;

                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && line !== '') {
                        ctx.fillText(line.trim(), titleStartX, y);
                        line = word + ' ';
                        y += lineHeight;
                        lineCount++;
                    } else {
                        line = testLine;
                    }
                }

                if (lineCount < maxLines && line.trim()) {
                    ctx.fillText(line.trim(), titleStartX, y);
                }
            }

            // Footer section
            const footerY = 1020;

            // Promotional text (bottom left) - psychological words to encourage learning
            ctx.fillStyle = '#888888';
            ctx.font = '18px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            const promoText = isKh
                ? 'ចាប់ផ្តើមរៀនបើកបរប្រកបដោយសុវត្ថិភាព និងជោគជ័យ - kesararamwithdigital.tech'
                : 'Start your safe and successful driving journey - kesararamwithdigital.tech';
            ctx.fillText(promoText, 60, footerY);

            // Date (bottom right) - full format in both languages
            ctx.textAlign = 'right';
            const currentDate = new Date();
            let dateText = '';

            if (isKh) {
                // Khmer date format: ខែមករា ០៥, ២០២៦
                const khmerMonths = [
                    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
                    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
                ];
                const khmerNumerals = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];

                const month = khmerMonths[currentDate.getMonth()];
                const day = currentDate.getDate().toString().split('').map(d => khmerNumerals[parseInt(d)]).join('');
                const year = currentDate.getFullYear().toString().split('').map(d => khmerNumerals[parseInt(d)]).join('');

                dateText = `ខែ${month} ${day}, ${year}`;
            } else {
                // English date format: January 05, 2026
                const englishMonths = [
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                ];

                const month = englishMonths[currentDate.getMonth()];
                const day = currentDate.getDate().toString().padStart(2, '0');
                const year = currentDate.getFullYear();

                dateText = `${month} ${day}, ${year}`;
            }

            ctx.fillText(dateText, 1860, footerY);

            // Download with branded filename: PWD3-R3-00-KWD.png
            const brandedFilename = `${topic.topic_code}-KWD.png`;

            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Failed to create image');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = brandedFilename;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('Save failed:', error);
            alert(isKh ? 'មានបញ្ហាក្នុងការរក្សាទុក' : 'Failed to save card');
        } finally {
            setSaving(false);
        }
    };

    return (
        <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-1 px-2 py-1 border-2 border-black font-bold text-[10px] transition-all ${saving
                ? "bg-zinc-100 text-zinc-400 cursor-wait"
                : "bg-yellow-400 hover:bg-yellow-500 shadow-[2px_2px_0_#000]"
                }`}
            title={isKh ? "រក្សាទុកកាត" : "Save Card"}
        >
            <Download size={12} />
            {isKh ? "រក្សាទុក" : "Save Card"}
        </button>
    );
}