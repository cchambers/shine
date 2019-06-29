const glob = require('glob')
let pages = {
  index: {
    entry: 'src/main.js',
    template: 'src/index.ejs'
  },
}

glob.sync('./src/components/**/docs/*').forEach(path => {  
  let component = path.split('/')[3];
  let filename = path.split('/');
  filename = filename[filename.length-1];
  let name = component+filename;
  pages[name] = {
    entry: 'src/component.js',
    template: path,
    filename: `pagedata/${component}/${filename}`
  }
})

module.exports = {
  runtimeCompiler: true,
  css: {
    loaderOptions: {
      sass: {
        data: `
          @import "@/assets/style/common/_mixins.scss";
          @import "@/assets/style/themes/default/_variables.scss";
        `
      }
    }
  },
  pages: pages,
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
      }
    }
  }
}
