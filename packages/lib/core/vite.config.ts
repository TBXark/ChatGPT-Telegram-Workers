import { createShareConfig } from '../../../vite.config.shared';

export default createShareConfig({
    root: __dirname,
    types: true,
    formats: ['es', 'cjs'],
    nodeExternals: false,
});
