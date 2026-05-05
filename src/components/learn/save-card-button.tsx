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

            // Premium white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 1920, 1080);

            // Add subtle grid pattern for premium look
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 1920; i += 40) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 1080);
                ctx.stroke();
            }
            for (let i = 0; i < 1080; i += 40) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(1920, i);
                ctx.stroke();
            }

            // Load KWD logo for top-left corner (BIGGER)
            const logo = new Image();
            logo.crossOrigin = 'anonymous';

            await new Promise<void>((resolve) => {
                logo.onload = () => resolve();
                logo.onerror = () => resolve();
                logo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(), 2000);
            });

            // Draw KWD logo at top-left (BIGGER - 160x160)
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 40, 20, 160, 160);
            }

            // Map sub_group to category URL slug (all 8 categories)
            const getCategorySlug = (subGroup: string): string => {
                const categoryMap: Record<string, string> = {
                    'Prohibitory Signs': 'road-sign',
                    'Mandatory Signs': 'road-sign',
                    'Priority Signs': 'road-sign',
                    'Warning Signs': 'road-sign',
                    'Temporary Signs': 'road-sign',
                    'Direction Signs': 'road-sign',
                    'Buildup Area Boundary Signs': 'road-sign',
                    'Street Name Signs': 'road-sign',
                    'Informative Signs': 'road-sign',
                    'Supplementary Signs': 'road-sign',
                    'Sign Posts': 'road-sign',
                    'Transverse Markings': 'road-sign',
                    'Longitudinal Markings': 'road-sign',
                    'Arrows Markings': 'road-sign',
                    'Other Road Markings': 'road-sign',
                    'Traffic Lights': 'road-sign',
                    'Traffic Police Signals': 'road-sign',
                    'Traffic Rules': 'road-traffic',
                    'Speed Limits': 'road-traffic',
                    'Parking': 'road-traffic',
                    'Overtaking': 'road-traffic',
                    'Intersections': 'priority',
                    'Roundabouts': 'priority',
                    'Pedestrian Crossings': 'priority',
                    'Basic Maneuvers': 'driving',
                    'Advanced Techniques': 'driving',
                    'Defensive Driving': 'driving',
                    'Engine': 'technical',
                    'Brakes': 'technical',
                    'Lights': 'technical',
                    'Safety Systems': 'technical',
                    'Weight Limits': 'loading-people-goods',
                    'Passenger Safety': 'loading-people-goods',
                    'Cargo Securing': 'loading-people-goods',
                    'Road Safety': 'general-knowledge',
                    'Environmental': 'general-knowledge',
                    'Legal': 'general-knowledge',
                    'Accidents': 'emergency',
                    'Breakdowns': 'emergency',
                    'First Aid': 'emergency',
                    'Emergency Contacts': 'emergency',
                };
                return categoryMap[subGroup] || 'road-sign';
            };

            const categorySlug = getCategorySlug(topic.sub_group);

            // SPLIT LAYOUT - Sign image on LEFT, Title/Description on RIGHT
            const contentStartY = 220;
            const signAreaSize = 380;
            const borderRadius = 3; // 3% radius
            const shadowOffset = 8;

            // LEFT SIDE - Sign image centered vertically
            const signAreaX = 100;
            const signAreaY = contentStartY;

            // Load and draw sign image with rounded corners
            if (topic.primary_image_url) {
                const signImg = new Image();
                signImg.crossOrigin = 'anonymous';

                await new Promise<void>((resolve) => {
                    signImg.onload = () => resolve();
                    signImg.onerror = () => resolve();
                    signImg.src = topic.primary_image_url;
                    setTimeout(() => resolve(), 3000);
                });

                // Drop shadow effect (dark)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(signAreaX + shadowOffset, signAreaY + shadowOffset, signAreaSize, signAreaSize);

                // Background card - Dark color (#322e2b) with rounded corners
                ctx.fillStyle = '#322e2b';
                this.roundRect(ctx, signAreaX, signAreaY, signAreaSize, signAreaSize, borderRadius);
                ctx.fill();

                // White background inside for image
                ctx.fillStyle = '#ffffff';
                this.roundRect(ctx, signAreaX + 10, signAreaY + 10, signAreaSize - 20, signAreaSize - 20, borderRadius);
                ctx.fill();

                // Center the sign image
                if (signImg.complete && signImg.naturalWidth > 0) {
                    const imgAspect = signImg.width / signImg.height;
                    let drawWidth = signAreaSize - 20;
                    let drawHeight = signAreaSize - 20;

                    if (imgAspect > 1) {
                        drawHeight = drawWidth / imgAspect;
                    } else {
                        drawWidth = drawHeight * imgAspect;
                    }

                    const x = signAreaX + 10 + (signAreaSize - 20 - drawWidth) / 2;
                    const y = signAreaY + 10 + (signAreaSize - 20 - drawHeight) / 2;
                    ctx.drawImage(signImg, x, y, drawWidth, drawHeight);
                }

                // Sign code below image - centered on left side
                ctx.fillStyle = '#25c1a4';
                ctx.font = 'bold 36px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                const signCodeX = signAreaX + signAreaSize / 2;
                ctx.fillText(topic.topic_code, signCodeX, signAreaY + signAreaSize + 60);
            }

            // RIGHT SIDE - Title and Description
            const rightStartX = 600;
            const rightStartY = 250;
            const maxRightWidth = 1250;

            // Title (right side) - Khmer first if available, then English
            const titleKh = topic.name_km;
            const titleEn = topic.name_en;
            const titleToUse = isKh ? titleKh : titleEn;

            ctx.fillStyle = '#25c1a4';
            ctx.font = 'bold 48px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';

            // Handle long titles with proper wrapping
            const titleWords = titleToUse.split(' ');
            let titleLine = '';
            let titleLineY = rightStartY;
            const titleLineHeight = 60;

            for (let word of titleWords) {
                const testLine = titleLine + word + ' ';
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxRightWidth && titleLine !== '') {
                    ctx.fillText(titleLine.trim(), rightStartX, titleLineY);
                    titleLine = word + ' ';
                    titleLineY += titleLineHeight;
                } else {
                    titleLine = testLine;
                }
            }
            if (titleLine.trim()) {
                ctx.fillText(titleLine.trim(), rightStartX, titleLineY);
            }

            // Description (right side, below title) - WHITE text
            const descriptionKh = topic.description_km;
            const descriptionEn = topic.description_en;
            const descriptionToUse = isKh ? descriptionKh : descriptionEn;

            if (descriptionToUse) {
                ctx.fillStyle = '#ffffff';
                ctx.font = '24px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';

                // Word wrap description
                const words = descriptionToUse.split(' ');
                let line = '';
                let y = titleLineY + 70;
                const maxWidth = maxRightWidth;
                const lineHeight = 38;
                let lineCount = 0;
                const maxLines = 8;

                for (let word of words) {
                    if (lineCount >= maxLines) break;

                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && line !== '') {
                        ctx.fillText(line.trim(), rightStartX, y);
                        line = word + ' ';
                        y += lineHeight;
                        lineCount++;
                    } else {
                        line = testLine;
                    }
                }

                if (lineCount < maxLines && line.trim()) {
                    ctx.fillText(line.trim(), rightStartX, y);
                }
            }

            // Horizontal line separator - Tint lighter variation of #25c1a4
            const hrY = 920;
            ctx.strokeStyle = '#5dd9c1'; // Lighter tint of #25c1a4
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(100, hrY);
            ctx.lineTo(1820, hrY);
            ctx.stroke();

            // Bilingual promotional message - Khmer FIRST
            const footerY = 980;
            ctx.fillStyle = '#25c1a4';
            ctx.font = 'bold 16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';

            const promoTextKh = 'រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត';
            const promoTextEn = 'Learn traffic signs, build safety knowledge for life';

            // Khmer first
            ctx.fillText(promoTextKh, 960, footerY);
            // English second
            ctx.fillText(promoTextEn, 960, footerY + 30);

            // Website link at bottom - Lighter tint
            ctx.fillStyle = '#5dd9c1';
            ctx.font = 'bold 14px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`kesararamwithdigital.tech/learn/${categorySlug}`, 960, footerY + 65);

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

    // Helper function to draw rounded rectangles
    private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

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
