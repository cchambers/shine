<template>
  <div
    class="belk-bag"
    :variant="variant"
    :count="itemCount"
    v-bind:class="{ active: itemCount > 0 }"
  >
    <template v-if="hasData">
      <sh-popper :disabled="isDisabled" offset-x="-42" placement="bottom" unique-id="belk-bag">
        <a id="goToCart" href="/shopping-bag" slot="reference">
          <div class="bag-icon">
            <belk-icon width="21" height="24" name="bag">shopping bag</belk-icon>
            <div class="bag-count">{{ itemCount }}</div>
          </div>
          <div class="bag-total">{{ totalPrice }}</div>
        </a>
        <div class="bag-content" slot="content">
          <div class="has-items">
            <div class="scrolling-area">
              <div class="text-center margin-y-little">
                <div class="bold px-16 pad-b-micro">Bag Subtotal</div>
                <div class="px-20 lh-24">{{ totalPrice }}</div>
              </div>
              <div v-if="shippingNote">
                <div class="margin-x-micro">
                  <div class="free-shipping-meter" :message="shippingNote"></div>
                </div>
                <div
                  v-html="shippingNote"
                  class="pad-b-little pad-t-micro pad-x-little text-center px-14"
                ></div>
              </div>
              <div class="hr margin-y-micro"></div>
              <ul class="bag-list belk-product-list" variant="tertiary">
                <li v-for="(product, index) in items" v-bind:key="index">
                  <belk-product v-bind="product" variant="bag"></belk-product>
                </li>
              </ul>
              <div v-if="tipNote" v-html="tipNote" class="margin-little px-14 b-y"></div>
            </div>
            <div class="pad-x-micro pad-b-micro">
              <sh-button variant="primary"
                full link="/shopping-bag">View Bag &amp; Checkout</sh-button>
            </div>
          </div>
          <div class="no-items pad-little">
            <div>
              <h4>Your bag is empty &amp; could use some love.</h4>
              <p
                class="unregistered pad-t-little text-center"
              >Sign in to see items you may have added to your bag.</p>
              <p class="registered pad-t-little text-center">That means it's time to shop!</p>
            </div>
          </div>
        </div>
      </sh-popper>
    </template>
  </div>
</template>

<script>
import ComponentPrototype from '../../component-prototype';
import MoneyFormatter from '../../money-formatter';
import BelkProduct from '../../belk-product/vue/BelkProduct.vue';

export default {
  mixins: [ComponentPrototype, MoneyFormatter],

  name: 'BelkBag',

  props: {
    disableBag: {
      type: Boolean,
      default: false,
    },
  },

  watch: {
    subTotal(val) {
      let total = val;
      if (total === 0) {
        total = 'Bag';
      } else {
        total = this.format(total, 'subTotal');
      }
      this.totalPrice = total;
    },
  },

  data() {
    return {
      items: [],
      itemCount: 0,
      subTotal: 0,
      shippingNote: '',
      tipNote: '',
      totalPrice: 'Bag',
      isDisabled: false,
      hasData: true,
      belkProduct: BelkProduct,
    };
  },

  created() {
    if (window.location.href.indexOf('shopping-bag') > 0 || this.disableBag) {
      this.isDisabled = true;
    }
  },

  methods: {
    events() {
      this.$bus.$on('user-data', this.handleUserData);
      this.$bus.$on('belk-bag-ready', (data) => {
        const target = data;
        // target.referenceElm.addEventListener('click', this.goToCart);
        if (this.isMobile()) {
          target.$set(target, 'disabled', true);
        }
      });
    },

    isMobile() {
      return (
        window.matchMedia('(max-width: 960px)').matches
        || document.querySelector('html').classList.contains('iOS')
      );
    },

    goToCart() {
      window.location.href = '/shopping-bag';
    },

    handleUserData(data) {
      if (data.qty) this.$set(this, 'itemCount', parseInt(data.qty, 10));
      if (data.subTotal) this.$set(this, 'subTotal', data.subTotal);
      if (data.cart) {
        this.$set(this, 'items', data.cart.items);
        if (data.cart.shippingMessage) {
          this.$set(this, 'shippingNote', data.cart.shippingMessage);
        }
        if (data.cart.tipLineMsg) {
          this.$set(this, 'tipNote', data.cart.tipLineMsg);
        }
        setTimeout(() => {
          this.$bus.$emit('bag-list-update', data.cart.items);
        }, 100);
      }
      if (this.hasData) {
        this.hasData = false;
        setTimeout(() => {
          this.hasData = true;
        }, 5);
      } else {
        this.hasData = true;
      }
    },

    emitUpdate() {
      this.$bus.$emit('value-changed', {
        itemCount: this.itemCount,
        totalPrice: this.totalPrice,
      });
    },
  },
};
</script>
<style lang="scss" src="../style/default.scss"></style>
