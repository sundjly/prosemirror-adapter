/* Copyright 2021, Prosemirror Adapter by Mirone. */
import { resolve } from 'path';
import { BuildOptions, defineConfig, UserConfig } from 'vite';

export const libFileName = (format: string) => `index.${format}.js`;

const resolvePath = (str: string) => resolve(__dirname, str);

function isObject(item: unknown): item is Record<string, unknown> {
    return Boolean(item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep<T>(target: T, ...sources: T[]): T {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                mergeDeep(target[key] as T, source[key] as T);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

const external = ['react', 'react-dom', 'prosemirror-state', 'prosemirror-view', 'vue'];

const viteBuild = (packageDirName: string, options: BuildOptions = {}): BuildOptions =>
    mergeDeep<BuildOptions>(
        {
            sourcemap: true,
            emptyOutDir: false,
            lib: {
                entry: resolvePath(`packages/${packageDirName}/src/index.ts`),
                name: `prosemirror-adapter_${packageDirName}`,
                fileName: libFileName,
                formats: ['es'],
            },
            rollupOptions: {
                external,
                output: {
                    dir: resolvePath(`packages/${packageDirName}/lib`),
                },
            },
        },
        options,
    );

export const viteConfigFactory = (packageDirName: string, options: UserConfig) => {
    return defineConfig({
        ...options,
        build: viteBuild(packageDirName, options.build),
    });
};