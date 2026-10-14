import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadHook(createBook) {
  const state = [];
  let reloads = 0;
  const react = {
    useState(initial) {
      const index = state.length;
      state.push(initial);
      return [initial, value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
    },
    useRef: value => ({ current: value }),
    useCallback: callback => callback,
    useEffect() {},
  };
  const api = {
    createBook,
    getBooks: async () => { reloads++; throw new Error('API_ERROR'); },
  };
  const source = fs.readFileSync(new URL('../src/hook/useBooks.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const context = { exports: {}, require: name => name === 'react' ? react : api };
  vm.runInNewContext(compiled, context);
  const hook = context.exports.default(() => {});
  return { hook, state, reloads: () => reloads };
}

test('new book is added without relying on a second request', async () => {
  const book = { id: 42, title: 'Title', author: 'Author', readed: false, reading: false };
  const { hook, state, reloads } = loadHook(async () => book);
  assert.equal(await hook.saveBook('Title', 'Author'), true);
  assert.equal(state[0].length, 1);
  assert.equal(state[0][0], book);
  assert.equal(reloads(), 0);
});

test('failed creation reports failure and keeps the shelf unchanged', async () => {
  const { hook, state } = loadHook(async () => { throw new Error('API_ERROR'); });
  assert.equal(await hook.saveBook('Title', 'Author'), false);
  assert.equal(state[0].length, 0);
  assert.ok(state[3]);
  assert.equal(state[2], false);
});
