import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FrameworkDetector } from './architecture/detectors/framework-detector';
import { BaseFrameworkAnalyzer } from './architecture/analyzers/base-analyzer';
import { ArchitectureInfo } from './architecture/models/architecture-info';

export class DocGenerator {
    private workspaceRoot: string;
    private analyzer: BaseFrameworkAnalyzer;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('Nenhum projeto aberto no workspace');
        }
        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        this.analyzer = FrameworkDetector.detect(this.workspaceRoot);
    }

    public async generate(): Promise<void> {
        const readmePath = path.join(this.workspaceRoot, 'README.md');
        
        if (await this.shouldOverwrite(readmePath) === false) {
            return;
        }

        const projectInfo = await this.analyzeProject();
        const content = this.generateFullDocumentation(projectInfo);
        
        fs.writeFileSync(readmePath, content);
        vscode.window.showInformationMessage('Documentação gerada com sucesso!');
    }

    private async shouldOverwrite(readmePath: string): Promise<boolean> {
        if (!fs.existsSync(readmePath) || fs.readFileSync(readmePath, 'utf8').trim() === '') {
            return true;
        }
        
        const choice = await vscode.window.showQuickPick(
            ['Sim', 'Não'], 
            { placeHolder: 'README.md já existe. Deseja sobrescrever?' }
        );
        
        return choice === 'Sim';
    }

    private async analyzeProject(): Promise<ProjectInfo> {
        const archInfo = await this.analyzer.analyze();
        const packageJson = this.getPackageJson();
        const dependencies = packageJson?.dependencies || {};
        const devDependencies = packageJson?.devDependencies || {};

        return {
            projectName: path.basename(this.workspaceRoot),
            architecture: archInfo,
            dependencies: { ...dependencies, ...devDependencies },
            scripts: packageJson?.scripts || {},
            mainFile: this.findMainFile(),
            hasTests: fs.existsSync(path.join(this.workspaceRoot, 'test')) || 
                     fs.existsSync(path.join(this.workspaceRoot, '__tests__'))
        };
    }

    private getPackageJson(): any {
        const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        }
        return null;
    }

    private findMainFile(): string | null {
        const possibleFiles = [
            'src/main.ts', 'src/index.ts', 'src/App.tsx', 
            'src/main.js', 'src/index.js', 'src/App.js',
            'main.ts', 'index.ts', 'App.tsx',
            'main.js', 'index.js', 'App.js'
        ];

        for (const file of possibleFiles) {
            if (fs.existsSync(path.join(this.workspaceRoot, file))) {
                return file;
            }
        }
        return null;
    }

    private generateFullDocumentation(info: ProjectInfo): string {
        return `# Documentação Técnica - ${info.projectName}

${this.generateArchitectureSection(info)}

${this.generateTechnologiesSection(info)}

${this.generateApiSection(info)}

${this.generateInstallationSection(info)}

${this.generateCodeDocumentationSection(info)}

## Informações do Projeto

**URL do Repositório**: [Inserir URL do repositório]

**Como contribuir**: [Instruções para contribuição]
`;
    }

    private generateArchitectureSection(info: ProjectInfo): string {
        const { architecture } = info;
        
        return `## 1. Arquitetura do Sistema e Diagramas de Fluxo

### Arquitetura Geral
${architecture.framework === 'React' ? this.generateReactArchitecture() : ''}
${architecture.framework === 'Angular' ? this.generateAngularArchitecture() : ''}

### Fluxo de Dados Principais
1. **Fluxo de Renderização**:
   - Carregamento dos componentes principais
   - Inicialização do estado da aplicação
   - Renderização da interface

2. **Fluxo de Dados**:
   - Comunicação entre componentes
   - Gerenciamento de estado
   - Integração com APIs (se aplicável)

${this.generateFolderStructureMarkdown(architecture.folderStructure)}`;
    }

    private generateReactArchitecture(): string {
        return `O projeto segue uma arquitetura baseada em componentes React com:
- Separação clara entre componentes de UI e lógica de negócios
- Gerenciamento de estado centralizado
- Roteamento de páginas (se aplicável)`;
    }

    private generateAngularArchitecture(): string {
        return `O projeto utiliza a arquitetura modular do Angular com:
- Módulos por funcionalidade
- Componentes inteligentes e apresentacionais
- Serviços para lógica de negócios
- Injeção de dependências`;
    }

    // ... (implementar os outros métodos de geração de seções)
}

interface ProjectInfo {
    projectName: string;
    architecture: ArchitectureInfo;
    dependencies: { [key: string]: string };
    scripts: { [key: string]: string };
    mainFile: string | null;
    hasTests: boolean;
}