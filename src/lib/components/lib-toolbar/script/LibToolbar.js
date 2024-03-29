/* eslint-disable import/no-extraneous-dependencies */
import * as ace from 'brace';
import 'brace/mode/html';
import 'brace/mode/json';
import 'brace/theme/monokai';
import Pretty from 'pretty';
import ComponentPrototype from '../../../../components/component-prototype';

export default {
  mixins: [ComponentPrototype],
  name: 'LibToolbar',

  props: {
    baseCode: String,
    demo: String,
    autoOpen: Boolean,
  },

  data() {
    return {
      active: false,
      fullscreen: false,
      isActive: false,
      code: '',
      editorCode: '',
      html: 'Loading...',
      updateTimer: 0,
      uniqueId: '',
      editor: {},
    };
  },

  created() {
    this.setUUID();
    window.Pretty = Pretty;
    if (this.autoOpen) this.active = true;
  },

  mounted() {
    const self = this;
    this.uniqueId = `sh${this.uuid}`;
    if (this.demo) {
      this.$el.addEventListener('click', () => {
        window.open(`${window.location.origin}/${this.demo}`, 'demo');
      });
    }
    if (this.baseCode) {
      this.code = this.baseCode;
      this.renderCode(this.baseCode);
      // this.$el.parentNode.removeAttribute('base-code');
    }
    this.$refs.editor.id = `editor-${this.uniqueId}`;
    setTimeout(() => {
      this.editor = ace.edit(this.$refs.editor.id);
      this.editor.getSession().setMode('ace/mode/html');
      this.editor.setTheme('ace/theme/monokai');
      this.code = Pretty(this.code);
      this.editor.setValue(this.code);
      this.editor.setOptions({
        wrapBehavioursEnabled: true,
        showLineNumbers: false,
        showGutter: false,
        wrap: true,
        showPrintMargin: false,
        indentedSoftWrap: false,
      });

      const len = self.editor.getSession().getDocument().getLength();
      self.$refs.editor.style.height = `${Math.max(200, Math.min(len * 21, 600))}px`;
      self.$refs.editor.style.width = '100%';
      self.editor.resize();
      self.editor.getSession().selection.clearSelection();

      self.editor.getSession().on('change', () => {
        const value = self.editor.getSession().getValue();
        self.editorCode = value;
        self.html = self.editorCode;
      });
    });
  },

  methods: {
    renderDebounce(code) {
      const self = this;
      clearTimeout(this.updateTimer);
      this.updateTimer = setTimeout(() => {
        self.renderCode(code);
      }, 300);
    },

    renderCode(code) {
      this.html = code;
    },

    copyEditor() {
      const copyTextarea = document.querySelector('#copy-editor');
      copyTextarea.value = this.editor.getValue();
      copyTextarea.select();
      document.execCommand('copy');
      this.$bus.$emit('notify', {
        type: 'default',
        message: 'Copied to clipboard.',
      });
    },

    toggleActive() {
      this.active = !this.active;
    },

    toggleFullscreen() {
      this.fullscreen = !this.fullscreen;
      if (this.fullscreen) {
        document.documentElement.classList.add('toolbar-fullscreen');
      } else {
        document.documentElement.classList.remove('toolbar-fullscreen');
      }
    },
  },

  updated() {
    this.isActive = this.active;
  },
};
