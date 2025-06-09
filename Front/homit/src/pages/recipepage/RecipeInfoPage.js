import React, { useState, useEffect } from 'react';
import './RecipeinfoPage.css';
import { authenticatedFetch } from '../../utils/authUtils';

const RecipeInfoPage = ({ recipe, onBackClick }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // 컴포넌트 마운트 시 즐겨찾기 상태 확인
  useEffect(() => {
    checkFavoriteStatus();
    fetchFavoriteCount();
  }, [recipe.RCP_SEQ]);

  // 현재 레시피가 즐겨찾기에 있는지 확인
  const checkFavoriteStatus = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8080/api/favorite/list');
      
      if (response.ok) {
        const favorites = await response.json();
        const isAlreadyFavorite = favorites.some(fav => fav.recipeId === recipe.RCP_SEQ);
        setIsFavorite(isAlreadyFavorite);
      }
    } catch (error) {
      // 에러 무시
    }
  };

  const fetchFavoriteCount = async () => {
    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/favorite/count/${recipe.RCP_SEQ}`);
      if (response.ok) {
        const count = await response.json();
        setFavoriteCount(count);
      }
    } catch (error) {
      // 에러 무시
    }
  };

  const getCookingSteps = (recipe) => {
    const steps = [];
    for (let i = 1; i <= 20; i++) {
      const step = recipe[`MANUAL${i.toString().padStart(2, '0')}`];
      const img = recipe[`MANUAL_IMG${i.toString().padStart(2, '0')}`];
      if (step?.trim()) steps.push({ step: i, instruction: step, image: img });
    }
    return steps;
  };

  const toggleFavorite = async () => {
    try {
      const url = isFavorite 
        ? 'http://localhost:8080/api/favorite/remove' 
        : 'http://localhost:8080/api/favorite/add';
      
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const body = isFavorite 
        ? { recipeId: recipe.RCP_SEQ }
        : { 
            recipeId: recipe.RCP_SEQ, 
            recipeName: recipe.RCP_NM, 
            imageUrl: recipe.ATT_FILE_NO_MAIN 
          };

      const response = await authenticatedFetch(url, {
        method,
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        // 즐겨찾기 개수 업데이트
        fetchFavoriteCount();
        alert(isFavorite ? '즐겨찾기에서 삭제되었습니다.' : '즐겨찾기에 추가되었습니다.');
      } else {
        alert('요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  return (
    <div className="recipe-info-page">
      {/* 헤더 */}
      <div className="info-header">
        <div className="info-header-container">
          <h1 className="recipe-title">{recipe.RCP_NM}</h1>
            <div className="header-actions">
              <div className="recipe-favorite-count">
                {favoriteCount} LIKES
              </div>
              <button 
                className={`favorite-btn ${isFavorite ? 'delete-state' : ''}`} 
                onClick={toggleFavorite}
              >
                {isFavorite ? '❤️' : '🤍'} {isFavorite ? '삭제' : '추가'}
              </button>
            </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="info-container">
        {/* 메인 이미지 */}
        {recipe.ATT_FILE_NO_MAIN && (
          <div className="main-image-container">
            <img src={recipe.ATT_FILE_NO_MAIN} alt={recipe.RCP_NM} className="main-image" />
          </div>
        )}
        
        {/* 기본 정보 그리드 */}
        <div className="info-grid">
          <div className="info-card">
            <h3 className="info-title">기본 정보</h3>
            <div className="info-content">
              <p><strong>카테고리:</strong> {recipe.RCP_PAT2 || '정보 없음'}</p>
              <p><strong>조리법:</strong> {recipe.RCP_WAY2 || '정보 없음'}</p>
              {recipe.INFO_ENG && <p><strong>열량:</strong> {recipe.INFO_ENG}kcal</p>}
            </div>
          </div>

          <div className="info-card">
            <h3 className="info-title">영양 정보</h3>
            <div className="info-content">
              {recipe.INFO_CAR && <p><strong>탄수화물:</strong> {recipe.INFO_CAR}g</p>}
              {recipe.INFO_PRO && <p><strong>단백질:</strong> {recipe.INFO_PRO}g</p>}
              {recipe.INFO_FAT && <p><strong>지방:</strong> {recipe.INFO_FAT}g</p>}
              {recipe.INFO_NA && <p><strong>나트륨:</strong> {recipe.INFO_NA}mg</p>}
            </div>
          </div>
        </div>
        
        {/* 재료 섹션 */}
        {recipe.RCP_PARTS_DTLS && (
          <div className="ingredients-section">
            <h3 className="section-title">재료</h3>
            <div className="ingredients-content">
              <p>{recipe.RCP_PARTS_DTLS}</p>
            </div>
          </div>
        )}
        
        {/* 조리 방법 */}
        <div className="cooking-section">
          <h3 className="section-title">조리 방법</h3>
          {getCookingSteps(recipe).map((step, i) => (
            <div key={i} className="cooking-step">
              {step.image && (
                <div className="step-image-container">
                  <img src={step.image} alt={`단계 ${step.step}`} className="step-image" />
                </div>
              )}
              <div className="step-content">
                <div className="step-number">단계 {step.step}</div>
                <p className="step-instruction">{step.instruction}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* 추가 정보 */}
        {(recipe.HASH_TAG || recipe.RCP_NA_TIP) && (
          <div className="additional-info">
            {recipe.HASH_TAG && (
              <div className="hashtag-section">
                <h3 className="section-title">해시태그</h3>
                <p className="hashtag-content">{recipe.HASH_TAG}</p>
              </div>
            )}
            {recipe.RCP_NA_TIP && (
              <div className="tip-section">
                <h3 className="section-title">저감조리법 팁</h3>
                <p className="tip-content">{recipe.RCP_NA_TIP}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeInfoPage;