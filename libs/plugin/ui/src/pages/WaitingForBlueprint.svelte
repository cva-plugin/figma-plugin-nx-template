<script lang="ts">
import Logo from "../assets/logo.svg";
</script>

<div>
  <img src="{Logo}" alt="Logo CVA" />
  <p class="text-logo">Component Variance Authority</p>
  <p class="first">Please select a valid<br />blueprint</p>
</div>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@700&family=Montserrat&display=swap");

// body {
//   width: 400px;
//   height: 100%;
// }

img {
  display: block;
  margin: 75.5px auto 0;
}

.text-logo {
  color: #ed6637;
  text-align: center;
  margin-top: 2px;
  font-size: 16px;
  font-weight: 700;
  line-height: 150%;
  letter-spacing: 0.36px;
  font-family: "Josefin Sans", sans-serif;
}

.first {
  color: #c12906;
  text-align: center;
  font-size: 25px;
  margin-top: 90px;
  font-weight: 700;
  letter-spacing: 0.14px;
  font-family: Montserrat, sans-serif;
}
</style>
