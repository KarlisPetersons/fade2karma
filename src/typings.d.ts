/* SystemJS module definition */
declare var module: NodeModule;

interface NodeModule {
    id: string;
}

declare interface Window {
    adsbygoogle: any[];
}

declare var adsbygoogle: any[];
