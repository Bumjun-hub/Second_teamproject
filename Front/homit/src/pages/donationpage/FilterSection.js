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
    <div className="filter-section-d">
      <div className="filter-grid-d">
        {/* 지역 선택 */}
        <div className="filter-item-d">
          <label>지역 선택</label>
          <select
            value={selectedRegion.province}
            onChange={(e) => setSelectedRegion({
              province: e.target.value,
              city: '',
              district: '',
              neighborhood: ''
            })}
            className="select-input-d"
            disabled={loading}
          >
            <option value="">전체 지역</option>
            {Object.keys(regionData).map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
        </div>

        {selectedRegion.province && (
          <div className="filter-item-d">
            <label>시/구</label>
            <select
              value={selectedRegion.city}
              onChange={(e) => setSelectedRegion({
                ...selectedRegion,
                city: e.target.value,
                district: '',
                neighborhood: ''
              })}
              className="select-input-d"
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
          <div className="filter-item-d">
            <label>동</label>
            <select
              value={selectedRegion.district}
              onChange={(e) => setSelectedRegion({
                ...selectedRegion,
                district: e.target.value,
                neighborhood: ''
              })}
              className="select-input-d"
              disabled={loading}
            >
              <option value="">전체</option>
              {Object.keys(regionData[selectedRegion.province][selectedRegion.city]).map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}

        {selectedRegion.district && (
          <div className="filter-item-d">
            <label>세부 동/리</label>
            <select
              value={selectedRegion.neighborhood}
              onChange={(e) => setSelectedRegion({
                ...selectedRegion,
                neighborhood: e.target.value
              })}
              className="select-input-d"
              disabled={loading}
            >
              <option value="">전체</option>
              {regionData[selectedRegion.province][selectedRegion.city][selectedRegion.district].map(neighborhood => (
                <option key={neighborhood} value={neighborhood}>{neighborhood}</option>
              ))}
            </select>
          </div>
        )}

        {/* 검색 */}
        <div className="filter-item-d">
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
      <div className="category-tabs-d">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`category-tab-d ${selectedCategory === category ? 'active-d' : ''}`}
            disabled={loading}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 액션 버튼들 */}
      <div className="action-buttons-d">
        <button
          onClick={onWriteClick}
          className="write-btn-d"
          disabled={loading}
        >
          <span className="icon-d">✏️</span>
          <span>글쓰기</span>
        </button>
      </div>
    </div>
  );
};

export default FilterSection;