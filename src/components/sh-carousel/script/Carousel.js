import ComponentPrototype from '../../component-prototype';

export default {
  mixins: [ComponentPrototype],

  name: 'Carousel',

  props: {
    startAt: {
      // 'Which position in the slide array should the modal begin on',
      type: Number,
      default: 0,
    },
    perNext: {
      // 'How many items the carousel will cycle through on interaction',
      type: Number,
      default: 1,
    },
    hideControls: {
      // 'Hide all controls',
      type: Boolean,
      default: false,
    },
    hideArrows: {
      // 'Hide the next/previous arrow controls',
      type: Boolean,
      default: false,
    },
    hideDots: {
      // 'Hide the dot controls',
      type: Boolean,
      default: false,
    },
    autoplay: {
      // 'Begin automatically cycling',
      type: String,
      default: null,
    },
    resolution: {
      // 'Begin automatically cycling',
      type: String,
      default: null,
    },
    variant: String,
    vertical: {
      type: Boolean,
    },
  },

  data() {
    return {
      slides: [],
      dots: [],
      list: [],
      active: null,
      previousArrow: 'arrow-left',
      nextArrow: 'arrow-right',
      paused: false,
      playing: false,
      playLabel: '',
      playTimer: {},
      carouselId: 'c',
    };
  },

  created() {
    this.setArrowIcon();
  },

  computed: {
    mode() {
      return (!this.playing) ? 'stopped' : 'playing';
    },

    delayTimer() {
      // eslint-disable-next-line radix
      const autoplay = parseInt(this.autoplay);
      let delay = (autoplay || 5000);
      if (delay < 2000) delay = 2000;
      return delay;
    },

    isFocused() {
      let focused = false;
      if (this.$el) focused = this.$el.contains(document.activeElement);
      return focused;
    },
  },

  mounted() {
    this.setUUID();
    this.carouselId = `carousel-${this.uuid}`;
    this.getSlides();
    this.ada();
    this.active = this.startAt;
    if (!this.resolution) setTimeout(this.autoSize);
    if (this.autoplay) this.play();
  },

  watch: {
    active(val) {
      this.slides.forEach((slide, index) => {
        if (index === val) {
          slide.classList.add('active');
        } else if (slide.classList.contains('active')) slide.classList.remove('active');
      });

      if (this.userTriggered) this.focus();
    },

    paused(val) {
      this.playLabel = (val) ? 'Start automatic slide show' : 'Stop automatic slide show';
    },
  },

  methods: {
    setArrowIcon() {
      if (this.vertical) {
        this.previousArrow = 'arrow-up';
        this.nextArrow = 'arrow-down';
      }
    },

    events() {
      const resizeDebounced = this.debounce(this.autoSize, 100);
      window.addEventListener('resize', resizeDebounced, true);
    },

    ada() {
      const slides = this.$refs.slides.querySelectorAll('li');
      slides.forEach((slide, index) => {
        slide.setAttribute('aria-roledescription', 'slide');
        slide.setAttribute('aria-label', `${index} of ${this.slides.length}`);
      });
    },

    mousePause(bool = true) {
      if (this.playing) {
        this.paused = bool;
        if (bool) {
          clearTimeout(this.playTimer);
        } else if (this.autoplay && !this.buttonPaused) this.play();
      }
    },

    pause() {
      clearTimeout(this.playTimer);
      this.paused = true;
    },

    play() {
      this.playing = true;
      this.playTimer = setTimeout(() => {
        if (!this.paused && !this.focused) {
          this.userTriggered = false;
          this.next();
        }
        this.play();
      }, this.delayTimer);
    },

    stop() {
      this.playing = false;
    },

    focus() {
      const activeSlide = this.$el.querySelector('.active');
      window.test = activeSlide;
      if (activeSlide) activeSlide.focus();
      if (this.variant === 'secondary') {
        if (this.vertical) {
          const dist = (this.hideArrows) ? activeSlide.offsetTop : activeSlide.offsetTop - 60;
          this.list.scrollTop = dist;
        } else {
          const dist = (this.hideArrows) ? activeSlide.offsetLeft : activeSlide.offsetLeft - 60;
          this.list.scrollLeft = dist;
        }
      }
    },

    nextHandler() {
      this.userTriggered = true;
      this.next();
    },

    next() {
      const len = this.slides.length;
      let which = this.active + this.perNext;
      if (which >= len) which -= len;
      this.active = which;
    },

    previousHandler() {
      this.userTriggered = true;
      this.previous();
    },

    previous() {
      let which = this.active - this.perNext;
      const len = this.slides.length;
      if (which < 0) which += len;
      this.active = which;
    },

    activate(which) {
      this.active = which;
    },

    swipeHandler(e) {
      let dir = 'next';
      if (e.direction > 2) dir = 'previous';
      this[dir]();
    },

    autoSize() {
      this.$refs.slides.classList.add('config');
      let maxHeight = 0;
      const slides = this.$el.querySelectorAll('.slides li');
      slides.forEach((slide) => {
        const ht = slide.offsetHeight;
        if (ht > maxHeight) maxHeight = ht;
      });
      this.$refs.slides.classList.remove('config');
      const heightStr = `${maxHeight}px`;
      this.$refs.spacer.style.height = heightStr;
    },

    getSlides() {
      const slides = this.$slots.slides[0];
      this.list = slides.elm;
      this.slides = slides.elm.children;
    },
  },

};
