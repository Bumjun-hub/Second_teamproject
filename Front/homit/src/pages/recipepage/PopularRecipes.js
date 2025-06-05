import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../../utils/authUtils';
import './PopularRecipes.css';

const FavoriteCountBadge = ({ count }) => {
  const getBadgeColor = (count) => {
    if (count >= 3) return '#FFD700'; // 골드
    if (count >= 2) return '#C0C0C0';  // 실버
    if (count >= 1) return '#CD7F32';  // 브론즈
    return '#gray';
  };

  const getBadgeText = (count) => {
    if (count >= 3) return '🏆';
    if (count >= 2) return '🥈';
    if (count >= 1) return '🥉';
    return '❤️';
  };

  return (
    <span 
      className="popular-favorite-badge" 
      style={{ backgroundColor: getBadgeColor(count) }}
    >
      {getBadgeText(count)} {count}
    </span>
  );
};

const PopularRecipes = ({ allRecipes = [], onRecipeClick }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (allRecipes.length > 0) {
      fetchPopularRecipes();
    }
  }, [allRecipes]);

  const fetchPopularRecipes = async () => {
    setLoading(true);
    try {
      // 모든 레시피의 즐겨찾기 개수를 조회해서 인기순으로 정렬
      const recipesWithCount = await Promise.all(
        allRecipes.map(async (recipe) => {
          try {
            const response = await authenticatedFetch(`http://localhost:8080/api/favorite/count/${recipe.RCP_SEQ}`);
            const count = response.ok ? await response.json() : 0;
            return { ...recipe, favoriteCount: count };
          } catch (error) {
            return { ...recipe, favoriteCount: 0 };
          }
        })
      );
      
      // 즐겨찾기 개수 순으로 정렬
      const sorted = recipesWithCount.sort((a, b) => b.favoriteCount - a.favoriteCount);
      setRecipes(sorted.slice(0, 10)); // 상위 10개
    } catch (error) {
      console.error('인기 레시피 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="popular-recipes">
        <h2>🔥 인기 레시피</h2>
        <div className="popular-loading">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="popular-recipes">
      <h2>🔥 인기 레시피 TOP 10</h2>
      
      {recipes.length === 0 ? (
        <div className="popular-no-recipes">
          <p>인기 레시피가 없습니다.</p>
        </div>
      ) : (
        <div className="popular-grid">
          {recipes.map((recipe, index) => (
            <div 
              key={recipe.RCP_SEQ} 
              className="popular-card"
              onClick={() => onRecipeClick && onRecipeClick(recipe)}
            >
              <div className="popular-rank-badge">#{index + 1}</div>
              
              <div className="popular-recipe-image">
                {recipe.ATT_FILE_NO_MAIN ? (
                  <img 
                    src={recipe.ATT_FILE_NO_MAIN} 
                    alt={recipe.RCP_NM}
                  />
                ) : (
                  <div className="popular-no-image">🍽️</div>
                )}
              </div>
              
              <div className="popular-recipe-info">
                <h3 className="popular-recipe-name">{recipe.RCP_NM}</h3>
                <div className="popular-recipe-meta">
                  <span className="popular-category">{recipe.RCP_PAT2}</span>
                  <FavoriteCountBadge count={recipe.favoriteCount} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularRecipes;