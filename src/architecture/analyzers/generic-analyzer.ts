import * as fs from 'fs';
import * as path from 'path';
import { ArchitectureInfo, ComponentInfo } from '../models/architecture-info';
import { BaseFrameworkAnalyzer } from './base-analyzer';

export class GenericAnalyzer extends BaseFrameworkAnalyzer {
    public async analyze(): Promise<ArchitectureInfo> {
        const folderStructure = await this.detectFolderStructure();
        
        return {
            framework: 'Unknown',
            architectureType: this.detectGenericArchitecture(),
            folderStructure,
            mainComponents: this.detectGenericComponents(),
            characteristics: this.getGenericCharacteristics()
        };
    }

    private detectGenericArchitecture(): string {
        if (fs.existsSync(path.join(this.projectRoot, 'src', 'main.ts'))) {
            return 'TypeScript Application';
        }
        return 'Generic Project Structure';
    }

    private detectGenericComponents(): ComponentInfo[] {
        const components: ComponentInfo[] = [];
        
        // Detectar arquivos principais genéricos por enquanto
        const mainFiles = ['main.ts', 'app.ts', 'index.ts', 'server.ts'];
        for (const file of mainFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                components.push({
                    name: file,
                    type: 'Main File',
                    path: file,
                    purpose: 'Application entry point'
                });
                break;
            }
        }
        
        return components;
    }

    protected getFolderDescription(folderName: string): string | undefined {
        const genericFolders: Record<string, string> = {
            'src': 'Source code files',
            'dist': 'Compiled output',
            'node_modules': 'Dependencies',
            'public': 'Public assets'
        };
        
        return genericFolders[folderName] || undefined;
    }

    private getGenericCharacteristics(): string[] {
        const characteristics: string[] = [];
        
        // Verificar se é TypeScript
        if (fs.existsSync(path.join(this.projectRoot, 'tsconfig.json'))) {
            characteristics.push('TypeScript Project');
        }
        
        // Verificar se tem package.json
        if (fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
            characteristics.push('Node.js Project');
        }
        
        return characteristics.length > 0 ? characteristics : ['Generic JavaScript Project'];
    }
}