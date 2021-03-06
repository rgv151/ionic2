import {defaults, assign} from '../util';
import {Hammer} from './hammer';

/**
 * A gesture recognizer class.
 *
 * TODO(mlynch): Re-enable the DOM event simulation that was causing issues (or verify hammer does this already, it might);
 */

export class Gesture {
  public element: HTMLElement;

  constructor(element, opts = {}) {
    defaults(opts, {
      domEvents: true
    });
    this.element = element;

    // Map 'x' or 'y' string to hammerjs opts
    this.direction = opts.direction || 'x';
    opts.direction = this.direction === 'x' ?
      Hammer.DIRECTION_HORIZONTAL :
      Hammer.DIRECTION_VERTICAL;

    this._options = opts;
    this._callbacks = {};

  }

  options(opts = {}) {
    assign(this._options, opts);
  }

  on(type, cb) {
    if(type == 'pinch' || type == 'rotate') {
      this.hammertime.get('pinch').set({enable: true});
    }
    this.hammertime.on(type, cb);
    (this._callbacks[type] || (this._callbacks[type] = [])).push(cb);
  }

  off(type, cb) {
    this.hammertime.off(type, this._callbacks[type] ? cb : null);
  }

  listen() {
    this.hammertime = new Hammer(this.element, this._options);
  }

  unlisten() {
    if (this.hammertime) {
      for (let type in this._callbacks) {
        for (let i = 0; i < this._callbacks[type].length; i++) {
          this.hammertime.off(type, this._callbacks[type]);
        }
      }
      this.hammertime.destroy();
      this.hammertime = null;
      this._callbacks = {}
    }
  }

  destroy() {
    this.unlisten()
  }
}
