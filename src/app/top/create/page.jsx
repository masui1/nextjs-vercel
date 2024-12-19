'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Button, TextField } from '@mui/material';

const Create = () => {
    const router = useRouter();
    const [tradingCompany, setTradingCompany] = useState('');
    const [lostProduct, setLostProduct] = useState('');
    const [datetimeEnd, setDatetimeEnd] = useState('');
    const [price, setPrice] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ tradingCompany, lostProduct, datetimeEnd, price }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: '不明なサーバーエラーが発生しました。',
                }));
                setErrorMessage(`弁当登録に失敗しました: ${errorData.error || '不明なエラー'}`);
                return;
            }
            router.push('/top');
        } catch (error) {
            setErrorMessage('ネットワークエラーが発生しました。');
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                届いた弁当を登録画面
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
                    label="無くなった時間"
                    type="datetime-local"
                    value={datetimeEnd}
                    onChange={(e) => setDatetimeEnd(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="金額"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
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

export default Create;
