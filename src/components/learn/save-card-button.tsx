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

            // Load KWD logo for top-left corner
            const logo = new Image();
            logo.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                logo.onload = resolve;
                logo.onerror = () => resolve(null);
                logo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(null), 3000);
            }).catch(() => null);

            // Draw KWD logo at top-left (bigger size - 120x120)
            if (logo.complete && logo.naturalWidth > 0) {
                ctx.drawImage(logo, 40, 30, 120, 120);
            }

            // KWD Logo link text below logo
            ctx.fillStyle = '#06b6d4';
            ctx.font = 'bold 16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('kesararamwithdigital.tech/learn/road-signs', 40, 175);

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

            // CENTERED POSTER LAYOUT
            const centerX = 960; // Canvas center
            const contentStartY = 220;

            // Load and draw sign image with neo-brutalism style
            if (topic.primary_image_url) {
                const signImg = new Image();
                signImg.crossOrigin = 'anonymous';
                await new Promise((resolve, reject) => {
                    signImg.onload = resolve;
                    signImg.onerror = reject;
                    signImg.src = topic.primary_image_url;
                    setTimeout(reject, 5000);
                });

                // Neo-brutalism card frame with KWD brand colors
                const signAreaSize = 380;
                const borderWidth = 20;
                const shadowOffset = 8;

                // Calculate centered position
                const signAreaX = centerX - (signAreaSize + borderWidth * 2) / 2;
                const signAreaY = contentStartY;

                // Drop shadow effect (dark)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(signAreaX + shadowOffset, signAreaY + shadowOffset, signAreaSize + (borderWidth * 2), signAreaSize + (borderWidth * 2));

                // Outer border - KWD Cyan (neo-brutalism style)
                ctx.fillStyle = '#06b6d4';
                ctx.fillRect(signAreaX, signAreaY, signAreaSize + (borderWidth * 2), signAreaSize + (borderWidth * 2));

                // Inner border - KWD Blue accent
                ctx.fillStyle = '#3b82f6';
                ctx.fillRect(signAreaX + 4, signAreaY + 4, signAreaSize + (borderWidth * 2) - 8, signAreaSize + (borderWidth * 2) - 8);

                // White background inside border
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(signAreaX + borderWidth, signAreaY + borderWidth, signAreaSize, signAreaSize);

                // Center the sign image
                const imgAspect = signImg.width / signImg.height;
                let drawWidth = signAreaSize;
                let drawHeight = signAreaSize;

                if (imgAspect > 1) {
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawWidth = drawHeight * imgAspect;
                }

                const x = signAreaX + borderWidth + (signAreaSize - drawWidth) / 2;
                const y = signAreaY + borderWidth + (signAreaSize - drawHeight) / 2;
                ctx.drawImage(signImg, x, y, drawWidth, drawHeight);

                // Sign code below image - centered
                ctx.fillStyle = '#06b6d4';
                ctx.font = 'bold 36px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(topic.topic_code, centerX, signAreaY + signAreaSize + borderWidth * 2 + 60);
            }

            // Title (centered below sign code)
            const name = isKh ? topic.name_km : topic.name_en;
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 48px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';

            const titleY = contentStartY + signAreaSize + borderWidth * 2 + 120;

            // Handle long titles with proper wrapping - centered
            const titleWords = name.split(' ');
            let titleLine = '';
            let titleLineY = titleY;
            const titleLineHeight = 60;
            const maxTitleWidth = 1400;

            for (let word of titleWords) {
                const testLine = titleLine + word + ' ';
                const metrics = ctx.measureText(testLine);

                if (metrics.width > maxTitleWidth && titleLine !== '') {
                    ctx.fillText(titleLine.trim(), centerX, titleLineY);
                    titleLine = word + ' ';
                    titleLineY += titleLineHeight;
                } else {
                    titleLine = testLine;
                }
            }
            if (titleLine.trim()) {
                ctx.fillText(titleLine.trim(), centerX, titleLineY);
            }

            // Description (centered below title)
            const description = isKh ? topic.description_km : topic.description_en;
            if (description) {
                ctx.fillStyle = '#374151';
                ctx.font = '24px system-ui, Arial, sans-serif';
                ctx.textAlign = 'center';

                // Word wrap description - centered
                const words = description.split(' ');
                let line = '';
                let y = titleLineY + 70;
                const maxWidth = 1400;
                const lineHeight = 38;
                let lineCount = 0;
                const maxLines = 6;

                for (let word of words) {
                    if (lineCount >= maxLines) break;

                    const testLine = line + word + ' ';
                    const metrics = ctx.measureText(testLine);

                    if (metrics.width > maxWidth && line !== '') {
                        ctx.fillText(line.trim(), centerX, y);
                        line = word + ' ';
                        y += lineHeight;
                        lineCount++;
                    } else {
                        line = testLine;
                    }
                }

                if (lineCount < maxLines && line.trim()) {
                    ctx.fillText(line.trim(), centerX, y);
                }
            }

            // Horizontal line separator (neo-brutalism style)
            const hrY = 920;
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(100, hrY);
            ctx.lineTo(1820, hrY);
            ctx.stroke();

            // Bilingual promotional message
            const footerY = 980;
            ctx.fillStyle = '#f97316';
            ctx.font = 'bold 16px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';

            const promoTextEn = 'Learn traffic signs, build safety knowledge for life';
            const promoTextKh = 'រៀនសញ្ញាចរាចរណ៍ បង្កើតចំណេះដឹងសុវត្ថិភាពពេញមួយជីវិត';

            ctx.fillText(promoTextEn, centerX, footerY);
            ctx.fillText(promoTextKh, centerX, footerY + 30);

            // Website link at bottom
            ctx.fillStyle = '#3b82f6';
            ctx.font = 'bold 14px system-ui, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`kesararamwithdigital.tech/learn/${categorySlug}`, centerX, footerY + 65);

            // Add small KWD logo in bottom-right corner as watermark
            const smallLogo = new Image();
            smallLogo.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                smallLogo.onload = resolve;
                smallLogo.onerror = () => resolve(null);
                smallLogo.src = 'https://res.cloudinary.com/dpgivqzrl/image/upload/v1775283913/kwd-black-nobg_zicjml.svg';
                setTimeout(() => resolve(null), 3000);
            }).catch(() => null);

            // Draw small logo in bottom-right corner (60x60 size)
            if (smallLogo.complete && smallLogo.naturalWidth > 0) {
                const logoSize = 60;
                const logoPadding = 20;
                ctx.drawImage(smallLogo, 1920 - logoSize - logoPadding, 1080 - logoSize - logoPadding, logoSize, logoSize);
            }

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
