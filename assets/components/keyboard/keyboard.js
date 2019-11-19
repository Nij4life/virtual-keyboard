import languages from '../../abstracts/languages.js';
import signs from '../../abstracts/signs.js';

class Keyboard {
    constructor(textarea) {
        this.textarea = textarea;
        this.lang = 'en';
        this._useStorage();
        this.capsLock = false;
        this.keyboard = this.initialize();
        this.addListeners();

        return this.keyboard;
    }

    initialize() {
        const wrap = document.createElement('div');
        wrap.classList.add('keyboard');
        const arr = Object.entries(languages[this.lang]);
        let row = document.createElement('div');
        row.classList.add('keyboard--row');
        wrap.append(row);

        arr.forEach((cell, i) => {
            if (i === 14 || i === 28 || i === 41 || i === 54) {
                row = document.createElement('div');
                row.classList.add('keyboard--row');
                wrap.append(row);
            }
            const span = document.createElement('span');
            span.classList.add('keyboard--item');
            span.setAttribute('data-Keycode', `${cell[0]}`);
            span.textContent = `${cell[1]}`;
            row.append(span);
        })
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

    _setActiveClass({ target }) {
        if (target.classList.contains('keyboard--item')) {
            const keycode = target.dataset.keycode;
            if (/^CapsLock$/.test(keycode) && this.capsLock) {
                target.classList.toggle('active');
            } else {
                target.classList.add('active');
            }
        }
    }

    _removeActiveClass({ target }) {
        if (target.classList.contains('keyboard--item')) {
            const keycode = target.dataset.keycode;
            if (!/^CapsLock$/.test(keycode)) {
                target.classList.remove('active');
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
        elems.forEach(el => {
            if (/^Key/.test(el.dataset.keycode)) el.textContent = el.textContent.toUpperCase();
        });
    }

    _lettersDown() {
        const elems = this.keyboard.querySelectorAll('.keyboard--item');
        elems.forEach(el => {
            if (/^Key/.test(el.dataset.keycode)) el.textContent = el.textContent.toLowerCase();
        });
    }

    _useShift() {
        const entries = Object.entries(signs[this.lang]);
        entries.forEach((el) => {
            this.keyboard.querySelector(`[data-keycode="${el[0]}"]`).textContent = el[1];
        });

        !this.capsLock ? this._lettersUp() : this._lettersDown();
    }

    _listenerLeave({ target }) {
        target.addEventListener('mouseleave', e => {
            e.target.classList.remove('active');
            if (target.dataset.keycode === 'ShiftLeft' || target.dataset.keycode === 'ShiftRight') {
                this._lettersDown();
            }
        }, { once: true });
    }

    addListeners() {
        window.addEventListener('DOMContentLoaded', () => {
            this.addListenerRealKeyboard();
            this.addListenVirtualKeyboard();
        });
    }

    addListenerRealKeyboard() {
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'CapsLock':
                    this.capsLock = !this.capsLock;
                    this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.toggle('active');
                    this.capsLock ? this._lettersUp() : this._lettersDown();
                    break;

                case 'Tab': {
                    let indexСarriage = this.textarea.selectionStart;
                    let text = this.textarea.value;
                    this.textarea.value = [...text.slice(0, indexСarriage), '    ', ...text.slice(indexСarriage)].join('');
                    this.textarea.selectionEnd = indexСarriage + 4;
                    e.preventDefault();
                }
                    break;

                case 'AltRight':
                case 'AltLeft':
                    if (e.shiftKey) {
                        this.changeLang();
                    } else {
                        e.preventDefault();
                    }
                    break;

                case 'ShiftLeft':
                        this.keyboard.querySelector(`[data-keycode='ShiftRight']`).classList.remove('active');
                        this.keyboard.querySelector(`[data-keycode='ShiftLeft']`).classList.add('active');
                        this._useShift();
                        break;
                case 'ShiftRight':
                        this.keyboard.querySelector(`[data-keycode='ShiftLeft']`).classList.remove('active');
                        this.keyboard.querySelector(`[data-keycode='ShiftRight']`).classList.add('active');
                        this._useShift();
                    break;
            }

            if (this.keyboard.querySelector(`[data-keycode=${e.code}]`) && e.code !== 'CapsLock') {
                this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.add('active');
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.code === 'CapsLock') return;

            if (this.keyboard.querySelector(`[data-keycode=${e.code}]`)) {
                this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.remove('active');

                if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
                    this.fill();

                    if (this.capsLock) {
                        this._lettersUp();
                    }

                    this.keyboard.querySelector(`[data-keycode=${e.code}]`).classList.remove('active');
                }
            }
        });
    }

    addListenVirtualKeyboard() {
        this.keyboard.addEventListener('mousedown', (e) => {
            const keycode = e.target.dataset.keycode;
            let key = e.target.textContent;
            let indexСarriage = this.textarea.selectionStart;
            let text = this.textarea.value;

            this._setActiveClass(e);
            this._listenerLeave(e);

            if (e.target.classList.contains('keyboard--item')) {
                // letter and digit
                if (!/^Arrow/.test(keycode) && key.length < 2) {
                    if (e.shiftKey || this.capsLock) {
                        this.textarea.value = [...text.slice(0, indexСarriage), key, ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = ++indexСarriage;
                    } else {
                        this.textarea.value = [...text.slice(0, indexСarriage), key.toLowerCase(), ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = ++indexСarriage;
                    }
                }

                // speсial keys
                switch (true) {
                    case (/^Shift/.test(keycode)):
                        this._useShift();
                        break;
                    case (/^Tab$/.test(keycode)):
                        this.textarea.value = [...text.slice(0, indexСarriage), '    ', ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = indexСarriage + 4;
                        break;

                    case (/^Space$/.test(keycode)):
                        this.textarea.value = [...text.slice(0, indexСarriage - 1), ' ', ...text.slice(indexСarriage - 1)].join('');
                        this.textarea.selectionEnd = indexСarriage;
                        break;
                    case (/^Enter$/.test(keycode)):
                        this.textarea.value = [...text.slice(0, indexСarriage), '\n', ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = ++indexСarriage;
                        break;
                    case (/^Backspace$/.test(keycode)):
                        this.textarea.value = [...text.slice(0, indexСarriage - 1), ...text.slice(indexСarriage)].join('');
                        this.textarea.selectionEnd = --indexСarriage;
                        break;
                    case (/^CapsLock$/.test(keycode)):
                        this.capsLock = !this.capsLock;
                        this.capsLock ? this._lettersUp() : this._lettersDown();
                        break;
                    case (/^ArrowLeft$/.test(keycode)):
                        this.textarea.selectionStart -= 1;
                        this.textarea.selectionEnd -= 1;
                        break;
                    case (/^ArrowRight$/.test(keycode)):
                        this.textarea.selectionEnd += 1;
                        this.textarea.selectionStart = this.textarea.selectionEnd;
                        break;
                    default:
                        break;
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

            this._removeActiveClass(e);
            this.textarea.focus();
        });

    }
}

export default Keyboard;
