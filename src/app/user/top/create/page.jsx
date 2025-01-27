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
import BarcodeScanner from "@/app/components/BarcodeScanner";

const Create = () => {
    const router = useRouter();
    const [productList, setProductList] = useState([]);
    const [tradingCompany, setTradingCompany] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
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

    const fetchProductList = useCallback(async () => {
        try {
            const response = await fetch("/api/product");
            if (response.ok) {
                const data = await response.json();
                setProductList(data);
                setFilteredProducts(data);
            } else {
                throw new Error("製品データの取得に失敗しました。");
            }
        } catch (error) {
            setErrorMessage(error.message || "API 呼び出しに失敗しました。");
        }
    }, []);

    useEffect(() => {
        fetchProductList();
    }, [fetchProductList]);

    const handleChange = (field) => (event) => {
        const value = event.target.value;
        setFormState((prevState) => ({
            ...prevState,
            [field]: value,
        }));

        if (field === "selectedProduct") {
            const product = productList.find((item) => item.product_name === value);
            if (product) {
                setFormState({
                    selectedProduct: product.product_name,
                    productName: product.product_name,
                    tradingCompany: product.trading_company,
                    price: product.price,
                    row: product.row || "",
                    barcode: product.barcode || "",
                    img: product.img,
                });
                setTradingCompany(product.trading_company);
            }
        }
    };

    const validateForm = () => {
        const { productName, tradingCompany, price, row } = formState;
    
        // 弁当名は入力が必須（手動入力または選択）
        if (!productName) {
            setErrorMessage("弁当名を入力または選択してください。");
            return false;
        }
    
        // 取引会社が選択されているか
        if (!tradingCompany || (tradingCompany !== "三ツ星ファーム" && tradingCompany !== "マッスルデリ")) {
            setErrorMessage("取引会社を選択してください。");
            return false;
        }
    
        // 金額が正の数値であること
        if (!price || isNaN(price) || price <= 0) {
            setErrorMessage("金額は正の数値を入力してください。");
            return false;
        }
    
        // 段数が選択されているか
        if (!row) {
            setErrorMessage("段数を選択してください。");
            return false;
        }
    
        // エラーメッセージをリセット
        setErrorMessage("");
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        const { tradingCompany, productName, price, row, barcode, img } = formState;

        const companyId = tradingCompany === "三ツ星ファーム" ? 1 : tradingCompany === "マッスルデリ" ? 2 : null;

        try {
            const response = await fetch("/api/users/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    companyId,
                    tradingCompany,
                    productName,
                    price,
                    row,
                    barcode,
                    img,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "不明なエラー");
            }

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

    const handleManualInput = (e) => {
        const value = e.target.value;
        setFormState((prevState) => ({
            ...prevState,
            productName: value,
        }));

        const filtered = productList.filter((item) =>
            item.product_name.includes(value)
        );
        setFilteredProducts(filtered);
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 4,
            }}
        >
            <Typography variant="h4" gutterBottom>
                届いた弁当を登録画面
            </Typography>
            <form
                onSubmit={handleSubmit}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                    width: "300px",
                }}
            >
                <TextField
                    label="弁当名"
                    value={formState.productName}
                    onChange={handleManualInput}
                    fullWidth
                />
                <FormControl>
                    <InputLabel>該当する弁当名</InputLabel>
                    <Select
                        value={formState.selectedProduct}
                        onChange={(e) => handleChange("selectedProduct")(e)}
                    >
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
                >
                    <MenuItem value="三ツ星ファーム">三ツ星ファーム</MenuItem>
                    <MenuItem value="マッスルデリ">マッスルデリ</MenuItem>
                </TextField>
                <TextField label="金額" value={formState.price} onChange={handleChange("price")} fullWidth />

                <FormControl fullWidth>
                    <InputLabel>段数</InputLabel>
                    <Select
                        value={formState.row || ""}
                        onChange={handleChange("row")}
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
                    <BarcodeScanner onDetected={(barcode) => setFormState((prevState) => ({ ...prevState, barcode }))} />
                    <Typography variant="body1" gutterBottom>
                        バーコード: {formState.barcode || "スキャン待機中..."}
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
                onClick={() => router.back()}
            >
                戻る
            </Button>
        </Box>
    );
};

export default Create;
