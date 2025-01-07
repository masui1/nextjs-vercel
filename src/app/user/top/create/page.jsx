"use client";

import React, { useState } from "react";
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
import BarcodeScanner from '@/app/components/BarcodeScanner';

const Create = () => {
    const router = useRouter();
    const [productName, setProductName] = useState("");
    const [tradingCompany, setTradingCompany] = useState("");
    const [price, setPrice] = useState("");
    const [row, setRow] = useState("");
    const [barcode, setBarcode] = useState('');
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        let company_id = null;
        if (tradingCompany === "三ツ星ファーム") {
            company_id = 1;
        } else if (tradingCompany === "マッスルデリ") {
            company_id = 2;
        }

        try {
            const response = await fetch("/api/users/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    company_id,
                    trading_company: tradingCompany,
                    product_name: productName,
                    price,
                    row,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: "不明なサーバーエラーが発生しました。",
                }));
                setErrorMessage(
                    `弁当登録に失敗しました: ${
                        errorData.error || "不明なエラー"
                    }`
                );
                return;
            }
            router.push("/user/top");
        } catch (error) {
            setErrorMessage("ネットワークエラーが発生しました。");
        }
    };

    const availableRows =
        tradingCompany === "三ツ星ファーム"
            ? [1, 2]
            : tradingCompany === "マッスルデリ"
            ? [3, 4, 5]
            : [];

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
                    label="無くなった品"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    fullWidth
                />
                <TextField
                    label="取引会社"
                    select
                    value={tradingCompany}
                    onChange={(e) => setTradingCompany(e.target.value)}
                    fullWidth
                >
                    <MenuItem value="三ツ星ファーム">三ツ星ファーム</MenuItem>
                    <MenuItem value="マッスルデリ">マッスルデリ</MenuItem>
                </TextField>
                <TextField
                    label="金額"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    fullWidth
                />
                <FormControl fullWidth>
                    <InputLabel>段数</InputLabel>
                    <Select
                        value={row}
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
