// Minimal DOM/event contract harness, NOT a browser, layout engine or WebGL test.
import assert from 'node:assert/strict';
export function canvasContext() {
 const ops = [], c = new Proxy({ops}, {
  get(target, key) { if (key in target) return target[key]; return (...args) => { for (const a of args) if (typeof a === 'number') assert.ok(Number.isFinite(a), `Nonfinite canvas ${String(key)}`); ops.push([key, ...args]); }; },
  set(target, key, value) { target[key] = value; ops.push(['set', key, value]); return true; }
 }); return c;
}
export function fakeDOM() {
 const previous = Object.fromEntries(['document', 'localStorage', 'requestAnimationFrame', 'cancelAnimationFrame'].map(k => [k, Object.getOwnPropertyDescriptor(globalThis,k)]));
 const frames = new Map(), storage = new Map(); let next = 0;
 class Node {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.attributes = {}; this.dataset = {}; this.handlers = {}; this.className = ''; this.style = {setProperty() {}}; this.disabled = false; this.textContent = ''; this._context = null; this.classList = {add: cls => {this.className += ' ' + cls;}, remove: cls => {this.className = this.className.split(' ').filter(c => c !== cls).join(' ');}, contains: cls => this.className.split(' ').includes(cls)}; }
  append(...children) { for (const child of children) { child.parent = this; this.children.push(child); } }
  set innerHTML(value) { this.children = []; this._html = value; }
  get innerHTML() { return this._html || ''; }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  addEventListener(k, fn) { (this.handlers[k] ||= []).push(fn); }
  dispatchEvent(e) { for (const fn of this.handlers[e.type] || []) fn(e); return true; }
  fire(type, data = {}) { this.dispatchEvent({type, button: 0, pointerId: 1, preventDefault() {}, ...data}); }
  focus() { if (document.activeElement !== this) { document.activeElement?.fire('blur'); document.activeElement = this; this.fire('focus'); } }
  click() { if (!this.disabled) { this.onclick?.(); this.fire('click'); } }
  setPointerCapture() {}
  getBoundingClientRect() { return {left: 0, top: 0, width: 640, height: 420}; }
  getContext() { return this._context ||= canvasContext(); }
  toDataURL() { return 'data:image/png;base64,TEST'; }
  showModal() { this.open = true; }
  close() { this.open = false; this.fire('close'); }
  querySelectorAll(selector) { const match = (el, query) => { if (query.startsWith('.')) return el.className.split(' ').includes(query.slice(1)); if (query === '[data-item]') return el.dataset.item !== undefined; if (query === 'canvas[tabindex]') return el.tagName === 'CANVAS' && el.tabIndex !== undefined; return el.tagName === query.toUpperCase(); }; const out = []; const walk = node => { for (const c of node.children) { if (selector.split(',').some(q => match(c, q))) out.push(c); walk(c); } }; walk(this); return out; }
 }
 const body = new Node('body');
 const document = {body, activeElement: body, createElement: tag => new Node(tag), getElementById: id => { let found; const walk = n => { if (n.id === id) found = n; n.children.forEach(walk); }; walk(body); return found; }};
 globalThis.document = document;
 Object.defineProperty(globalThis,'localStorage',{configurable:true,writable:true,value:{setItem:(k,v)=>{storage.set(k,v);},getItem:k=>storage.get(k)??null}});
 globalThis.requestAnimationFrame = fn => { const id = ++next; frames.set(id, fn); return id; };
 globalThis.cancelAnimationFrame = id => frames.delete(id);
 return {document, storage, frames, node(tag, id) { const el = document.createElement(tag); el.id = id; body.append(el); return el; }, flush() { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(fn => fn()); }, restore() { for(const [key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];} }};
}
