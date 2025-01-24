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
                        facingMode: 'environment',
                    },
                },
                decoder: {
                    readers: ['ean_reader'],
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
            onDetected(data.codeResult.code);
        });

        return () => {
            Quagga.stop();
        };
    }, [onDetected]);

    return (
        <div
            ref={videoRef}
            style={{
                width: '100vw',
                height: '68vh',
                overflow: 'hidden',
            }}
        />
    );
};

export default BarcodeScanner;
