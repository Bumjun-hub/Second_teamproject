import { useEffect, useState } from "react";
import Section from "../../components/Section";
import './HotItemPage.css';

const HotItemPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = items.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const encodeQuery = encodeURIComponent(searchQuery);
      const res = await fetch(`http://localhost:8080/api/item/search?query=${encodeQuery}&display=30&start=1&sort=sim`);
      const data = await res.json();
      setItems(data);
      setCurrentPage(1);
    } catch (e) {
      console.error("검색실패 : ", e);
    }
  };

  const fetchHotItems = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/item/search?query=주방도구&display=30&start=1&sort=sim`);
      const data = await res.json();
      setItems(data);
    } catch (e) {
      console.error('🔥 핫아이템 불러오기 실패:', e);
    }
  };

  useEffect(() => {
    fetchHotItems();
  }, []);

  return (
    <Section>
      <div className="Pageinfo">
        <div className="board-header">
          <h2 className="board-title">인기있는 상품을 한눈에 확인해보세요!</h2>
        </div>
      </div>

      <div className="search-bar-wrapper">
        <div className="search-bar">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      <div className="HotItemlist">
        <div className="HotItemlist-inner">
          {currentItems.map((item, index) => (
            <div key={index} className="HotItem">
              <img src={item.imageUrl} alt={item.name} />
              <h3>{item.name.replace(/<[^>]*>/g, '')}</h3>
              <p>{Number(item.price).toLocaleString()}원</p>
              <button
                className="apply-button"
                onClick={() => window.open(item.url, "_blank")}
              >
                상세 보기
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "40px" }}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            style={{
              margin: "0 5px",
              padding: "8px 16px",
              backgroundColor: currentPage === index + 1 ? "#2668A7" : "#ddd",
              color: currentPage === index + 1 ? "#fff" : "#000",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </Section>
  );
};

export default HotItemPage;
