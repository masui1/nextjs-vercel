'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Typography, TextField, InputAdornment } from '@mui/material';

const EditTop = () => {
    const router = useRouter();
    const [id, setId] = useState(null);
    const [tradingCompany, setTradingCompany] = useState('');
    const [lostProduct, setLostProduct] = useState('');
    const [price, setPrice] = useState('');
    const [row, setRow] = useState('');
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
                    const response = await fetch(`/api/users/edit/${id}`, { method: 'GET' });
                    const data = await response.json();
    
                    if (response.ok) {
                        setTradingCompany(data.tradingcompany);
                        setLostProduct(data.lostproduct);
                        setPrice(data.price);
                        setRow(data.row);
                    } else {
                        setErrorMessage(data.error || 'データ取得に失敗しました');
                    }
                } catch (error) {
                    setErrorMessage('ネットワークエラーが発生しました');
                }
            };
    
            fetchData();
        }
    }, [id]);

    const handleSubmit = async (event) => {
        event.preventDefault();
    
        try {
            const response = await fetch(`/api/users/edit/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tradingCompany, lostProduct, price, row }),
            });
    
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: '不明なサーバーエラーが発生しました。',
                }));
                setErrorMessage(`弁当更新に失敗しました: ${errorData.error || '不明なエラー'}`);
                return;
            }
    
            router.push('/user/top');
        } catch (error) {
            setErrorMessage('ネットワークエラーが発生しました。');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                届いた弁当の編集画面
            </Typography>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
                <TextField
                    label="取引会社"
                    value={tradingCompany}
                    onChange={(e) => setTradingCompany(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="無くなった品"
                    value={lostProduct}
                    onChange={(e) => setLostProduct(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="金額"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: <InputAdornment position="end">円</InputAdornment>,
                    }}
                />
                <TextField
                    label="段目"
                    value={row}
                    onChange={(e) => setRow(e.target.value)}
                    fullWidth
                    InputProps={{
                        endAdornment: <InputAdornment position="end">段目</InputAdornment>,
                    }}
                />
                <Button type="submit" variant="contained" color="primary">
                    登録
                </Button>
            </form>
            {errorMessage && (
                <Typography color="error" sx={{ mt: 2 }}>
                    {errorMessage}
                </Typography>
            )}
            <Button
                variant="contained"
                color="secondary"
                sx={{ mt: 2 }}
                onClick={() => {
                    router.back();
                }}
            >
                戻る
            </Button>
        </Box>
    );
};

export default EditTop;
