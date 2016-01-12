import {Directive, ElementRef, Renderer} from 'angular2/core';

import {Config} from '../../config/config';


/**
 * @name Icon
 * @description
 * Icons can be used on their own, or inside of a number of Ionic components.
 * For a full list of available icons, check out the
 * [Ionicons resource docs](../../../../resources/ionicons).
 *
 * One feature of Ionicons is that when icon names are set, the actual icon
 * which is rendered can change slightly depending on the mode the app is
 * running from. For example, by setting the icon name of `alarm`, on iOS the
 * icon will automatically apply `ios-alarm`, and on Material Design it will
 * automatically apply `md-alarm`. This allow the developer to write the
 * markup once, and let Ionic automatically apply the appropriate icon.
 *
 * @usage
 * ```html
 * <!-- automatically uses the correct "star" icon depending on the mode -->
 * <ion-icon name="star"></ion-icon>
 *
 * <!-- explicity set the icon for each mode -->
 * <ion-icon ios="ios-home" md="md-home"></ion-icon>
 *
 * <!-- always use the same icon, no matter what the mode -->
 * <ion-icon name="ios-clock"></ion-icon>
 * <ion-icon name="logo-twitter"></ion-icon>
 * ```
 *
 * @property {string} [name] - Use the appropriate icon for the mode.
 * @property {string} [ios] - Explicitly set the icon to use on iOS.
 * @property {string} [md] - Explicitly set the icon to use on Android.
 * @property {boolean} [isActive] - Whether or not the icon has an "active"
 * appearance. On iOS an active icon is filled in or full appearance, and an
 * inactive icon on iOS will use an outlined version of the icon same icon.
 * Material Design icons do not change appearance depending if they're active
 * or not. The `isActive` property is largely used by the tabbar.
 * @see {@link /docs/v2/components#icons Icon Component Docs}
 *
 */
@Directive({
  selector: 'ion-icon,icon',
  inputs: [
    'name',
    'ios',
    'md',
    'isActive'
  ],
  host: {
    'role': 'img'
  }
})
export class Icon {

  constructor(
    config: Config,
    private _elementRef: ElementRef,
    private _renderer: Renderer
  ) {
    this.mode = config.get('iconMode');
    this._name = '';
    this._ios = '';
    this._md = '';
    this._css = '';

    if (_elementRef.nativeElement.tagName === 'ICON') {
      // deprecated warning
      console.warn('<icon> has been renamed to <ion-icon>');
      console.warn('<ion-icon> requires the "name" attribute w/ a value');
      console.warn('<icon home></icon> should now be <ion-icon name="home"></ion-icon>');
    }
  }

  get name() {
    return this._name;
  }

  /**
   * @private
   */
  set name(val) {
    if (!(/^md-|^ios-|^logo-/.test(val))) {
      // this does not have one of the defaults
      // so lets auto add in the mode prefix for them
      val = this.mode + '-' + val;
    }
    this._name = val;
    this.update();
  }

  get ios() {
    return this._ios;
  }

  /**
   * @private
   */
  set ios(val) {
    this._ios = val;
    this.update();
  }

  get md() {
    return this._md;
  }

  /**
   * @private
   */
  set md(val) {
    this._md = val;
    this.update();
  }

  get isActive() {
    return (this._isActive === undefined || this._isActive === true || this._isActive === 'true');
  }

  /**
   * @private
   */
  set isActive(val) {
    this._isActive = val;
    this.update();
  }

  /**
   * @private
   */
  update() {
    let css = 'ion-';

    if (this._ios && this.mode === 'ios') {
      css += this._ios;

    } else if (this._md && this.mode === 'md') {
      css += this._md;

    } else {
      css += this._name;
    }

    if (this.mode == 'ios' && !this.isActive) {
      css += '-outline';
    }

    if (this._css !== css) {
      if (this._css) {
        this._renderer.setElementClass(this._elementRef, this._css, false);
      }
      this._css = css;
      this._renderer.setElementClass(this._elementRef, css, true);

      this._renderer.setElementAttribute(this._elementRef, 'aria-label',
          css.replace('ion-', '').replace('ios-', '').replace('md-', '').replace('-', ' '));
    }
  }

  /**
   * @private
   */
  addClass(className) {
    this._renderer.setElementClass(this._elementRef, className, true);
  }

}
