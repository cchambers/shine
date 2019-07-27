import Popper from '../../../assets/script/popper';

function on(element, event, handler) {
  if (element && event && handler) {
    document.addEventListener ? element.addEventListener(event, handler, false) : element.attachEvent('on' + event, handler);
  }
}

function off(element, event, handler) {
  if (element && event) {
    document.removeEventListener ? element.removeEventListener(event, handler, false) : element.detachEvent('on' + event, handler)
  }
}

export default {
  name: 'NavItem',
  props: {
    tagName: {
      type: String,
      default: 'span',
    },
    trigger: {
      type: String,
      default: 'hover',
      validator: value => ['click', 'hover'].indexOf(value) > -1
    },
    delayOnMouseOver: {
      type: Number,
      default: 10,
    },
    delayOnMouseOut: {
      type: Number,
      default: 10,
    },
    disabled: {
      type: Boolean,
      default: false
    },
    enterActiveClass: String,
    leaveActiveClass: String,
    boundariesSelector: {
      type: String,
      default: '.documentation'
    },
    reference: {},
    forceShow: {
      type: Boolean,
      default: false
    },
    dataValue: {
      default: null,
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    visibleArrow: {
      type: Boolean,
      default: false
    },
    transition: {
      type: String,
      default: ''
    },
    stopPropagation: {
      type: Boolean,
      default: false
    },
    preventDefault: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default() {
        return {};
      }
    }
  },

  data() {
    return {
      referenceElm: null,
      popperJS: null,
      showPopper: false,
      currentPlacement: '',
      content: 'empty',
      popperOptions: {
        modifiers: {
          flip: {
            behavior: ['bottom']
          },
          computeStyle: {
            x: 'left'
          },
          preventOverflow: {
            padding: 0,
            priority: ['left']
          }
        }
      }
    };
  },

  watch: {
    showPopper(value) {
      if (value) {
        this.$emit('show', this);
        if (this.popperJS) {
          this.popperJS.enableEventListeners();
        }
        this.updatePopper();
      } else {
        if (this.popperJS) {
          this.popperJS.disableEventListeners();
        }
        this.$emit('hide', this);
      }
    },

    forceShow: {
      handler(value) {
        this[value ? 'doShow' : 'doClose']();
      },
      immediate: true
    },

    disabled(value) {
      if (value) {
        this.showPopper = false;
      }
    }
  },

  created() {
    this.appendedArrow = false;
    this.appendedToBody = false;
  },

  mounted() {
    this.init();
  },

  methods: {
    init() {
      this.referenceElm = this.$refs.target;
      this.popper = this.$refs.popper;
      switch (this.trigger) {
        case 'click':
          on(this.referenceElm, 'click', this.doToggle);
          on(document, 'click', this.handleDocumentClick);
          break;
        case 'hover':
          on(this.referenceElm, 'mouseover', this.onMouseOver);
          on(this.referenceElm, 'focus', this.onMouseOver);
          on(this.popper, 'mouseover', this.onMouseOver);
          on(this.popper, 'focus', this.onMouseOver);
          on(this.referenceElm, 'mouseout', this.onMouseOut);
          on(this.referenceElm, 'blur', this.onMouseOut);
          on(this.popper, 'mouseout', this.onMouseOut);
          on(this.popper, 'blur', this.onMouseOut);
          break;
      }
    },

    doToggle(event) {
      if (this.stopPropagation) {
        event.stopPropagation();
      }

      if (this.preventDefault) {
        event.preventDefault();
      }

      if (!this.forceShow) {
        this.showPopper = !this.showPopper;
      }
    },

    doShow() {
      this.showPopper = true;
    },

    doClose() {
      this.showPopper = false;
    },

    doDestroy() {
      if (this.showPopper) {
        return;
      }

      if (this.popperJS) {
        this.popperJS.destroy();
        this.popperJS = null;
      }

      if (this.appendedToBody) {
        this.appendedToBody = false;
        document.body.removeChild(this.popper.parentElement);
      }
    },

    createPopper() {
      this.$nextTick(() => {
        if (this.visibleArrow) {
          this.appendArrow(this.popper);
        }

        if (this.appendToBody && !this.appendedToBody) {
          this.appendedToBody = true;
          document.body.appendChild(this.popper.parentElement);
        }

        if (this.popperJS && this.popperJS.destroy) {
          this.popperJS.destroy();
        }

        if (this.boundariesSelector) {
          const boundariesElement = document.querySelector(this.boundariesSelector) || document.querySelector("#main") ;

          if (boundariesElement) {
            this.popperOptions.modifiers = Object.assign({

            }, this.popperOptions.modifiers);
            this.popperOptions.modifiers.preventOverflow = Object.assign({}, this.popperOptions.modifiers.preventOverflow);
            this.popperOptions.modifiers.preventOverflow.boundariesElement = boundariesElement;
          }
        }

        this.popperOptions.onCreate = () => {
          this.$emit('created', this);
          this.$nextTick(this.updatePopper);
        };

        this.popperJS = new Popper(this.referenceElm, this.popper, this.popperOptions);
      });
    },

    destroyPopper() {
      off(this.referenceElm, 'click', this.doToggle);
      off(this.referenceElm, 'mouseup', this.doClose);
      off(this.referenceElm, 'mousedown', this.doShow);
      off(this.referenceElm, 'focus', this.doShow);
      off(this.referenceElm, 'blur', this.doClose);
      off(this.referenceElm, 'mouseout', this.onMouseOut);
      off(this.referenceElm, 'mouseover', this.onMouseOver);
      off(document, 'click', this.handleDocumentClick);

      this.showPopper = false;
      this.doDestroy();
    },

    appendArrow(element) {
      if (this.appendedArrow) {
        return;
      }

      this.appendedArrow = true;

      const arrow = document.createElement('div');
      arrow.setAttribute('x-arrow', '');
      arrow.className = 'popper-arrow';
      element.appendChild(arrow);
    },

    updatePopper() {
      this.popperJS ? this.popperJS.scheduleUpdate() : this.createPopper();
    },

    onMouseOver() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.showPopper = true;
      }, this.delayOnMouseOver);
    },

    onMouseOut() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this.showPopper = false;
      }, this.delayOnMouseOut);
    },

    handleDocumentClick(e) {
      if (!this.$el || !this.referenceElm ||
        this.elementContains(this.$el, e.target) ||
        this.elementContains(this.referenceElm, e.target) ||
        !this.popper || this.elementContains(this.popper, e.target)
      ) {
        return;
      }

      this.$emit('documentClick', this);

      if (this.forceShow) {
        return;
      }

      this.showPopper = false;
    },

    elementContains(elm, otherElm) {
      if (typeof elm.contains === 'function') {
        return elm.contains(otherElm);
      }

      return false;
    }
  },

  destroyed() {
    this.destroyPopper();
  }
}