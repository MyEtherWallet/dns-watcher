<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">

// *********************************************************************
// CSS reset
// *********************************************************************
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
}

body {
  box-sizing: border-box;
}


// *********************************************************************
// Standard list styles
// *********************************************************************
ul li {
  list-style-type: none;
}


// *********************************************************************
// Standard link styles
// *********************************************************************
a:link,
a:visited,
a:hover,
a:active {
  color: black;
  text-decoration: none;
}

a {
  &.underline {
    text-decoration: underline;
  }
}

.underline a {
  text-decoration: underline;
}


// *********************************************************************
// Standard elements
// *********************************************************************
.hidden {
  display: none;
}

.clickable {
  cursor: pointer;
}

</style>
