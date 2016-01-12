import {getQuerystring, assign} from '../util/util';
import {ready, windowDimensions, flushDimensionCache} from '../util/dom';


/**
 * @name Platform
 * @description
 * Platform returns the availble information about your current platform.
 * Platforms in Ionic 2 are much more complex then in V1, returns not just a single platform,
 * but a hierarchy of information, such as a devices OS, phone vs tablet, or mobile vs browser.
 * With this information you can completely custimize your app to fit any device and platform.
 *
 * @usage
 * ```ts
 * import {Platform} 'ionic/ionic';
 * export MyClass {
 *    constructor(platform: Platform){
 *      this.platform = platform;
 *    }
 * }
 * ```
 * @demo /docs/v2/demos/platform/
 */
export class Platform {
  private _platforms: Array<string>;
  private _versions: any={};
  private _dir: string;
  private _lang: string;
  private _url: string;
  private _qs: any;
  private _ua: string;
  private _bPlt: string;
  private _onResizes: Array<any>=[];
  private _readyPromise: any;
  private _readyResolve: any;
  private _engineReady: any;
  private _resizeTimer: any;
  public platformOverride: string;

  constructor(platforms=[]) {
    this._platforms = platforms;
    this._readyPromise = new Promise(res => { this._readyResolve = res; } );
  }


  // Methods
  // **********************************************

  /**
   * @param {string} platformName
   * @returns {bool} returns true/false based on platform you place
   * @description
   * Depending on the platform name, isPlatform will return true or flase
   *
   * ```
   * import {Platform} 'ionic/ionic';
   * export MyClass {
   *    constructor(platform: Platform){
   *      this.platform = platform;
   *      if(this.platform.is('ios'){
   *        // what ever you need to do for
   *        // if the platfomr is ios
   *      }
   *    }
   * }
   * ```
   */
  is(platformName) {
    return (this._platforms.indexOf(platformName) > -1);
  }

  /**
   * @returns {array} the array of platforms
   * @description
   * Depending on what device you are on, `platforms` can return multiple values.
   * Each possible value is a hierarchy of platforms. For example, on an iPhone,
   * it would return mobile, ios, and iphone.
   *
   * ```
   * import {Platform} 'ionic/ionic';
   * export MyClass {
   *    constructor(platform: Platform){
   *      this.platform = platform;
   *      console.log(this.platform.platforms());
   *      // This will return an array of all the availble platforms
   *      // From if your on mobile, to mobile os, and device name
   *    }
   * }
   * ```
   */
  platforms() {
    // get the array of active platforms, which also knows the hierarchy,
    // with the last one the most important
    return this._platforms;
  }


  /**
   * Returns an object containing information about the paltform
   *
   * ```
   * import {Platform} 'ionic/ionic';
   * export MyClass {
   *    constructor(platform: Platform){
   *      this.platform = platform;
   *      console.log(this.platform.versions());
   *    }
   * }
   * ```

   * @param {string} [platformName] optional platformName
   * @returns {object} An object with various platform info
   *
   */
  versions(platformName) {
    if (arguments.length) {
      // get a specific platform's version
      return this._versions[platformName];
    }

    // get all the platforms that have a valid parsed version
    return this._versions;
  }

  /**
   * @private
   */
  version() {
    for (let platformName in this._versions) {
      if (this._versions[platformName]) {
        return this._versions[platformName];
      }
    }
    return {};
  }

  /**
   * Returns a promise when the platform is ready and native functionality can be called
   *
   * ```
   * import {Platform} 'ionic/ionic';
   * export MyClass {
   *    constructor(platform: Platform){
   *      this.platform = platform;
   *      this.platform.ready().then(() => {
   *        console.log('Platform ready');
   *        // The platform is now ready, execute any native code you want
   *       });
   *    }
   * }
   * ```
   * @returns {promise} Returns a promsie when device ready has fired
   */
  ready() {
    return this._readyPromise;
  }

