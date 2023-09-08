import App from './Main.svelte';

// Set TEST_PATTERN
const app = new App({
  target: document.body,
  props: {
    testFilterPattern: '.*',
    testing: true,
  },
});

export default app;
