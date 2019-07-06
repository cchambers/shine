"use strict";

/**
 * The sass-loader makes node-sass available to webpack modules.
 *
 * @this {LoaderContext}
 * @param {string} content
 */
function themeLoader(content) {

  content = `${content}
    [theme="dark"] {
      $lightpurple: #BB86FC;
      $purple: #3700B3;
      $green: #03DAC6;
    
      $highlight-primary: #BB86FC;
      $highlight-secondary: rgb(25,25,25);
      $highlight-tertiary: #03DAC6;
      $highlight-quaternary: #272822;
    
      $lowlight-primary: $purple;
      $lowlight-secondary: #272822;
      $lowlight-tertiary: rgb(200,200,200);
      $lowlight-quaternary: #222;
      $lowlight-quinary: $purple;
    
      $accent-primary: rgb(157, 208, 230);
      $accent-secondary: rgb(129, 177, 210);
      $accent-tertiary: $highlight-tertiary;
      $accent-quaternary: rgb(6, 103, 160);
      $accent-quinary: rgb(41, 57, 115);
    
      $back-primary: $lowlight-secondary;
      ${content}
    }`;
  return content;
}

module.exports = themeLoader;
