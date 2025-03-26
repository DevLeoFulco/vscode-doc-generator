import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FolderItem, FolderStructure, ProjectInfo } from './architecture/models/architecture-info';

export class DocGenerator {
    private workspaceRoot: string;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('Nenhum projeto aberto no workspace');
        }
        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
    }

    public async generate(): Promise<void> {
        const readmePath = path.join(this.workspaceRoot, 'README.md');
        
        // Vou verificar se o README existe e está vazio
        if (fs.existsSync(readmePath) && fs.readFileSync(readmePath, 'utf8').trim() !== '') {
            const overwrite = await vscode.window.showQuickPick(
                ['Sim', 'Não'],
                { placeHolder: 'README.md já existe. Deseja sobrescrever?' }
            );
            
            if (overwrite !== 'Sim') {
                return;
            }
        }

        // Começo a coletar informações do projeto
        const projectInfo = await this.analyzeProject();
        
        // Começo a gerar conteúdo do README
        const content = this.generateReadmeContent(projectInfo);
        
        // Passo a escrever no arquivo
        fs.writeFileSync(readmePath, content);
    }

    private async analyzeProject(): Promise<ProjectInfo> {
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        let dependencies = {};
        
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            dependencies = packageJson.dependencies || {};
        }
        
        // Primeira implementação de teste para análise de arquitetura
        const folderStructure = await this.scanDirectory(this.workspaceRoot, 3);
        
        return {
            dependencies,
            projectStructure: this.getProjectStructure(),
            architectureInfo: {
                framework: this.detectFramework(),
                architectureType: 'Standard',
                folderStructure: {
                    root: this.workspaceRoot,
                    children: folderStructure
                },
                characteristics: this.detectProjectCharacteristics()
            }
        };
    }

    private getProjectStructure(): string[] {
        // Preciso implementar análise de estrutura de pastas
        return [];
    }

    private generateReadmeContent(info: ProjectInfo): string {
        return `# Documentação Técnica

## Arquitetura do Sistema
${this.generateArchitectureSection(info)}


`;
    }

    private generateArchitectureSection(info: ProjectInfo): string {
        const archInfo = info.architectureInfo;
        
        let markdown = `## Arquitetura do Sistema\n\n`;
        markdown += `**Framework**: ${archInfo.framework}\n\n`;
        markdown += `**Tipo de Arquitetura**: ${archInfo.architectureType}\n\n`;
        
        markdown += `### Características Principais\n`;
        markdown += archInfo.characteristics.map(c => `- ${c}`).join('\n') + '\n\n';
        
        markdown += `### Estrutura de Pastas\n`;
        markdown += this.generateFolderStructureMarkdown(archInfo.folderStructure);
        
        return markdown;
    }

    private generateFolderStructureMarkdown(structure: FolderStructure, depth = 0): string {
        let markdown = '';
        const indent = '  '.repeat(depth);
        
        markdown += `${indent}- ${structure.root}\n`;
        
        for (const item of structure.children) {
            if (item.description) {
                markdown += `${indent}  - ${item.name} (${item.description})\n`;
            } else {
                markdown += `${indent}  - ${item.name}\n`;
            }
            
            if (item.type === 'directory' && item.children) {
                markdown += this.generateFolderStructureMarkdown({
                    root: `${structure.root}/${item.name}`,
                    children: item.children
                }, depth + 1);
            }
        }
        
        return markdown;
    }

    private async scanDirectory(dirPath: string, depth: number): Promise<FolderItem[]> {
        if (depth <= 0) return [];
        
        const items = await fs.promises.readdir(dirPath);
        const result: FolderItem[] = [];
        
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = await fs.promises.stat(fullPath);
            
            const folderItem: FolderItem = {
                name: item,
                type: stat.isDirectory() ? 'directory' : 'file',
                description: ''
            };
            
            if (stat.isDirectory()) {
                folderItem.children = await this.scanDirectory(fullPath, depth - 1);
            }
            
            result.push(folderItem);
        }
        
        return result;
    }
    
    private detectFramework(): string {
        if (fs.existsSync(path.join(this.workspaceRoot, 'angular.json'))) {
            return 'Angular';
        }
        
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            if (packageJson.dependencies?.react) {
                return 'React';
            }
        }
        
        return 'Node.js';
    }
    
    private detectProjectCharacteristics(): string[] {
        const characteristics: string[] = [];
        
        if (fs.existsSync(path.join(this.workspaceRoot, 'tsconfig.json'))) {
            characteristics.push('TypeScript Project');
        } else {
            characteristics.push('JavaScript Project');
        }
        
        return characteristics;
    }
}

