const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Content = require('./models/contentModel');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedData = async () => {
    try {
        // 1. FAQ (from Events in index.json)
        const faqContent = {
            page: 'faq',
            sections: [
                { key: 'faq_1', content: JSON.stringify({ question: 'Do you offer online classes?', answer: 'Yes, we provide comprehensive online classes suitable for all participants, featuring live sessions and interactive learning materials.' }) },
                { key: 'faq_2', content: JSON.stringify({ question: 'What are your admission requirements?', answer: 'Admission requirements differ based on the program. Generally, we require prior records, an assessment test, and a consultation with our team.' }) },
                { key: 'faq_3', content: JSON.stringify({ question: 'How can I contact Tovanah Consulting Ltd.?', answer: 'You can reach us by phone at (555) 123-4567, email at info@tovanahconsulting.com, or visit our office during business hours.' }) }
            ]
        };

        // 2. Testimonies
        const testimoniesContent = {
            page: 'testimonies',
            sections: [
                { key: 'testimony_1', content: JSON.stringify({ name: 'Margaret Kojo-Musa', rating: 4, description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' }), image: './images/testifier/mag.jpg' }
            ]
        };

        // 3. News
        const newsContent = {
            page: 'news',
            sections: [
                { key: 'news_1', content: JSON.stringify({ title: 'Classes Resume', date: '1st July 2026', info: 'We are pleased to announce that our training classes will resume on 1st July 2026.' }), image: './images/class_resume.jpg' },
                { key: 'news_2', content: JSON.stringify({ title: 'New Leadership Workshop', date: '15th July 2026', info: 'We are excited to launch a new Leadership Workshop starting on 15th July 2026.' }), image: './images/leadership_workshop.jpg' }
            ]
        };

        // 4. Team
        const teamContent = {
            page: 'our-team',
            sections: [
                { key: 'ceo', content: JSON.stringify({ name: 'Junisar Bangali Esq.', position: 'Chief Executive Officer', bio: 'Dr. Junisar Bangali Esq. is a visionary leader...' }), image: '../../images/ceo.jpg' },
                { key: 'staff_1', content: JSON.stringify({ name: 'Sarah Johnson', position: 'Academic Director', bio: 'Sarah Johnson brings 15 years...' }), image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2' }
            ]
        };

        await Content.deleteMany({ page: { $in: ['faq', 'testimonies', 'news', 'our-team'] } });
        await Content.insertMany([faqContent, testimoniesContent, newsContent, teamContent]);

        console.log('Content seeded successfully');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedData();
