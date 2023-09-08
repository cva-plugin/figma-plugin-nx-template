<script lang="ts">
import bell from "../assets/bell.svg";
export let title: string;
export let content: string;
export let link: {
  href: string;
  callout: string;
};
export let backgroundColor: "info" | "none" = "none";
export let shadow: boolean = false;
</script>

<div
  class="info flex self-stretch m-2 p-4 rounded-md {shadow ? 'shadow' : 'shadow-none'}
     {backgroundColor === 'info' ? 'bg-[e1f3ff]' : 'bg-white'}">
  <div class="block h-full">
    <slot>
      <img class="h-7" src="{bell}" alt="Bell icon" />
    </slot>
  </div>
  <div class="flex flex-col mx-4 text-xs">
    <h3 class="text-[13px] font-bold">{title}</h3>
    <p>{content}</p>
    <a class="self-end text-blue-400 text-[#18A0f8]" href="{link.href}">{link.callout}</a>
  </div>
</div>

<style lang="scss">
// .shadow {
// filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.15));
// }

.info {
  .content {
    a {
      color: var(--lightBlue);
    }
  }
}
</style>
