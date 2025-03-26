import path from 'path';
import * as fs from 'fs';
import { ArchitectureInfo, ComponentInfo } from '../models/architecture-info';
import { BaseFrameworkAnalyzer } from './base-analyzer';

export class AngularAnalyzer extends BaseFrameworkAnalyzer {
    public async analyze(): Promise<ArchitectureInfo> {
        const folderStructure = await this.detectFolderStructure();
        
        return {
            framework: 'Angular',
            architectureType: this.detectAngularArchitecture(),
            folderStructure,
            mainComponents: this.detectAngularComponents(),
            characteristics: this.getAngularCharacteristics()
        };
    }

    private detectAngularArchitecture(): string {
        // Implementação da detecção de arquitetura Angular vai começar assim
        if (fs.existsSync(path.join(this.projectRoot, 'projects'))) {
            return 'Multi-Project Workspace';
        }
        return 'Standard Angular CLI Structure';
    }

    private detectAngularComponents(): ComponentInfo[] {
        // Implementação temporária para encontrar componentes principais
        const components: ComponentInfo[] = [];
        
        // Primeiro exemplo de teste: encontrar módulos principais
        const appModulePath = path.join(this.projectRoot, 'src/app/app.module.ts');
        if (fs.existsSync(appModulePath)) {
            components.push({
                name: 'AppModule',
                type: 'Root Module',
                path: 'src/app/app.module.ts',
                purpose: 'Root application module'
            });
        }
        
        return components;
    }

    protected getFolderDescription(folderName: string): string | undefined {
        const angularFolders: Record<string, string> = {
            'src/app': 'Application modules and components',
            'src/assets': 'Static assets',
            'src/environments': 'Environment configuration',
            'e2e': 'End-to-end tests'
        };
        
        return angularFolders[folderName] || undefined;
    }

    private getAngularCharacteristics(): string[] {
        const characteristics = ['Component-based architecture', 'Modular design'];
        
        if (fs.existsSync(path.join(this.projectRoot, 'angular.json'))) {
            characteristics.push('Angular CLI project');
        }
        
        return characteristics;
    }
}