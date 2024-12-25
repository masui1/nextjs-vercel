'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, CircularProgress, Card, CardContent } from '@mui/material';

const BuyTop = () => {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [bentos, setBentos] = useState({ row1: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const bentoId = pathParts[pathParts.length - 1];
    setId(bentoId);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/buy/${id}`, { method: 'GET' });
          const data = await response.json();
          if (response.ok) {
            setBentos({ row1: [data] });
          } else {
            setErrorMessage(data.error || 'データ取得に失敗しました');
          }
        } catch (error) {
          setErrorMessage('ネットワークエラーが発生しました');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (bentoId) => {
    try {
      const response = await fetch(`/api/buy/${bentoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_purchased: true }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(`購入に失敗しました: ${data.error || '不明なエラー'}`);
        return;
      }

      setBentos((prevState) => ({
        row1: prevState.row1.map((bento) =>
          bento.id === bentoId ? { ...bento, is_purchased: true } : bento
        ),
      }));
      setErrorMessage('');
      router.push('/top');
    } catch (error) {
      setErrorMessage('ネットワークエラーが発生しました');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
      <Typography variant="h4" gutterBottom>購入画面</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : bentos.row1.length > 0 ? (
          bentos.row1.map((bento) => (
            <Card key={bento.id} sx={{ minWidth: 400, maxWidth: 400 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>商品: {bento.lostproduct}</Typography>
                <Typography variant="body1">取引会社: {bento.tradingcompany}</Typography>
                <Typography variant="body2">金額: {bento.price}円</Typography>
                <Typography variant="body2">購入済み: {bento.is_purchased ? 'はい' : 'いいえ'}</Typography>
                <Button
                  onClick={() => handleSubmit(bento.id)}
                  variant="contained"
                  color="primary"
                  disabled={bento.is_purchased}
                >
                  {bento.is_purchased ? '購入済み' : '購入'}
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1">データがありません</Typography>
        )}
      </Box>
      {errorMessage && (
        <Typography color="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}
      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 2 }}
        onClick={() => router.push('/top')}
      >
        戻る
      </Button>
    </Box>
  );
};

export default BuyTop;