  /**
   * @private
   */
  prepareReady(config) {
    let self = this;

    function resolve() {
      self._readyResolve(config);
    }

    if (this._engineReady) {
      // the engine provide a ready promise, use this instead
      this._engineReady(resolve);

    } else {
      // there is no custom ready method from the engine
      // use the default dom ready
      ready(resolve);
    }
  }

  /**
  * Set the app's language direction, which will update the `dir` attribute
  * on the app's root `<html>` element. We recommend the app's `index.html`
  * file already has the correct `dir` attribute value set, such as
  * `<html dir="ltr">` or `<html dir="rtl">`. This method is useful if the
  * direction needs to be dynamically changed per user/session.
  * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
  * @param {string} dir  Examples: `rtl`, `ltr`
  */
  setDir(dir, updateDocument) {
    this._dir = (dir || '').toLowerCase();
    if (updateDocument !== false) {
      document.documentElement.setAttribute('dir', dir);
    }
  }

  /**
   * Returns app's language direction.
   * We recommend the app's `index.html` file already has the correct `dir`
   * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @returns {string}
   */
  dir() {
    return this._dir;
  }

  /**
   * Returns if this app is using right-to-left language direction or not.
   * We recommend the app's `index.html` file already has the correct `dir`
   * attribute value set, such as `<html dir="ltr">` or `<html dir="rtl">`.
   * [W3C: Structural markup and right-to-left text in HTML](http://www.w3.org/International/questions/qa-html-dir)
   * @returns {boolean}
   */
  isRTL() {
    return (this._dir === 'rtl');
  }

  /**
  * Set the app's language and optionally the country code, which will update
  * the `lang` attribute on the app's root `<html>` element.
  * We recommend the app's `index.html` file already has the correct `lang`
  * attribute value set, such as `<html lang="en">`. This method is useful if
  * the language needs to be dynamically changed per user/session.
  * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
  * @param {string} language  Examples: `en-US`, `en-GB`, `ar`, `de`, `zh`, `es-MX`
  */
  setLang(language, updateDocument) {
    this._lang = language;
    if (updateDocument !== false) {
      document.documentElement.setAttribute('lang', language);
    }
  }

  /**
   * Returns app's language and optional country code.
   * We recommend the app's `index.html` file already has the correct `lang`
   * attribute value set, such as `<html lang="en">`.
   * [W3C: Declaring language in HTML](http://www.w3.org/International/questions/qa-html-language-declarations)
   * @returns {string}
   */
  lang() {
    return this._lang;
  }

  // Methods meant to be overridden by the engine
  // **********************************************
  // Provided NOOP methods so they do not error when
  // called by engines (the browser) doesn't provide them
  /**
  * @private
  */
  on() {}
  /**
  * @private
  */
  onHardwareBackButton() {}
  /**
  * @private
  */
  registerBackButtonAction() {}
  /**
  * @private
  */
  exitApp() {}
  /**
  * @private
  */
  fullScreen() {}
  /**
  * @private
  */
  showStatusBar() {}


  // Getter/Setter Methods
  // **********************************************

  /**
  * @private
  */
  setUrl(url) {
    this._url = url;
    this._qs = getQuerystring(url);
  }

  /**
  * @private
  */
  url(val) {
    return this._url;
  }

  /**
  * @private
  */
  query(key) {
    return (this._qs || {})[key];
  }

  /**
  * @private
  */
  setUserAgent(userAgent) {
    this._ua = userAgent;
  }

  /**
  * @private
  */
  userAgent(val) {
    return this._ua || '';
  }

  /**
  * @private
  */
  setNavigatorPlatform(navigatorPlatform) {
    this._bPlt = navigatorPlatform;
  }

  /**
  * @private
  */
  navigatorPlatform(val) {
    return this._bPlt || '';
  }

  /**
  * @private
  */
  width() {
    return windowDimensions().width;
  }

  /**
  * @private
  */
  height() {
    return windowDimensions().height;
  }

  /**
  * @private
  */
  isPortrait() {
    return this.width() < this.height();
  }

