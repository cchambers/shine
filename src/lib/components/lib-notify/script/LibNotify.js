export default {
  name: 'LibNotify',
  props: {
    baseCode: String,
  },
  data() {
    return {
      active: false,
      message: '',
      type: 'default',
      timeout: 0,
    };
  },

  mounted() {
    this.$bus.$on('notify', this.doNotify);
  },

  methods: {
    doNotify(data) {
      const self = this;
      self.type = data.type || 'default';
      self.message = data.message;
      self.active = true;
      clearTimeout(self.timeout);
      self.timeout = setTimeout(() => {
        self.active = false;
      }, 1800);
    },
  },
};
