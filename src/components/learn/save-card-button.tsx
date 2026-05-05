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

            // Clean white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1920, 1080);

            // Load KWD black logo
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = () => resolve(null);
                logo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(null), 3000);
            }).catch(() => null);

            // Header section with logo and sign code
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 60, 40, 80, 40);
            }

            // Sign code in header (top right)
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(topic.topic_code, 1860, 70);

            // Website URL in header (top right, smaller)
            ctx.fillStyle = '#666666';
            ctx.font = '16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('kesararamwithdigital.tech', 1860, 95);

            // Main content area - Sign image with border (left side)
            const signBoxX = 80;
            const signBoxY = 160;
            const signBoxSize = 300;

            // Sign border (black frame)
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.strokeRect(signBoxX, signBoxY, signBoxSize, signBoxSize);

            // White background inside frame
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(signBoxX + 3, signBoxY + 3, signBoxSize - 6, signBoxSize - 6);

            // Load and draw sign image
            if (topic.primary_image_url) {
                const signImg = new Image();
                signImg.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    signImg.onload = resolve;
                    signImg.onerror = reject;
                    signImg.src = topic.primary_image_url;
                    setTimeout(reject, 5000);
                });

                // Center the sign image within the frame
                const padding = 20;
                const maxSize = signBoxSize - (padding * 2);
                const imgAspect = signImg.width / signImg.height;
                let drawWidth = maxSize;
                let drawHeight = maxSize;

                if (imgAspect > 1) {
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawWidth = drawHeight * imgAspect;
                }

                const x = signBoxX + (signBoxSize - drawWidth) / 2;
                const y = signBoxY + (signBoxSize - drawHeight) / 2;
                ctx.drawImage(signImg, x, y, drawWidth, drawHeight);
            }

            // Sign title (right side of image)
            const name = isKh ? topic.name_km : topic.name_en;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 48px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';

            // Handle long titles
            const maxTitleWidth = 1400;
            let titleText = name;
            let titleMetrics = ctx.measureText(titleText);
            if (titleMetrics.width > maxTitleWidth) {
                // Try to fit by reducing font size
                ctx.font = 'bold 36px system-ui, Arial, sans-serif';
                titleMetrics = ctx.measureText(titleText);
                if (titleMetrics.width > maxTitleWidth) {
                    // Truncate if still too long
                    titleText = name.substring(0, 50) + '...';
                }
            }

            ctx.fillText(titleText, 420, 220);

            // Description (right side, below title)
            const description = isKh ? topic.description_km : topic.description_en;
            if (description) {
                ctx.fillStyle = '#333333';
                ctx.font = '24px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';

                // Word wrap description
                const words = description.split(' ');
                let line = '';
                let y = 280;
                const maxWidth = 1400;
                const lineHeight = 35;
                let lineCount = 0;
                const maxLines = 8;

                for (let word of words) {
                    if (lineCount >= maxLines) break;

                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && line !== '') {
                        ctx.fillText(line.trim(), 420, y);
                        line = word + ' ';
                        y += lineHeight;
                        lineCount++;
                    } else {
                        line = testLine;
                    }
                }

                if (lineCount < maxLines && line.trim()) {
                    ctx.fillText(line.trim(), 420, y);
                }
            }

            // Footer section
            const footerY = 1020;

            // Credits (bottom left)
            ctx.fillStyle = '#888888';
            ctx.font = '16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Downloaded from https://www.kesararamwithdigital.tech/learn/road-sign', 60, footerY);

            // Date (bottom right)
            ctx.textAlign = 'right';
            const currentDate = new Date().toLocaleDateString(isKh ? 'km-KH' : 'en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            ctx.fillText(currentDate, 1860, footerY);

            // Download the image
            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Failed to create image');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${topic.topic_code}.png`;
                a.click();
                URL.revokeObjectURL(url);
            }, 'image/png', 1.0);

        } catch (error) {
            console.error('Save failed:', error);
            alert(isKh ? 'មានបញ្ហា' : 'Failed to save');
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