import React, { useState, useEffect } from 'react';
import './RecipeFavorite.css';
import { authenticatedFetch } from '../../utils/authUtils';

const RecipeFavorite = ({ onRecipeClick }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch('http://localhost:8080/api/favorite/list');
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      } else {
        setError('즐겨찾기를 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 조회 오류:', error);
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId) => {
    if (!window.confirm('즐겨찾기에서 삭제하시겠습니까?')) return;

    try {
      const response = await authenticatedFetch('http://localhost:8080/api/favorite/remove', {
        method: 'DELETE',
        body: JSON.stringify({ recipeId })
      });

      if (response.ok) {
        setFavorites(favorites.filter(fav => fav.recipe.recipeId !== recipeId));
        alert('즐겨찾기에서 삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 삭제 오류:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleRecipeClick = (recipe) => {
    if (onRecipeClick) {
      onRecipeClick(recipe);
    }
  };

  if (loading) {
    return (
      <div className="favorite-container">
        <div className="loading">
          <div className="loading-spinner">⏳</div>
          <p>즐겨찾기를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="favorite-container">
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchFavorites} className="retry-btn">다시 시도</button>
        </div>
      </div>
    );
  }

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>즐겨찾기</h2>
        <span className="favorite-count">{favorites.length}개</span>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorite">
          <div className="empty-icon">🤍</div>
          <h3>저장된 즐겨찾기가 없습니다</h3>
          <p>마음에 드는 레시피를 즐겨찾기에 추가해보세요!</p>
        </div>
      ) : (
        <div className="favorite-grid">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="favorite-card">
              <div className="card-image-container" onClick={() => handleRecipeClick(favorite.recipe)}>
                {favorite.recipe.imageUrl ? (
                  <img 
                    src={favorite.recipe.imageUrl} 
                    alt={favorite.recipe.recipeName}
                    className="card-image"
                  />
                ) : (
                  <div className="no-image">
                    <span>🍽️</span>
                  </div>
                )}
              </div>
              
              <div className="card-content">
                <h3 
                  className="recipe-title" 
                  onClick={() => handleRecipeClick(favorite.recipe)}
                >
                  {favorite.recipe.recipeName}
                </h3>
                
                <div className="card-actions">
                  <button 
                    className="view-btn"
                    onClick={() => handleRecipeClick(favorite.recipe)}
                  >
                    레시피 보기
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFavorite(favorite.recipe.recipeId)}
                  >
                    ❤️ 삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeFavorite;