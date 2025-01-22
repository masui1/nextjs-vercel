"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Button,
  Toolbar,
  Typography,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Top = () => {
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [bentos, setBentos] = useState({
        row1: [],
        row2: [],
        row3: [],
        row4: [],
        row5: [],
    });
    const [error, setError] = useState(null);
    const router = useRouter();

  const fetchData = async (companyId, row) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/bentos?companyId=${companyId}&row=${row}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(`データの取得に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/users', { method: 'GET', credentials: 'include' });
      const userData = await response.json();
      if (!response.ok) {
        throw new Error('ユーザー情報の取得に失敗しました');
      }
      setUsers(userData.user || userData);
    } catch (error) {
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchAllData = async () => {
    const allRows = await Promise.all([
      fetchData(1, 1),
      fetchData(1, 2),
      fetchData(2, 3),
      fetchData(2, 4),
      fetchData(2, 5),
    ]);
    const filterExpired = (items) => {
      const now = new Date();
      return items.filter((item) => {
        if (!item.is_purchased || !item.purchasedData) return true;
        const purchasedDate = new Date(item.purchasedData);
        const timeDiff = now - purchasedDate;
        return timeDiff <= 24 * 60 * 60 * 1000;
      });
    };

    setBentos({
      row1: filterExpired(allRows[0]),
      row2: filterExpired(allRows[1]),
      row3: filterExpired(allRows[2]),
      row4: filterExpired(allRows[3]),
      row5: filterExpired(allRows[4]),
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    try {
      let url = '/api/search';
      if (search.trim() !== '') {
        const params = new URLSearchParams({ q: search.trim() });
        url += `?${params.toString()}`;
      }
      console.log('データを取得しています:', url);
      const response = await fetch(url);
      if (!response.ok) throw new Error('データの取得に失敗しました。');
      const data = await response.json();
  
      if (search.trim() === '') {
        fetchAllData();
      } else {
        const groupedData = data.reduce((acc, item) => {
          const rowKey = `row${item.row}`;
          if (!acc[rowKey]) {
            acc[rowKey] = [];
          }
          acc[rowKey].push(item);
          return acc;
        }, {});

        const updatedBentos = {
          row1: groupedData.row1 || [],
          row2: groupedData.row2 || [],
          row3: groupedData.row3 || [],
          row4: groupedData.row4 || [],
          row5: groupedData.row5 || [],
        };

        setBentos(updatedBentos);
      }
    } catch (error) {
      setError(`データの取得に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filterAvailableBentos = (bentos) => {
    return bentos.filter(bento => !(bento.is_purchased || bento.purchasedDate));
  };

  return (
    <Box>
     <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6">弁当管理サイト</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="商品名を検索"
              onChange={(e) => setSearch(e.target.value)}
              sx={{ width: 300 }}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={handleSearch}>
                    <SearchIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
          <Button onClick={() => router.push('/user/login')} variant="contained" color="primary">
            管理者の方はこちらへ
          </Button>
        </Box>
      </Toolbar>
    </AppBar>

      {/* 1段目 - 三ツ星ファーム */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          1段目 (三ツ星ファーム)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filterAvailableBentos(bentos.row1).length > 0 ? (
              filterAvailableBentos(bentos.row1).map((bento) =>
                !bento.buies_created ? (
                  <div
                      key={bento.id}
                      className="bg-slate-200 shadow-md rounded-lg p-4 w-full max-w-xs"
                      onClick={() => handleBuyRedirect(bento.id)}
                    >
                      <h3 className="text-xl font-bold">{bento.product_name}</h3>
                      <Link href="https://mitsuboshifarm.jp/subscription_menu_2.html?course_id=14&srsltid=AfmBOopz8xTCwKeA9lqy6IuNklKcWL28yZhSDocsDtNH7BL7LUzzHPfh" legacyBehavior>
                        <a className="text-blue-500 text-base underline" onClick={(e) => e.stopPropagation()}>詳細はこちら</a>
                      </Link>
                      <p className="text-base font-medium text-gray-700">取引会社: 三ツ星ファーム</p>
                      <p className="text-base font-medium text-gray-700">金額: {bento.price}円</p>
                      <img src={`${bento.img}`} className="w-full h-auto rounded-md" alt={bento.product_name} />
                  </div>
                ) : null
              )
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* 2段目 - 三ツ星ファーム */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          2段目 (三ツ星ファーム)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filterAvailableBentos(bentos.row2).length > 0 ? (
              filterAvailableBentos(bentos.row2).map((bento) =>
                !bento.buies_created ? (
                  <div
                      key={bento.id}
                      className="bg-slate-200 shadow-md rounded-lg p-4 w-full max-w-xs"
                      onClick={() => handleBuyRedirect(bento.id)}
                    >
                      <h3 className="text-xl font-bold">{bento.product_name}</h3>
                      <Link href="https://mitsuboshifarm.jp/subscription_menu_2.html?course_id=14&srsltid=AfmBOopz8xTCwKeA9lqy6IuNklKcWL28yZhSDocsDtNH7BL7LUzzHPfh" legacyBehavior>
                        <a className="text-blue-500 text-base underline" onClick={(e) => e.stopPropagation()}>詳細はこちら</a>
                      </Link>
                      <p className="text-base font-medium text-gray-700">取引会社: 三ツ星ファーム</p>
                      <p className="text-base font-medium text-gray-700">金額: {bento.price}円</p>
                      <img src={`${bento.img}`} className="w-full h-auto rounded-md" alt={bento.product_name} />
                  </div>
                ) : null
              )
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          3段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filterAvailableBentos(bentos.row3).length > 0 ? (
              filterAvailableBentos(bentos.row3).map((bento) =>
                !bento.buies_created ? (
                  <div
                      key={bento.id}
                      className="bg-slate-200 shadow-md rounded-lg p-4 w-full max-w-xs"
                      onClick={() => handleBuyRedirect(bento.id)}
                    >
                      <h3 className="text-xl font-bold">{bento.product_name}</h3>
                      <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat" legacyBehavior>
                        <a className="text-blue-500 text-base underline" onClick={(e) => e.stopPropagation()}>詳細はこちら</a>
                      </Link>
                      <p className="text-base font-medium text-gray-700">取引会社: マッスルデリ</p>
                      <p className="text-base font-medium text-gray-700">金額: {bento.price}円</p>
                      <img src={`${bento.img}`} className="w-full h-auto rounded-md" alt={bento.product_name} />
                  </div>
                ) : null
              )
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          4段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filterAvailableBentos(bentos.row4).length > 0 ? (
              filterAvailableBentos(bentos.row4).map((bento) =>
                !bento.buies_created ? (
                  <div
                      key={bento.id}
                      className="bg-slate-200 shadow-md rounded-lg p-4 w-full max-w-xs"
                      onClick={() => handleBuyRedirect(bento.id)}
                    >
                      <h3 className="text-xl font-bold">{bento.product_name}</h3>
                      <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat" legacyBehavior>
                        <a className="text-blue-500 text-base underline" onClick={(e) => e.stopPropagation()}>詳細はこちら</a>
                      </Link>
                      <p className="text-base font-medium text-gray-700">取引会社: マッスルデリ</p>
                      <p className="text-base font-medium text-gray-700">金額: {bento.price}円</p>
                      <img src={`${bento.img}`} className="w-full h-auto rounded-md" alt={bento.product_name} />
                  </div>
                ) : null
              )
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          5段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {filterAvailableBentos(bentos.row5).length > 0 ? (
              filterAvailableBentos(bentos.row5).map((bento) =>
                !bento.buies_created ? (
                  <div
                      key={bento.id}
                      className="bg-slate-200 shadow-md rounded-lg p-4 w-full max-w-xs"
                      onClick={() => handleBuyRedirect(bento.id)}
                    >
                      <h3 className="text-xl font-bold">{bento.product_name}</h3>
                      <Link
                        href="https://muscledeli.jp/shop/product_categories/md-lowfat"
                        legacyBehavior
                      >
                        <a
                          className="text-blue-500 text-base underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          詳細はこちら
                        </a>
                      </Link>
                      <p className="text-base font-medium text-gray-700">取引会社: マッスルデリ</p>
                      <p className="text-base font-medium text-gray-700">金額: {bento.price}円</p>
                      <img src={`${bento.img}`} className="w-full h-auto rounded-md" alt={bento.product_name} />
                  </div>
                ) : null
              )
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Top;
