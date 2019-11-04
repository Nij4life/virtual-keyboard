import languages from '../../abstracts/languages.js';
import signs from '../../abstracts/signs.js';
class Keyboard {
    constructor(textarea) {
        this.textarea = textarea;
        this.lang = 'en';
        this._useStorage();
        this.capsLock = false;
        this.keyboard = this.initialize();
        this.listeners();

        return this.keyboard;
    }

    initialize() {
        const ul = document.createElement('ul');
        ul.classList.add('keyboard');
        const arr = Object.entries(languages[this.lang]);

        for (let cell of arr) {
            const li = document.createElement('li');
            li.classList.add('keyboard--item');
            li.setAttribute('data-Keycode', `${cell[0]}`);
            li.textContent = `${cell[1]}`;
            ul.append(li);
        }
        return ul;
    }

    changeLang() {
        this.lang = (this.lang === 'en') ? 'ru' : 'en';
        this.fill();
        sessionStorage.setItem('lang', this.lang);
    }

    fill() {
        this.keyboard.querySelectorAll('[data-keycode]')
            .forEach(cell => {
                cell.textContent = languages[this.lang][cell.dataset.keycode];
            });
    }

    _toggleActiveClass(e) {
        const keycode = e.target.dataset.keycode;
        if (/^CapsLock$/.test(keycode) && this.capsLock) {
            e.target.classList.toggle('active');
        } else {
            e.target.classList.toggle('active');
        }
    }

    _useStorage() {
        if (sessionStorage.getItem('lang')) {
            this.lang = sessionStorage.getItem('lang');
        }
    }

    _lettersUp() {
        const elems = this.keyboard.querySelectorAll('.keyboard--item');
        for (let x of elems) {
            if (/^Key/.test(x.dataset.keycode)) x.textContent = x.textContent.toUpperCase();
        }
    }

    _lettersDown() {
        const elems = this.keyboard.querySelectorAll('.keyboard--item');
        for (let x of elems) {
            if (/^Key/.test(x.dataset.keycode)) x.textContent = x.textContent.toLowerCase();
        }
    }

    _useShift() {
        const entries = Object.entries(signs[this.lang]);
        entries.forEach((el) => {
            this.keyboard.querySelector(`[data-keycode="${el[0]}"]`).textContent = el[1];
        });

        this._lettersUp();
    }

    listeners() {
        window.addEventListener('DOMContentLoaded', () => {
            this.listenReal();
            this.listenVirtual();
        });
    }

    listenReal() {
        document.addEventListener('keydown', (e) => {
            if (e.code === 'CapsLock') {
                this.capsLock = (this.capsLock === true) ? false : true;
                this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.toggle('active');
                if (this.capsLock) {
                    this._lettersUp();
                } else {
                    this._lettersDown();
                }

            } else if (this.keyboard.querySelector(`[data-keycode=${e.code}]`)) {
                this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.add('active');
            }

            if (e.code === 'Tab') {
                this.textarea.value += '    ';
                e.preventDefault();
            }

            if (e.code === 'AltRight' || e.code === 'AltLeft') {
                if (e.shiftKey) {
                    this.changeLang();
                } else {
                    e.preventDefault();
                }
            }

            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this._useShift();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'CapsLock') return;

            if (this.keyboard.querySelector(`[data-keycode=${e.code}]`)) {
                this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.remove('active');
            }

            if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                this.fill();
            }
        });
    }



    listenVirtual() {
        this.keyboard.addEventListener('mousedown', (e) => {
            let key = e.target.textContent;
            const keycode = e.target.dataset.keycode;

            this._toggleActiveClass(e);

            if (e.target.classList.contains('keyboard--item')) {
                // letter and digit
                if (key.length < 2) {
                    if (e.shiftKey || this.capsLock) {
                        this.textarea.value += key;
                    } else {
                        this.textarea.value += (key).toLowerCase();
                    }
                }
                // speсial keys
                if (/^Shift/.test(keycode)) {
                    this._useShift();
                } else if (/^Tab$/.test(keycode)) {
                    this.textarea.value += '    ';
                } else if (/^Space$/.test(keycode)) {
                    this.textarea.value += ' ';
                } else if (/^Enter$/.test(keycode)) {
                    this.textarea.value += '\n';
                } else if (/^Backspace$/.test(keycode)) {
                    this.textarea.value = this.textarea.value.slice(0, -1);
                } else if (/^CapsLock$/.test(keycode)) {
                    this.capsLock = this.capsLock ? false : true;
                    if (this.capsLock) {
                        this._lettersUp();
                    } else {
                        this._lettersDown();
                    }
                }
            }
        });

        this.keyboard.addEventListener('mouseup', (e) => {
            // if no caps lock that change class .active
            if (/^CapsLock$/.test(e.target.dataset.keycode)) return;

            if (/^Shift/.test(e.target.dataset.keycode) ) {
                this._lettersDown();
                this.fill();
            }

            this._toggleActiveClass(e);
        });
    }
}

export default Keyboard;
