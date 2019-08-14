import Popper from '../../../assets/script/popper';

export default {
  name: 'BelkTakeover',

  props: {
    placement: {
      type: String,
      default: 'left-start'
    },
    delay: {
      type: Number,
      default: 2000
    },
    attachTo: {
      type: String,
      default: '.documentation.contain'
    },
    scrollWith: {
      type: String,
      default: 'main'
    }
  },

  data() {
    return {
      active: false,
      referenceEl: {},
      scrollingEl: {},
      popperJS: null,
      showPopper: false,
      mobile: false,
      currentPlacement: '',
      poppers: []
    }
  },


  mounted() {
    let self = this;
    this.referenceEl = document.querySelector(this.attachTo);
    this.scrollingEl = document.querySelector(this.scrollWith);
    this.popperLeft = this.$refs.popperLeft;
    this.popperRight = this.$refs.popperRight;

    this.poppers.push(new Popper(this.referenceEl, this.popperLeft, this.opts('left-start')));
    this.poppers.push(new Popper(this.referenceEl, this.popperRight, this.opts('right-start')));

    setTimeout(() => {
      self.$el.classList.add('active');
      self.$nextTick(self.updatePopper);
    }, this.delay);

    this.poppers.forEach((el) => {
      el.enableEventListeners();
    })
  },

  methods: {
    updatePopper() {
      if (this.poppers.length) {
        this.poppers.forEach((popper) => {
          popper.scheduleUpdate();
        })
      }
    },

    opts(pos) {
      let self = this;
      return {
        placement: pos,
        modifiers: {
          preventOverflow: {
            boundariesElement: self.scrollingEl,
            priority: ['top'],
            padding: 0
          },
          flip: {
            behavior: [pos]
          }
        },
        onCreate: () => {
          self.$emit('created', self);
          self.$nextTick(self.updatePopper);
        }
      }
    }
  },

}