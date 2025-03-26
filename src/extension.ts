import * as vscode from 'vscode';
import { DocGenerator } from './doc-generator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.generateDoc', async () => {
        const docGenerator = new DocGenerator();
        
        // Poss mostrar diálogo de confirmação
        const choice = await vscode.window.showQuickPick(
            ['Gerar Documentação', 'Cancelar'], 
            { placeHolder: 'Deseja gerar a documentação técnica?' }
        );
        
        if (choice === 'Gerar Documentação') {
            try {
                await docGenerator.generate();
                vscode.window.showInformationMessage('Documentação gerada com sucesso!');
            } catch (error) {
                vscode.window.showErrorMessage(`Erro ao gerar documentação: ${error}`);
            }
        }
    });

    // Para adicionar botão na barra de status
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'extension.generateDoc';
    statusBarItem.text = '$(file-code) Gerar Doc';
    statusBarItem.tooltip = 'Gerar Documentação Técnica';
    statusBarItem.show();

    context.subscriptions.push(disposable, statusBarItem);
}