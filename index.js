import Keyboard from './assets/components/keyboard/keyboard.js';

const textarea = document.createElement('textarea');
textarea.classList.add('textarea');
const virtualKeyboard = new Keyboard(textarea);

const container = document.createElement('div');
container.classList.add('container');
container.append(textarea);
container.append(virtualKeyboard);
document.body.append(container);
