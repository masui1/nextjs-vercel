'use client';

import { useEffect, useRef, useState } from 'react';

const BarcodeScanner = ({ onDetected }) => {
    const videoRef = useRef();
    const [error, setError] = useState(null);

    useEffect(() => {
        let Quagga;
        let started = false;

        const init = async () => {
            try {
                const mod = await import('@ericblade/quagga2');
                Quagga = mod.default;

                await new Promise((resolve, reject) => {
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
                                reject(err);
                            } else {
                                resolve();
                            }
                        }
                    );
                });

                started = true;
                Quagga.start();

                Quagga.onDetected((data) => {
                    onDetected(data.codeResult.code);
                });
            } catch (err) {
                console.error('BarcodeScanner error:', err);
                setError('バーコードスキャナーを起動できませんでした。カメラへのアクセスを許可しているか確認してください。');
            }
        };

        init();

        return () => {
            if (Quagga && started) {
                try {
                    Quagga.stop();
                } catch (e) {
                    // ignore cleanup errors
                }
            }
        };
    }, [onDetected]);

    if (error) {
        return <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>;
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
