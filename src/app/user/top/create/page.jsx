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
    const [productList, setProductList] = useState([]); // 全製品リスト
    const [filteredProducts, setFilteredProducts] = useState([]); // フィルタリングされたリスト
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
    const [isManualInput, setIsManualInput] = useState(false);

    const fetchProductList = useCallback(async () => {
        try {
            const response = await fetch("/api/product");
            if (response.ok) {
                const data = await response.json();
                setProductList(data);
                setFilteredProducts(data); // 初期値として全リストを設定
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
            }
        }
    };

    const validateForm = () => {
        const { productName, tradingCompany, price, row } = formState;

        if (!productName || !tradingCompany || !price || !row) {
            setErrorMessage("全ての項目を入力してください。");
            return false;
        }

        if (isNaN(price) || price <= 0) {
            setErrorMessage("金額は正の数値を入力してください。");
            return false;
        }

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
                body: JSON.stringify({ companyId, tradingCompany, productName, price, row, barcode, img }),
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

    const toggleManualInput = () => {
        setIsManualInput(!isManualInput);
        setFilteredProducts(productList); // リストをリセット
        setFormState((prevState) => ({
            ...prevState,
            selectedProduct: "",
            productName: "",
        }));
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

        // 入力値でフィルタリング
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
                    select={!isManualInput}
                    value={isManualInput ? "" : formState.selectedProduct}
                    onChange={handleChange("selectedProduct")}
                    fullWidth
                    disabled={isManualInput}
                >
                    {!isManualInput &&
                        productList.map((item) => (
                            <MenuItem key={item.product_name} value={item.product_name}>
                                {item.product_name}
                            </MenuItem>
                        ))}
                </TextField>

                <TextField
                    label="手動入力"
                    value={formState.productName}
                    onChange={handleManualInput}
                    fullWidth
                    disabled={!isManualInput}
                />

                {isManualInput && (
                    <FormControl fullWidth>
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
                )}

                <Button onClick={toggleManualInput} sx={{ mb: 2 }}>
                    {isManualInput ? "セレクトで選ぶ" : "手動入力で選ぶ"}
                </Button>

                <TextField label="取引会社" value={formState.tradingCompany} fullWidth disabled />
                <TextField label="金額" value={formState.price} fullWidth disabled />

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
