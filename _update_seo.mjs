import fs from 'fs';
import path from 'path';

// Define the optimized metadata for each path.
// Titles: < 60 chars (Remember "| KWD" adds 6 chars, so aim for ~50)
// Desc:   < 160 chars
const seoData = {
  'general-knowledge': {
    title: 'Cambodia Driving Knowledge & Rules Test',
    desc: 'Master Cambodian general driving knowledge. Essential road safety strategies, rules, and reference materials for passing your theory test.',
  },
  'technical': {
    title: 'Vehicle Technical Driving Guide Cambodia',
    desc: 'Pass your Cambodia license test by understanding vehicle mechanics, engine safety, and technical driving requirements for cars and motorcycles.',
  },
  'road-traffic': {
    title: 'Cambodia Road Traffic Laws & Regulations',
    desc: 'Complete guide to Cambodian road traffic laws, speed limits, right-of-way, and legal driving regulations to pass your official theory exam.',
  },
  'road-sign': {
    title: 'Traffic Signs Test Cambodia | Road Signs',
    desc: 'Practice Cambodian traffic signs and road markings. Master warning, regulatory, and information signs for your driving license theory exam.',
  },
  'priority': {
    title: 'Right-of-Way Priority Rules Cambodia',
    desc: 'Understand intersection priority and right-of-way rules in Cambodia. Vital practice questions for passing your official driving theory test.',
  },
  'loading-people-goods': {
    title: 'Vehicle Loading Laws in Cambodia',
    desc: 'Learn the legal requirements for loading passengers and transporting goods safely on Cambodian roads. Essential for commercial and private drivers.',
  },
  'emergency': {
    title: 'Driving Emergency Response Cambodia',
    desc: 'Learn vital emergency response patterns, accident protocols, and vehicle breakdown procedures for safe driving on Cambodian roads.',
  },
  'driving': {
    title: 'Practical Driving Tips & Theory Cambodia',
    desc: 'Expert practical driving theory and techniques for navigating Cambodian roads safely. Improve your skills and pass the licensing exam easily.',
  }
};

const publicDir = path.join(process.cwd(), 'src/app/(public)');

for (const [folder, data] of Object.entries(seoData)) {
  const filePath = path.join(publicDir, folder, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Regex to match the export const metadata = { ... }; block
    const metadataRegex = /export const metadata: Metadata = {[\s\S]*?};/;
    
    const newMetadata = `export const metadata: Metadata = {
  title: "${data.title}",
  description: "${data.desc}",
};`;

    if (metadataRegex.test(content)) {
      content = content.replace(metadataRegex, newMetadata);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated: ${folder}`);
    } else {
      console.log(`No metadata block found in: ${folder}`);
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
