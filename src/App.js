// /Users/shinji81/my-app/src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [contentImages, setContentImages] = useState([]);
  const [keywordMap, setKeywordMap] = useState({});

  useEffect(() => {
    const fetchKeywords = async () => {
      console.log('키워드 요청 보내는 중...');
      try {
        const response = await fetch('http://localhost:3001/api/keywords');
        if (!response.ok) throw new Error('키워드를 가져오는데 실패했습니다.');
        const data = await response.json();

        const map = {};
        data.forEach((keyword) => {
          map[keyword.keywords_id] = keyword.keywords_name;
        });

        setKeywordMap(map);
      } catch (error) {
        console.error(error);
      }
    };

    fetchKeywords();
  }, []);

  const handleButtonClick = (id) => {
    setSelectedKeywords((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  };

  const fetchContentImages = useCallback(async () => {
    if (selectedKeywords.length === 0) {
      setContentImages([]);
      return;
    }

    const keywordNames = selectedKeywords.map((id) => keywordMap[id]).filter(Boolean);
    console.log('서버에 전달할 키워드:', keywordNames);

    try {
      const response = await fetch('http://localhost:3001/api/contents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keywords: keywordNames }),
      });

      if (!response.ok) throw new Error('데이터를 가져오는데 실패했습니다.');
      const data = await response.json();
      setContentImages(data);
    } catch (error) {
      console.error(error);
      setContentImages([]);
    }
  }, [selectedKeywords, keywordMap]);

  useEffect(() => {
    fetchContentImages();
  }, [fetchContentImages]);

  const handleClearSelection = () => {
    setSelectedKeywords([]);
    setContentImages([]);
  };

  return (
    <div className="app">
      <h1 className="title">Keyword Selector</h1>

      {/* 검색박스 키워드 표시 */}
      <div className="selected-keywords-box">
        {selectedKeywords.length > 0 ? (
          selectedKeywords.map((id) => (
            <span key={id} className="selected-keywords">
              #{keywordMap[id]}
            </span>
          ))
        ) : (
          <span className="no-keywords">선택된 키워드가 없습니다.</span>
        )}
      </div>

      {/* 키워드 버튼 */}
      <div className="keyword-container">
        {Object.keys(keywordMap).map((id) => (
          <button
            key={id}
            onClick={() => handleButtonClick(id)}
            className={`keyword-button ${selectedKeywords.includes(id) ? 'active' : ''}`}
          >
            {keywordMap[id]}
          </button>
        ))}
      </div>

      <button className="clear-button" onClick={handleClearSelection}>
        선택 해제
      </button>

      <h3 className="subtitle">Contents</h3>
      <div className="content-container">
        {contentImages.length > 0 ? (
          contentImages.map((content, index) => (
            <div key={index} className="content-card">
              <img
                src={`http://localhost:3001/${content.contents_poster}`}
                alt={content.contents_name}
              />
              <p>{content.contents_name}</p>
            </div>
          ))
        ) : (
          <p className="no-content">선택된 키워드에 해당하는 콘텐츠가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default App;