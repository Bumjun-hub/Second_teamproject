import React, { useState, useEffect } from 'react';
import RecipeInfoPage from './RecipeInfoPage';
import PopularRecipes from './PopularRecipes';
import { authenticatedFetch } from '../../utils/authUtils';
import './RecipePage.css';
import { BsFire, BsSearch } from "react-icons/bs";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, 
         MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import Section from '../../components/Section';

const RecipePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [showPopularSection, setShowPopularSection] = useState(true);

  const apiKey = process.env.REACT_APP_RECIPE_API_KEY;

  const categories = ['전체', '밥', '반찬', '국&찌개', '일품', '후식'];
  const recipesPerPage = 12;

  useEffect(() => {
    loadRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRecipes = async () => {
    try {
      const response = await fetch(`http://openapi.foodsafetykorea.go.kr/api/${apiKey}/COOKRCP01/json/1/1000`);
      const data = await response.json();
      if (data.COOKRCP01?.row) {
        const allRecipes = data.COOKRCP01.row.filter(r => parseInt(r.RCP_SEQ) <= 1000);
        
        // 즐겨찾기 개수로 정렬
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
        
        // 인기순으로 정렬 (즐겨찾기 많은 순)
        const sorted = recipesWithCount.sort((a, b) => b.favoriteCount - a.favoriteCount);
        setRecipes(sorted);
      }
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleBackClick = () => {
    window.history.back(); 
  };

  useEffect(() => {
    const handlePopState = (event) => {
      setShowDetailPage(false);
      setSelectedRecipe(null);
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getCategoryFromRecipe = (recipe) => {
    const cat = recipe.RCP_PAT2;
    if (cat.includes('밥')) return '밥';
    if (cat.includes('반찬')) return '반찬';
    if (cat.includes('국') || cat.includes('찌개')) return '국&찌개';
    if (cat.includes('후식')) return '후식';
    return '일품';
  };

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.RCP_NM.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || getCategoryFromRecipe(recipe) === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const currentRecipes = filteredRecipes.slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage);
  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe);
    setShowDetailPage(true);
    setShowPopularSection(false);

    window.history.pushState(
      { page: 'detail', recipe: recipe.RCP_SEQ }, 
      '', 
      `#recipe-${recipe.RCP_SEQ}`
    );
  };

  // 검색이나 카테고리 변경 시 인기 레시피 섹션 숨기기
  useEffect(() => {
    if (searchTerm || selectedCategory !== '전체') {
      setShowPopularSection(false);
    } else {
      setShowPopularSection(true);
    }
  }, [searchTerm, selectedCategory]);

  if (loading) return <div className="loading">레시피 로딩 중...</div>;

  // 상세 페이지 표시
  if (showDetailPage) {
    return <RecipeInfoPage recipe={selectedRecipe} onBackClick={handleBackClick} />;
  }

  // 메인 페이지 표시
  return (
    <Section>
    <div className="recipe-page">
      {/* 헤더 */}
      <div className="header">
        <div className="header-container">
          {/* 검색창 */}
          <div className="search-container">
            <input
              type="text"
              placeholder="요리명 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon"><BsSearch size={25}/></span>
          </div>
          {/* 카테고리 */}
          <div className="category-container">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => {setSelectedCategory(category); setCurrentPage(1);}}
                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div className="main-container">
        {/* 인기 레시피 섹션 - 검색이나 필터가 없을 때만 표시 */}
        {showPopularSection && (
          <div className="popular-section">
            <PopularRecipes 
              allRecipes={recipes}
              onRecipeClick={handleRecipeClick}
            />
          </div>
        )}

        {/* 전체 레시피 섹션 */}
        <div className="all-recipes-section">
          <h1 className="main-title">
            {searchTerm ? `"${searchTerm}" 검색 결과` : 
             selectedCategory !== '전체' ? `${selectedCategory} 레시피` : '전체 레시피'}
          </h1>
          
          {/* 레시피 그리드 */}
          <div className="recipe-grid">
            {currentRecipes.map(recipe => (
              <div
                key={recipe.RCP_SEQ}
                onClick={() => handleRecipeClick(recipe)}
                className="recipe-card"
              >
                <div className="recipe-image">
                  {recipe.ATT_FILE_NO_MAIN ? (
                    <img src={recipe.ATT_FILE_NO_MAIN} alt={recipe.RCP_NM} />
                  ) : (
                    <span className="recipe-title-overlay">{recipe.RCP_NM}</span>
                  )}
                </div>
                <div className="recipe-info">
                  <h3 className="recipe-name">{recipe.RCP_NM}</h3>
                  <div className="recipe-meta">
                    <span className="recipe-category">{recipe.RCP_PAT2}</span>
                    {recipe.INFO_ENG && <span className="recipe-calories"><BsFire size={15}/> {recipe.INFO_ENG}kcal</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination1">
              {/* 네비게이션 버튼들 */}
              {[
                [() => setCurrentPage(1), currentPage === 1, MdOutlineKeyboardDoubleArrowLeft],
                [() => setCurrentPage(Math.max(1, currentPage - 1)), currentPage === 1, MdOutlineKeyboardArrowLeft],
              ].map(([onClick, disabled, Icon], idx) => (
                <button key={idx} onClick={onClick} disabled={disabled} className="pagination1-btn">
                  <Icon size={25} />
                </button>
              ))}
              {/* 페이지 번호들 */}
              {(() => {
                if (totalPages <= 5) {
                  return Array.from({length: totalPages}, (_, i) => i + 1);
                }
                const start = Math.floor((currentPage - 1) / 5) * 5 + 1;
                const end = Math.min(start + 4, totalPages);
                return Array.from({length: end - start + 1}, (_, i) => start + i);
              })().map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`pagination1-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
              {/* 네비게이션 버튼들 */}
              {[
                [() => setCurrentPage(Math.min(totalPages, currentPage + 1)), currentPage === totalPages, MdOutlineKeyboardArrowRight],
                [() => setCurrentPage(totalPages), currentPage === totalPages, MdOutlineKeyboardDoubleArrowRight],
              ].map(([onClick, disabled, Icon], idx) => (
                <button key={idx + 2} onClick={onClick} disabled={disabled} className="pagination1-btn">
                  <Icon size={25} />
                </button>
              ))}
            </div>
          )}

          {/* 검색 결과가 없을 때 */}
          {filteredRecipes.length === 0 && (
            <div className="no-results">
              <div className="no-results-title">검색 결과가 없습니다.</div>
              <div className="no-results-subtitle">다른 검색어나 카테고리를 시도해보세요.</div>
            </div>
          )}
        </div>
      </div>
    </div>
    </Section>
  );
};

export default RecipePage;