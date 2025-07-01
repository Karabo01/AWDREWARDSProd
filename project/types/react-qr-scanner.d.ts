declare module 'react-qr-scanner' {
    import * as React from 'react';

    export interface QrReaderProps {
        delay?: number;
        scanDelay?: number;
        onError?: (error: any) => void;
        onScan?: (result: any) => void;
        style?: React.CSSProperties;
        facingMode?: 'user' | 'environment';
        constraints?: MediaStreamConstraints;
        className?: string;
        legacyMode?: boolean;
        showViewFinder?: boolean;
    }

    export default class QrReader extends React.Component<QrReaderProps> {}
}
