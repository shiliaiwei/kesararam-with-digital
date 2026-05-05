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

            // Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1920, 1080);

            // Header background
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, 1920, 120);

            // Load logo
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = () => resolve(null); // Continue even if logo fails
                logo.src = '/brand/kwd-gray.png';
                setTimeout(reject, 3000);
            }).catch(() => null);

            if (logo.complete && logo.naturalWidth > 0) {
                ctx.globalAlpha = 0.7;
                ctx.drawImage(logo, 60, 30, 120, 60);
                ctx.globalAlpha = 1.0;
            }

            // Header text
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.fillText(topic.topic_code, 200, 75);

            // Website URL
            ctx.fillStyle = '#666666';
            ctx.font = 'bold 20px Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText('kesararamwithdigital.tech', 1860, 70);

            // Load sign image
            if (topic.primary_image_url) {
                const signImg = new Image();
                signImg.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    signImg.onload = resolve;
                    signImg.onerror = reject;
                    signImg.src = topic.primary_image_url;
                    setTimeout(reject, 5000);
                });

                // Draw sign with border
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 4;
                ctx.strokeRect(60, 180, 400, 400);
                ctx.fillStyle = '#f9fafb';
                ctx.fillRect(64, 184, 392, 392);

                // Center the sign image
                const imgAspect = signImg.width / signImg.height;
                let drawWidth = 360;
                let drawHeight = 360;
                if (imgAspect > 1) {
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawWidth = drawHeight * imgAspect;
                }
                const x = 260 - drawWidth / 2;
                const y = 380 - drawHeight / 2;
                ctx.drawImage(signImg, x, y, drawWidth, drawHeight);
            }

            // Sign name
            const name = isKh ? topic.name_km : topic.name_en;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 56px Arial, sans-serif';
            ctx.textAlign = 'left';
            const nameText = name.length > 30 ? name.substring(0, 30) + '...' : name;
            ctx.fillText(nameText, 520, 250);

            // Description
            const description = isKh ? topic.description_km : topic.description_en;
            if (description) {
                ctx.fillStyle = '#374151';
                ctx.font = '28px Arial, sans-serif';
                const words = description.split(' ');
                let line = '';
                let y = 320;
                for (let word of words) {
                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > 1300 && line !== '') {
                        ctx.fillText(line, 520, y);
                        line = word + ' ';
                        y += 40;
                        if (y > 500) break;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, 520, y);
            }

            // Footer
            ctx.fillStyle = '#e5e7eb';
            ctx.fillRect(0, 960, 1920, 120);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '18px Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Downloaded from kesararamwithdigital.tech', 60, 1020);
            ctx.textAlign = 'right';
            ctx.fillText(new Date().toLocaleDateString(), 1860, 1020);

            // Download
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
