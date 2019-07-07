import InputPrototype from './../../input-prototype'

export default {
  name: 'Input',
  mixins: [InputPrototype],
  props: {
    msg: {
      type: String,
      default: 'new component'
    }
  },

  data() {
    return {
      value: {
        type: String,
        value: 'what'
      }
    }
  },
  
  methods: {
    snap() {
      if (!this.snapping) {
        this.snapping = true;
        this.snapTimeout = setTimeout(this.recover, 1500);
        this.$emit('snapping');
      }
    },

    recover() {
      this.halve();
      this.snapping = false;
      this.$emit('snapped');
    },

    halve() {
      let str = this.$el.innerText;
      if (!str.length) return;
      let middle = Math.ceil(str.length / 2);
      let half = str.slice(0, middle);
      this.$el.innerText = half.trim();
    }
  },

}