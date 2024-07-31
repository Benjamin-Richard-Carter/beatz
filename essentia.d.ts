declare module 'essentia.js' {
  export const EssentiaWASM: any;
  export const Essentia: any;
  export const EssentiaModel: any;
  export const EssentiaExtractor: any;
  export const EssentiaPlot: any;
}

declare module 'essentia.js/dist/essentia-wasm.module.js' {
  export function EssentiaWASM(): Promise<any>;
}
