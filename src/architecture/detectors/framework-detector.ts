import { AngularAnalyzer } from '../analyzers/angular-analyzer';
import { ReactAnalyzer } from '../analyzers/react-analyzer';
import { BaseFrameworkAnalyzer } from '../analyzers/base-analyzer';
import { ArchitectureInfo } from '../models/architecture-info';
import path from 'path';
import * as fs from 'fs';
import { GenericAnalyzer } from '../analyzers/generic-analyzer';

export class FrameworkDetector {
    public static async detect(projectRoot: string): Promise<BaseFrameworkAnalyzer> {
        // Verifica no Angular
        if (fs.existsSync(path.join(projectRoot, 'angular.json'))) {
            return new AngularAnalyzer(projectRoot);
        }
        
        // Verifica no React
        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            
            if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
                return new ReactAnalyzer(projectRoot);
            }
        }
        
        // Padrão para projetos não identificados vai ficar generico por enquanto 
        return new GenericAnalyzer(projectRoot);
    }
}