import {Directive, Component, ElementRef, Host, EventEmitter, Output} from 'angular2/core';
import {NgClass} from 'angular2/common';

import {Ion} from '../ion';
import {Animation} from '../../animations/animation';
import {Gesture} from '../../gestures/gesture';
import {DragGesture} from '../../gestures/drag-gesture';
import {Config} from '../../config/config';
import {dom} from '../../util';
import {CSS} from '../../util/dom';
import * as util from '../../util';

import {Swiper} from './swiper-widget';
import {Scroll} from '../scroll/scroll';


/**
 * @name Slides
 * @description
 * Slides is a slide box implementation based on Swiper.js
 *
 * Swiper.js:
 * The most modern mobile touch slider and framework with hardware accelerated transitions
 *
 * http://www.idangero.us/swiper/
 *
 * Copyright 2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under MIT
 *
 * @usage
 * ```ts
 * @Page({
 *  template: `
 *     <ion-slides pager (change)="onSlideChanged($event)" loop="true" autoplay="3000">
 *      <ion-slide>
 *        <h3>Thank you for choosing the Awesome App!</h3>
 *        <p>
 *          The number one app for everything awesome.
 *        </p>
 *      </ion-slide>
 *      <ion-slide>
 *        <h3>Using Awesome</h3>
 *         <div id="list">
 *           <h5>Just three steps:</h5>
 *           <ol>
 *             <li>Be awesome</li>
 *             <li>Stay awesome</li>
 *             <li>There is no step 3</li>
 *           </ol>
 *         </div>
 *      </ion-slide>
 *      <ion-slide>
 *        <h3>Any questions?</h3>
 *      </ion-slide>
 *    </ion-slides>
 *    `
 *})
 *
 *```
 * @property {Number} [autoplay] - enable autoplay if set w/ delay between transitions (in ms)
 * @property {Boolean} [loop] - whether the slides should loop from the last slide back to the first
 * @property {Boolean} [bounce] - whether the slides should bounce
 * @property {Number} [index] - The slide index to start on
 * @property [pager] - add this property to enable the slide pager
 * @property {Any} [change] - expression to evaluate when a slide has been changed
 * @demo /docs/v2/demos/slides/
 * @see {@link /docs/v2/components#slides Slides Component Docs}
 */
@Component({
  selector: 'ion-slides',
  inputs: [
    'autoplay',
    'loop',
    'index',
    'bounce',
    'pager',
    'options',
    'zoom',
    'zoomDuration',
    'zoomMax'
  ],
  template:
    '<div class="swiper-container">' +
      '<div class="swiper-wrapper">' +
        '<ng-content></ng-content>' +
      '</div>' +
      '<div [class.hide]="!showPager" class="swiper-pagination"></div>' +
    '</div>',
  directives: [NgClass]
})
export class Slides extends Ion {
  @Output() change: EventEmitter<any> = new EventEmitter();

  /**
   * @private
   * @param {ElementRef} elementRef  TODO
   */
  constructor(elementRef: ElementRef, config: Config) {

    super(elementRef, config);
    this.rapidUpdate = util.debounce(() => {
      this.update();
    }, 10);

    console.warn("(slideChanged) deprecated. Use (change) to track slide changes.");
  }

  /**
   * @private
   */
  ngOnInit() {
    if(!this.options) {
      this.options = {};
    }

    this.showPager = util.isTrueProperty(this.pager);


    var options = util.defaults({
      loop: util.isTrueProperty(this.loop),
      autoplay: parseInt(this.autoplay) || 0,
      pagination: '.swiper-pagination',
      paginationClickable: true,
      lazyLoading: true,
      preloadImages: false
    }, this.options);

    options.onTap = (swiper, e) => {
      this.onTap(swiper, e);
      return this.options.onTap && this.options.onTap(swiper, e);
    };
    options.onClick = (swiper, e) => {
      this.onClick(swiper, e);
      return this.options.onClick && this.options.onClick(swiper, e);
    };
    options.onDoubleTap = (swiper, e) => {
      this.onDoubleTap(swiper, e);
      return this.options.onDoubleTap && this.options.onDoubleTap(swiper, e);
    };
    options.onTransitionStart = (swiper, e) => {
      this.onTransitionStart(swiper, e);
      return this.options.onTransitionStart && this.options.onTransitionStart(swiper, e);
    };
    options.onTransitionEnd = (swiper, e) => {
      this.onTransitionEnd(swiper, e);
      return this.options.onTransitionEnd && this.options.onTransitionEnd(swiper, e);
    };
    options.onSlideChangeStart = (swiper) => {
      return this.options.onSlideChangeStart && this.options.onSlideChangeStart(swiper);
    };
    options.onSlideChangeEnd = (swiper) => {
      this.change.emit(swiper);
      return this.options.onSlideChangeEnd && this.options.onSlideChangeEnd(swiper);
    };
    options.onLazyImageLoad = (swiper, slide, img) => {
      return this.options.onLazyImageLoad && this.options.onLazyImageLoad(swiper, slide, img);
    };
    options.onLazyImageReady = (swiper, slide, img) => {
      return this.options.onLazyImageReady && this.options.onLazyImageReady(swiper, slide, img);
    };

    var swiper = new Swiper(this.getNativeElement().children[0], options);

    this.slider = swiper;

    /*
    * TODO: Finish this
    if(util.isTrueProperty(this.zoom)) {
      this.enableZoom = true;
      setTimeout(() => {
        this.initZoom();
      })
    }
    */

  }

