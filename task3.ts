const _ = require('lodash');
const cr = require('crypto');
const readline = require('node:readline');
const AsciiTable = require('ascii-table')

class Game {
    private readonly _secretKey: string = cr.randomBytes(32).toString('hex').toUpperCase();
    private readonly _openKey: string = '';
    private readonly weapons: string[] = [];
    private readonly _errorMessage: string = '';
    private readonly weaponsCount: number = 0;
    private readonly compMoveIndex: number = 0;
    private readonly rl = readline.createInterface({ input: process.stdin, output: process.stdout});

    constructor(args: string[]) {
        this.weaponsCount = args.length;
        if (this.weaponsCount < 3) {
            this._errorMessage = 'at least 3!';
        } else if (!(this.weaponsCount % 2)) {
            this._errorMessage = 'must be odd!'
        } else if (_.uniq(args).length !== this.weaponsCount) {
            this._errorMessage = 'must be uniq!';
        } else {
            this.weapons = args;
            this.compMoveIndex =  Math.floor(Math.random() * this.weaponsCount);
            this._openKey = cr.createHmac("sha3-256", this._secretKey ).update(this.getCompMoveString()).digest("hex").toUpperCase();
        }
    }

    getCompMoveString(): string {
        return this.getWeapon(this.compMoveIndex);
    }

    getWeapon(ind: number): string {
        return this.weapons[ind];
    }

    startGame() {
        console.log('HMAC: ' + this._openKey);
        console.log('Available moves:');
        this.weapons.forEach((w, i) => {
            const commandNumber = i + 1
            console.log(commandNumber + ' - ' + this.getWeapon(i));
        });
        console.log('0 - exit');
        console.log('? - help');

        this.rl.question('Enter your move: ', this.callback.bind(this));
    }

    callback(answer: string) {
        if (answer === '?') {
            this.showTable();
        }
        const answerCommand = parseInt(answer);
        if (answerCommand === 0) {
            process.exit();
        }
        if (answerCommand <= this.weaponsCount) {
            this.move(answerCommand - 1, this.compMoveIndex);
        }
        console.log('Incorrect input');
        this.rl.question('Enter your move: ', this.callback.bind(this));
    }

    move(playerMoveIndex: number, compMoveIndex: number) {
        const resultMessage = this.getResultMessage(playerMoveIndex, compMoveIndex);
        console.log('Your move: ' + this.getWeapon(playerMoveIndex));
        console.log('Computer move: ' + this.getWeapon(compMoveIndex));
        console.log(resultMessage);
        console.log('HMAC key: ' + this._secretKey);
        process.exit();
    }

    getResultMessage(p: number, c: number): string {
        const radius = (this.weaponsCount - 1) / 2
        const res = Math.sign((p - c + radius + this.weaponsCount) % this.weaponsCount - radius);
        switch (res) {
            case 1: return 'You win!';
            case 0: return 'Draw!';
            case -1: return 'You lose!';
            default: return 'error';
        }
    }

    showTable() {
        const table = new AsciiTable('Rules');
        table.setHeading('v PC\\User >', ...this.weapons)

        this.weapons.forEach((name, c) => {
            const resultRow: string [] = [];
            this.weapons.forEach((n, p) => {
                resultRow.push(this.getResultMessage(p,c))
            })

            table.addRow(name, ...resultRow)
        })

        console.log(table.toString())
        this.startGame()
    }

    get errorMessage(): string {
        return this._errorMessage;
    }
}




const game = new Game(process.argv.slice(2));
if (game.errorMessage) {
    console.log(game.errorMessage);
    process.exit();
}
game.startGame();



