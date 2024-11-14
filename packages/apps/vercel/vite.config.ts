import { createShareConfig } from '../../../vite.config.shared';

export default createShareConfig({
    root: __dirname,
    nodeExternals: true,
    excludeMonoRepoPackages: true,
});
