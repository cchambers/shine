<template>
  <div class="sh-carousel"
    :id="carouselId"
    :variant="variant"
    @mouseenter="mousePause(true, true)"
    @mouseleave="mousePause(false, true)"
    v-hammer:swipe="swipeHandler"
    v-hammer:tap="pause"
    aria-roledescription="carousel">
    <div ref="spacer" class="carousel-spacer"></div>
    <div ref="slides" slot="slides" class="slides">
      <slot name="slides"></slot>
    </div>
    <div v-if="!hideControls" class="controls">
      <button :aria-controls="carouselId"
        v-if="!hideArrows" class="arrow next" v-hammer:tap="nextHandler">
        <belk-icon width="20" :name="nextArrow"></belk-icon>
      </button>
      <button :aria-controls="carouselId"
        v-if="!hideArrows" class="arrow previous" v-hammer:tap="previousHandler">
        <belk-icon width="20" :name="previousArrow"></belk-icon>
      </button>
      <div class="play">
        <button :aria-controls="carouselId"
          class="button "
          :aria-label="playLabel"
          :disabled="isFocused"
          v-hammer:tap="play">
          {{ mode }}
        </button>
        <ul v-if="!hideDots" ref="dots" class="dots">
          <li v-for="(dot,index) in dots" v-bind:key="index" v-bind:class="{ active: dot.active }">
            ●
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script src="../script/Carousel.js"></script>
<style lang="scss" src="../style/default.scss"></style>
<style lang="scss" src="../style/primary.scss"></style>
<style lang="scss" src="../style/secondary.scss"></style>
