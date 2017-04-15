const request = require('request');
const Handlebars = require('handlebars');
const fs = require('fs');
const uuidV4 = require('uuid/v4');

class Giphy {
    private _url: object;
    private _type: string;

    constructor(type = 'trending') {
        this._type = type;
        this._url = {
            trending: 'http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC'
        };
    }

    getGifs(): Promise<object> {
        return new Promise((resolve, reject) => {
            request(this._url[this._type], (error, response, body) => {
                if (error) {
                    reject(error);
                }
                resolve(JSON.parse(body));
            });
        });
    }

    getTemplate(): string {
        return [
            '<style>',
            'h1 { margin: 20px 10px; }',
            '.small { font-size: 16px }',
            '.giphy-container { display: flex; width: 100%; height: 100%; flex-direction: row; justify-content: stretch; align-items: flex-start;flex-wrap: wrap; }',
            '.giphy-item { display: block; width: auto; height: 250px; margin: 0 10px; }',
            '.giphy-item__img-container { display: block; width: 100%; height: auto; }',
            '.giphy-item__img-container img { display: block; max-width: 100%; height: auto; }',
            '.giphy-item__url-container { display: flex; align-items: center; height: 30px; }',
            '.giphy-item__url-container input { display: block; width: 100%; border: 1px solid #DDD; height: 30px; padding: 0 10px;}',
            '</style>',
            '<h1><span class="small">powered by</span> GIPHY</h1>',
            '<main class="giphy-container">',
                '{{#each giphyResults}}',
                    '<div class="giphy-item" style="width: {{this.images.fixed_height.width}}px;">',
                        '<div class="giphy-item__img-container">',
                            '<img src="{{this.images.fixed_height.url}}"/>',
                        '</div>',
                        '<div class="giphy-item__url-container">',
                            '<input type="text" value="https://media.giphy.com/media/{{this.id}}/giphy.gif" />',
                        '</div>',
                    '</div>',
                '{{/each}}',
            '</main>'
        ].join('');
    }

    getId(): string {
        return uuidV4().split('-')[0];
    }

    writePage(template): Promise<string> {
        return new Promise((resolve, reject) => {
            const filePath = `${__dirname}/${this.getId()}-giphy-preview-${this._type}.html`;
            fs.writeFile(filePath, template, (error) => {
                if (error) {
                    reject(error);
                }
                resolve(filePath);
            });
        });
    }

    async generatePage(): Promise<string> {
        const giphyResults = await this.getGifs();
        const giphyPreviewTemplate = this.getTemplate();
        const compiledGiphyTemplate = Handlebars.compile(giphyPreviewTemplate);
        const dataTemplate = compiledGiphyTemplate({ giphyResults: giphyResults['data'] });
        return this.writePage(dataTemplate);
    }
}

export default Giphy;