'use client';

import { useEffect, useRef, useState } from 'react';
import Quagga from '@ericblade/quagga2';

const BarcodeScanner = ({ onDetected }) => {
    const videoRef = useRef();
    const [error, setError] = useState(null);

    useEffect(() => {
        let started = false;

        Quagga.init(
            {
                inputStream: {
                    type: 'LiveStream',
                    target: videoRef.current,
                    constraints: {
                        width: 640,
                        height: 480,
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['ean_reader'],
                },
            },
            (err) => {
                if (err) {
                    console.error('Quagga init error:', err);
                    setError('カメラの起動に失敗しました。カメラへのアクセスを許可してください。');
                    return;
                }
                started = true;
                Quagga.start();
            }
        );

        Quagga.onDetected((data) => {
            onDetected(data.codeResult.code);
        });

        return () => {
            if (started) {
                Quagga.stop();
            }
        };
    }, [onDetected]);

    if (error) {
        return <p style={{ color: 'red' }}>{error}</p>;
    }

    return (
        <div
            ref={videoRef}
            style={{
                width: '100%',
                maxWidth: '640px',
                height: '320px',
                overflow: 'hidden',
            }}
        />
    );
};

export default BarcodeScanner;
