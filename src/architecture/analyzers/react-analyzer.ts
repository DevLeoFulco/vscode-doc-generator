import path from 'path';
import * as fs from 'fs';
import { ArchitectureInfo, ComponentInfo } from '../models/architecture-info';
import { BaseFrameworkAnalyzer } from './base-analyzer';

export class ReactAnalyzer extends BaseFrameworkAnalyzer {
    public async analyze(): Promise<ArchitectureInfo> {
        const folderStructure = await this.detectFolderStructure();
        
        return {
            framework: 'React',
            architectureType: this.detectReactArchitecture(),
            folderStructure,
            mainComponents: this.detectReactComponents(),
            characteristics: this.getReactCharacteristics()
        };
    }

    private detectReactArchitecture(): string {
        if (fs.existsSync(path.join(this.projectRoot, 'src/features'))) {
            return 'Feature-Based Structure';
        } else if (fs.existsSync(path.join(this.projectRoot, 'src/containers'))) {
            return 'Container/Component Pattern';
        }
        return 'Standard React Structure';
    }

    private detectReactComponents(): ComponentInfo[] {
        const components: ComponentInfo[] = [];
        
        // Detectar App.js/App.tsx que são base do React
        const appFiles = ['App.tsx', 'App.jsx', 'App.js'];
        for (const file of appFiles) {
            const appPath = path.join(this.projectRoot, 'src', file);
            if (fs.existsSync(appPath)) {
                components.push({
                    name: 'App',
                    type: 'Root Component',
                    path: `src/${file}`,
                    purpose: 'Main application component'
                });
                break;
            }
        }
        
        return components;
    }

    protected getFolderDescription(folderName: string): string | undefined {
        const reactFolders: Record<string, string> = {
            'src/components': 'Reusable UI components',
            'src/pages': 'Page-level components',
            'src/hooks': 'Custom React hooks',
            'src/store': 'Redux store configuration'
        };
        
        return reactFolders[folderName] || undefined;
    }

    private getReactCharacteristics(): string[] {
        const characteristics = ['Component-based architecture', 'Virtual DOM'];
        
        if (fs.existsSync(path.join(this.projectRoot, 'package.json'))) {
            const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
            
            if (packageJson.dependencies?.redux) {
                characteristics.push('Uses Redux for state management');
            }
            
            if (packageJson.dependencies?.['react-router-dom']) {
                characteristics.push('Uses React Router for navigation');
            }
        }
        
        return characteristics;
    }
}