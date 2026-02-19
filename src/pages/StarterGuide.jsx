import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, BookOpen, Rocket, Code2, AlertTriangle, Wrench, ArrowRight, Sparkles, CheckCircle, X, Monitor, Zap, MessageSquare, Brain, Loader } from 'lucide-react';

const StarterGuide = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const pdfRef = useRef(null);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);
        try {
            const { default: jsPDF } = await import('jspdf');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 20;
            const contentWidth = pageWidth - margin * 2;
            let y = 0;

            const addNewPage = () => {
                pdf.addPage();
                y = margin;
            };

            const checkPageBreak = (neededHeight) => {
                if (y + neededHeight > pageHeight - margin) {
                    addNewPage();
                    return true;
                }
                return false;
            };

            // ===== 표지 =====
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // 보라색 그라데이션 바
            pdf.setFillColor(99, 102, 241);
            pdf.rect(0, 0, pageWidth, 8, 'F');
            pdf.setFillColor(168, 85, 247);
            pdf.rect(0, 8, pageWidth, 3, 'F');

            // 타이틀
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(32);
            pdf.setFont('helvetica', 'bold');
            pdf.text('VIBE CODING', pageWidth / 2, 80, { align: 'center' });

            pdf.setFontSize(24);
            pdf.setTextColor(168, 85, 247);
            pdf.text('STARTER PACK', pageWidth / 2, 95, { align: 'center' });

            pdf.setFontSize(14);
            pdf.setTextColor(148, 163, 184);
            pdf.text('AI Prompt Coding Complete Guide', pageWidth / 2, 115, { align: 'center' });

            // 구분선
            pdf.setDrawColor(99, 102, 241);
            pdf.setLineWidth(0.5);
            pdf.line(60, 125, 150, 125);

            // 부제
            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.text('Korea Coding Vibe Lab', pageWidth / 2, 140, { align: 'center' });

            // 하단 정보
            pdf.setFontSize(9);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Version 1.0  |  ${new Date().getFullYear()}`, pageWidth / 2, 270, { align: 'center' });
            pdf.text('https://korea-coding-vibe-lab.vercel.app', pageWidth / 2, 278, { align: 'center' });

            // ===== 목차 =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            pdf.setFontSize(22);
            pdf.setTextColor(99, 102, 241);
            pdf.setFont('helvetica', 'bold');
            pdf.text('TABLE OF CONTENTS', margin, y + 10);
            y += 25;

            pdf.setDrawColor(99, 102, 241);
            pdf.setLineWidth(0.3);
            pdf.line(margin, y, pageWidth - margin, y);
            y += 15;

            const tocItems = [
                { num: '01', title: 'What is Vibe Coding?', desc: 'AI + Coding = Vibe Coding' },
                { num: '02', title: 'Getting Started', desc: 'Tools, Accounts & Setup' },
                { num: '03', title: 'Prompt Writing Basics', desc: 'Good vs Bad Prompts' },
                { num: '04', title: 'Practical Examples', desc: '5 Real-World Projects' },
                { num: '05', title: 'Common Mistakes', desc: 'Top 5 Beginner Pitfalls' },
                { num: '06', title: 'AI Coding Tools', desc: 'Cursor, Windsurf, Bolt & More' },
                { num: '07', title: 'Next Steps', desc: 'Join Korea Coding Vibe Lab' },
            ];

            tocItems.forEach((item) => {
                pdf.setFontSize(18);
                pdf.setTextColor(168, 85, 247);
                pdf.setFont('helvetica', 'bold');
                pdf.text(item.num, margin, y);

                pdf.setFontSize(13);
                pdf.setTextColor(255, 255, 255);
                pdf.text(item.title, margin + 18, y);

                pdf.setFontSize(9);
                pdf.setTextColor(148, 163, 184);
                pdf.text(item.desc, margin + 18, y + 7);

                y += 22;
            });


            // ===== Section 1: What is Vibe Coding? =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');

            // 섹션 헤더
            pdf.setFillColor(99, 102, 241);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(99, 102, 241);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 01', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('What is Vibe Coding?', margin, 32);

            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s1lines = [
                'Vibe Coding is a new programming paradigm where you describe',
                'what you want to build in natural language, and AI writes the code for you.',
                '',
                'Instead of memorizing syntax and debugging for hours, you simply:',
                '',
                '  1. Describe your idea clearly to AI',
                '  2. Review the generated code',
                '  3. Iterate and refine with more prompts',
                '',
                'Think of it as pair programming with a super-intelligent partner',
                'who never gets tired and knows every programming language.',
                '',
                '',
                'WHO IS THIS FOR?',
                '',
                '  - Complete beginners who want to build real projects',
                '  - Non-technical founders with startup ideas',
                '  - Designers who want to prototype quickly',
                '  - Students learning programming concepts',
                '  - Anyone curious about AI-assisted development',
                '',
                '',
                'WHY VIBE CODING?',
                '',
                '  - No prior coding experience needed',
                '  - Build functional apps in hours, not months',
                '  - Focus on WHAT you want, not HOW to code it',
                '  - Learn programming concepts naturally',
                '  - Join a growing community of vibe coders',
            ];

            s1lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(13);
                    pdf.setTextColor(168, 85, 247);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });


            // ===== Section 2: Getting Started =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(16, 185, 129);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(16, 185, 129);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 02', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Getting Started', margin, 32);
            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s2lines = [
                'ESSENTIAL TOOLS (FREE)',
                '',
                '  1. Cursor (cursor.com)',
                '     - AI-first code editor based on VS Code',
                '     - Free tier includes AI chat and autocomplete',
                '     - Best for: Full project development',
                '',
                '  2. Windsurf (codeium.com/windsurf)',
                '     - Full-featured AI IDE',
                '     - Cascade mode for multi-file editing',
                '     - Best for: Large-scale projects',
                '',
                '  3. Bolt.new (bolt.new)',
                '     - Browser-based, no installation needed',
                '     - Instant preview and deployment',
                '     - Best for: Quick prototypes',
                '',
                '  4. v0 by Vercel (v0.dev)',
                '     - Generate UI components from text',
                '     - React/Next.js focused',
                '     - Best for: Frontend/UI design',
                '',
                '',
                'ACCOUNTS TO CREATE',
                '',
                '  [x] GitHub (github.com) - Code hosting & version control',
                '  [x] Vercel (vercel.com) - Free website deployment',
                '  [x] Supabase (supabase.com) - Free database & auth',
                '  [x] ChatGPT or Claude - For prompt assistance',
                '',
                '',
                'FIRST STEPS',
                '',
                '  Step 1: Install Cursor or open Bolt.new',
                '  Step 2: Create a new project folder',
                '  Step 3: Open AI chat (Ctrl+L in Cursor)',
                '  Step 4: Type your first prompt!',
            ];

            s2lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(13);
                    pdf.setTextColor(16, 185, 129);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });


            // ===== Section 3: Prompt Writing =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(245, 158, 11);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(245, 158, 11);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 03', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Prompt Writing Basics', margin, 32);
            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s3lines = [
                'THE GOLDEN RULES OF PROMPT WRITING',
                '',
                '  Rule 1: Be Specific',
                '    Bad:  "Make a website"',
                '    Good: "Create a personal portfolio website with',
                '          a dark theme, hero section, project gallery,',
                '          and contact form using React"',
                '',
                '  Rule 2: Provide Context',
                '    Bad:  "Add a button"',
                '    Good: "Add a gradient purple submit button at the',
                '          bottom of the form that shows a loading',
                '          spinner when clicked"',
                '',
                '  Rule 3: Break Down Complex Tasks',
                '    Bad:  "Build me a full e-commerce site"',
                '    Good: "Let\'s start with the product listing page.',
                '          Show 12 products in a 3-column grid with',
                '          image, name, price, and add-to-cart button"',
                '',
                '  Rule 4: Mention Technologies',
                '    "Use React, Framer Motion for animations,',
                '     and Supabase for the backend database"',
                '',
                '  Rule 5: Describe Visual Style',
                '    "Dark mode with glassmorphism cards, purple',
                '     accent colors, and subtle hover animations"',
                '',
                '',
                'PROMPT TEMPLATE',
                '',
                '  I want to build [WHAT].',
                '  It should [KEY FEATURES].',
                '  The style should be [VISUAL DESCRIPTION].',
                '  Use [TECHNOLOGIES].',
                '  Start with [FIRST STEP].',
            ];

            s3lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(13);
                    pdf.setTextColor(245, 158, 11);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else if (line.includes('Bad:')) {
                    pdf.setTextColor(239, 68, 68);
                    pdf.text(line, margin, y);
                    pdf.setTextColor(203, 213, 225);
                } else if (line.includes('Good:')) {
                    pdf.setTextColor(34, 197, 94);
                    pdf.text(line, margin, y);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });


            // ===== Section 4: Practical Examples =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(236, 72, 153);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(236, 72, 153);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 04', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Practical Examples', margin, 32);
            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s4lines = [
                'EXAMPLE 1: PERSONAL PORTFOLIO',
                '',
                '  "Build a personal portfolio website with:',
                '  - Hero section with my name and animated typing effect',
                '  - Skills section with progress bars',
                '  - Project gallery with hover effects',
                '  - Contact form with email validation',
                '  Use React, dark theme, purple accents"',
                '',
                '',
                'EXAMPLE 2: TODO APP',
                '',
                '  "Create a modern todo app with:',
                '  - Add, edit, delete tasks',
                '  - Categories with color tags',
                '  - Drag and drop reordering',
                '  - Local storage persistence',
                '  - Smooth animations on add/remove',
                '  Use React with Framer Motion"',
                '',
                '',
                'EXAMPLE 3: WEATHER DASHBOARD',
                '',
                '  "Build a weather dashboard that:',
                '  - Shows current weather for any city',
                '  - Displays 5-day forecast with icons',
                '  - Has animated weather backgrounds',
                '  - Uses OpenWeatherMap API',
                '  - Responsive design for mobile"',
                '',
                '',
                'EXAMPLE 4: MINI GAME',
                '',
                '  "Create a simple snake game with:',
                '  - Arrow key controls',
                '  - Score tracking and high score',
                '  - Speed increases as score goes up',
                '  - Game over screen with restart',
                '  Use HTML Canvas, neon-style graphics"',
            ];

            s4lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(12);
                    pdf.setTextColor(236, 72, 153);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });

            // Example 5 on next page
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(236, 72, 153);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(236, 72, 153);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 04 (CONTINUED)', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Practical Examples', margin, 32);
            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s4blines = [
                'EXAMPLE 5: COMMUNITY CHAT',
                '',
                '  "Build a real-time chat application with:',
                '  - User authentication (sign up / login)',
                '  - Real-time message updates',
                '  - User avatars and online status',
                '  - Message reactions (emoji)',
                '  - Typing indicator',
                '  Use React, Supabase for auth and realtime"',
                '',
                '',
                'TIPS FOR ALL EXAMPLES',
                '',
                '  1. Start simple, then add features one by one',
                '  2. Test each feature before moving to the next',
                '  3. If something breaks, describe the error to AI',
                '  4. Save your work frequently (git commit)',
                '  5. Deploy early so you can share with friends!',
                '',
                '',
                'ITERATING ON YOUR PROJECT',
                '',
                '  After the initial build, try prompts like:',
                '',
                '  "The button animation feels laggy, can you',
                '   optimize it with CSS transforms instead?"',
                '',
                '  "Add a dark/light mode toggle in the header"',
                '',
                '  "Make the layout responsive for mobile screens',
                '   under 768px width"',
                '',
                '  "Add a loading skeleton while data is fetching"',
            ];

            s4blines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(12);
                    pdf.setTextColor(236, 72, 153);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });


            // ===== Section 5: Common Mistakes =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(239, 68, 68);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(239, 68, 68);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 05', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Common Mistakes (TOP 5)', margin, 32);
            y = 45;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s5lines = [
                'MISTAKE 1: TOO VAGUE PROMPTS',
                '',
                '  Problem: "Make it look better"',
                '  Solution: "Change the card background to a gradient',
                '  from #1e293b to #0f172a, add a 1px border with',
                '  20% white opacity, and a subtle box shadow"',
                '',
                '',
                'MISTAKE 2: TRYING TO BUILD EVERYTHING AT ONCE',
                '',
                '  Problem: "Build me a full social media platform',
                '  with posts, comments, likes, stories, DMs..."',
                '  Solution: Break into phases. Start with just posts.',
                '  Get it working, then add comments, then likes, etc.',
                '',
                '',
                'MISTAKE 3: NOT TESTING INCREMENTALLY',
                '',
                '  Problem: Writing 10 prompts without checking if',
                '  the previous changes still work.',
                '  Solution: Test after EVERY prompt. If something',
                '  breaks, fix it before moving on.',
                '',
                '',
                'MISTAKE 4: IGNORING ERROR MESSAGES',
                '',
                '  Problem: "It\'s not working, fix it"',
                '  Solution: Copy the EXACT error message and paste',
                '  it to the AI. Include relevant code context.',
                '  "I get this error: TypeError: Cannot read property',
                '  \'map\' of undefined in ProductList.jsx line 42"',
                '',
                '',
                'MISTAKE 5: NOT USING VERSION CONTROL',
                '',
                '  Problem: Making 50 changes and losing track',
                '  Solution: Use git. Commit after each working feature.',
                '  "git add . && git commit -m \'Add product card UI\'"',
                '  This way you can always go back if things break.',
            ];

            s5lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3 && line.includes('MISTAKE')) {
                    pdf.setFontSize(12);
                    pdf.setTextColor(239, 68, 68);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else if (line.includes('Problem:')) {
                    pdf.setTextColor(239, 68, 68);
                    pdf.text(line, margin, y);
                    pdf.setTextColor(203, 213, 225);
                } else if (line.includes('Solution:')) {
                    pdf.setTextColor(34, 197, 94);
                    pdf.text(line, margin, y);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });


            // ===== Section 6: AI Tools Comparison =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(59, 130, 246);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(59, 130, 246);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 06', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('AI Coding Tools Comparison', margin, 32);
            y = 48;

            // 테이블 헤더
            pdf.setFillColor(30, 41, 59);
            pdf.rect(margin, y - 5, contentWidth, 12, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(148, 163, 184);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Tool', margin + 3, y + 2);
            pdf.text('Type', margin + 40, y + 2);
            pdf.text('Price', margin + 80, y + 2);
            pdf.text('Best For', margin + 110, y + 2);
            y += 14;

            const tools = [
                ['Cursor', 'Desktop IDE', 'Free / $20/mo', 'Full projects'],
                ['Windsurf', 'Desktop IDE', 'Free / $15/mo', 'Large codebases'],
                ['Bolt.new', 'Browser', 'Free / $20/mo', 'Quick prototypes'],
                ['v0 (Vercel)', 'Browser', 'Free / $20/mo', 'UI Components'],
                ['Lovable', 'Browser', 'Free / $20/mo', 'Full-stack apps'],
                ['Replit Agent', 'Browser', 'Free / $25/mo', 'Learning & deploy'],
                ['GitHub Copilot', 'Extension', '$10/mo', 'Code completion'],
                ['Claude (API)', 'Chat', '$20/mo', 'Complex logic'],
                ['ChatGPT', 'Chat', 'Free / $20/mo', 'General coding'],
            ];

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            tools.forEach((tool, i) => {
                if (i % 2 === 0) {
                    pdf.setFillColor(22, 33, 50);
                    pdf.rect(margin, y - 5, contentWidth, 12, 'F');
                }

                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.text(tool[0], margin + 3, y + 2);
                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(203, 213, 225);
                pdf.text(tool[1], margin + 40, y + 2);
                pdf.setTextColor(16, 185, 129);
                pdf.text(tool[2], margin + 80, y + 2);
                pdf.setTextColor(168, 85, 247);
                pdf.text(tool[3], margin + 110, y + 2);
                y += 12;
            });

            y += 15;

            pdf.setFontSize(13);
            pdf.setTextColor(59, 130, 246);
            pdf.setFont('helvetica', 'bold');
            pdf.text('RECOMMENDED FOR BEGINNERS', margin, y);
            y += 12;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const recLines = [
                '  1st Choice: Bolt.new',
                '    -> No setup needed, works in browser',
                '    -> Instant preview, easy deployment',
                '',
                '  2nd Choice: Cursor',
                '    -> More powerful, better for learning',
                '    -> Free tier is generous enough to start',
                '',
                '  For Quick UI: v0.dev',
                '    -> Just describe the UI you want',
                '    -> Copy the generated React components',
            ];

            recLines.forEach(line => {
                pdf.text(line, margin, y);
                y += 7;
            });


            // ===== Section 7: Next Steps =====
            addNewPage();
            pdf.setFillColor(15, 23, 42);
            pdf.rect(0, 0, pageWidth, pageHeight, 'F');
            pdf.setFillColor(139, 92, 246);
            pdf.rect(0, 0, pageWidth, 6, 'F');

            pdf.setFontSize(10);
            pdf.setTextColor(139, 92, 246);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CHAPTER 07', margin, 20);

            pdf.setFontSize(22);
            pdf.setTextColor(255, 255, 255);
            pdf.text('Next Steps', margin, 32);
            y = 50;

            pdf.setFontSize(13);
            pdf.setTextColor(139, 92, 246);
            pdf.setFont('helvetica', 'bold');
            pdf.text('JOIN KOREA CODING VIBE LAB', margin, y);
            y += 12;

            pdf.setFontSize(11);
            pdf.setTextColor(203, 213, 225);
            pdf.setFont('helvetica', 'normal');

            const s7lines = [
                'Korea Coding Vibe Lab is your home for:',
                '',
                '  Daily Check-ins & Streaks',
                '    Build consistency with daily attendance rewards',
                '',
                '  AI Study Partner',
                '    Practice with AI-guided coding exercises',
                '',
                '  Battle Arena',
                '    Compete with others in real-time coding battles',
                '',
                '  Quests & Achievements',
                '    Complete missions to earn points and badges',
                '',
                '  Mentor System',
                '    Get help from experienced developers',
                '',
                '  Vibe Shop & Season Pass',
                '    Earn and spend points on exclusive items',
                '',
                '  Study Groups',
                '    Join or create groups to learn together',
                '',
                '',
                'YOUR 7-DAY CHALLENGE',
                '',
                '  Day 1: Sign up & complete your first check-in',
                '  Day 2: Build a simple landing page with AI',
                '  Day 3: Add interactivity (buttons, forms)',
                '  Day 4: Connect a database (Supabase)',
                '  Day 5: Deploy your first project online',
                '  Day 6: Join a study group',
                '  Day 7: Share your project in the community!',
                '',
                '',
                'Remember: Everyone starts as a beginner.',
                'The key is to start small, stay consistent,',
                'and enjoy the process. Happy vibe coding!',
            ];

            s7lines.forEach(line => {
                if (line === line.toUpperCase() && line.trim().length > 3) {
                    pdf.setFontSize(13);
                    pdf.setTextColor(139, 92, 246);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(line, margin, y);
                    pdf.setFont('helvetica', 'normal');
                    pdf.setFontSize(11);
                    pdf.setTextColor(203, 213, 225);
                } else {
                    pdf.text(line, margin, y);
                }
                y += 7;
            });

            // 하단 바
            pdf.setFillColor(99, 102, 241);
            pdf.rect(0, pageHeight - 6, pageWidth, 6, 'F');

            // 저장
            pdf.save('Vibe_Coding_Starter_Pack_Guide.pdf');

        } catch (error) {
            console.error('PDF generation error:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const sections = [
        {
            num: '01',
            title: '바이브코딩이란?',
            subtitle: 'AI와 대화하며 코딩하는 새로운 방식',
            icon: <Sparkles size={24} />,
            color: '#6366f1',
            content: [
                '코드를 모르는 사람도 AI에게 "이런 걸 만들어줘"라고 말하면 실제 작동하는 프로그램이 완성됩니다.',
                'AI가 코드를 작성하고, 당신은 아이디어와 방향을 제시하는 것이 바이브코딩의 핵심입니다.',
                '프로그래밍 언어를 외울 필요 없이, 자연어로 소통하며 원하는 결과물을 만들어보세요!'
            ]
        },
        {
            num: '02',
            title: '시작 전 준비물',
            subtitle: '도구, 계정, 환경 설정',
            icon: <Wrench size={24} />,
            color: '#10b981',
            content: [
                'Cursor, Windsurf, Bolt.new 중 하나만 있으면 시작 가능!',
                'GitHub 계정으로 코드를 저장하고, Vercel로 무료 배포하세요.',
                'Supabase를 연결하면 데이터베이스와 인증까지 무료로 추가됩니다.'
            ]
        },
        {
            num: '03',
            title: '프롬프트 작성 기초',
            subtitle: '좋은 프롬프트 vs 나쁜 프롬프트',
            icon: <MessageSquare size={24} />,
            color: '#f59e0b',
            content: [
                '❌ "웹사이트 만들어줘" → ⭕ "다크모드 포트폴리오 사이트를 React로 만들어줘"',
                '❌ "버튼 추가" → ⭕ "보라색 그라디언트 제출 버튼을 폼 하단에 추가해줘"',
                '구체적일수록, 기술 스택을 명시할수록 AI가 정확한 결과를 줍니다.'
            ]
        },
        {
            num: '04',
            title: '실전 예제 5가지',
            subtitle: '바로 따라할 수 있는 프로젝트',
            icon: <Code2 size={24} />,
            color: '#ec4899',
            content: [
                '포트폴리오 사이트, 투두 앱, 날씨 대시보드, 미니 게임, 채팅 앱',
                '각 예제마다 바로 복사해서 쓸 수 있는 프롬프트 템플릿이 포함되어 있습니다.',
                'PDF에서 더 자세한 프롬프트 예시를 확인하세요!'
            ]
        },
        {
            num: '05',
            title: '초보자 흔한 실수 TOP 5',
            subtitle: '이것만 피하면 절반은 성공',
            icon: <AlertTriangle size={24} />,
            color: '#ef4444',
            content: [
                '너무 애매하게 말하기 / 한번에 다 만들려고 하기',
                '테스트 안 하고 계속 기능 추가 / 에러 메시지 무시',
                '버전 관리(Git) 안 하기 — 이 5가지만 피해도 성장 속도가 2배!'
            ]
        },
        {
            num: '06',
            title: '추천 AI 코딩 도구',
            subtitle: 'Cursor, Windsurf, Bolt 등 비교',
            icon: <Monitor size={24} />,
            color: '#3b82f6',
            content: [
                '초보자 추천 1순위: Bolt.new (설치 없이 브라우저에서 바로 사용)',
                '본격적으로 배울 때: Cursor (무료 티어로도 충분)',
                'UI 디자인만: v0.dev (텍스트로 컴포넌트 생성)'
            ]
        },
        {
            num: '07',
            title: '다음 단계',
            subtitle: 'Korea Coding Vibe Lab 활용하기',
            icon: <Rocket size={24} />,
            color: '#8b5cf6',
            content: [
                '출석 체크인으로 꾸준함 기르기, AI 스터디로 실력 올리기',
                '배틀 아레나에서 경쟁하고, 퀘스트로 포인트 모으기',
                '7일 챌린지: 가입 → 랜딩페이지 → DB 연결 → 배포 → 커뮤니티 공유!'
            ]
        }
    ];

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', paddingBottom: '100px' }}>
            {/* 헤더 */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '50px' }}
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                    style={{
                        width: '80px', height: '80px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        borderRadius: '24px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                        boxShadow: '0 0 40px rgba(99, 102, 241, 0.4)',
                    }}
                >
                    <BookOpen size={40} color="white" />
                </motion.div>

                <h1 style={{
                    fontSize: '2.8rem', fontWeight: '900',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    marginBottom: '12px', lineHeight: '1.2'
                }}>
                    바이브코딩 스타터 팩
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.15rem', marginBottom: '32px', lineHeight: '1.6' }}>
                    AI 프롬프트 코딩 초보자를 위한 완벽 가이드 📚
                </p>

                {/* 다운로드 버튼 */}
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99, 102, 241, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    style={{
                        padding: '18px 40px',
                        background: isGenerating
                            ? 'rgba(99, 102, 241, 0.3)'
                            : 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '1.1rem',
                        fontWeight: '800',
                        cursor: isGenerating ? 'wait' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s',
                    }}
                >
                    {isGenerating ? (
                        <>
                            <Loader size={22} style={{ animation: 'spin 1s linear infinite' }} />
                            PDF 생성 중...
                        </>
                    ) : (
                        <>
                            <Download size={22} />
                            📥 PDF 다운로드 (무료)
                        </>
                    )}
                </motion.button>

                <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '12px' }}>
                    10페이지 · 영문 콘텐츠 · A4 사이즈
                </p>
            </motion.div>

            {/* 콘텐츠 미리보기 카드 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '20px',
                marginBottom: '60px',
            }}>
                {sections.map((section, idx) => (
                    <motion.div
                        key={section.num}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => setActiveSection(activeSection === idx ? null : idx)}
                        style={{
                            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.4))',
                            backdropFilter: 'blur(10px)',
                            border: activeSection === idx
                                ? `2px solid ${section.color}`
                                : '1px solid rgba(255, 255, 255, 0.08)',
                            borderRadius: '20px',
                            padding: '24px',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* 배경 글로우 */}
                        <div style={{
                            position: 'absolute',
                            top: '-20px',
                            right: '-20px',
                            width: '100px',
                            height: '100px',
                            background: `radial-gradient(circle, ${section.color}15, transparent 70%)`,
                            borderRadius: '50%',
                        }} />

                        {/* 헤더 */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                borderRadius: '14px',
                                background: `${section.color}15`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: section.color,
                                border: `1px solid ${section.color}30`,
                                flexShrink: 0,
                            }}>
                                {section.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '0.7rem', fontWeight: '800',
                                    color: section.color,
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    marginBottom: '4px',
                                }}>
                                    Chapter {section.num}
                                </div>
                                <h3 style={{
                                    fontSize: '1.1rem', fontWeight: '800',
                                    color: '#fff', margin: 0,
                                }}>
                                    {section.title}
                                </h3>
                            </div>
                        </div>

                        <p style={{
                            color: '#94a3b8', fontSize: '0.9rem',
                            margin: '0 0 12px 0', lineHeight: '1.5',
                        }}>
                            {section.subtitle}
                        </p>

                        {/* 펼치기 내용 */}
                        {activeSection === idx && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{
                                    borderTop: '1px solid rgba(255,255,255,0.1)',
                                    paddingTop: '14px',
                                    marginTop: '6px',
                                }}
                            >
                                {section.content.map((text, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            display: 'flex', alignItems: 'flex-start',
                                            gap: '10px', marginBottom: '10px',
                                        }}
                                    >
                                        <CheckCircle size={16} color={section.color} style={{ marginTop: '3px', flexShrink: 0 }} />
                                        <span style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: '1.5' }}>
                                            {text}
                                        </span>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* 더보기 힌트 */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: section.color, fontSize: '0.8rem', fontWeight: '600',
                        }}>
                            {activeSection === idx ? (
                                <>접기 <X size={14} /></>
                            ) : (
                                <>미리보기 <ArrowRight size={14} /></>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 하단 CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{
                    textAlign: 'center',
                    padding: '48px 32px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))',
                    borderRadius: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                }}
            >
                <h2 style={{
                    fontSize: '1.8rem', fontWeight: '900', color: '#fff',
                    marginBottom: '12px',
                }}>
                    지금 바로 시작하세요! 🚀
                </h2>
                <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '28px', lineHeight: '1.6' }}>
                    PDF를 다운로드하고, 첫 번째 프로젝트를 만들어보세요.<br />
                    모든 대가는 초보자였습니다. 중요한 건 시작하는 것!
                </p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    style={{
                        padding: '16px 36px',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        border: 'none',
                        borderRadius: '14px',
                        color: '#fff',
                        fontSize: '1.05rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '10px',
                    }}
                >
                    <Download size={20} />
                    PDF 다운로드
                </motion.button>
            </motion.div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default StarterGuide;
