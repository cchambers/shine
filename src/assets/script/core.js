const app = {
  init() {
    app.setup();
    if (window.location.search) app.urlParamsToObj();
  },

  setup() {
    const iOSCheck = navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') < 0;
    if (iOSCheck) document.getElementsByTagName('html')[0].classList.add('iOS');

    const IE11Check = !(window.ActiveXObject) && 'ActiveXObject' in window;
    if (IE11Check) document.getElementsByTagName('html')[0].classList.add('IE11');

    const demos = document.querySelectorAll('lib-toolbar');
    for (let x = 0, l = demos.length; x < l; x += 1) {
      const html = demos[x].innerHTML;
      demos[x].setAttribute('base-code', html);
      demos[x].innerHTML = '';
    }

    app.interaction = 'keyboard';

    document.addEventListener('keydown', () => {
      if (app.interaction !== 'keyboard') {
        app.interaction = 'keyboard';
        document.documentElement.setAttribute('interaction', app.interaction);
      }
    });

    document.addEventListener('click', () => {
      if (app.interaction !== 'mouse') {
        app.interaction = 'mouse';
        document.documentElement.setAttribute('interaction', app.interaction);
      }
    });

    document.addEventListener('touchstart', () => {
      if (app.interaction !== 'touch') {
        app.interaction = 'touch';
        document.documentElement.setAttribute('interaction', app.interaction);
      }
    });
  },

  cookieParamsToObj() {
    let str = document.cookie;
    str = str.split(', ');
    const result = {};
    for (let i = 0; i < str.length; i += 1) {
      const cur = str[i].split('=');
      // eslint-disable-next-line prefer-destructuring
      result[cur[0]] = cur[1];
    }
    return result;
  },

  urlParamsToObj() {
    let { search } = window.location;
    search = search.replace(/\?&/g, '');
    search = search.replace(/\?/g, '');
    search = search.replace(/=&/g, '&');
    search = search.replace(/&&/g, '&');
    search = search.replace(/&&&/g, '&');
    search = search.replace(/(&)/g, '","');
    search = search.replace(/=/g, '":"');
    const result = JSON.parse(`{"${search}"}`, (key, value) => (key === '' ? value : decodeURIComponent(value)));
    window.location.params = result;
  },
};

app.init();
