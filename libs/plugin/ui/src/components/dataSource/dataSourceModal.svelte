<script lang="ts">
//Components
import Modal from "@ui/elements/modal.svelte";
import Switch from "@ui/elements/switch.svelte";
import { Button, SelectMenu, Label, Input } from "@tokilabs/figma-plugin-sdk";

// Images
import plus from "@ui/assets/plus.svg";
import less from "@ui/assets/less.svg";
import propertyColor from "@ui/assets/propertyColor.svg";
import propertyBoolean from "@ui/assets/propertyBoolean.svg";
import propertyNumber from "@ui/assets/propertyNumber.svg";
import propertyText from "@ui/assets/propertyText.svg";
import { IDataSourceStore, dataSourceStore } from "@ui/stores/dataSourceStore";
import { Command, MessageBus } from '@cva/shared';

//Export Props
export let showModal = true;
let className: string = "";
export { className as class };

// Internal Props
type MenuItem = {
  value: string;
  label: keyof IDataSourceStore;
  group: string | null;
  selected: boolean;
};

let recordPropertySvg: Record<keyof IDataSourceStore, string> = {
  Color: propertyColor,
  Boolean: propertyBoolean,
  Number: propertyNumber,
  Text: propertyText,
};
let menuItems: MenuItem[] = Object.entries(recordPropertySvg).map(([entry, value]) => {
  return {
    value: value,
    label: entry as keyof IDataSourceStore,
    group: null,
    selected: false,
  };
});
let selectedItem: MenuItem | null = null;

let data: IDataSourceStore;

// mock props
let inputValue = "My List of ";

//reactivity
dataSourceStore.subscribe((store) => {
  data = store;
});

//events

function onDataTypeChange() {
  if (selectedItem && inputValue == "My List of ") inputValue = inputValue + selectedItem.label;
  if (selectedItem && data[selectedItem.label].length < 1) {
    const newKey = `${selectedItem.label} ${data[selectedItem.label].length}`;
    const value = dataSourceStore.basicDataSource(selectedItem.label);
    const newData = {
      name: newKey,
      value: value,
    };
    data[selectedItem.label].push(newData);
    data = data;
  }
}

function onRemoveDataSource(type: keyof IDataSourceStore, name: string) {
  const i = data[type].findIndex((d) => d.name == name);
  if (i != -1) {
    data[type].splice(i, 1);
    data = data;
  }
  return null;
}

function onCreateItemButtonClicked(type: keyof IDataSourceStore) {
  if (!selectedItem) {
    MessageBus.sendCommand(Command.ShowMessage, {
      message: "Please insert a data type!",
      error: true,
    });
  } else {
    const newKey = `${type} ${Object.keys(data[type]).length}`;
    const value = dataSourceStore.basicDataSource(type);
    const newData = {
      name: newKey,
      value: value,
    };
    data[type].push(newData);
    data = data;
  }
}
function onSaveDataSources() {
  MessageBus.sendCommand(Command.ShowMessage, {
    message: "The dataSources have been saved",
  });
  dataSourceStore.update((store) => {
    return data;
  });
  showModal = false;
}
</script>

