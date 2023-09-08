<!-- Overflow.svelte -->
<style>
  /* Styling for the overflow container */
  .overflow-container {
    max-height: 0px; /* Set the desired maximum height */
    overflow-y: auto; /* Enable vertical scrolling if necessary */

  }
</style>

<div class="overflow-container">
  <!-- Slot for the content to be passed in -->
  <slot></slot>
</div>
