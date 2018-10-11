declare const React: typeof import("react");
declare const Promise: {
        new <R>(callback: (
            resolve: (thenableOrResult?: R | PromiseLike<R>) => void,
            reject: (error?: any) => void,
        onCancel?: (callback: () => void) => void
    ) => void): Promise<R>;
};
declare const ReactDOM: typeof import("react-dom");
