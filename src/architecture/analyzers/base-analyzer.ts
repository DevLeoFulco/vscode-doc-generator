import * as fs from 'fs';
import * as path from 'path';
import { ArchitectureInfo, FolderItem, FolderStructure } from '../models/architecture-info';

export abstract class BaseFrameworkAnalyzer {
    protected projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    public abstract analyze(): Promise<ArchitectureInfo>;

    protected async detectFolderStructure(maxDepth = 3): Promise<FolderStructure> {
        return this.scanDirectory(this.projectRoot, maxDepth);
    }

    private async scanDirectory(dirPath: string, depth: number): Promise<FolderStructure> {
        const items = await fs.promises.readdir(dirPath);
        const result: FolderStructure = {
            root: path.relative(this.projectRoot, dirPath),
            children: []
        };

        if (depth <= 0) return result;

        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = await fs.promises.stat(fullPath);
            
            const folderItem: FolderItem = {
                name: item,
                type: stat.isDirectory() ? 'directory' : 'file',                
            };

            if (stat.isDirectory()) {
                folderItem.children = (await this.scanDirectory(fullPath, depth - 1)).children;
                folderItem.description = this.getFolderDescription(item);
            }

            result.children.push(folderItem);
        }

        return result;
    }

    protected abstract getFolderDescription(folderName: string): string | undefined;
}