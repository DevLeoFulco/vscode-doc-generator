import * as vscode from 'vscode';
import { DocGenerator } from './doc-generator';

export function activate(context: vscode.ExtensionContext) {
    console.log('[DocGenerator] Extensão ativada');

    // Criação e configuração do botão na status bar
    const statusBarItem = createStatusBarItem();
    
    // Configura atualização automática da visibilidade do botão
    setupStatusBarVisibility(context, statusBarItem);

    // Registra o comando principal
    const disposable = registerDocGeneratorCommand(statusBarItem);
    
    context.subscriptions.push(disposable, statusBarItem);
}

function createStatusBarItem(): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, 
        100
    );
    statusBarItem.command = 'vscode-doc-generator.generateDoc';
    statusBarItem.text = '$(file-code) Gerar Doc';
    statusBarItem.tooltip = 'Gerar Documentação Técnica';
    return statusBarItem;
}

function setupStatusBarVisibility(
    context: vscode.ExtensionContext,
    statusBarItem: vscode.StatusBarItem
): void {
    const updateVisibility = () => {
        statusBarItem[
            vscode.workspace.workspaceFolders?.length ? 'show' : 'hide'
        ]();
    };

    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(updateVisibility)
    );
    updateVisibility();
}

function registerDocGeneratorCommand(
    statusBarItem: vscode.StatusBarItem
): vscode.Disposable {
    return vscode.commands.registerCommand(
        'vscode-doc-generator.generateDoc',
        async () => {
            if (!vscode.workspace.workspaceFolders?.length) {
                vscode.window.showErrorMessage('Abra uma pasta de projeto primeiro!');
                return;
            }

            try {
                const choice = await showConfirmationDialog();
                if (choice !== 'Gerar Documentação') return;

                await generateDocumentation();
            } catch (error) {
                handleGenerationError(error);
            }
        }
    );
}

async function showConfirmationDialog(): Promise<string | undefined> {
    return vscode.window.showQuickPick(
        ['Gerar Documentação', 'Cancelar'], 
        { 
            placeHolder: 'Deseja gerar a documentação técnica?',
            ignoreFocusOut: true
        }
    );
}

async function generateDocumentation(): Promise<void> {
    const docGenerator = await DocGenerator.create();
    await docGenerator.generate();
    vscode.window.showInformationMessage('✅ Documentação gerada com sucesso!');
}

function handleGenerationError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[DocGenerator] Erro:', error);
    vscode.window.showErrorMessage(
        `❌ Falha na geração de documentação: ${errorMessage}`
    );
}

export function deactivate() {
    console.log('[DocGenerator] Extensão desativada');
}