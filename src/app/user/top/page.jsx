'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography, TextField, CircularProgress, IconButton, Select, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const UserTop = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState(null); 
  const [productList, setProductList] = useState([]);
  const [bentos, setBentos] = useState({
    row1: [],
    row2: [],
    row3: [],
    row4: [],
    row5: [],
  });
  const [selectedRow, setSelectedRow] = useState('row1');
  const [showButton, setShowButton] = useState(false); 
  const [buttonColor, setButtonColor] = useState('secondary');
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchData = async (companyId, row) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/bentos?companyId=${companyId}&row=${row}`);
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

  const fetchProductList = async () => {
    try {
      const response = await fetch('/api/product');
      if (!response.ok) {
        throw new Error('Failed to fetch product list');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      setError(`Error fetching product list: ${error.message}`);
    }
  };

  useEffect(() => {
    const getProductList = async () => {
      const productList = await fetchProductList();
      setProductList(productList);
    };
    getProductList();
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

  const handleRowChange = (event) => {
    setSelectedRow(event.target.value);
    const targetElement = document.getElementById(event.target.value);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
      const handleScroll = () => {
        const rowIds = ['row2', 'row3', 'row4', 'row5'];
        
        let isAnyRowInViewport = false;
    
        rowIds.forEach((rowId) => {
          const rowElement = document.getElementById(rowId);
          if (rowElement) {
            const rect = rowElement.getBoundingClientRect();
            const isInViewport = rect.top <= window.innerHeight && rect.bottom >= 0;
    
            if (isInViewport) {
              isAnyRowInViewport = true;
              setButtonColor('primary');
            }
          }
        });
  
        setShowButton(isAnyRowInViewport);
      };
    
      window.addEventListener('scroll', handleScroll);
    
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  
    const handleScrollToTop = () => {
      document.getElementById('header').scrollIntoView({ behavior: 'smooth' });
    };

  return (
    <Box>
      <AppBar id="header" position="static" sx={{ backgroundColor: '#9acd32' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" color="inherit">弁当一覧</Typography>
          <Typography variant="body1">
            ユーザー: {users && users.username ? users.username : '未ログイン'}
          </Typography>
          <Select
            value={selectedRow}
            size="small"
            color="primary"
            onChange={handleRowChange}
            sx={{ width: 250 }}
          >
            <MenuItem value="row1">1段目 (三ツ星ファーム)</MenuItem>
            <MenuItem value="row2">2段目 (三ツ星ファーム)</MenuItem>
            <MenuItem value="row3">3段目 (マッスルデリ)</MenuItem>
            <MenuItem value="row4">4段目 (マッスルデリ)</MenuItem>
            <MenuItem value="row5">5段目 (マッスルデリ)</MenuItem>
          </Select>
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
            <Button onClick={() => router.push('/user/top/create')} variant="contained" color="primary">
              弁当の登録はこちらへ
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 1段目 - 三ツ星ファーム */}
      <Box id="row1" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          1段目 (三ツ星ファーム)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.row1.length > 0 ? (
              bentos.row1.map((bento) => (
                <div
                  key={bento.id}
                  className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
                  style={{
                    backgroundImage: `url(${bento.img})`,
                    height: '300px',
                  }}
                  onClick={() => router.push(`/user/top/edit/${bento.id}`)}
                >
                  <div className="absolute inset-0 rounded-lg flex flex-col justify-end">
                    <div className="w-full bg-black bg-opacity-40 p-4 rounded-b-lg">
                      <h3 className="text-xl font-bold text-white">
                        {bento.product_name}
                      </h3>
                      <p className="text-base font-medium text-gray-200 mt-2">
                        取引会社: 三ツ星ファーム
                      </p>
                      <p className="text-base font-medium text-gray-200 mt-2">
                        金額: {bento.price}円
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* 2段目 - 三ツ星ファーム */}
      <Box id="row2" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          2段目 (三ツ星ファーム)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.row2.length > 0 ? (
              bentos.row2.map((bento) => (
                <div
                key={bento.id}
                className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
                style={{
                  backgroundImage: `url(${bento.img})`,
                  height: '300px',
                }}
                onClick={() => router.push(`/user/top/edit/${bento.id}`)}
              >
                <div className="absolute inset-0 rounded-lg flex flex-col justify-end">
                  <div className="w-full bg-black bg-opacity-40 p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold text-white">
                      {bento.product_name}
                    </h3>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      取引会社: 三ツ星ファーム
                    </p>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      金額: {bento.price}円
                    </p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
        {showButton && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleScrollToTop}
              sx={{
                transition: 'background-color 0.3s ease',
              }}
            >
              ↑
            </Button>
          </Box>
        )}
      </Box>

      <Box id="row3" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          3段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.row3.length > 0 ? (
              bentos.row3.map((bento) => (
                <div
                key={bento.id}
                className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
                style={{
                  backgroundImage: `url(${bento.img})`,
                  height: '300px',
                }}
                onClick={() => router.push(`/user/top/edit/${bento.id}`)}
              >
                <div className="absolute inset-0 rounded-lg flex flex-col justify-end">
                  <div className="w-full bg-black bg-opacity-40 p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold text-white">
                      {bento.product_name}
                    </h3>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      取引会社: マッスルデリ
                    </p>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      金額: {bento.price}円
                    </p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
        {showButton && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleScrollToTop}
              sx={{
                transition: 'background-color 0.3s ease',
              }}
            >
              ↑
            </Button>
          </Box>
        )}
      </Box>

      <Box id="row4" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          4段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.row4.length > 0 ? (
              bentos.row4.map((bento) => (
                <div
                key={bento.id}
                className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
                style={{
                  backgroundImage: `url(${bento.img})`,
                  height: '300px',
                }}
                onClick={() => router.push(`/user/top/edit/${bento.id}`)}
              >
                <div className="absolute inset-0 rounded-lg flex flex-col justify-end">
                  <div className="w-full bg-black bg-opacity-40 p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold text-white">
                      {bento.product_name}
                    </h3>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      取引会社: マッスルデリ
                    </p>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      金額: {bento.price}円
                    </p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
        {showButton && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleScrollToTop}
              sx={{
                transition: 'background-color 0.3s ease',
              }}
            >
              ↑
            </Button>
          </Box>
        )}
      </Box>

      <Box id="row5" sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          5段目 (マッスルデリ)
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.row5.length > 0 ? (
              bentos.row5.map((bento) => (
                <div
                key={bento.id}
                className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
                style={{
                  backgroundImage: `url(${bento.img})`,
                  height: '300px',
                }}
                onClick={() => router.push(`/user/top/edit/${bento.id}`)}
              >
                <div className="absolute inset-0 rounded-lg flex flex-col justify-end">
                  <div className="w-full bg-black bg-opacity-40 p-4 rounded-b-lg">
                    <h3 className="text-xl font-bold text-white">
                      {bento.product_name}
                    </h3>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      取引会社: マッスルデリ
                    </p>
                    <p className="text-base font-medium text-gray-200 mt-2">
                      金額: {bento.price}円
                    </p>
                  </div>
                </div>
              </div>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
        {showButton && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            <Button
              variant="contained"
              color={buttonColor}
              onClick={handleScrollToTop}
              sx={{
                transition: 'background-color 0.3s ease',
              }}
            >
              ↑
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserTop;
