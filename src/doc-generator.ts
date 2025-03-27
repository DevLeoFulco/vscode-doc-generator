import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { DocumentUtils } from './utils/document-utils';
import { FrameworkDetector } from './architecture/detectors/framework-detector';
import { BaseFrameworkAnalyzer } from './architecture/analyzers/base-analyzer';
import { ArchitectureInfo, ProjectInfo } from './architecture/models/architecture-info';

export class DocGenerator {
    private workspaceRoot: string;
    private analyzer: BaseFrameworkAnalyzer;

    private constructor(workspaceRoot: string, analyzer: BaseFrameworkAnalyzer) {
        this.workspaceRoot = workspaceRoot;
        this.analyzer = analyzer;
    }

    public static async create(): Promise<DocGenerator> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('Nenhum projeto aberto no workspace');
        }
        
        const workspaceRoot = workspaceFolders[0].uri.fsPath;
        const analyzer = await FrameworkDetector.detect(workspaceRoot);
        
        return new DocGenerator(workspaceRoot, analyzer);
    }

    public async generate(): Promise<void> {
        const readmePath = path.join(this.workspaceRoot, 'README.md');
        
        if (!(await this.shouldOverwrite(readmePath))) {
            return;
        }

        try {
            const projectInfo = await this.analyzeProject();
            const content = this.generateFullDocumentation(projectInfo);
            fs.writeFileSync(readmePath, content);
            vscode.window.showInformationMessage('✅ Documentação gerada com sucesso!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`❌ Falha ao gerar documentação: ${errorMessage}`);
            console.error('[DocGenerator] Erro:', error);
        }
    }

    private async shouldOverwrite(readmePath: string): Promise<boolean> {
        if (!fs.existsSync(readmePath) || fs.readFileSync(readmePath, 'utf8').trim() === '') {
            return true;
        }
        
        const choice = await vscode.window.showQuickPick(
            ['Sim', 'Não'], 
            { 
                placeHolder: 'README.md já existe. Deseja sobrescrever?',
                ignoreFocusOut: true
            }
        );
        
        return choice === 'Sim';
    }

    private async analyzeProject(): Promise<ProjectInfo> {
        const archInfo = await this.analyzer.analyze();
        const packageJson = DocumentUtils.getPackageJson(this.workspaceRoot);

        return {
            projectName: path.basename(this.workspaceRoot),
            architecture: archInfo,
            dependencies: { 
                ...packageJson?.dependencies, 
                ...packageJson?.devDependencies 
            },
            scripts: packageJson?.scripts || {},
            mainFile: DocumentUtils.findMainFile(this.workspaceRoot),
            hasTests: DocumentUtils.hasTests(this.workspaceRoot),
            repositoryUrl: await this.detectRepositoryUrl()
        };
    }

    private async detectRepositoryUrl(): Promise<string | null> {
        try {
            const gitConfigPath = path.join(this.workspaceRoot, '.git', 'config');
            if (fs.existsSync(gitConfigPath)) {
                const gitConfig = fs.readFileSync(gitConfigPath, 'utf8');
                const urlMatch = gitConfig.match(/url\s*=\s*(.+)/);
                if (urlMatch && urlMatch[1]) {
                    return urlMatch[1].replace('git@github.com:', 'https://github.com/').replace('.git', '');
                }
            }
        } catch (error) {
            console.warn('Não foi possível detectar URL do repositório:', error);
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

${this.generateProjectInfoSection(info)}`;
    }

    private generateArchitectureSection(info: ProjectInfo): string {
        const { architecture } = info;
        
        return `## 1. Arquitetura do Sistema e Diagramas de Fluxo

### Arquitetura Geral
${this.generateFrameworkSpecificArchitecture(architecture)}

### Fluxo de Dados Principais
1. **Fluxo de Renderização**:
   - Carregamento dos componentes principais
   - Inicialização do estado da aplicação
   - Renderização da interface

2. **Fluxo de Dados**:
   - Comunicação entre componentes
   - Gerenciamento de estado
   - Integração com APIs (se aplicável)

${DocumentUtils.generateFolderStructure(architecture.folderStructure)}`;
    }

    private generateFrameworkSpecificArchitecture(archInfo: ArchitectureInfo): string {
        const frameworkTemplates = {
            'React': `O projeto segue uma arquitetura baseada em componentes React com:
- Separação clara entre componentes de UI e lógica de negócios
- Gerenciamento de estado ${archInfo.characteristics.includes('Redux') ? 'com Redux' : 'com React Hooks'}
- Roteamento ${archInfo.characteristics.includes('React Router') ? 'com React Router' : 'básico'}`,

            'Angular': `O projeto utiliza a arquitetura modular do Angular com:
- Módulos por funcionalidade
- Componentes inteligentes e apresentacionais
- Serviços para lógica de negócios
- Injeção de dependências`,

            'default': `O projeto segue uma arquitetura ${archInfo.framework === 'Node.js' ? 'Node.js' : 'JavaScript/TypeScript'} com:
- Estrutura de pastas organizada por funcionalidade
- Separação entre lógica de negócios e apresentação`
        };

        return frameworkTemplates[archInfo.framework as keyof typeof frameworkTemplates] || frameworkTemplates.default;
    }

    private generateTechnologiesSection(info: ProjectInfo): string {
        const coreDeps = DocumentUtils.filterCoreDependencies(info.dependencies);
        
        return `## 2. Descrição das Tecnologias e Ferramentas Utilizadas

### Tecnologias Principais
${coreDeps.map(dep => `- **${dep.name}@${dep.version}**: ${
    DocumentUtils.getPackageDescription(dep.name)
}`).join('\n')}

### Ferramentas de Desenvolvimento
- **VS Code**: Editor principal
- **ESLint**: Linting de código
- **TypeScript**: Checagem de tipos${info.architecture.framework === 'Angular' ? '\n- **Angular CLI**: Ferramenta de construção' : ''}`;
    }

    private generateApiSection(info: ProjectInfo): string {
        return `## 3. Documentação da API

${DocumentUtils.detectApiEndpoints(this.workspaceRoot) || 'A aplicação não utiliza APIs externas ou a integração ainda não foi implementada.'}`;
    }

    private generateInstallationSection(info: ProjectInfo): string {
        const installCommands = info.architecture.framework === 'Angular' ? 
            'npm install -g @angular/cli\nnpm install' : 
            'npm install';

        const startCommand = info.scripts.dev ? 
            `npm run ${info.scripts.dev}` : 
            info.scripts.start ? 
            `npm run ${info.scripts.start}` : 
            'npm start';

        return `## 4. Manual de Instalação e Configuração

### Requisitos do Sistema
- Node.js (versão 16 ou superior)
- npm ou yarn
${info.architecture.framework === 'Angular' ? '- Angular CLI (global)' : ''}

### Instalação
1. Clone o repositório:
   \`\`\`bash
   git clone ${info.repositoryUrl || '<URL_DO_REPOSITORIO>'}
   cd ${info.projectName}
   \`\`\`

2. Instale as dependências:
   \`\`\`bash
   ${installCommands}
   \`\`\`

3. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   ${startCommand}
   \`\`\``;
    }

    private generateCodeDocumentationSection(info: ProjectInfo): string {
        const components = DocumentUtils.detectMainComponents(this.workspaceRoot);
        
        return `## 5. Documentação do Código

### Estrutura de Diretórios
${DocumentUtils.generateFolderStructure(info.architecture.folderStructure)}

### Principais Componentes
${components.length > 0 ? 
    components.map(c => `- **${c.name}**: ${c.description || 'Componente principal'}`).join('\n') : 
    'Não foram detectados componentes principais'}

### Padrões e Convenções
- Nomenclatura de arquivos e componentes
- Organização de imports
- Estrutura de pastas`;
    }

    private generateProjectInfoSection(info: ProjectInfo): string {
        return `## Informações do Projeto

**URL do Repositório**: ${info.repositoryUrl || '[Inserir URL do repositório]'}

**Como contribuir**:
1. Faça um fork do projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/nova-feature\`)
3. Commit suas mudanças (\`git commit -m 'Adiciona nova feature'\`)
4. Push para a branch (\`git push origin feature/nova-feature\`)
5. Abra um Pull Request`;
    }
}