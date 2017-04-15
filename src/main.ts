'use strict';

import * as vscode from 'vscode';
import Giphy from './giphy';
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const cache: object = {};

function previewTrending(): void {
    const giphyTrending = new Giphy('trending');
    giphyTrending.generatePage()
        .then((pagePath) => {
            const pageUri = vscode.Uri.parse(`file://${pagePath}`);
            cache[pagePath] = true;
            return vscode.commands.executeCommand('vscode.previewHtml', pageUri);
        })
        .then((success) => {
            if (success) {
                console.log('GIPHY Trending Created.');
            }
        })
        .catch((error) => {
            console.log(error);
        });
}

function createGifDir(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        mkdirp(`${__dirname}/giphy`, function (error) {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

function cleanUp(pagePath): Promise<boolean> {
    return new Promise((resolve, reject) => {
        rimraf(pagePath, {}, (error) => {
            if (error) {
                reject(error);
            }
            resolve(true);
        });
    });
}

export function activate(context: vscode.ExtensionContext) {
    createGifDir();

    let giphyTrendingDisposable = vscode.commands.registerCommand('giphy.trending', () => {
        previewTrending();
    });

    context.subscriptions.push(giphyTrendingDisposable);
}

export function deactivate() {
    const cleanUpPromises = [];
    Object.keys(cache).forEach((pagePath) => {
        cleanUpPromises.push(cleanUp(pagePath));
        delete cache[pagePath];
    });
    Promise.all(cleanUpPromises)
        .then((results) => {
            console.log('GIPHY Clean Up.');
        })
        .catch((error) => {
            console.log(error);
        });
}