  /**
  * @private
  */
  isLandscape() {
    return !this.isPortrait();
  }

  /**
  * @private
  */
  windowResize() {
    let self = this;
    clearTimeout(self._resizeTimer);

    self._resizeTimer = setTimeout(() => {
      flushDimensionCache();

      for (let i = 0; i < self._onResizes.length; i++) {
        try {
          self._onResizes[i]();
        } catch (e) {
          console.error(e);
        }
      }
    }, 250);
  }

  /**
  * @private
  */
  onResize(cb) {
    this._onResizes.push(cb);
  }


  // Platform Registry
  // **********************************************

  /**
   * @private
   */
  static register(platformConfig) {
    platformRegistry[platformConfig.name] = platformConfig;
  }

  /**
  * @private
  */
  static registry() {
    return platformRegistry;
  }

  /**
   * @private
   */
  static get(platformName) {
    return platformRegistry[platformName] || {};
  }

  /**
   * @private
   */
  static setDefault(platformName) {
    platformDefault = platformName;
  }

  /**
   * @private
   */
  testQuery(queryValue, queryTestValue) {
    let valueSplit = queryValue.toLowerCase().split(';');
    return valueSplit.indexOf(queryTestValue) > -1;
  }

  /**
   * @private
   */
  testUserAgent(userAgentExpression) {
    let rgx = new RegExp(userAgentExpression, 'i');
    return rgx.test(this._ua || '');
  }

  /**
   * @private
   */
  testNavigatorPlatform(navigatorPlatformExpression) {
    let rgx = new RegExp(navigatorPlatformExpression, 'i');
    return rgx.test(this._bPlt);
  }

  /**
   * @private
   */
  matchUserAgentVersion(userAgentExpression) {
    if (this._ua && userAgentExpression) {
      let val = this._ua.match(userAgentExpression);
      if (val) {
        return {
          major: val[1],
          minor: val[2]
        };
      }
    }
  }

  /**
   * @private
   */
  isPlatform(queryTestValue, userAgentExpression) {
    if (!userAgentExpression) {
      userAgentExpression = queryTestValue;
    }

    let queryValue = this.query('ionicplatform');
    if (queryValue) {
      return this.testQuery(queryValue, queryTestValue);
    }

    return this.testUserAgent(userAgentExpression);
  }

  /**
   * @private
   */
  load(platformOverride) {
    let rootPlatformNode = null;
    let engineNode = null;
    let self = this;

    this.platformOverride = platformOverride;

    // figure out the most specific platform and active engine
    let tmpPlatform = null;
    for (let platformName in platformRegistry) {

      tmpPlatform = this.matchPlatform(platformName);
      if (tmpPlatform) {
        // we found a platform match!
        // check if its more specific than the one we already have

        if (tmpPlatform.isEngine) {
          // because it matched then this should be the active engine
          // you cannot have more than one active engine
          engineNode = tmpPlatform;

        } else if (!rootPlatformNode || tmpPlatform.depth > rootPlatformNode.depth) {
          // only find the root node for platforms that are not engines
          // set this node as the root since we either don't already
          // have one, or this one is more specific that the current one
          rootPlatformNode = tmpPlatform;
        }
      }
    }

    if (!rootPlatformNode) {
      rootPlatformNode = new PlatformNode(platformDefault);
    }

    // build a Platform instance filled with the
    // hierarchy of active platforms and settings

    if (rootPlatformNode) {

      // check if we found an engine node (cordova/node-webkit/etc)
      if (engineNode) {
        // add the engine to the first in the platform hierarchy
        // the original rootPlatformNode now becomes a child
        // of the engineNode, which is not the new root
        engineNode.child = rootPlatformNode;
        rootPlatformNode.parent = engineNode;
        rootPlatformNode = engineNode;

        // add any events which the engine would provide
        // for example, Cordova provides its own ready event
        let engineMethods = engineNode.methods();
        engineMethods._engineReady = engineMethods.ready;
        delete engineMethods.ready;
        assign(this, engineMethods);
      }

      let platformNode = rootPlatformNode;
      while (platformNode) {
        insertSuperset(platformNode);
        platformNode = platformNode.child;
      }

      // make sure the root noot is actually the root
      // incase a node was inserted before the root
      platformNode = rootPlatformNode.parent;
      while (platformNode) {
        rootPlatformNode = platformNode;
        platformNode = platformNode.parent;
      }

      platformNode = rootPlatformNode;
      while (platformNode) {
        // set the array of active platforms with
        // the last one in the array the most important
        this._platforms.push(platformNode.name());

        // get the platforms version if a version parser was provided
        this._versions[platformNode.name()] = platformNode.version(this);

        // go to the next platform child
        platformNode = platformNode.child;
      }
    }

    if (this._platforms.indexOf('mobile') > -1 && this._platforms.indexOf('cordova') === -1) {
      this._platforms.push('mobileweb');
    }
  }

