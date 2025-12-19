'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
} from '@mui/material';

const EditTop = () => {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [tradingCompany, setTradingCompany] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [row, setRow] = useState('');
  const [barcode, setBarcode] = useState('');

  // Master
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState('');

  // 画像
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  /* =====================
     ID取得
  ===================== */
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    setId(pathParts[pathParts.length - 1]);
  }, []);

  /* =====================
     編集対象Bento取得
  ===================== */
  useEffect(() => {
    if (!id) return;

    const fetchBento = async () => {
      const res = await fetch(`/api/users/edit/${id}`);
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error);
        return;
      }

      setTradingCompany(data.tradingCompany);
      setProductName(data.productName);
      setPrice(data.price);
      setRow(data.row);
      setBarcode(data.barcode);
      setImagePreview(data.img || '');
    };

    fetchBento();
  }, [id]);

  /* =====================
     MasterBentos取得
  ===================== */
  useEffect(() => {
    const fetchMasters = async () => {
      const res = await fetch('/api/masters');
      const data = await res.json();
      if (res.ok) setMasters(data);
    };
    fetchMasters();
  }, []);

  /* =====================
     Master反映
  ===================== */
  const handleMasterChange = (masterId) => {
    setSelectedMaster(masterId);
    const master = masters.find((m) => m.id === masterId);
    if (!master) return;

    setTradingCompany(master.trading_company);
    setProductName(master.product_name);
    setPrice(master.price);
    setBarcode(master.barcode);
  };

  /* =====================
     画像選択
  ===================== */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /* =====================
     更新
  ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tradingCompany || !productName || !price || !row) {
      setErrorMessage('未入力項目があります');
      return;
    }

    const formData = new FormData();
    formData.append('tradingCompany', tradingCompany);
    formData.append('productName', productName);
    formData.append('price', price);
    formData.append('row', row);
    formData.append('barcode', barcode);
    if (imageFile) formData.append('image', imageFile);

    const res = await fetch(`/api/users/edit/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      const data = await res.json();
      setErrorMessage(data.error);
      return;
    }

    router.push('/user/top');
  };

  /* =====================
     削除
  ===================== */
  const handleDelete = async () => {
    const res = await fetch(`/api/users/edit/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setErrorMessage(data.message);
      return;
    }
    router.push('/user/top');
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        届いた弁当の編集画面
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
            label="取引会社"
            value={tradingCompany}
            onChange={(e) => setTradingCompany(e.target.value)}
            fullWidth sx={{ mb: 2 }}
        />
        <TextField
            label="商品名" 
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            fullWidth sx={{ mb: 2 }}
        />
        <TextField
          label="金額"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          InputProps={{ endAdornment: <InputAdornment position="end">円</InputAdornment> }}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField label="段目" value={row} onChange={(e) => setRow(e.target.value)} fullWidth sx={{ mb: 2 }} />

        <Typography>バーコード: {barcode}</Typography>

        <Button component="label" sx={{ mt: 2 }}>
          画像変更
          <input hidden type="file" accept="image/*" onChange={handleImageChange} />
        </Button>

        {imagePreview && (
          <Box sx={{ mt: 2 }}>
            <img src={imagePreview} alt="preview" width="100%" />
          </Box>
        )}

        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
          編集
        </Button>
        <Button 
            variant='contained'
            color='error'
            fullWidth sx={{ mt: 2 }} 
            onClick={handleDelete}
        >
          削除
        </Button>
      </form>
      {errorMessage && (
        <Typography color='error' sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}
      <Button
        variant="contained"
        color="secondary"
        fullWidth
        sx={{ mt: 2 }}
        onClick={() => router.back()}
      >
        戻る
      </Button>
    </Box>
  );
};

export default EditTop;
