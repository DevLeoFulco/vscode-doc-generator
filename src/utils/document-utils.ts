import * as fs from 'fs';
import * as path from 'path';
import { FolderStructure, FolderItem } from '../architecture/models/architecture-info';

/**
 * Utilitários que vou usar na geração
 */
export class DocumentUtils {
    /**
     * Estrutura que gera representação em árvore da estrutura de pastas
     */
    static generateStructureTree(structure: FolderStructure, prefix = ''): string {
        let result = `${prefix}${structure.root}/\n`;
        
        structure.children.forEach((item, index) => {
            const isLast = index === structure.children.length - 1;
            const newPrefix = prefix + (isLast ? '    ' : '│   ');
            
            result += `${prefix}${isLast ? '└── ' : '├── '}${item.name}`;
            
            if (item.description) {
                result += ` (${item.description})`;
            }
            
            result += '\n';
            
            if (item.type === 'directory' && item.children) {
                result += this.generateStructureTree({
                    root: `${structure.root}/${item.name}`,
                    children: item.children
                }, newPrefix);
            }
        });
        
        return result;
    }

    /**
     * Estrutura para filtrar dependências principais do package.json
     */
    static filterCoreDependencies(deps: { [key: string]: string }): {name: string, version: string}[] {
        const ignoreList = ['typescript', 'vite', 'webpack', 'eslint'];
        return Object.entries(deps)
            .filter(([name]) => !ignoreList.includes(name))
            .map(([name, version]) => ({ name, version }));
    }

    /**
     * Obter descrição de pacotes conhecidos
     */
    static getPackageDescription(pkgName: string): string {
        const descriptions: Record<string, string> = {
            'react': 'Biblioteca JavaScript para construção de interfaces',
            'react-dom': 'Renderização React para o DOM',
            '@angular/core': 'Core do framework Angular',
            'rxjs': 'Biblioteca para programação reativa',
            'axios': 'Cliente HTTP para chamadas API',
            'express': 'Framework web para Node.js'
        };
        return descriptions[pkgName] || 'Dependência do projeto';
    }

    /**
     * Detectar arquivo principal do projeto
     */
    static findMainFile(projectRoot: string): string | null {
        const possibleFiles = [
            'src/main.ts', 'src/index.ts', 'src/App.tsx', 
            'src/main.js', 'src/index.js', 'src/App.js',
            'main.ts', 'index.ts', 'App.tsx',
            'main.js', 'index.js', 'App.js'
        ];

        for (const file of possibleFiles) {
            if (fs.existsSync(path.join(projectRoot, file))) {
                return file;
            }
        }
        return null;
    }

    /**
     * Verificar se o projeto tem testes
     */
    static hasTests(projectRoot: string): boolean {
        return fs.existsSync(path.join(projectRoot, 'test')) || 
               fs.existsSync(path.join(projectRoot, '__tests__'));
    }

    static getPackageJson(projectRoot: string): any {
        const packageJsonPath = path.join(projectRoot, 'package.json');
        try {
            return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        } catch {
            return null;
        }
    }

    static detectApiEndpoints(projectRoot: string): string {
        // Implementação para detectar endpoints de API
        return ''; // Retornar string vazia se não encontrar
    }

    static detectMainComponents(projectRoot: string): Array<{name: string, description?: string}> {
        // Implementação para detectar os componentes
        return []; // Retornar array vazio se não encontrar
    }

    static generateFolderStructure(structure: FolderStructure): string {
        return '```\n' + this.generateStructureTree(structure) + '\n```';
    }
}