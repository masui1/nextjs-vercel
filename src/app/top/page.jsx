'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Box, Button, Toolbar, Typography, TextField, CircularProgress, Card, CardContent } from '@mui/material';

const Top = () => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [bentos, setBentos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/bentos');

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const responseBody = await response.text();

        const data = responseBody ? JSON.parse(responseBody) : [];
        setBentos(data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) return;
    const params = new URLSearchParams({
      q: search,
    });
  
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
  
      const data = await response.json();
      setBentos(data);
    } catch (error) {
      console.error('検索に失敗しました:', error);
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
            size="small"
          />
          <Button
            onClick={handleSearch}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            検索
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              onClick={() => router.push('/top/create')}
              variant="contained"
              color="primary"
            >
              登録はこちらへ
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          登録された弁当一覧
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {bentos.map((bento) => (
              <Card key={bento.id} sx={{ minWidth: 250, maxWidth: 250 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {bento.tradingCompany}
                  </Typography>
                  <Typography variant="body2">
                    商品: {bento.lostProduct}
                  </Typography>
                  <Typography variant="body2">
                    金額: {bento.price}円
                  </Typography>
                  <Typography variant="body2">
                    時間: {new Date(bento.datetimeEnd).toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Top;
