import React, { useState, useEffect } from 'react';
import RecipeInfoPage from './RecipeInfoPage';
import './RecipePage.css';
import { BsFire,BsSearch } from "react-icons/bs";
import { FaStar } from "react-icons/fa";
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, 
         MdOutlineKeyboardDoubleArrowLeft, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";

const RecipePage = () => {
  const [recipes, setRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showDetailPage, setShowDetailPage] = useState(false);

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
        setRecipes(data.COOKRCP01.row.filter(r => parseInt(r.RCP_SEQ) <= 1000));
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

    window.history.pushState(
    { page: 'detail', recipe: recipe.RCP_SEQ }, 
    '', 
    `#recipe-${recipe.RCP_SEQ}`
  );
  };
  if (loading) return <div className="loading">레시피 로딩 중...</div>;
  // 상세 페이지 표시
  if (showDetailPage) {
    return <RecipeInfoPage recipe={selectedRecipe} onBackClick={handleBackClick} />;
  }
  // 메인 페이지 표시
  return (
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
        <h1 className="main-title">인기 레시피</h1>
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
                <div className="recipe-rating">
                  <span><FaStar size={13} color='d0d000'/> 4.5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* 페이지네이션 */}
          {totalPages > 1 && (
          <div className="pagination">
            {/* 네비게이션 버튼들 */}
            {[
              [() => setCurrentPage(1), currentPage === 1, MdOutlineKeyboardDoubleArrowLeft],
              [() => setCurrentPage(Math.max(1, currentPage - 1)), currentPage === 1, MdOutlineKeyboardArrowLeft],
            ].map(([onClick, disabled, Icon], idx) => (
              <button key={idx} onClick={onClick} disabled={disabled} className="pagination-btn">
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
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            {/* 네비게이션 버튼들 */}
            {[
              [() => setCurrentPage(Math.min(totalPages, currentPage + 1)), currentPage === totalPages, MdOutlineKeyboardArrowRight],
              [() => setCurrentPage(totalPages), currentPage === totalPages, MdOutlineKeyboardDoubleArrowRight],
            ].map(([onClick, disabled, Icon], idx) => (
              <button key={idx + 2} onClick={onClick} disabled={disabled} className="pagination-btn">
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
  );
};

export default RecipePage;