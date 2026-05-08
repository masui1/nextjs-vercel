"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import dynamic from "next/dynamic";
import { supabaseClient } from "@/lib/supabaseClient";

const BarcodeScanner = dynamic(() => import("@/app/components/BarcodeScanner"), { ssr: false });

const Create = () => {
  const router = useRouter();
  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [formState, setFormState] = useState({
    selectedProduct: "",
    productName: "",
    tradingCompany: "",
    price: "",
    row: "",
    barcode: "",
    img: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const showImageUpload = isNewProduct || (!isNewProduct && !formState.img);

  // 製品リスト取得
  const fetchProductList = useCallback(async () => {
    try {
      const response = await fetch("/api/master-bentos");
      if (!response.ok) throw new Error("製品データの取得に失敗しました。");
      const data = await response.json();

      // product_name 重複を除外
      const uniqueProducts = data.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.product_name === item.product_name)
      );
      setProductList(uniqueProducts);
      setFilteredProducts(uniqueProducts);
    } catch (error) {
      setErrorMessage(error.message || "API 呼び出しに失敗しました。");
    }
  }, []);

  useEffect(() => {
    fetchProductList();
  }, [fetchProductList]);

  // Select や取引会社変更時
  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setFormState((prev) => ({ ...prev, [field]: value }));

    if (field === "selectedProduct") {
      const product = productList.find((p) => p.product_name === value);
      if (product) {
        setFormState({
          selectedProduct: product.product_name,
          productName: product.product_name,
          tradingCompany: product.trading_company,
          price: product.price,
          row: product.row,
          barcode: product.barcode,
          img: product.img,
        });
        setIsNewProduct(false);
        setFilteredProducts([product]);
      }
    } else if (field === "tradingCompany") {
      setFormState((prev) => ({ ...prev, row: "" }));
    }
  };

  // 手入力による弁当名更新
  const handleManualInput = (e) => {
    const value = e.target.value;

    setFormState((prev) => ({ ...prev, productName: value }));

    // 会社ごとに絞り込む場合はここで条件追加可能
    let filtered = productList.filter((p) => p.product_name.includes(value));

    const existingProduct = productList.find((p) => p.product_name === value);
    if (existingProduct) {
      setIsNewProduct(false);
      setFormState((prev) => ({
        ...prev,
        selectedProduct: existingProduct.product_name,
        productName: existingProduct.product_name,
        tradingCompany: existingProduct.trading_company,
        price: existingProduct.price,
        row: existingProduct.row,
        barcode: existingProduct.barcode,
        img: existingProduct.img,
      }));
      filtered = [existingProduct]; // 完全一致を候補に
    } else {
      setIsNewProduct(true);
      setFormState((prev) => ({ ...prev, selectedProduct: "", img: "" }));
    }

    setFilteredProducts(filtered);
  };

  // 画像アップロード
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseClient.storage
      .from("bento-images")
      .upload(fileName, file);

    if (error) {
      setErrorMessage("画像アップロードに失敗しました");
      return;
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bento-images/${fileName}`;
    setFormState((prev) => ({ ...prev, img: url }));
  };

  // バリデーション
  const validateForm = () => {
    const { productName, tradingCompany, price, row, img } = formState;
    setErrorMessage("");

    if (!productName.trim()) {
      setErrorMessage("弁当名を入力または選択してください。");
      return false;
    }
    if (!tradingCompany || !["三ツ星ファーム", "マッスルデリ"].includes(tradingCompany)) {
      setErrorMessage("取引会社を選択してください。");
      return false;
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMessage("金額は正の数値を入力してください。");
      return false;
    }
    if (!row) {
      setErrorMessage("段数を選択してください。");
      return false;
    }
    if (isNewProduct && !img.trim()) {
      setErrorMessage("新しい弁当を登録する場合は画像をアップロードしてください。");
      return false;
    }

    return true;
  };

  // 登録処理
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const companyId = formState.tradingCompany === "三ツ星ファーム" ? 1 : 2;

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formState, companyId }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "不明なエラー");
      }

      await fetchProductList();
      router.push("/user/top");
    } catch (error) {
      setErrorMessage(`弁当登録に失敗しました: ${error.message}`);
    }
  };

  const availableRows =
    formState.tradingCompany === "三ツ星ファーム"
      ? [1, 2]
      : formState.tradingCompany === "マッスルデリ"
      ? [3, 4, 5]
      : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        届いた弁当を登録画面
      </Typography>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "16px", width: "300px" }}
      >
        <TextField
          label="弁当名 (手動入力)"
          value={formState.productName}
          onChange={handleManualInput}
          fullWidth
          required
        />

        <FormControl>
          <InputLabel>該当する弁当名を選択</InputLabel>
          <Select value={formState.selectedProduct} onChange={handleChange("selectedProduct")}>
            {filteredProducts.map((item) => (
              <MenuItem key={item.product_name} value={item.product_name}>
                {item.product_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="取引会社"
          select
          value={formState.tradingCompany}
          onChange={handleChange("tradingCompany")}
          fullWidth
          required
        >
          <MenuItem value="三ツ星ファーム">三ツ星ファーム</MenuItem>
          <MenuItem value="マッスルデリ">マッスルデリ</MenuItem>
        </TextField>

        <TextField
          label="金額"
          value={formState.price}
          onChange={handleChange("price")}
          type="number"
          fullWidth
          required
        />

        <FormControl fullWidth required>
          <InputLabel>段数</InputLabel>
          <Select value={formState.row || ""} onChange={handleChange("row")} disabled={!formState.tradingCompany}>
            {availableRows.map((v) => (
              <MenuItem key={v} value={v}>
                {v}段目
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {showImageUpload && (
          <label htmlFor="fileInput" style={{ cursor: "pointer", color: "#1976d2" }}>
            📷 画像を選択
            <input
              id="fileInput"
              type="file"
              accept="image/*,.png,.jpg,.jpeg,.heic"
              style={{
                opacity: 0,
                position: "absolute",
                width: "1px",
                height: "1px",
              }}
              onChange={handleFileUpload}
            />
          </label>
        )}

        <Box>
          <Typography variant="h6">バーコードスキャン</Typography>
          <BarcodeScanner
            onDetected={(barcode) => setFormState((prev) => ({ ...prev, barcode }))}
          />
          <Typography>バーコード: {formState.barcode || "スキャン待機中..."}</Typography>
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

      <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => router.back()}>
        戻る
      </Button>
    </Box>
  );
};

export default Create;
