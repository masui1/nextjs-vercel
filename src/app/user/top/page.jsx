'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography, TextField, CircularProgress, Card, CardContent } from '@mui/material';

const UserTop = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
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
      const response = await fetch(`/api/user/bentos?companyId=${companyId}&row=${row}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data = await response.json();
      const filteredData = data.filter(bento => !bento.buies_created);
      return filteredData;
    } catch (error) {
      setError(`データの取得に失敗しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      const dataForRow1 = await fetchData(1, 1); // company_id:1, row:1
      const dataForRow2 = await fetchData(1, 2); // company_id:1, row:2
      const dataForRow3 = await fetchData(2, 3); // company_id:2, row:3
      const dataForRow4 = await fetchData(2, 4); // company_id:2, row:4
      const dataForRow5 = await fetchData(2, 5); // company_id:2, row:5

      setBentos({
        row1: dataForRow1,
        row2: dataForRow2,
        row3: dataForRow3,
        row4: dataForRow4,
        row5: dataForRow5,
      });
    };

    fetchAllData();
  }, []);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams({ q: search });

    try {
      const response = await fetch(`/api/user/search?${params.toString()}`);
      if (!response.ok) throw new Error('検索結果の取得に失敗しました。');
      const data = await response.json();
      const filteredData = data.filter(bento => !bento.buies_created);
      setBentos({
        row1: filteredData.slice(0, 1), // row1
        row2: filteredData.slice(1, 2), // row2
        row3: filteredData.slice(2, 3), // row3
        row4: filteredData.slice(3, 4), // row4
        row5: filteredData.slice(4, 5), // row5
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ backgroundColor: '#9acd32' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" color="inherit">管理者用弁当管理サイト</Typography>
          <TextField
            label="弁当名"
            variant="outlined"
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            size="small"
          />
          <Button onClick={handleSearch} variant="contained" color="primary" disabled={loading}>
            検索
          </Button>
          <Button onClick={() => router.push('/user/top/create')} variant="contained" color="primary">
            弁当の登録はこちらへ
          </Button>
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
            {bentos.row1.length > 0 ? (
              bentos.row1.map((bento) => (
                <Card
                  key={bento.id}
                  sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      商品: {bento.lostproduct}
                    </Typography>
                    <Link href="https://mitsuboshifarm.jp/subscription_menu_2.html?course_id=14&srsltid=AfmBOopz8xTCwKeA9lqy6IuNklKcWL28yZhSDocsDtNH7BL7LUzzHPfh">
                      詳細はこちら
                    </Link>
                    <Typography variant="body1">取引会社: 三ツ星ファーム</Typography>
                    <Typography variant="body2">金額: {bento.price}円</Typography>
                    <Button onClick={() => router.push(`/user/top/edit/${bento.id}`)} variant="contained" color="primary">
                      弁当の編集はこちらへ
                    </Button>
                  </CardContent>
                </Card>
              ))
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
            {bentos.row2.length > 0 ? (
              bentos.row2.map((bento) => (
                <Card
                  key={bento.id}
                  sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      商品: {bento.lostproduct}
                    </Typography>
                    <Link href="https://mitsuboshifarm.jp/subscription_menu_2.html?course_id=14&srsltid=AfmBOopz8xTCwKeA9lqy6IuNklKcWL28yZhSDocsDtNH7BL7LUzzHPfh">
                      詳細はこちら
                    </Link>
                    <Typography variant="body1">取引会社: 三ツ星ファーム</Typography>
                    <Typography variant="body2">金額: {bento.price}円</Typography>
                    <Button onClick={() => router.push(`/user/top/edit/${bento.id}`)} variant="contained" color="primary">
                      弁当の編集はこちらへ
                    </Button>
                  </CardContent>
                </Card>
              ))
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
            {bentos.row3.length > 0 ? (
              bentos.row3.map((bento) => (
                <Card
                  key={bento.id}
                  sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      商品: {bento.lostproduct}
                    </Typography>
                    <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat?gad_source=1&gclid=CjwKCAiAgoq7BhBxEiwAVcW0LEqVZ9JUQErZtAtbQoMcHPrm8ou88y-tbYfFvW0oXvulKmmz_7jAVhoCEEMQAvD_BwE">
                      詳細はこちら
                    </Link>
                    <Typography variant="body1">取引会社: マッスルデリ</Typography>
                    <Typography variant="body2">金額: {bento.price}円</Typography>
                    <Button onClick={() => router.push(`/user/top/edit/${bento.id}`)} variant="contained" color="primary">
                      弁当の編集はこちらへ
                    </Button>
                  </CardContent>
                </Card>
              ))
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
            {bentos.row4.length > 0 ? (
              bentos.row4.map((bento) => (
                <Card
                  key={bento.id}
                  sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      商品: {bento.lostproduct}
                    </Typography>
                    <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat?gad_source=1&gclid=CjwKCAiAgoq7BhBxEiwAVcW0LEqVZ9JUQErZtAtbQoMcHPrm8ou88y-tbYfFvW0oXvulKmmz_7jAVhoCEEMQAvD_BwE">
                      詳細はこちら
                    </Link>
                    <Typography variant="body1">取引会社: マッスルデリ</Typography>
                    <Typography variant="body2">金額: {bento.price}円</Typography>
                    <Button onClick={() => router.push(`/user/top/edit/${bento.id}`)} variant="contained" color="primary">
                      弁当の編集はこちらへ
                    </Button>
                  </CardContent>
                </Card>
              ))
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
            {bentos.row5.length > 0 ? (
              bentos.row5.map((bento) => (
                <Card
                  key={bento.id}
                  sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      商品: {bento.lostproduct}
                    </Typography>
                    <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat?gad_source=1&gclid=CjwKCAiAgoq7BhBxEiwAVcW0LEqVZ9JUQErZtAtbQoMcHPrm8ou88y-tbYfFvW0oXvulKmmz_7jAVhoCEEMQAvD_BwE">
                      詳細はこちら
                    </Link>
                    <Typography variant="body1">取引会社: マッスルデリ</Typography>
                    <Typography variant="body2">金額: {bento.price}円</Typography>
                    <Button onClick={() => router.push(`/user/top/edit/${bento.id}`)} variant="contained" color="primary">
                      弁当の編集はこちらへ
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="body1">データがありません</Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserTop;
