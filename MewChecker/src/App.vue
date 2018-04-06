<template>
    <div id="app" >
    <link href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" integrity="sha384-wvfXpqpZZVQGK6TAh5PVlGOfQNHSoD2xbE+QkPxCAFlNEevoEH3Sl0sibVcOQVnN" crossorigin="anonymous">
    <div class="dns-watcher">

        <div class="wrapper">
            <header>
                <img src="~@/assets/mew-logo.png">
                <h1 class="title">DNS Watcher</h1>
                <h5 class="">status.myetherwallet.com</h5>

            </header>
            <div class="status">
                <file-check></file-check>
            </div>

            <dns-result-table></dns-result-table>
            <!--<div class="status-buttons">-->
                <!--<button>Errors</button>-->
                <!--<button>Valid</button>-->
            <!--</div>-->

            <!--<div class="table-data">-->
                <!--<dns-results></dns-results>-->
            <!--</div>-->


        </div>

    </div>

        <!--<img class="mewLogo" src="../public/mewlogo.svg">-->
        <!--<file-check></file-check>-->
        <!--<div class="checker-component">-->
            <!--<h3>DNS Nameservers correctly or incorrectly pointing to myetherwallet.com:</h3>-->
            <!--<dns-results></dns-results>-->
        <!--</div>-->

    </div>
</template>

<script>
    import FileCheck from "./components/FileCheck.vue";
    import DnsResultTable from "./components/DnsResultTable.vue";

    export default {
        name: 'app',
        components: {
            FileCheck,
            DnsResultTable
        }
    }
</script>

<style lang="scss">
    html, body, div, span, applet, object, iframe,
    h1, h2, h3, h4, h5, h6, p, blockquote, pre,
    a, abbr, acronym, address, big, cite, code,
    del, dfn, em, img, ins, kbd, q, s, samp,
    small, strike, strong, sub, sup, tt, var,
    b, u, i, center,
    dl, dt, dd, ol, ul, li,
    fieldset, form, label, legend,
    table, caption, tbody, tfoot, thead, tr, th, td,
    article, aside, canvas, details, embed,
    figure, figcaption, footer, header, hgroup,
    menu, nav, output, ruby, section, summary,
    time, mark, audio, video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
    }
    /* HTML5 display-role reset for older browsers */
    article, aside, details, figcaption, figure,
    footer, header, hgroup, menu, nav, section {
        display: block;
    }
    body {
        line-height: 1;
    }
    ol, ul {
        list-style: none;
    }
    blockquote, q {
        quotes: none;
    }
    blockquote:before, blockquote:after,
    q:before, q:after {
        content: '';
        content: none;
    }
    table {
        border-collapse: collapse;
        border-spacing: 0;
    }
</style>
