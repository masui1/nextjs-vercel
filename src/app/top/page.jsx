'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography, TextField, CircularProgress, Card, CardContent } from '@mui/material';

const Top = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [bentos, setBentos] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/bentos');
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        const data = await response.json();
        setBentos(data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
        setError(`データの取得に失敗しました: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleSearch = async () => {
    setError(null);
    setLoading(true);
    const params = new URLSearchParams({ q: search });

    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      if (!response.ok) throw new Error('検索結果の取得に失敗しました。');
      const data = await response.json();
      setBentos(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">弁当管理サイト</Typography>
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
          <Button onClick={() => router.push('/top/create')} variant="contained" color="primary">
            弁当の登録はこちらへ
          </Button>
        </Toolbar>
      </AppBar>

    
      <Box sx={{ p: 2 }}>
        {/* 1〜3段目 */}
        {Array.from({ length: 3 }, (_, index) => (
          <Box key={index} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {`${index + 1}段目`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {bentos.map((bento) => (
                  <Card key={bento.id} sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}>
                    <CardContent>
                    <Typography variant="h6" gutterBottom>商品: {bento.lostproduct}</Typography>
                      <Link href="https://mitsuboshifarm.jp/subscription_menu.html?course_id=14&srsltid=AfmBOorpinR4pGt4x2_t8nzDFpYVqHMK-sZDmGZ4xkQNFg5iRLr5tXde">
                        詳細はこちら
                      </Link>
                      <Typography variant="body2">取引企業: {bento.tradingcompany}</Typography>
                      <Typography variant="body2">金額: {bento.price}円</Typography>
                      <Button onClick={() => router.push(`/top/edit/${bento.id}`)} variant="contained" color="primary">
                        弁当の編集はこちらへ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        ))}

        {/* 4〜5段目 */}
        {Array.from({ length: 2 }, (_, index) => (
          <Box key={index + 3} sx={{ p: 2 }}>
            <Typography variant="h5" gutterBottom>
              {`${index + 4}段目`}
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {bentos.map((bento) => (
                  <Card key={bento.id} sx={{ whiteSpace: 'nowrap', minWidth: 400, maxWidth: 400 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {bento.tradingcompany}
                      </Typography>
                      <Link href="https://muscledeli.jp/shop/product_categories/md-lowfat?gad_source=1&gclid=CjwKCAiAgoq7BhBxEiwAVcW0LEqVZ9JUQErZtAtbQoMcHPrm8ou88y-tbYfFvW0oXvulKmmz_7jAVhoCEEMQAvD_BwE">
                        詳細はこちら
                      </Link>
                      <Typography variant="body2">商品: {bento.lostproduct}</Typography>
                      <Typography variant="body2">金額: {bento.price}円</Typography>
                      <Button onClick={() => router.push(`/top/edit/${bento.id}`)} variant="contained" color="primary">
                        弁当の編集はこちらへ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Top;
