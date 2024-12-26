import { useEffect, useRef } from 'react';
import Quagga from 'quagga';

const BarcodeScanner = ({ onDetected }) => {
    const videoRef = useRef();

    useEffect(() => {
        Quagga.init(
            {
                inputStream: {
                    type: 'LiveStream',
                    target: videoRef.current,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment', // リアカメラを使用
                    },
                },
                decoder: {
                    readers: ['ean_reader'], // 対応するバーコードフォーマット
                },
            },
            (err) => {
                if (err) {
                    console.error(err);
                    return;
                }
                Quagga.start();
            }
        );

        Quagga.onDetected((data) => {
            onDetected(data.codeResult.code); // 読み取ったバーコードを親に渡す
        });

        return () => {
            Quagga.stop();
        };
    }, [onDetected]);

    return <div ref={videoRef} style={{ width: '100%', height: '100%' }} />;
};

export default BarcodeScanner;
