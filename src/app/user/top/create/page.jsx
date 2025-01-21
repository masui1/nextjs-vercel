'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Typography, Box, Button, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import BarcodeScanner from '@/app/components/BarcodeScanner';

const Create = () => {
    const router = useRouter();
    const [productList, setProductList] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [productName, setProductName] = useState('');
    const [tradingCompany, setTradingCompany] = useState('');
    const [price, setPrice] = useState('');
    const [row, setRow] = useState('');
    const [barcode, setBarcode] = useState('');
    const [img, setImg] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isManualInput, setIsManualInput] = useState(false);

    useEffect(() => {
        async function fetchProductList() {
            try {
                const response = await fetch('/api/product');
                if (response.ok) {
                    const data = await response.json();
                    setProductList(data);
                } else {
                    setErrorMessage('製品データの取得に失敗しました。');
                }
            } catch (error) {
                setErrorMessage('API 呼び出しに失敗しました。');
            }
        }
        fetchProductList();
    }, []);

    const handleProductChange = (event) => {
        const selected = event.target.value;
        setSelectedProduct(selected);

        const product = productList.find((item) => item.product_name === selected);
        if (product) {
            setProductName(product.product_name);
            setTradingCompany(product.trading_company);
            setPrice(product.price);
            setRow(product.row || '');
            setBarcode(product.barcode || '');
            setImg(product.img);
        }
    };

    const handleProductInputChange = (event) => {
        setProductName(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!productName || !tradingCompany || !price || !row) {
            setErrorMessage('全ての項目を入力してください。');
            return;
        }

        // 価格が数値かチェック
        if (isNaN(price) || price <= 0) {
            setErrorMessage('金額は正の数値を入力してください。');
            return;
        }

        let companyId = null;
        if (tradingCompany === '三ツ星ファーム') {
            companyId = 1;
        } else if (tradingCompany === 'マッスルデリ') {
            companyId = 2;
        }

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ companyId, tradingCompany, productName, price, row, barcode, img }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setErrorMessage(`弁当登録に失敗しました: ${errorData.error || '不明なエラー'}`);
                return;
            }

            router.push('/user/top');
        } catch (error) {
            setErrorMessage('ネットワークエラーが発生しました。');
        }
    };

    const availableRows = tradingCompany === '三ツ星ファーム' ? [1, 2] : tradingCompany === 'マッスルデリ' ? [3, 4, 5] : [];
    useEffect(() => {
        if (availableRows.length === 0) {
            setRow('');
        }
    }, [availableRows]);

    // productList を手入力の検索に合わせてフィルタリング
    const filteredProductList = productList.filter((item) =>
        item.product_name.toLowerCase().includes(productName.toLowerCase())
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                届いた弁当を登録画面
            </Typography>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '300px' }}>
                <TextField
                    label="弁当名"
                    select={!isManualInput}
                    value={selectedProduct}
                    onChange={handleProductChange}
                    fullWidth
                >
                    {!isManualInput && filteredProductList.map((item) => (
                        <MenuItem key={item.product_name} value={item.product_name}>
                            {item.product_name}
                        </MenuItem>
                    ))}
                </TextField>
                
                <TextField
                    label="手動入力"
                    value={productName}
                    onChange={handleProductInputChange}
                    fullWidth
                    disabled={isManualInput}
                />

                <Button onClick={() => setIsManualInput(!isManualInput)} sx={{ mb: 2 }}>
                    {isManualInput ? 'セレクトで選ぶ' : '手動入力で選ぶ'}
                </Button>

                <TextField
                    label="取引会社"
                    value={tradingCompany}
                    fullWidth
                    disabled
                />
                <TextField
                    label="金額"
                    value={price}
                    fullWidth
                    disabled
                />
                <FormControl fullWidth>
                    <InputLabel>段数</InputLabel>
                    <Select
                        value={row || ''}
                        onChange={(e) => setRow(e.target.value)}
                        label="段目"
                    >
                        {availableRows.map((value) => (
                            <MenuItem key={value} value={value}>
                                {value}段目
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Box>
                    <Typography variant="h6" gutterBottom>
                        バーコードスキャン
                    </Typography>
                    <BarcodeScanner onDetected={setBarcode} />
                    <Typography variant="body1" gutterBottom>
                        バーコード: {barcode || 'スキャン待機中...'}
                    </Typography>
                </Box>

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
