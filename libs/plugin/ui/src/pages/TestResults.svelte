<script lang="ts">
import { Event, MessageBus } from '@cva/shared';
import { onMount } from "svelte";

MessageBus.listenToEvent(Event.TestPassed, testPassed);
MessageBus.listenToEvent(Event.TestFailed, testFailed);
MessageBus.listenToEvent(Event.TestsEnded, testsEnded);

function testPassed(asserts: any){
  console.log("passed", asserts)
}
function testFailed(asserts: any){
  console.log("failed", asserts)
}
function testsEnded(asserts: any){
  console.log("endend", asserts)
}

onMount(async () => {
  console.log("Test Results mounted");
});
</script>

<div id="test-results-page">
  <!-- our test table implementation
  <h1 class="text-logo">Test Results</h1>
  <table>
    <thead>
      <tr>
        <th class="cell-result">Result</th>
        <th class="cell-name">Test Name</th>
        <th class="cell-message">Message</th>
      </tr>
    </thead>
    <tbody>
      <tr class="test-result passed">
        <td class="cell-result">✅</td>
        <td class="cell-name">Test 1</td>
        <td class="cell-message"></td>
      </tr>
      <tr class="test-result skipped">
        <td class="cell-result">▽</td>
        <td class="cell-name">Test 4</td>
        <td class="cell-message">
          <emphasis>not executed (fail fast is <code>true</code>)</emphasis>
        </td>
      </tr>
      <tr class="test-result passed">
        <td class="cell-result">✅</td>
        <td class="cell-name">Test 2</td>
        <td class="cell-message"></td>
      </tr>
      <tr class="test-result failed">
        <td class="cell-result">❌</td>
        <td class="cell-name">Test 3</td>
        <td class="cell-message">
          Expected <br />
          <pre><code
              >&lbrace;
  "value": 1
&rbrace;</code></pre>
          but got<br />
          <pre><code
              >&lbrace;
  "value": 2
&rbrace;</code></pre>
        </td>
      </tr>
      <tr class="test-result unknown">
        <td class="cell-result">❔</td>
        <td class="cell-name">Test 4</td>
        <td class="cell-message">
          <emphasis>not executed (fail fast is <code>true</code>)</emphasis>
        </td>
      </tr>
    </tbody>
  </table>
-->

  <!-- CSS

h1 {
  font-size: 2em;
  font-weight: 300;
  line-height: 1em;
  text-align: center;
}

h2 {
  font-size: 1em;
  font-weight: 300;
  text-align: center;
  display: block;
  line-height: 1em;
  padding-bottom: 2em;
}

table {
  text-align: left;
  overflow: hidden;
  width: 80%;
  margin: 0 auto;
  display: table;
  padding: 0 0 8em 0;

  td,
  th {
    padding-bottom: 2%;
    padding-top: 2%;
    padding-left: 2%;
  }

  td {
    font-weight: normal;
    font-size: 1em;
    -webkit-box-shadow: 0 2px 2px -2px #0e1119;
    -moz-box-shadow: 0 2px 2px -2px #0e1119;
    box-shadow: 0 2px 2px -2px #0e1119;
  }

  /* Background-color of the odd rows */
  tr:nth-child(odd) {
    background-color: #13161d;
  }

  /* Background-color of the even rows 181e22 */
  tr:nth-child(even) {
    background-color: #151e23;
  }

  th {
    font-size: 1em;
    text-align: left;
    letter-spacing: 1px;
    color: #fff;
    background-color: #111115;
  }

  tr:hover {
    background-color: #333;
    -webkit-box-shadow: 0 6px 6px -6px #0e1119;
    -moz-box-shadow: 0 6px 6px -6px #0e1119;
    box-shadow: 0 6px 6px -6px #0e1119;
  }

  // td:hover {
  //   background-color: #fff842;
  //   color: #403e10;
  //   font-weight: bold;

  //   box-shadow: #7f7c21 -1px 1px, #7f7c21 -2px 2px, #7f7c21 -3px 3px, #7f7c21 -4px 4px,
  //     #7f7c21 -5px 5px, #7f7c21 -6px 6px;
  //   transform: translate3d(6px, -6px, 0);

  //   transition-delay: 0s;
  //   transition-duration: 0.4s;
  //   transition-property: all;
  //   transition-timing-function: line;
  // }
}

.cell-result,
.cell-name,
.cell-message {
  white-space: nowrap;
}

table .test-result {
  // td:first-child {
  //   color: #fb667a;
  // }

  &.passed td {
    color: #9ddffd;
  }

  &.skipped td {
    color: #fffb90;
  }

  &.failed td {
    color: #ffa3b5;
  }

  &.unknown td {
    color: #cfdee5;
  }

  .cell-result {
    text-align: center;
  }

  .cell-message pre {
    border: 1px solid #557;
    padding: 10px;
  }
}
-->
</div>

<style lang="scss">
/*
	Table Responsive
	===================
	Author: https://github.com/pablorgarcia
 */

@charset "UTF-8";
@import "https://fonts.googleapis.com/css?family=Open+Sans:300,400,700";

#test-results-page {
  width: 100%;
  height: 100%;
  padding: 20px 10px;
  font-family: "Open Sans", sans-serif;
  font-weight: 300;
  line-height: 1.42em;
  color: #eeeeef;
  background-color: #25272b;
}
</style>
