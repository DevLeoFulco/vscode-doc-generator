import * as vscode from 'vscode';
import { DocGenerator } from './doc-generator';

export function activate(context: vscode.ExtensionContext) {
    console.log('[DocGenerator] Extensão ativada'); // Log visível no console

    // Criação do botão na status bar
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'vscode-doc-generator.generateDoc';
    statusBarItem.text = '$(file-code) Gerar Doc';
    statusBarItem.tooltip = 'Gerar Documentação Técnica';
    
    // Mostra apenas quando tem workspace
    const updateStatusBar = () => {
        if (vscode.workspace.workspaceFolders?.length) {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    };

    // Atualiza quando o workspace muda
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(updateStatusBar)
    );
    updateStatusBar(); // Configura estado inicial

    // Registra o comando principal
    const disposable = vscode.commands.registerCommand('vscode-doc-generator.generateDoc', async () => {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showErrorMessage('Abra uma pasta de projeto primeiro!');
            return;
        }

        const choice = await vscode.window.showQuickPick(
            ['Gerar Documentação', 'Cancelar'], 
            { 
                placeHolder: 'Deseja gerar a documentação técnica?',
                ignoreFocusOut: true
            }
        );
        
        if (choice === 'Gerar Documentação') {
            try {
                const docGenerator = new DocGenerator();
                await docGenerator.generate();
                vscode.window.showInformationMessage('✅ Documentação gerada com sucesso!');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error('[DocGenerator] Erro:', errorMessage);
                vscode.window.showErrorMessage(`❌ Erro ao gerar documentação: ${errorMessage}`);
            }
        }
    });

    context.subscriptions.push(disposable, statusBarItem);
}

export function deactivate() {
    console.log('[DocGenerator] Extensão desativada');
}