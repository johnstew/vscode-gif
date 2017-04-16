import { workspace } from 'vscode' ;
const request = require('request');
const Handlebars = require('handlebars');
const fs = require('fs');
const uuidV4 = require('uuid/v4');

class Gif {
    private _url: object;
    private _type: string;
    private _settings: any;
    private _rating: string;

    constructor(type = 'trending') {
        this._settings = workspace.getConfiguration('gif');
        this._rating = this._settings.get('rating');
        this._type = type;
        this._url = {
            trending: 'http://api.giphy.com/v1/gifs/trending?api_key=dc6zaTOxFJmzC',
            agree: 'http://api.giphy.com/v1/gifs/search?q=agree&api_key=dc6zaTOxFJmzC',
            awww: 'http://api.giphy.com/v1/gifs/search?q=awww&api_key=dc6zaTOxFJmzC',
            dance: 'http://api.giphy.com/v1/gifs/search?q=dance&api_key=dc6zaTOxFJmzC',
            deal: 'http://api.giphy.com/v1/gifs/search?q=deal+with+it&api_key=dc6zaTOxFJmzC',
            eww: 'http://api.giphy.com/v1/gifs/search?q=eww&api_key=dc6zaTOxFJmzC',
            facepalm: 'http://api.giphy.com/v1/gifs/search?q=facepalm&api_key=dc6zaTOxFJmzC',
            fist: 'http://api.giphy.com/v1/gifs/search?q=fist+bump&api_key=dc6zaTOxFJmzC',
            gl: 'http://api.giphy.com/v1/gifs/search?q=gl&api_key=dc6zaTOxFJmzC',
            bye: 'http://api.giphy.com/v1/gifs/search?q=goodbye&api_key=dc6zaTOxFJmzC',
            hug: 'http://api.giphy.com/v1/gifs/search?q=hug&api_key=dc6zaTOxFJmzC',
            idk: 'http://api.giphy.com/v1/gifs/search?q=idk&api_key=dc6zaTOxFJmzC',
            no: 'http://api.giphy.com/v1/gifs/search?q=no&api_key=dc6zaTOxFJmzC',
            omg: 'http://api.giphy.com/v1/gifs/search?q=omg&api_key=dc6zaTOxFJmzC',
            mic: 'http://api.giphy.com/v1/gifs/search?q=mic+drop&api_key=dc6zaTOxFJmzC',
            please: 'http://api.giphy.com/v1/gifs/search?q=please&api_key=dc6zaTOxFJmzC',
            oops: 'http://api.giphy.com/v1/gifs/search?q=oops&api_key=dc6zaTOxFJmzC',
            seriously: 'http://api.giphy.com/v1/gifs/search?q=seriously&api_key=dc6zaTOxFJmzC',
            shocked: 'http://api.giphy.com/v1/gifs/search?q=shocked&api_key=dc6zaTOxFJmzC',
            shrug: 'http://api.giphy.com/v1/gifs/search?q=shrug&api_key=dc6zaTOxFJmzC',
            sorry: 'http://api.giphy.com/v1/gifs/search?q=sorry&api_key=dc6zaTOxFJmzC',
            thanks: 'http://api.giphy.com/v1/gifs/search?q=thanks&api_key=dc6zaTOxFJmzC',
            yes: 'http://api.giphy.com/v1/gifs/search?q=yes&api_key=dc6zaTOxFJmzC'
        };

        this.setRating();
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
            '.gif-container { display: flex; width: 100%; height: 100%; flex-direction: row; justify-content: stretch; align-items: flex-start;flex-wrap: wrap; }',
            '.gif-item { display: block; width: auto; height: 250px; margin: 0 10px; }',
            '.gif-item__img-container { display: block; width: 100%; height: auto; }',
            '.gif-item__img-container img { display: block; max-width: 100%; height: auto; }',
            '.gif-item__url-container { display: flex; align-items: center; height: 30px; }',
            '.gif-item__url-container input { display: block; width: 100%; border: 1px solid #DDD; height: 30px; padding: 0 10px;}',
            '</style>',
            '<h1><span class="small">powered by</span> GIPHY</h1>',
            '<main class="gif-container">',
                '{{#each gifResults}}',
                    '<div class="gif-item" style="width: {{this.images.fixed_height.width}}px;">',
                        '<div class="gif-item__img-container">',
                            '<img src="{{this.images.fixed_height.url}}"/>',
                        '</div>',
                        '<div class="gif-item__url-container">',
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
            const filePath = `${__dirname}/gif/${this.getId()}-gif-preview-${this._type}.html`;
            fs.writeFile(filePath, template, (error) => {
                if (error) {
                    reject(error);
                }
                resolve(filePath);
            });
        });
    }

    setRating(): void {
        Object.keys(this._url).forEach((url) => {
            this._url[url] = `${this._url[url]}&rating=${this._rating}`;
            console.log(this._url[url]);
        });
    }

    async generatePage(): Promise<string> {
        const gifResults = await this.getGifs();
        const gifPreviewTemplate = this.getTemplate();
        const compiledGifTemplate = Handlebars.compile(gifPreviewTemplate);
        const dataTemplate = compiledGifTemplate({ gifResults: gifResults['data'] });
        return this.writePage(dataTemplate);
    }
}

export default Gif;