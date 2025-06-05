import React, { useState, useEffect } from 'react';
import './RecipeFavorite.css';
import { authenticatedFetch } from '../../utils/authUtils';
import { IoClose } from "react-icons/io5";

const RecipeFavorite = ({ onRecipeClick, recipes = [] }) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8080/api/favorite/list');
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('즐겨찾기 목록 조회 실패:', error);
    }
  };

  const removeFavorite = async (recipeId) => {
    if (!window.confirm('즐겨찾기에서 삭제하시겠습니까?')) {
      return;
    }

    try {
      const response = await authenticatedFetch('http://localhost:8080/api/favorite/remove', {
        method: 'DELETE',
        body: JSON.stringify({ recipeId })
      });

      if (response.ok) { 
        setFavorites(prevFavorites => 
          prevFavorites.filter(fav => fav.recipeId !== recipeId)
        );
        alert('즐겨찾기에서 삭제되었습니다.');
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('즐겨찾기 삭제 실패:', error);
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const fetchRecipeFromAPI = async (recipeId) => {
    try {
    
      const apiKey = process.env.REACT_APP_RECIPE_API_KEY;
      const response = await fetch(
        `http://openapi.foodsafetykorea.go.kr/api/${apiKey}/COOKRCP01/json/1/1000`
      );
      
      if (response.ok) {
        const data = await response.json();
        const recipeList = data.COOKRCP01?.row || [];
        
        const foundRecipe = recipeList.find(recipe => recipe.RCP_SEQ === recipeId);
        
        if (foundRecipe) {
          return foundRecipe;
        } else {
          throw new Error('레시피를 찾을 수 없습니다.');
        }
      } else {
        throw new Error('API 요청 실패');
      }
    } catch (error) {
      console.error('외부 API 레시피 조회 실패:', error);
      throw error;
    } finally {
    }
  };

  const handleRecipeClick = async (favorite) => {
    if (!onRecipeClick) return;

    const recipeId = favorite.recipeId;
    
    try {
      // 1. 먼저 기존 recipes 배열에서 찾기
      let fullRecipe = recipes.find(recipe => recipe.RCP_SEQ === recipeId);
      
      if (fullRecipe) {
        onRecipeClick(fullRecipe);
        return;
      }
      
      // 2. 기존 recipes에 없으면 외부 API에서 조회
      fullRecipe = await fetchRecipeFromAPI(recipeId);
      
      if (fullRecipe) {
        onRecipeClick(fullRecipe);
      }
      
    } catch (error) {
      console.error('레시피 조회 실패:', error);
      const fallbackRecipe = {
        RCP_SEQ: favorite.recipeId,
        RCP_NM: favorite.recipeName,
        ATT_FILE_NO_MAIN: favorite.imageUrl,
        RCP_PAT2: '정보 없음',
        RCP_WAY2: '정보 없음',
        RCP_PARTS_DTLS: '상세 정보를 불러올 수 없습니다.',
        INFO_ENG: '',
        INFO_CAR: '',
        INFO_PRO: '',
        INFO_FAT: '',
        INFO_NA: '',
        ...Array.from({length: 20}, (_, i) => ({
          [`MANUAL${(i + 1).toString().padStart(2, '0')}`]: '',
          [`MANUAL_IMG${(i + 1).toString().padStart(2, '0')}`]: ''
        })).reduce((acc, cur) => ({...acc, ...cur}), {})
      };
      
      onRecipeClick(fallbackRecipe);
      alert('레시피 상세 정보를 불러오는데 실패했습니다. 기본 정보만 표시됩니다.');
    }
  };

  return (
    <div className="favorite-container">
      <div className="favorite-header">
        <h2>즐겨찾기</h2>
      </div>

      {favorites.length === 0 ? (
        <div className="empty-favorite">
          <div className="empty-icon">🤍</div>
          <h3>저장된 즐겨찾기가 없습니다</h3>
          <p>마음에 드는 레시피를 즐겨찾기에 추가해보세요!</p>
        </div>
      ) : (
        <div className="favorite-grid">
          {favorites.map((favorite, index) => (
            <div key={favorite.recipeId || index} className="favorite-card">
              <div className="card-image-container" onClick={() => handleRecipeClick(favorite)}>
                {favorite.imageUrl ? (
                  <img 
                    src={favorite.imageUrl} 
                    alt={favorite.recipeName}
                    className="card-image"
                  />
                ) : (
                  <div className="no-image">
                    <span>🍽️</span>
                  </div>
                )}
                <div className="card-actions">
                  <button 
                    className="remove-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFavorite(favorite.recipeId);
                    }}
                  >
                    <IoClose size={35} />
                  </button>
                </div>
              </div>
              
              <div className="card-content">
                <h3 
                  className="recipe-title" 
                  onClick={() => handleRecipeClick(favorite)}
                >
                  {favorite.recipeName}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeFavorite;