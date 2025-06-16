import { useEffect, useState } from "react";
import Section from "../../components/Section";
import './HotItemPage.css';
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const HotItemPage = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const categories = ['주방용품', '청소용품', '욕실용품', '생활용품', '가전제품', '뷰티/건강', '반려동물', '음식'];
  const [selectedCategory, setSelectedCategory] = useState('주방도구');

  const loadMoreItems = async () => {
    if (loading || !hasMore || offset > 1000) return;
    setLoading(true);
    try {
      const query = searchQuery.trim() || '주방도구';
      const encodeQuery = encodeURIComponent(query);
      const res = await fetch(`http://localhost:8080/api/item/search?query=${encodeQuery}&display=10&start=${offset}&sort=sim`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Invalid data');
      setItems(prev => {
        const existingIds = new Set(prev.map(item => item.naverProductId));
        const newItems = data.filter(item => !existingIds.has(item.naverProductId));
        return [...prev, ...newItems];
      });
      setOffset(prev => prev + 10);
    } catch {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setOffset(1);
    setHasMore(true);
    loadMoreItems();
    fetchWishlist();
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop + 200 >= document.documentElement.scrollHeight) {
        loadMoreItems();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset, searchQuery]);

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/wishlist/getlist`, { credentials: 'include' });
      const data = await res.json();
      const ids = new Set(data.map(item => item.naverProductId));
      setWishlistIds(ids);
    } catch (err) {
      console.error("위시리스트 불러오기 실패", err);
    }
  };

  const handleWishlist = async (item) => {
    const id = item.naverProductId;
    const isWishlisted = wishlistIds.has(id);
    try {
      if (isWishlisted) {
        await fetch(`http://localhost:8080/api/wishlist/delete/${id}`, {
          method: 'DELETE', credentials: 'include'
        });
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        const body = {
          name: item.name.replace(/<[^>]*>/g, ''),
          url: item.url,
          imageUrl: item.imageUrl,
          price: item.price,
          naverProductId: id,
          category1: item.category1 || '',
          category2: item.category2 || '',
          category3: item.category3 || '',
          category4: item.category4 || ''
        };
        await fetch('http://localhost:8080/api/wishlist/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(body)
        });
        setWishlistIds(prev => new Set(prev).add(id));
      }
    } catch (err) {
      console.error("위시리스트 토글 실패", err);
    }
  };

  return (
    <Section>
      <div className="hot-page-wrapper">

        <div className="hot-header">
          <h2 className="hot-title">인기있는 상품을 한눈에 확인해보세요!</h2>
        </div>

        <div className="hot-search-filter">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="hot-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="hot-search-button" onClick={() => setSearchQuery(searchQuery)}>검색</button>
        </div>

        <div className="hot-category-list">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`hot-category-button ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setSearchQuery(cat);
                setSelectedCategory(cat);
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="hot-grid">
          {items.map((item, index) => (
            <div key={index} className="hot-card">
              <div className="hot-image-wrapper">
                <img src={item.imageUrl} alt={item.name} className="hot-card-img" />
                <button className="heart-button" onClick={() => handleWishlist(item)}>
                  {wishlistIds.has(item.naverProductId)
                    ? <AiFillHeart size={24} color="red" />
                    : <AiOutlineHeart size={24} color="#8C8C8C" />}
                </button>
              </div>
              <div className="hot-card-body">
                <h3 className="hot-item-name">{item.name.replace(/<[^>]*>/g, '')}</h3>
                <p className="hot-item-price">{Number(item.price).toLocaleString()}원</p>
                <button className="hot-view-btn" onClick={() => window.open(item.url, "_blank")}>상세 보기</button>
              </div>
            </div>
          ))}
        </div>

        {loading && <p className="hot-loading">로딩 중...</p>}

      </div>
    </Section>

  );
};

export default HotItemPage;
