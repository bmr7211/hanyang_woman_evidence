// /Users/shinji81/my-app/backend/routes/imageRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// 키워드
router.get('/keywords', async (req, res) => {
  console.log('키워드 요청 받음'); 

  try {
    const query = 'SELECT * FROM keywords';
    const [results] = await db.promise().query(query); 
    res.json(results); 
  } catch (err) {
    console.error('Error fetching keywords:', err);
    res.status(500).send('Error fetching keywords');
  }
});

// 콘텐츠 이미지
router.post('/contents', async (req, res) => {
  const { keywords } = req.body;

  if (!keywords || keywords.length === 0) {
    return res.json([]);
  }

  const placeholders = keywords.map(() => '?').join(', ');
  const query = `
    SELECT DISTINCT c.*
    FROM contents c
    JOIN contents_keywords ck ON c.contents_id = ck.contents_id
    JOIN keywords k ON ck.keywords_id = k.keywords_id
    WHERE k.keywords_name IN (${placeholders})
    GROUP BY c.contents_id
    HAVING COUNT(DISTINCT k.keywords_name) = ?;
  `;

  try {
    const [results] = await db.promise().query(query, [...keywords, keywords.length]); 
    res.json(results); 
  } catch (err) {
    console.error('Error fetching contents:', err);
    res.status(500).send('Error fetching contents');
  }
});

module.exports = router;