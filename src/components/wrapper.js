/* eslint-disable */
const camelizeRE = /-(\w)/g;
const camelize = (str) => str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ''));

const hyphenateRE = /\B([A-Z])/g;
const hyphenate = (str) => str.replace(hyphenateRE, '-$1').toLowerCase();

function getInitialProps(propsList) {
  const res = {};
  propsList.forEach((key) => {
    res[key] = undefined;
  });
  return res;
}

function injectHook(options, key, hook) {
  options[key] = [].concat(options[key] || []);
  options[key].unshift(hook);
}

function callHooks(vm, hook) {
  if (vm) {
    const hooks = vm.$options[hook] || [];
    hooks.forEach((hook) => {
      hook.call(vm);
    });
  }
}

function createCustomEvent(name, args) {
  return new CustomEvent(name, {
    bubbles: false,
    cancelable: false,
    detail: args,
  });
}

const isBoolean = (val) => /function Boolean/.test(String(val));
const isNumber = (val) => /function Number/.test(String(val));

function convertAttributeValue(value, name, {
  type,
} = {}) {
  if (isBoolean(type)) {
    if (value === 'true' || value === 'false') {
      return value === 'true';
    }
    if (value === '' || value === name) {
      return true;
    }
    return value != null;
  } if (isNumber(type)) {
    const parsed = parseFloat(value, 10);
    return isNaN(parsed) ? value : parsed;
  }
  return value;
}

function toVNodes(h, children) {
  const res = [];
  for (let i = 0, l = children.length; i < l; i++) {
    let item = children[i];
    res.push(toVNode(h, item));
  }
  return res;
}

function toVNode(h, node) {
  if (node.nodeType === 3) {
    return node.data.trim() ? node.data : null;
  }


  if (node.nodeType === 1) {
    const data = {
      attrs: getAttributes(node),
      domProps: {
        innerHTML: node.innerHTML,
      },
    };

    if (data.attrs.slot) {
      data.slot = data.attrs.slot;
      delete data.attrs.slot;
    }
    return h(node.tagName, data);
  }
  return null;
}

function getAttributes(node) {
  const res = {};
  for (let i = 0, l = node.attributes.length; i < l; i++) {
    const attr = node.attributes[i];
    res[attr.nodeName] = attr.nodeValue;
  }
  return res;
}

function wrap(Vue, Component) {
  const isAsync = typeof Component === 'function' && !Component.cid;
  let isInitialized = false;
  let hyphenatedPropsList;
  let camelizedPropsList;
  let camelizedPropsMap;

  function initialize(Component) {
    if (isInitialized) return;

    const options = typeof Component === 'function'
      ? Component.options
      : Component;

    // extract props info
    const propsList = Array.isArray(options.props)
      ? options.props
      : Object.keys(options.props || {});
    hyphenatedPropsList = propsList.map(hyphenate);
    camelizedPropsList = propsList.map(camelize);
    const originalPropsAsObject = Array.isArray(options.props) ? {} : options.props || {};
    camelizedPropsMap = camelizedPropsList.reduce((map, key, i) => {
      map[key] = originalPropsAsObject[propsList[i]];
      return map;
    }, {});

    // proxy $emit to native DOM events
    injectHook(options, 'beforeCreate', function () {
      const emit = this.$emit;
      this.$emit = (name, ...args) => {
        this.$root.$options.customElement.dispatchEvent(createCustomEvent(name, args));
        return emit.call(this, name, ...args);
      };
    });

    injectHook(options, 'created', function () {
      // sync default props values to wrapper on created
      camelizedPropsList.forEach((key) => {
        this.$root.props[key] = this[key];
      });
    });

    // proxy props as Element properties
    camelizedPropsList.forEach((key) => {
      Object.defineProperty(CustomElement.prototype, key, {
        get() {
          return this._wrapper.props[key];
        },
        set(newVal) {
          this._wrapper.props[key] = newVal;
        },
        enumerable: false,
        configurable: true,
      });
    });

    isInitialized = true;
  }

  function syncAttribute(el, key) {
    const camelized = camelize(key);
    const value = el.hasAttribute(key) ? el.getAttribute(key) : undefined;
    el._wrapper.props[camelized] = convertAttributeValue(
      value,
      key,
      camelizedPropsMap[camelized],
    );
  }

  class CustomElement extends HTMLElement {
    constructor() {
      super();
      // this.attachShadow({
      //   mode: 'open',
      // });
      const wrapper = this._wrapper = new Vue({
        name: 'custom-element',
        customElement: this,
        data() {
          return {
            props: {},
            slotChildren: [],
          };
        },
        render(h) {
          return h(Component, {
            ref: 'inner',
            props: this.props,
          }, this.slotChildren);
        },
      });


      // // Use MutationObserver to react to future attribute & slot content change
      const observer = new MutationObserver((mutations) => {
        let hasChildrenChange = false;
        for (let i = 0; i < mutations.length; i++) {
          const m = mutations[i];
          if (isInitialized && m.type === 'attributes' && m.target === this) {
            syncAttribute(this, m.attributeName);
          } else {
            hasChildrenChange = true;
          }
        }
        // if (hasChildrenChange) {
        //   console.log('CHILD CHANGE');
        // //   wrapper.slotChildren = Object.freeze(toVNodes(
        // //     wrapper.$createElement,
        // //     this.childNodes,
        // //   ));
        // }
      });
      observer.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });
    }

    get vueComponent() {
      return this._wrapper.$refs.inner;
    }

    connectedCallback() {
      const wrapper = this._wrapper;
      // console.log('mounted', wrapper._isMounted)
      if (!wrapper._isMounted) {
        // initialize attributes
        const syncInitialAttributes = () => {
          wrapper.props = getInitialProps(camelizedPropsList);
          hyphenatedPropsList.forEach((key) => {
            syncAttribute(this, key);
          });
        };

        if (isInitialized) {
          syncInitialAttributes();
        } else {
          // async & unresolved
          Component()
            .then((resolved) => {
              if (resolved.__esModule || resolved[Symbol.toStringTag] === 'Module') {
                resolved = resolved.default;
              }
              initialize(resolved);
              syncInitialAttributes();
            });
        }
        // initialize children
        wrapper.slotChildren = Object.freeze(toVNodes(
          wrapper.$createElement,
          this.childNodes,
        ));
        wrapper.$mount();
        this.innerHTML = '';
        // console.log(wrapper.$el)
        this.appendChild(wrapper.$el);
      } else {
        callHooks(this.vueComponent, 'activated');
      }
    }

    disconnectedCallback() {
      callHooks(this.vueComponent, 'deactivated');
    }
  }

  if (!isAsync) {
    initialize(Component);
  }

  return CustomElement;
}

export default wrap;