  /**
   * @private
   */
  onTap(swiper, e) {
  }
  /**
   * @private
   */
  onClick(swiper, e) {
  }
  /**
   * @private
   */
  onDoubleTap(swiper, e) {

    this.toggleZoom(swiper, e);
  }
  /**
   * @private
   */
  onLazyImageLoad(swiper, slide, img) {
  }
  /**
   * @private
   */
  onLazyImageReady(swiper, slide, img) {
  }

  /*
  nextButton(swiper, e) {
  }
  prevButton() {
  }
  indexButton() {
  }
  */

  /**
   * @private
   */
  initZoom() {
    this.zoomDuration = this.zoomDuration || 230;
    this.maxScale = this.zoomMax || 3;

    this.zoomElement = this.getNativeElement().children[0].children[0];

    this.zoomElement && this.zoomElement.classList.add('ion-scroll-zoom');

    this.zoomGesture = new Gesture(this.zoomElement);
    this.zoomGesture.listen();

    this.scale = 1;

    this.zoomLastPosX = 0;
    this.zoomLastPosY = 0;


    let last_scale, startX, startY, posX = 0, posY = 0, zoomRect;

    this.viewportWidth = this.getNativeElement().offsetWidth;
    this.viewportHeight = this.getNativeElement().offsetHeight;

    this.zoomElement.addEventListener('touchstart', (e) => {

      this.onTouchStart(e);
    });

    this.zoomElement.addEventListener('touchmove', (e) => {
      this.onTouchMove(e);
    });

    this.zoomElement.addEventListener('touchend', (e) => {
      this.onTouchEnd(e);
    });

    this.zoomGesture.on('pinchstart', (e) => {
      last_scale = this.scale;
      console.log('Last scale', e.scale);
    });

    this.zoomGesture.on('pinch', (e) => {
      this.scale = Math.max(1, Math.min(last_scale * e.scale, 10));
      console.log('Scaling', this.scale);
      this.zoomElement.style[CSS.transform] = 'scale(' + this.scale + ')'

      zoomRect = this.zoomElement.getBoundingClientRect();
    });

    this.zoomGesture.on('pinchend', (e) => {
      //last_scale = Math.max(1, Math.min(last_scale * e.scale, 10));
      if(this.scale > this.maxScale) {
        let za = new Animation(this.zoomElement)
          .duration(this.zoomDuration)
          .easing('linear')
          .from('scale', this.scale)
          .to('scale', this.maxScale);
          za.play();

          this.scale = this.maxScale;
      }
    });
  }

  /**
   * @private
   */
  resetZoom() {

    if(this.zoomElement) {

      this.zoomElement.parentElement.style[CSS.transform] = '';
      this.zoomElement.style[CSS.transform] = 'scale(1)';
    }

    this.scale = 1;
    this.zoomLastPosX = 0;
    this.zoomLastPosY = 0;
  }

  /**
   * @private
   */
  toggleZoom(swiper, e) {
    console.log('Try toggle zoom');
    if(!this.enableZoom) { return; }

    console.log('Toggling zoom', e);

    /*
    let x = e.pointers[0].clientX;
    let y = e.pointers[0].clientY;

    let mx = this.viewportWidth / 2;
    let my = this.viewportHeight / 2;

    let tx, ty;

    if(x > mx) {
      // Greater than half
      tx = -x;
    } else {
      // Less than or equal to half
      tx = (this.viewportWidth - x);
    }
    if(y > my) {
      ty = -y;
    } else {
      ty = y-my;
    }

    console.log(y);
    */

    let zi = new Animation(this.touch.target.children[0])
      .duration(this.zoomDuration)
      .easing('linear')
      .fill('none');

    let zw = new Animation(this.touch.target.children[0])
      .duration(this.zoomDuration)
      .easing('linear');

    let za = new Animation();
    za.fill('none');
    za.add(zi);//, zw);

    if(this.scale > 1) {
      // Zoom out

      //zw.fromTo('translateX', posX + 'px', '0px');
      //zw.fromTo('translateY', posY + 'px', '0px');

      zi.from('scale', this.scale);
      zi.to('scale', 1);
      za.play();

      //posX = 0;
      //posY = 0;

      this.scale = 1;
    } else {
      // Zoom in

      //zw.fromTo('translateX', posX + 'px', tx + 'px');
      //zw.fromTo('translateY', posY + 'px', ty + 'px');

      zi.from('scale', this.scale);
      zi.to('scale', this.maxScale);
      za.play();

      //posX = tx;
      //posY = ty;

      this.scale = this.maxScale;
    }
  }

  /**
   * @private
   */
  onTransitionStart(swiper) {
  }
  /**
   * @private
   */
  onTransitionEnd(swiper) {
  }

