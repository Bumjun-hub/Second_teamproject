import React from 'react';

const FilterSection = ({
  selectedRegion,
  setSelectedRegion,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  regionData,
  categories,
  onWriteClick,
  loading,
  onRefresh
}) => {
  return (
    <div className="filter-section">
      <div className="filter-grid">
        {/* 지역 선택 */}
        <div className="filter-item">
          <label>지역 선택</label>
          <select
            value={selectedRegion.province}
            onChange={(e) => setSelectedRegion({
              province: e.target.value,
              city: '',
              district: '',
              neighborhood: ''
            })}
            className="select-input"
            disabled={loading}
          >
            <option value="">전체 지역</option>
            {Object.keys(regionData).map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>

        {selectedRegion.province && (
          <div className="filter-item">
            <label>시/구</label>
            <select
              value={selectedRegion.city}
              onChange={(e) => setSelectedRegion({
                ...selectedRegion,
                city: e.target.value,
                district: '',
                neighborhood: ''
              })}
              className="select-input"
              disabled={loading}
            >
              <option value="">전체</option>
              {Object.keys(regionData[selectedRegion.province]).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        )}

        {selectedRegion.city && (
          <div className="filter-item">
            <label>동</label>
            <select
              value={selectedRegion.district}
              onChange={(e) => setSelectedRegion({
                ...selectedRegion,
                district: e.target.value
              })}
              className="select-input"
              disabled={loading}
            >
              <option value="">전체</option>
              {regionData[selectedRegion.province][selectedRegion.city].map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}

        {/* 검색 */}
        <div className="filter-item">
          <label>검색</label>
          <div className="search-container-d">
            <span className="search-icon-d">🔍</span>
            <input
              type="text"
              placeholder="제목, 내용 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-d"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
            disabled={loading}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 액션 버튼들 */}
      <div className="action-buttons">
        <button
          onClick={onWriteClick}
          className="write-btn"
          disabled={loading}
        >
          <span className="icon">✏️</span>
          <span>글쓰기</span>
        </button>
        
        <button
          onClick={onRefresh}
          className="refresh-btn"
          disabled={loading}
          title="새로고침"
        >
          <span className="icon">🔄</span>
          <span>새로고침</span>
        </button>
      </div>
    </div>
  );
};

export default FilterSection;