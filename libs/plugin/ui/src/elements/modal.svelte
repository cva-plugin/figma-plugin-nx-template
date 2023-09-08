<script lang="ts">
import IconClose from "../assets/closeModal.svg";
import ClickOutside from "svelte-click-outside";
export let showModal: boolean;

let className: string = "";
export { className as class };

let dialog: HTMLDialogElement;

$: if (dialog && showModal) dialog.showModal();
</script>

<!-- @component
  @name Modal
  @description
    A modal dialog box.
 -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<ClickOutside on:clickoutside="{() => {}}">
  <dialog bind:this="{dialog}" on:close="{() => (showModal = false)}" class="modal {className}">
    <div class="container" on:click|stopPropagation>
      <div class="content">
        <slot name="header" />
        <div
          class="close"
          on:click="{() => {
            dialog.close();
          }}">
          <img src="{IconClose}" alt="Close" />
        </div>
      </div>
      <slot />
    </div>
  </dialog>
</ClickOutside>

<style lang="scss">
.modal {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  gap: 0.625rem;
  border-radius: 0.125rem;
  background-color: #ffffff;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  .container {
    width: 100%;
    height: 100%;
    .content {
      display: flex;
      padding-top: 0.5rem;
      flex-direction: row;
      justify-content: space-between;
      height: 24px;
      .close {
        cursor: pointer;
        height: 12px;
      }
    }
  }
}
</style>
