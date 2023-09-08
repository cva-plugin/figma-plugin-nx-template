<script lang="ts">
  import RequestAccess from "./RequestAccess.svelte";
  import { MessageBus, Command, Event } from '@cva/shared';
  import { Button, Input, Label } from "@tokilabs/figma-plugin-sdk";
  import { checkSentInviteCode } from "@ui/requests/checkInviteCode";
  import { optionsStore } from "@ui/stores/OptionsStore";
  import register from "@ui/requests/waitlistRegistration";
  import logo from "../assets/logo.svg";
  let emailInput: string;
  let inviteCodeInput: string;
  let haveInvite: boolean = false;
  async function joinWaitlist() {
    if (emailInput) {
      const registred = await register(emailInput, $optionsStore.figmaUserId);
      haveInvite = registred;
    }
  }
  async function verifyInviteCode() {
    if (inviteCodeInput) {
      const verified = await checkSentInviteCode(inviteCodeInput, $optionsStore.figmaUserId);
      if (verified) {
        optionsStore.update((store) => {
          store.screen = "AskForBlueprint";
          return store;
        });
      }
    }
  }
</script>

<div
  id="RequestAccessPage"
  class="page-container center-content support-page"
  style="height: 100%;"
>
  {#if !haveInvite}
    <figure class="cva-full-logo">
      <img src={logo} alt="CVA logo" />
      <figcaption>COMPONENT VARIANCE AUTHORITY</figcaption>
    </figure>
    <article>
      <p>
        We may have authority in our name,<br />but we don't want to control your flow.
      </p>
      <p class="emphasize">We want to give you control over your component variants!</p>
      <p>Share with us your their pain when dealing with component variant explosion!</p>
      <a href="https://discord.gg/DFWupGKJs9"> Join the chat on Discord → </a>
      <p>
        <a href="https://twitter.com/cvaforfigma"> Follow us on Twitter → </a>
        <span class="fine-print">(DMs are always open)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      </p>
      <div class="form">
        <label for="email">Request Access</label>
        <Input
          type="email"
          id="email"
          name="email"
          bind:value={emailInput}
          placeholder="What's your email?"
        />
        <p>
          <Button class="big" on:click={joinWaitlist}>Request Access</Button>
        </p>
      </div>
      <p class="small-link" on:keydown on:click={() => (haveInvite = !haveInvite)}>
        Got an invite code already? →
      </p>
    </article>
  {:else}
    <img class="h-24 w-62" src={logo} alt="logo" />
    <p class="cva-name">COMPONENT VARIANCE AUTHORITY</p>
    <div
      class=" text-[11px] font-normal tracking-[0.11px] leading-[14px] ml-2 w-[230px] h-full w-full"
    />
    <div class="page-container center-content">
      <p class="text-[12px] font-medium leading-4 m-[30px]">Enter invitation code</p>
      <!-- <Label>Email</Label> -->

      <Input
        class="relative w-[200px]  h-[32px]"
        bind:value={inviteCodeInput}
        placeholder="Enter your invitation code"
      />

      <Button class="h-8 mx-auto mt-2 text-xs w-fit" on:click={verifyInviteCode}
        >Request Access</Button
      >
      <p
        class="link mt-[30px] text-blue-400 text-xs cursor-pointer"
        on:keydown
        on:click={() => (haveInvite = !haveInvite)}
      >
        Wanna sign up for an email? →
      </p>
    </div>
  {/if}
</div>

<style lang="scss">
  .link {
    color: rgb(96 165 250);
  }

  .link:hover {
    text-decoration: underline;
  }

  // .fixed-bottom-center {
  //   position: fixed;
  //   left: 50%;
  //   transform: translateX(-50%);
  //   bottom: 300;
  // }
</style>
