"use client";

import { useState } from "react";
import { Download } from "lucide-react";

// Helper function to draw rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

            // Dark GitHub background color (#0d1117)
            ctx.fillStyle = '#0d1117';
            ctx.fillRect(0, 0, 1920, 1080);

            // Add subtle grid pattern for visual interest
            ctx.strokeStyle = 'rgba(48, 54, 61, 0.3)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 1920; i += 60) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, 1080);
                ctx.stroke();
            }
            for (let i = 0; i < 1080; i += 60) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(1920, i);
                ctx.stroke();
            }

            // Load KWD logo for top-left corner
            const logo = new Image();
            logo.crossOrigin = 'anonymous';

            await new Promise<void>((resolve) => {
                logo.onload = () => resolve();
                logo.onerror = () => resolve();
                logo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(), 2000);
            });

            // Draw KWD logo at top-left (smaller, 120x120)
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 40, 20, 120, 120);
            }

            // Map sub_group to category URL slug
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

            // PSYCHOLOGICAL EYE-TRACKING DESIGN
            // Primary focus: Sign image (LEFT, LARGE, PROMINENT)
            // Secondary focus: Title (RIGHT, LARGE, TEAL)
            // Tertiary focus: Description (RIGHT, MEDIUM)

            const signAreaSize = 500;
            const signAreaX = 100;
            const signAreaY = 200;
            const borderRadius = 15;

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

                // Draw subtle glow effect around image (eye-catching)
                ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
                roundRect(ctx, signAreaX - 10, signAreaY - 10, signAreaSize + 20, signAreaSize + 20, borderRadius + 5);
                ctx.fill();

                // Background card - YELLOW brand color (#ffd700) with rounded corners
                ctx.fillStyle = '#ffd700';
                roundRect(ctx, signAreaX, signAreaY, signAreaSize, signAreaSize, borderRadius);
                ctx.fill();

                // YELLOW background inside for image
                ctx.fillStyle = '#ffd700';
                roundRect(ctx, signAreaX + 15, signAreaY + 15, signAreaSize - 30, signAreaSize - 30, borderRadius);
                ctx.fill();

                // Center the sign image
                if (signImg.complete && signImg.naturalWidth > 0) {
                    const imgAspect = signImg.width / signImg.height;
                    let drawWidth = signAreaSize - 30;
                    let drawHeight = signAreaSize - 30;

                    if (imgAspect > 1) {
                        drawHeight = drawWidth / imgAspect;
                    } else {
                        drawWidth = drawHeight * imgAspect;
                    }

                    const x = signAreaX + 15 + (signAreaSize - 30 - drawWidth) / 2;
                    const y = signAreaY + 15 + (signAreaSize - 30 - drawHeight) / 2;
                    ctx.drawImage(signImg, x, y, drawWidth, drawHeight);
                }

                // Sign code below image - centered on left side - VIBRANT RED
                ctx.fillStyle = '#ff0050';
                ctx.font = 'bold 40px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                const signCodeX = signAreaX + signAreaSize / 2;
                ctx.fillText(topic.topic_code, signCodeX, signAreaY + signAreaSize + 70);

                // Tag below code - sub_group category - TEAL background with BLACK text
                ctx.fillStyle = '#25c1a4';
                ctx.font = 'bold 16px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';

                const tagText = topic.sub_group;
                const tagMetrics = ctx.measureText(tagText);
                const tagWidth = tagMetrics.width + 24;
                const tagHeight = 36;
                const tagX = signCodeX - tagWidth / 2;
                const tagY = signAreaY + signAreaSize + 100;

                // Tag background with rounded corners
                ctx.fillStyle = '#25c1a4';
                roundRect(ctx, tagX, tagY, tagWidth, tagHeight, 6);
                ctx.fill();

                // Tag text - BLACK
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 14px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(tagText, signCodeX, tagY + 24);
            }

            // RIGHT SIDE - Title and Description (SECONDARY FOCUS)
            const rightStartX = 700;
            const rightStartY = 220;
            const maxRightWidth = 1150;

            // Title (right side) - CAPITALS, Teal color (#25c1a4), VERY LARGE
            const titleKh = topic.name_km;
            const titleEn = topic.name_en;
            const titleToUse = isKh ? titleKh : titleEn;

            ctx.fillStyle = '#25c1a4';
            ctx.font = 'bold 64px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';

            // Handle long titles with proper wrapping - UPPERCASE
            const titleWords = titleToUse.toUpperCase().split(' ');
            let titleLine = '';
            let titleLineY = rightStartY;
            const titleLineHeight = 80;

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

            // Description (right side, below title) - WHITE text for contrast on dark background
            const descriptionKh = topic.description_km;
            const descriptionEn = topic.description_en;
            const descriptionToUse = isKh ? descriptionKh : descriptionEn;

            if (descriptionToUse) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 26px system-ui, Arial, sans-serif';
                ctx.textAlign = 'left';

                // Word wrap description
                const words = descriptionToUse.split(' ');
                let line = '';
                let y = titleLineY + 90;
                const maxWidth = maxRightWidth;
                const lineHeight = 40;
                let lineCount = 0;
                const maxLines = 6;

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

            // Horizontal line separator - Vibrant Red
            const hrY = 900;
            ctx.strokeStyle = '#ff0050';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(100, hrY);
            ctx.lineTo(1820, hrY);
            ctx.stroke();

            // Footer section with beautiful styling
            const footerStartY = 920;

            // Add subtle background for quote section
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(80, footerStartY - 15, 1760, 95);

            // Bilingual promotional message - WHITE text with 70% opacity
            ctx.textAlign = 'center';

            // Khmer text - larger and bold - WHITE 70%
            ctx.font = 'bold 22px system-ui, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const promoTextKh = 'រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត';
            ctx.fillText(promoTextKh, 960, footerStartY);

            // English text - slightly smaller - WHITE 70%
            ctx.font = 'bold 18px system-ui, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const promoTextEn = 'Protect your life and loved ones.';
            const promoTextEn2 = 'Learn traffic signs, build safety knowledge for life';
            ctx.fillText(promoTextEn, 960, footerStartY + 32);
            ctx.fillText(promoTextEn2, 960, footerStartY + 58);

            // Copyright section with KWD logo - bottom left
            const copyrightY = 1010;

            // Draw KWD logo small version for copyright (50x50)
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 80, copyrightY - 25, 50, 50);
            }

            // Copyright text - WHITE
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('© 2024 KWD. All rights reserved.', 150, copyrightY + 8);

            // Website link at bottom right - WHITE
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px system-ui, Arial, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`kesararamwithdigital.tech/learn/${categorySlug}`, 1820, copyrightY + 8);

            // Add QR code in bottom-right corner - USE LOCAL FILE
            const qrCodeImg = new Image();
            qrCodeImg.crossOrigin = 'anonymous';

            await new Promise<void>((resolve) => {
                qrCodeImg.onload = () => resolve();
                qrCodeImg.onerror = () => resolve();
                qrCodeImg.src = '/brand/qrcode-kwd.png';
                setTimeout(() => resolve(), 2000);
            });

            const qrX = 1650;
            const qrY = 900;
            const qrSize = 120;

            if (qrCodeImg.complete && qrCodeImg.naturalWidth > 0) {
                ctx.drawImage(qrCodeImg, qrX, qrY, qrSize, qrSize);
            }

            // Add QR label - WHITE
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 12px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan to learn', qrX + 60, qrY + 140);

            // Download with branded filename
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
