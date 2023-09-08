<script lang="ts">
  import Tree from "../components/tree.svelte";
  import Output from "../components/output.svelte";
  import Bell from "../assets/bell.svg";
  import Resize from "../utils/resize.svelte";
</script>

<div id="GenerateVariantsPage" class="page-container plugin-ui" style="height: 100%;">
  <!-- <Header /> -->
  <div class="info flex self-stretch mt-[13px] p-4 rounded-md shadow-none bg-[e1f3ff]">
    <div class="block h-full">
      <slot>
        <img src={Bell} alt="Bell icon" class="h-4 w-[14px] mt-1" />
      </slot>
    </div>
    <div class="flex flex-col pl-3 text-xs">
      <h3 class="text-[13px] m-0 p-0 font-bold">CVA is Free while in beta!</h3>
      <p class="text-[11px] m-0 p-0">
        Join us on Discord to help shape CVA to your needs and get a big discount later!
      </p>
      <a class="self-end text-blue-400 text-[#18A0f8]" href="localhost:3000">join the beta →</a>
    </div>
  </div>

  <Tree />
  <Output />
  <Resize />
</div>

<style lang="scss">
  .info {
    display: none;
    .content {
      a {
        color: var(--lightBlue);
      }
    }
  }
</style>
