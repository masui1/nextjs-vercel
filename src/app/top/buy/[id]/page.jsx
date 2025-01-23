"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const BuyTop = () => {
  const router = useRouter();
  const [id, setId] = useState(null);
  const [bentos, setBentos] = useState({ row1: [] });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const pathParts = window.location.pathname.split("/");
    const bentoId = pathParts[pathParts.length - 1];
    setId(bentoId);
  }, []);

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/buy/${id}`, {
            method: "GET",
          });
          const data = await response.json();
          if (response.ok) {
            setBentos({ row1: [data] });
          } else {
            setErrorMessage(data.error || "データ取得に失敗しました");
          }
        } catch (error) {
          setErrorMessage("ネットワークエラーが発生しました");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  const handleSubmit = async (bentoId) => {
    try {
      const purchasedDate = new Date();
      const requestBody = { is_purchased: true, purchasedDate };

      const response = await fetch(`/api/buy/${bentoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(
          `購入に失敗しました: ${data.error || "不明なエラー"}`
        );
        return;
      }
      setBentos((prevState) => ({
        row1: prevState.row1.map((bento) =>
          bento.id === bentoId
            ? { ...bento, is_purchased: true, purchasedDate }
            : bento
        ),
      }));
      setErrorMessage("");
      router.push("/top");
    } catch (error) {
      setErrorMessage("ネットワークエラーが発生しました");
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        購入画面
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        {loading ? (
          <CircularProgress />
        ) : bentos.row1.length > 0 ? (
          bentos.row1.map((bento) => (
            <div
              key={bento.id}
              className="relative bg-cover bg-center shadow-md rounded-lg w-full max-w-96"
              style={{
                backgroundImage: `url(${bento.img})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "300px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
              }}
            >
              <div className="w-full bg-black bg-opacity-20 p-4 rounded-b-lg">
                <h3 className="text-xl font-bold text-white">
                  商品: {bento.product_name}
                </h3>
                <p className="text-base font-medium text-gray-200 mt-2">
                  取引会社: {bento.trading_company}
                </p>
                <p className="text-base font-medium text-gray-200 mt-2">
                  金額: {bento.price}円
                </p>
                <Button
                  onClick={() => handleSubmit(bento.id)}
                  variant="contained"
                  color="primary"
                  disabled={bento.is_purchased}
                >
                  {bento.is_purchased ? "購入済み" : "購入"}
                </Button>
              </div>
            </div>
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
        onClick={() => router.push("/top")}
      >
        戻る
      </Button>
    </Box>
  );
};

export default BuyTop;
