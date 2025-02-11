<template>
  <div class="circle-stencil" :style="style">
    <draggable-element
        class="circle-stencil__handler"
        @drag="onResize"
        @drag-end="onResizeEnd"
    >
      <svg
          class="circle-stencil__icon"
          xmlns="http://www.w3.org/2000/svg"
          width="26.7"
          height="26.3"
          @mousedown.prevent
      >
        <path
            fill="#FFF"
            d="M15.1 4.7L18.3 6l-3.2 3.3 2.3 2.3 3.3-3.3 1.3 3.3L26.7 0zM9.3 14.7L6 18l-1.3-3.3L0 26.3l11.6-4.7-3.3-1.3 3.3-3.3z"
        ></path>
      </svg>
    </draggable-element>
    <draggable-area @move="onMove" @move-end="onMoveEnd">
      <stencil-preview
          class="circle-stencil__preview"
          :image="image"
          :coordinates="coordinates"
          :width="stencilCoordinates.width"
          :height="stencilCoordinates.height"
          :transitions="transitions"
      />
    </draggable-area>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import {
  DraggableElement,
  DraggableArea,
  StencilPreview,
  ResizeEvent
} from 'vue-advanced-cropper';

const props = defineProps({
  image: Object,
  coordinates: Object,
  transitions: Object,
  stencilCoordinates: Object
});

const emit = defineEmits();

const style = computed(() => {
  const { height, width, left, top } = props.stencilCoordinates;
  const style = {
    width: `${width}px`,
    height: `${width}px`, // Enforce square aspect ratio
    transform: `translate(${left}px, ${top}px)`
  };
  if (props.transitions && props.transitions.enabled) {
    style.transition = `${props.transitions.time}ms ${props.transitions.timingFunction}`;
  }
  return style;
});

const onMove = (moveEvent) => {
  emit('move', moveEvent);
};

const onMoveEnd = () => {
  emit('move-end');
};

const onResize = (dragEvent) => {
  const shift = dragEvent.shift();
  const sizeResize = Math.max(shift.left, -shift.top); // Ensure width and height resize equally

  emit(
      'resize',
      new ResizeEvent(
          {
            left: sizeResize,
            right: sizeResize,
            top: sizeResize,
            bottom: sizeResize
          },
          {
            compensate: true
          }
      )
  );
};

const onResizeEnd = () => {
  emit('resize-end');
};
</script>

<style scoped lang="scss">
.circle-stencil {
  border-radius: 50%;
  cursor: move;
  position: absolute;
  border: dashed 2px white;
  box-sizing: border-box;

  &__handler {
    position: absolute;
    right: 15%;
    top: 14%;
    z-index: 1;
    cursor: ne-resize;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(50%, -50%);
  }

  &__preview {
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
