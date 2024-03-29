import ComponentPrototype from '../../component-prototype';

export default {
  mixins: [ComponentPrototype],

  name: 'Banner',

  props: {
    backgrounds: {
      type: String,
    },
    slideFrom: {
      type: String,
      default: 'bottom',
    },
    slideTo: {
      type: String,
      default: 'bottom',
    },
    contentIn: {
      type: String,
      default: '400',
    },
    contentOut: {
      type: String,
      default: '250',
    },
    changeDelay: {
      type: String,
      default: '400',
    },
    closable: {
      type: String,
      value: false,
    },
    revealEvent: {
      type: String,
    },
  },

  data() {
    return {
      animate: 'in',
      carousel: undefined,
      carouselId: undefined,
      carouselSpeed: 5000,
      closed: false,
      background: undefined,
      isClosable: false,
      backgroundArray: [],
      whichback: 0,
      revealed: true,
    };
  },

  created() {
    if (this.revealEvent) this.revealed = false;
    if (this.closable) {
      this.isClosable = true;
      const wasClosed = this.getItem(`${this.closable}-closed`);
      if (wasClosed) this.closed = true;
    }
  },

  mounted() {
    const self = this;
    if (self.revealEvent && !this.revealed) {
      self.$bus.$on(self.revealEvent, () => {
        if (!self.revealed) {
          self.revealed = true;
          self.init();
          self.$bus.$off(self.revealEvent);
        }
      });
    }
    self.init();
  },

  methods: {
    init() {
      this.findCarousel();
      if (this.backgrounds) this.configureBackgrounds();
      this.loadImages();
    },

    closeBanner() {
      this.closed = true;
      this.setItem(`${this.closable}-closed`, true);
    },

    findCarousel() {
      const self = this;
      const el = self.$el.querySelector('sh-carousel');
      if (el) {
        setTimeout(() => {
          const target = el.querySelector('.sh-carousel');
          self.carouselId = target.id;
          self.carousel = el.getVueInstance();
          self.$bus.$on('carousel-slide-changing', (data) => {
            if (data.id === self.carouselId) {
              self.animate = 'out';
            }
          });
          self.$bus.$on('carousel-slide-changed', (data) => {
            if (data.id === self.carouselId) {
              self.handleCarousel();
            }
          });

          if (self.carousel.autoplay) this.carouselSpeed = self.carousel.autoplay;
          self.carousel.setChangeDelay(parseInt(this.changeDelay, 10));
        }, 20);
      }
    },

    configureBackgrounds() {
      const arr = this.backgrounds.split(',');
      for (let x = 0, l = arr.length; x < l; x += 1) {
        arr[x] = `back-${arr[x].trim()}`;
      }
      this.backgroundArray = arr;
      this.handleBackground(0);
    },

    loadImages() {
      const imgs = this.$el.querySelectorAll('img[data-src]');
      if (imgs.length) {
        for (let x = 0, l = imgs.length; x < l; x += 1) {
          const el = imgs[x];
          const src = el.getAttribute('data-src');
          el.src = src;
        }
      }
    },

    handleCarousel() {
      if (this.backgroundArray.length) this.handleBackground();
      this.animate = 'in';
    },

    handleBackground(defwhich = null) {
      let which;
      if (defwhich !== null) {
        which = defwhich;
      } else {
        which = this.whichback;
        which += 1;
        if (which >= this.backgroundArray.length) which = 0;
      }
      this.whichback = which;
      this.background = this.backgroundArray[which];
    },
  },
};
