<template>
  <div class='belk-barcode' :variant='variant'>
    <svg ref='barcode'></svg>
  </div>
</template>

<script>
/* eslint-disable no-bitwise */
import JsBarcode from 'jsbarcode';
import ComponentPrototype from '../../component-prototype';

export default {
  mixins: [ComponentPrototype],

  name: 'BelkBarcode',
  props: {
    code: {
      type: String,
      default: 'no code',
    },
    format: {
      type: String,
      default: 'code128',
    },
    height: {
      type: Number,
      default: 50,
    },
    width: {
      type: Number,
      default: 4,
    },
    color: {
      type: String,
      default: '#222',
    },
    alignText: {
      type: String,
      default: undefined,
    },
  },

  mounted() {
    const obj = {
      format: this.format,
      lineColor: this.color,
      background: null,
      width: this.width,
      height: this.height,
      displayValue: true,
    };
    if (this.alignText) obj.textAlign = this.alignText;
    JsBarcode(this.$refs.barcode, this.code, obj);
  },
};
</script>
<style lang='scss' src='../style/default.scss'></style>
