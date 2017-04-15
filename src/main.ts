'use strict';

import * as vscode from 'vscode';
import Giphy from './giphy';
const giphy = new Giphy();

export function activate(context: vscode.ExtensionContext) {

    let giphyTrendingDisposable = vscode.commands.registerCommand('giphy.trending', () => {
        previewGiphy();
    });

    context.subscriptions.push(giphyTrendingDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('I HAVE BEEN DEACTIVATED!! CLEAN UP');
}

function previewGiphy() {
    giphy.generatePage()
        .then((pagePath) => {
            const pageUri = vscode.Uri.parse(`file://${pagePath}`);
            return vscode.commands.executeCommand('vscode.previewHtml', pageUri);
        })
        .then((success) => {
            console.log(success);
        })
        .catch((error) => {
            console.log(error);
        });
}