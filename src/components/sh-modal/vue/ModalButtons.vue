<template>
  <div class="sh-modal-buttons" :variant="variant" :hidden="this.hidden">
    <div class="tab-lock" v-on:focus="modalFocusLast()" tabindex="0"></div>
    <button @click="closeModals">
      <belk-icon v-if="closeActive" name="close" width="28" height="28">Close Modal</belk-icon>
    </button>
    <button v-if="printActive" print-trigger hidden>
      <belk-icon name="print" width="28" height="28">Print Modal Content</belk-icon>
    </button>
    <div class="tab-lock" v-on:focus="modalFocusFirst()" tabindex="0"></div>
  </div>
</template>

<script>
/* eslint-disable no-restricted-globals */
import ComponentPrototype from '../../component-prototype';

export default {
  mixins: [ComponentPrototype],

  name: 'ModalButtons',

  data() {
    return {
      printActive: false,
      closeActive: true,
      hidden: false,
    };
  },

  methods: {
    doPrint() {
      window.print();
    },

    closeModals(e) {
      e.stopPropagation();
      this.$bus.$emit('close-modals');
    },

    modalFocusFirst() {
      this.$bus.$emit('modal-focus-first');
    },

    modalFocusLast() {
      this.$bus.$emit('modal-focus-last');
    },

    events() {
      this.$bus.$on('modal-buttons-focus', () => {
        this.$el.querySelector('button').focus();
      });

      this.$bus.$on('modal-buttons-hide', () => {
        this.hidden = true;
      });

      this.$bus.$on('modal-closed', () => {
        if (this.hidden) this.hidden = false;
      });

      this.$bus.$on('modal-opening', (modal) => {
        this.variant = modal.variant || 'default';
      });
    },
  },
};
</script>
