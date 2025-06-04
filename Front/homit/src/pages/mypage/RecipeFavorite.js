import React, { useState, useEffect } from 'react';
import './RecipeFavorite.css';
import { authenticatedFetch } from '../../utils/authUtils';
import { IoClose } from "react-icons/io5";

const RecipeFavorite = ({ onRecipeClick }) => {
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
   } catch {
     // 에러 처리
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
   } catch {
     alert('네트워크 오류가 발생했습니다.');
   }
 };

 const handleRecipeClick = (favorite) => {
   if (onRecipeClick) {
     const recipe = {
       recipeId: favorite.recipeId,
       recipeName: favorite.recipeName,
       imageUrl: favorite.imageUrl,
       RCP_SEQ: favorite.recipeId, 
       RCP_NM: favorite.recipeName,
       ATT_FILE_NO_MAIN: favorite.imageUrl
     };
     onRecipeClick(recipe);
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