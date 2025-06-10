import { useEffect, useState } from "react";
import Section from "../../components/Section";
import './HotItemPage.css';
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const HotItemPage = () => {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [offset, setOffset] = useState(1); // ✅ 무한 스크롤용 offset 추가
  const [loading, setLoading] = useState(false); // ✅ 중복 요청 방지용 로딩 상태
  const [hasMore, setHasMore] = useState(true); // ✅ 더 이상 불러올 게 없을 경우 false

  const [wishlistIds, setWishlistIds] = useState(new Set());

  // 카테고리
  const categories = ['주방용품', '청소용품', '욕실용품', '생활용품', '가전제품', '뷰티/건강', '반려동물', '음식'];
  const [selectedCategory, setSelectedCategory] = useState('주방도구');

  // ✅ 아이템 추가 로딩 함수 (스크롤 하단 도달 시 호출)
  const loadMoreItems = async () => {
    if (loading || !hasMore) return;

    // ✅ 최대 요청 제한
    if (offset > 1000) {
      console.warn("⛔️ offset 1000 초과 - 로딩 중단");
      setHasMore(false);
      return;
    }

    setLoading(true);
    try {
      const query = searchQuery.trim() || '주방도구';
      const encodeQuery = encodeURIComponent(query);
      const res = await fetch(`http://localhost:8080/api/item/search?query=${encodeQuery}&display=10&start=${offset}&sort=sim`);
      const data = await res.json();

      // ✅ 배열 여부 확인
      if (!Array.isArray(data)) {
        console.error("❌ 배열이 아님:", data);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setItems(prev => {
        const existingIds = new Set(prev.map(item => item.naverProductId));
        const newItems = data.filter(item => !existingIds.has(item.naverProductId));
        return [...prev, ...newItems];
      });

      setOffset(prev => prev + 10);
    } catch (e) {
      console.error("🔥 아이템 로딩 실패:", e);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };


  // ✅ 초기 로딩 및 검색 시 재로딩
  useEffect(() => {
    setItems([]);
    setOffset(1);
    setHasMore(true);
    loadMoreItems();
    fetchWishlist();
  }, [searchQuery]);

  useEffect(() => {
    console.log("📋 [전체 아이템 목록 갯수]:", items.length);
    console.log("📋 [전체 아이템 ID 목록]:", items.map(i => i.naverProductId));
  }, [items]);

  // ✅ 스크롤 하단 감지 이벤트 등록
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 200 >=
        document.documentElement.scrollHeight

      ) {
        loadMoreItems();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [offset, searchQuery]);

  // ✅ 위시리스트 불러오기
  const fetchWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/wishlist/getlist`, {
        credentials: 'include'
      });
      const data = await res.json();
      const ids = new Set(data.map(item => item.naverProductId));
      setWishlistIds(ids);


    } catch (err) {
      console.error("위시리스트 불러오기 실패", err);
    }
  };

  // ✅ 위시리스트 토글
  const handleWishlist = async (item) => {
    const id = item.naverProductId;
    const isWishlisted = wishlistIds.has(id);

    try {
      if (isWishlisted) {
        await fetch(`http://localhost:8080/api/wishlist/delete/${id}`, {
          method: 'DELETE',
          credentials: 'include'
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

  // ✅ 검색 시 상태 초기화 (검색어만 바꾸면 자동 로딩됨)
  const handleSearch = () => {
    setItems([]);
    setOffset(1);
    setHasMore(true);

  };

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
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={selectedCategory === cat ? "active" : ""}
            onClick={() => {
              setSearchQuery(cat); // 검색어 바꾸고
              setSelectedCategory(cat); // 버튼 하이라이트용
            }}
          >
            {cat}
          </button>
        ))}
      </div>


      <div className="HotItemlist">
        <div className="HotItemlist-inner">
          {items.map((item, index) => (
            <div key={index} className="HotItem">
              <div className="image-container">
                <img src={item.imageUrl} alt={item.name} className="item-image" />
                <button className="heart-button-wishlist" onClick={() => handleWishlist(item)}>
                  {wishlistIds.has(item.naverProductId)
                    ? <AiFillHeart size={24} color="red" />
                    : <AiOutlineHeart size={24} color="#8C8C8C" />}
                </button>
              </div>
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

      {/* ✅ 로딩 중 메시지 */}
      {loading && <p style={{ textAlign: 'center', margin: '20px 0' }}>로딩 중...</p>}


    </Section>
  );
};

export default HotItemPage;