  /**
   * @private
   */
  matchPlatform(platformName) {
    // build a PlatformNode and assign config data to it
    // use it's getRoot method to build up its hierarchy
    // depending on which platforms match
    let platformNode = new PlatformNode(platformName);
    let rootNode = platformNode.getRoot(this);

    if (rootNode) {
      rootNode.depth = 0;
      let childPlatform = rootNode.child;
      while (childPlatform) {
        rootNode.depth++;
        childPlatform = childPlatform.child;
      }
    }
    return rootNode;
  }

}

function insertSuperset(platformNode) {
  let supersetPlaformName = platformNode.superset();
  if (supersetPlaformName) {
    // add a platform in between two exist platforms
    // so we can build the correct hierarchy of active platforms
    let supersetPlatform = new PlatformNode(supersetPlaformName);
    supersetPlatform.parent = platformNode.parent;
    supersetPlatform.child = platformNode;
    if (supersetPlatform.parent) {
      supersetPlatform.parent.child = supersetPlatform;
    }
    platformNode.parent = supersetPlatform;
  }
}


class PlatformNode {
  private c: any;
  public parent: PlatformNode;
  public child: PlatformNode;
  public isEngine: boolean;

  constructor(platformName) {
    this.c = Platform.get(platformName);
    this.isEngine = this.c.isEngine;
  }

  name(): string {
    return this.c.name;
  }

  settings() {
    return this.c.settings || {};
  }

  superset() {
    return this.c.superset;
  }

  methods() {
    return this.c.methods || {};
  }

  isMatch(p): boolean {
    if (p.platformOverride && !this.isEngine) {
      return (p.platformOverride === this.c.name);

    } else if (!this.c.isMatch) {
      return false;
    }

    return this.c.isMatch(p);
  }

  version(p) {
    if (this.c.versionParser) {
      let v = this.c.versionParser(p);
      if (v) {
        let str = v.major + '.' + v.minor;
        return {
          str: str,
          num: parseFloat(str),
          major: parseInt(v.major, 10),
          minor: parseInt(v.minor, 10)
        };
      }
    }
  }

  getRoot(p) {
    if (this.isMatch(p)) {

      let parents = this.getSubsetParents(this.name());

      if (!parents.length) {
        return this;
      }

      let platform = null;
      let rootPlatform = null;

      for (let i = 0; i < parents.length; i++) {
        platform = new PlatformNode(parents[i]);
        platform.child = this;

        rootPlatform = platform.getRoot(p);
        if (rootPlatform) {
          this.parent = platform;
          return rootPlatform;
        }
      }
    }

    return null;
  }

  getSubsetParents(subsetPlatformName) {
    let platformRegistry = Platform.registry();

    let parentPlatformNames = [];
    let platform = null;

    for (let platformName in platformRegistry) {
      platform = platformRegistry[platformName];

      if (platform.subsets && platform.subsets.indexOf(subsetPlatformName) > -1) {
        parentPlatformNames.push(platformName);
      }
    }

    return parentPlatformNames;
  }

}

let platformRegistry = {};
let platformDefault = null;
