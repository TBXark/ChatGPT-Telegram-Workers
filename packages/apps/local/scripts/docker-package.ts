import * as fs from 'node:fs/promises';

async function main() {
    const packageJson = JSON.parse(await fs.readFile('package.json', 'utf-8'));
    delete packageJson.scripts;
    delete packageJson.devDependencies;
    for (const key in packageJson.dependencies) {
        if (key.startsWith('@chatgpt-telegram-workers/')) {
            delete packageJson.dependencies[key];
        }
    }
    await fs.writeFile('package-docker.json', JSON.stringify(packageJson, null, 2));
}

main().catch(console.error);
