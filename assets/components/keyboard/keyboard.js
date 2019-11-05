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
        const wrap = document.createElement('div');
        wrap.classList.add('keyboard');
        const arr = Object.entries(languages[this.lang]);
        let row = document.createElement('div');
        row.classList.add('keyboard--row');
        wrap.append(row);
        let i = 0;

        for(let cell of arr) {
            if (i === 14 || i === 28 || i === 41 ||  i === 54) {
                row = document.createElement('div');
                row.classList.add('keyboard--row');
                wrap.append(row);
            }
            const span = document.createElement('span');
            span.classList.add('keyboard--item');
            span.setAttribute('data-Keycode', `${cell[0]}`);
            span.textContent = `${cell[1]}`;
            row.append(span);
            i++;
        }
        return wrap;
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
        if (e.target.classList.contains('keyboard--item')) {
            const keycode = e.target.dataset.keycode;
            if (/^CapsLock$/.test(keycode) && this.capsLock) {
                e.target.classList.toggle('active');
            } else {
                e.target.classList.toggle('active');
            }
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
                let indexСarriage = this.textarea.selectionStart;
                let text = this.textarea.value;
                this.textarea.value = [...text.slice(0, indexСarriage), '    ', ...text.slice(indexСarriage)].join('');
                this.textarea.selectionEnd = indexСarriage + 4;
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
            let indexСarriage = this.textarea.selectionStart;
            let text = this.textarea.value;

            this._toggleActiveClass(e);

            if (e.target.classList.contains('keyboard--item')) {
                // letter and digit
                if (key.length < 2) {
                    if (e.shiftKey || this.capsLock) {
                        this.textarea.value = [...text.slice(0, indexСarriage), key, ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = ++indexСarriage;
                    } else {
                        this.textarea.value = [...text.slice(0, indexСarriage), key.toLowerCase(), ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = ++indexСarriage;
                    }
                }
                // speсial keys
                if (/^Shift/.test(keycode)) {
                    this._useShift();
                } else if (/^Tab$/.test(keycode)) {
                    this.textarea.value = [...text.slice(0, indexСarriage), '    ', ...text.slice(indexСarriage)].join('');
                    this.textarea.selectionEnd = indexСarriage + 4;
                } else if (/^Space$/.test(keycode)) {
                    this.textarea.value = [...text.slice(0, indexСarriage), ' ', ...text.slice(indexСarriage)].join('');
                    this.textarea.selectionEnd = ++indexСarriage;
                } else if (/^Enter$/.test(keycode)) {
                    this.textarea.value = [...text.slice(0, indexСarriage), '\n', ...text.slice(indexСarriage)].join('');
                    this.textarea.selectionEnd = ++indexСarriage;
                } else if (/^Backspace$/.test(keycode)) {
                    this.textarea.value = [...text.slice(0, indexСarriage-1), ...text.slice(indexСarriage)].join('');
                    this.textarea.selectionEnd = --indexСarriage;
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

            if (/^Shift/.test(e.target.dataset.keycode)) {
                this._lettersDown();
                this.fill();
            }

            this._toggleActiveClass(e);
            this.textarea.focus();
        });
    }
}



export default Keyboard;
