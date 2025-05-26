import './App.css';
import MainPage from './pages/mainpage/MainPage';
import { Route, Routes } from 'react-router-dom';
import GroupBuyPage from './pages/GroupBuyPage';
import BoardPage from './pages/BoardPage';
import RecipePage from './pages/RecipePage';
import HotItemPage from './pages/HotItemPage';
import LoginPage from './pages/LoginPage';
import Layout from './components/Layout';
import GroupBuyInfoPage from './pages/GroupBuyInfoPage';
import GroupBuyWritePage from './pages/GroupBuyWritePage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/groupbuy" element={<GroupBuyPage />} />
        <Route path="/groupbuy/info/:id" element={<GroupBuyInfoPage/>}/>
        <Route path="/groupbuy/write" element={<GroupBuyWritePage/>}/>
        <Route path="/board" element={<BoardPage />} />
        <Route path="/recipe" element={<RecipePage />} />
        <Route path="/popular" element={<HotItemPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Layout>

  );
}

export default App;