  /**
   * @private
   */
  onTouchStart(e) {
    console.log('Touch start', e);

    //TODO: Support mice as well

    let target = dom.closest(e.target, '.slide').children[0].children[0];

    this.touch = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      deltaX: 0,
      deltaY: 0,
      lastX: 0,
      lastY: 0,
      target: target.parentElement,
      zoomable: target,
      zoomableWidth: target.offsetWidth,
      zoomableHeight: target.offsetHeight
    }
    console.log('Target', this.touch.target);

    //TODO: android prevent default

  }

  /**
   * @private
   */
  onTouchMove(e) {
    this.touch.deltaX = e.touches[0].clientX - this.touch.startX;
    this.touch.deltaY = e.touches[0].clientY - this.touch.startY;

    // TODO: Make sure we need to transform (image is bigger than viewport)

    let zoomableScaledWidth = this.touch.zoomableWidth * this.scale;
    let zoomableScaledHeight = this.touch.zoomableHeight * this.scale;

    let x1 = Math.min((this.viewportWidth / 2) - zoomableScaledWidth/2, 0)
    let x2 = -x1;
    let y1 = Math.min((this.viewportHeight / 2) - zoomableScaledHeight/2, 0)
    let y2 = -y1;

    console.log('BOUNDS', x1, x2, y1, y2);

    if(this.scale <= 1) {
      return;
    }

    console.log('PAN', e);

    // Move image
    this.touch.x = this.touch.deltaX + this.touch.lastX;
    this.touch.y = this.touch.deltaY + this.touch.lastY;

    console.log(this.touch.x, this.touch.y);

    if(this.touch.x < x1) {
      console.log('OUT ON LEFT');
    }
    if(this.touch.x > x2 ){
      console.log('OUT ON RIGHT');
    }

    if(this.touch.x > this.viewportWidth) {
      // Too far on the left side, let the event bubble up (to enable slider on edges, for example)
    } else if(-this.touch.x > this.viewportWidth) {
      // Too far on the right side, let the event bubble up (to enable slider on edges, for example)
    } else {
      console.log('TRANSFORM', this.touch.x, this.touch.y, this.touch.target);
      //this.touch.target.style[CSS.transform] = 'translateX(' + this.touch.x + 'px) translateY(' + this.touch.y + 'px)';
      this.touch.target.style[CSS.transform] = 'translateX(' + this.touch.x + 'px) translateY(' + this.touch.y + 'px)';
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

  }

  /**
   * @private
   */
  onTouchEnd(e) {
    console.log('PANEND', e);

    if(this.scale > 1) {

      if(Math.abs(this.touch.x) > this.viewportWidth) {
        posX = posX > 0 ? this.viewportWidth - 1 : -(this.viewportWidth - 1);
        console.log('Setting on posx', this.touch.x);
      }

      /*
      if(posY > this.viewportHeight/2) {
        let z = new Animation(this.zoomElement.parentElement);
        z.fromTo('translateY', posY + 'px', Math.min(this.viewportHeight/2 + 30, posY));
        z.play();
      } else {
        let z = new Animation(this.zoomElement.parentElement);
        z.fromTo('translateY', posY + 'px', Math.max(this.viewportHeight/2 - 30, posY));
        z.play();
      }
      */

      this.touch.lastX = this.touch.x;
      this.touch.lastY = this.touch.y;
    }
  }

  /**
   * @private
   * Update the underlying slider implementation. Call this if you've added or removed
   * child slides.
   */
  update() {
    setTimeout(() => {
      this.slider.update();

      // Don't allow pager to show with > 10 slides
      if(this.slider.slides.length > 10) {
        this.showPager = false;
      }
    });
  }

  /**
   * @private
   */
  next() {
    this.slider.slideNext();
  }

  /**
   * @private
   */
  prev() {
    this.slider.slidePrev();
  }

  /**
   * @private
   */
  getIndex() {
    return this.slider.activeIndex;
  }

  /**
   * @private
   */
  getNumSlides() {
    return this.slider.slides.length;
  }

  /**
   * @private
   */
  isAtEnd() {
    return this.slider.isEnd;
  }

  /**
   * @private
   */
  isAtBeginning() {
    return this.slider.isBeginning;
  }

  /**
   * @private
   */
  getSliderWidget() {
    return this.slider;
  }
}

 /**
  * @private
  */
@Component({
  selector: 'ion-slide',
  inputs: ['zoom'],
  template: '<div class="slide-zoom"><ng-content></ng-content></div>'
})
export class Slide {
  /**
   * TODO
   * @param {Slides} slides  The containing slidebox.
   * @param {ElementRef} elementRef  TODO
   */
  constructor(
    elementRef: ElementRef,
    @Host() slides: Slides
  ) {
    this.ele = elementRef.nativeElement;
    this.ele.classList.add('swiper-slide');

    slides.rapidUpdate();
  }
}

 /**
  * @private
  */
@Directive({
  selector: 'slide-lazy',
})
export class SlideLazy {
  constructor(elementRef: ElementRef) {
    elementRef.getNativeElement().classList.add('swiper-lazy');
  }
}