<Modal class=" {className}" bind:showModal="{showModal}">
  <!-- style
    padding-top: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border-style: none;
    border-radius: 0.5rem;
    //width: 340px;
    //height: 340px;
    box-sizing: border-box;
  -->
  <strong slot="header">User Data Source</strong>
  <div class="modal-class">
    <div class="divider"></div>
    <div class="data-source">
      <div class="data-source-properties">
        <!-- Data name -->
        <Label>Datasource Name</Label>
        <Input class="" bind:value="{inputValue}" />
      </div>
      <!-- Data type -->
      <div class="data-source-options">
        <Label>Data Type</Label>
        <SelectMenu
          class="w-[128px] h-[32px] pl-[12px]"
          bind:menuItems="{menuItems}"
          bind:value="{selectedItem}"
          iconName="{selectedItem?.value}"
          on:change="{onDataTypeChange}" />
      </div>
    </div>

    <!-- <Overflow> -->
          <div id="headerTable">
            <div id="headerTableName"> Name </div>
            <div id="headerTableValue"> Value </div>
            </div>
    <div class="overflow" style="margin-top: 0px; height: 145px;">
      <div class="table">
        <table width="100%">

          <tbody>
            {#if selectedItem}
              {#if selectedItem.label == "Color"}
                {#each data.Color as color}
                  <tr class="table-body">
                    <td><Input class="input-component" bind:value="{color.name}" /></td>
                    <td class="color-cell">
                      <div class="container">
                        <div class="show-color" style="background-color: {color.value};"></div>
                        <div class="color-value">
                          <Input
                            class="input-component"
                            bind:value="{color.value}"
                            on:change="{() => (color.value = color.value.toUpperCase())}" />
                        </div>
                      </div>
                    </td>
                    <td class="table-last-cell">
                      <img
                        src="{less}"
                        alt="remove data-source"
                        on:keyup
                        on:click="{onRemoveDataSource('Color', color.name)}" /></td>
                  </tr>
                {/each}
              {:else if selectedItem.label == "Boolean"}
                {#each data.Boolean as boolean}
                  <tr class="table-body">
                    <td><Input class="input-component" bind:value="{boolean.name}" /></td>
                    <td
                      ><Switch bind:checked={boolean.value}
                        >{boolean.value.toString().charAt(0).toUpperCase() +
                          boolean.value.toString().slice(1)}</Switch>
                    </td>
                    <td class="table-last-cell">
                      <img
                        src="{less}"
                        on:keyup
                        on:click="{onRemoveDataSource('Boolean', boolean.name)}"
                        alt="remove data-source" /></td>
                  </tr>
                {/each}
              {:else if selectedItem.label == "Number"}
                {#each data.Number as number}
                  <tr class="table-body">
                    <td><Input class="input-component" bind:value="{number.name}" /></td>
                    <td><Input class="input-component" bind:value="{number.value}" /></td>
                    <td class="table-last-cell">
                      <img
                        src="{less}"
                        on:keyup
                        on:click="{onRemoveDataSource('Number', number.name)}"
                        alt="remove data-source" /></td>
                  </tr>
                {/each}
              {:else if selectedItem.label == "Text"}
                {#each data.Text as text}
                  <tr class="table-body">
                    <td><Input class="input-component" bind:value="{text.name}" /></td>
                    <td> <Input class="input-component" bind:value="{text.value}" /> </td>
                    <td class="table-last-cell">
                      <img
                        src="{less}"
                        on:keyup
                        on:click="{onRemoveDataSource('Text', text.name)}"
                        alt="remove data-source" /></td>
                  </tr>
                {/each}
              {/if}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <!-- </Overflow> -->
    <div class="buttons">
      <div class="create-item-button">
        <button
          class="borderless-button"
          on:click={() => onCreateItemButtonClicked(selectedItem.label)}>
          <img src="{plus}" alt="plus button" />
          <strong> Create Item </strong>
        </button>
      </div>
      <div class="save-button">
        <Button on:click="{onSaveDataSources}">Save</Button>
      </div>
    </div>
  </div>
</Modal>

<style lang="scss">
:global(.modal) {
  overflow: hidden;
}
.modal-class {
  display: flex;
  flex-direction: column;
}

strong {
  font-family: Inter;
  font-size: 11px;
  font-style: normal;
  color: var(--black-iii, #333);
  font-weight: 500;
  line-height: 14px;
  letter-spacing: 0.11px;
}

.divider {
  position: absolute;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: #ccc;
  margin-top: 10px;
}

.data-source {
  display: flex;
  align-self: stretch;
  gap: 57px;
  padding-top: 16px;
}

.overflow {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-height: 150px; /* Set the desired maximum height */
  overflow-y: auto; /* Enable vertical scrolling if necessary */
}
#headerTable{
  width: 100%;
  padding-top: 8px;
  text-align: left;
  color: rgba(0, 0, 0, 0.4);
  font-size: 11px;
  font-weight: 400;
  display: flex;
}
#headerTableName{
  width: 160px; background-color: #FAFAFA; height:35px; padding: 10px 0 0 22px; margin-left:-16px;
}
#headerTableValue{
  width: 182px; background-color: #FAFAFA; height:35px; padding-top: 10px; margin-right:-16px;
}
.table {
  margin-top: 0px;

  .background {
    position: absolute;
    left: 0;
    width: 100%;
    height: 34px;
    background-color: #fafafa;
    z-index: -1;
  }

  th,
  td {
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0.055px;
  }

  th {
    width: 50%;
    padding-top: 8px;
    text-align: left;
    color: rgba(0, 0, 0, 0.4);

  }

  td {
    color: rgba(0, 0, 0, 0.8);
  }

  // Color td

  .color-cell {
    .container {
      display: flex;
      justify-content: start;
    }
  }
  .show-color {
      margin-top: 8px;
      width: 14px;
      height: 14px;
    }

  .table-last-cell {
    text-align: right;
  }
}
.buttons {
  display: flex;
  gap: 50%;
  margin-top: 140px;
}

.create-item-button {
  width: 100px;
  height: 32px;
  position: absolute;
  bottom: 5;
  left: 5;

  .borderless-button {
    border: none;
    background-color: transparent;
    padding: 0;
    display: inline-flex;
    white-space: nowrap;
    align-items: center;
    justify-content: center;
    color: #000;
    font-family: Inter;
    font-size: 11px;
    font-style: normal;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: -0.055px;
    position: absolute;
    bottom: 10;
    left: 15;
  }

  .borderless-button:active {
    transform: scale(0.95);
    transition: transform 0.3s ease;
  }

  img {
    max-width: 100%;
    height: auto;
  }
}
.save-button {
  position: absolute;
  bottom: 15;
  right: 15;
}
</style>
