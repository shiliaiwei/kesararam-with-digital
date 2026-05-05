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

// Generate a simple QR code pattern
function generateQRCodeCanvas(url: string, size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (!ctx) return canvas;

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Create a simple QR-like pattern based on URL hash
    const hash = url.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seed = hash % 1000;

    // Draw position detection patterns (3 corners)
    const drawPositionMarker = (x: number, y: number) => {
        // Outer 7x7 black square
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, 7, 7);
        // Inner 5x5 white square
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x + 1, y + 1, 5, 5);
        // Center 3x3 black square
        ctx.fillStyle = '#000000';
        ctx.fillRect(x + 2, y + 2, 3, 3);
    };

    drawPositionMarker(0, 0);
    drawPositionMarker(size - 7, 0);
    drawPositionMarker(0, size - 7);

    // Draw timing patterns (alternating black/white lines)
    ctx.fillStyle = '#000000';
    for (let i = 8; i < size - 8; i += 2) {
        ctx.fillRect(i, 6, 1, 1);
        ctx.fillRect(6, i, 1, 1);
    }

    // Draw data area with pseudo-random pattern based on URL
    ctx.fillStyle = '#000000';
    let random = seed;
    for (let y = 8; y < size - 8; y++) {
        for (let x = 8; x < size - 8; x++) {
            // Skip timing patterns
            if ((x === 6 || y === 6) && (x < size - 8 || y < size - 8)) continue;

            // Pseudo-random based on position and seed
            random = (random * 9301 + 49297) % 233280;
            if ((random / 233280) > 0.5) {
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    // Draw format information area
    ctx.fillStyle = '#000000';
    ctx.fillRect(8, 0, 1, 9);
    ctx.fillRect(0, 8, 9, 1);

    return canvas;
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
            const borderRadius = 10; // 10% radius
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

                // Background card - YELLOW brand color (#ffd700) with rounded corners
                ctx.fillStyle = '#ffd700';
                roundRect(ctx, signAreaX, signAreaY, signAreaSize, signAreaSize, borderRadius);
                ctx.fill();

                // NO BLACK BORDER - removed

                // YELLOW background inside for image (same as outer)
                ctx.fillStyle = '#ffd700';
                roundRect(ctx, signAreaX + 10, signAreaY + 10, signAreaSize - 20, signAreaSize - 20, borderRadius);
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

                // Sign code below image - centered on left side - BLACK color
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 36px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                const signCodeX = signAreaX + signAreaSize / 2;
                ctx.fillText(topic.topic_code, signCodeX, signAreaY + signAreaSize + 60);

                // Tag below code - sub_group category - TEAL background with BLACK text
                ctx.fillStyle = '#25c1a4';
                ctx.font = 'bold 16px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';

                // Draw tag background
                const tagText = topic.sub_group;
                const tagMetrics = ctx.measureText(tagText);
                const tagWidth = tagMetrics.width + 20;
                const tagHeight = 32;
                const tagX = signCodeX - tagWidth / 2;
                const tagY = signAreaY + signAreaSize + 90;

                // Tag background with rounded corners
                ctx.fillStyle = '#25c1a4';
                roundRect(ctx, tagX, tagY, tagWidth, tagHeight, 5);
                ctx.fill();

                // Tag text - BLACK
                ctx.fillStyle = '#000000';
                ctx.font = 'bold 14px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(tagText, signCodeX, tagY + 22);
            }

            // RIGHT SIDE - Title and Description
            const rightStartX = 600;
            const rightStartY = 250;
            const maxRightWidth = 1250;

            // Title (right side) - CAPITALS, Teal color (#25c1a4)
            const titleKh = topic.name_km;
            const titleEn = topic.name_en;
            const titleToUse = isKh ? titleKh : titleEn;

            ctx.fillStyle = '#25c1a4';
            ctx.font = 'bold 48px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';

            // Handle long titles with proper wrapping - UPPERCASE
            const titleWords = titleToUse.toUpperCase().split(' ');
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

            // Description (right side, below title) - BLACK text
            const descriptionKh = topic.description_km;
            const descriptionEn = topic.description_en;
            const descriptionToUse = isKh ? descriptionKh : descriptionEn;

            if (descriptionToUse) {
                ctx.fillStyle = '#000000';
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

            // Horizontal line separator - Using brand color #ff0050
            const hrY = 920;
            ctx.strokeStyle = '#ff0050';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(100, hrY);
            ctx.lineTo(1820, hrY);
            ctx.stroke();

            // Bilingual promotional message - POWERFUL PSYCHOLOGY - Khmer FIRST
            const footerY = 980;
            ctx.fillStyle = '#ff0050';
            ctx.font = 'bold 16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';

            // Updated powerful psychological messages with "Protect your life and loved ones"
            const promoTextKh = 'រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត';
            const promoTextEn = 'Protect your life and loved ones.';
            const promoTextEn2 = 'Learn traffic signs, build safety knowledge for life';

            // Khmer first
            ctx.fillText(promoTextKh, 960, footerY);
            // English - Protect your life and loved ones
            ctx.fillText(promoTextEn, 960, footerY + 30);
            // English - Learn traffic signs
            ctx.fillText(promoTextEn2, 960, footerY + 55);

            // Website link at bottom - Same color as promotional message
            ctx.fillStyle = '#ff0050';
            ctx.font = 'bold 14px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`kesararamwithdigital.tech/learn/${categorySlug}`, 960, footerY + 95);

            // Add QR code in bottom-right corner
            // Generate QR code using the helper function
            const qrUrl = `https://www.kesararamwithdigital.tech/learn/${categorySlug}`;
            const qrCanvas = generateQRCodeCanvas(qrUrl, 120);

            // Draw QR code on main canvas
            const qrX = 1680;
            const qrY = 920;
            ctx.drawImage(qrCanvas, qrX, qrY, 120, 120);

            // Add QR label
            ctx.fillStyle = '#ff0050';
            ctx.font = 'bold 12px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Scan to learn', qrX + 60, qrY + 140);

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
