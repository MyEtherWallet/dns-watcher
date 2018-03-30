<template>
<div class="checker">
    <div v-if="checkComplete">
        <div v-if="fileCheckResult">
            <img class="checkmark" src="../../public/approved-151676.svg">
            The true <a href="https://myetherwallet.com">myetherwallet</a> is being served to your computer
        </div>
        <div v-else>
            WARNING: the true myetherwallet is not being served to your computer
        </div>
    </div>
    <div class="placeholding" v-else>
        Checking if the true myetherwallet.com site...
    </div>
</div>


</template>

<script>
    import fileCheck from "../js/inBrowserFileCheck";
   let files = [
        "/index.html",
        "/embedded.html",
        "/helpers.html",
        "/signmsg.html",
        "/bin/startMEW.js",
        "/css/etherwallet-master.min.css",
        // fontsBold: "",
        // fontsLight: "",
        // fontsRegular: "",
        "/js/etherwallet-master.js",
        "/js/etherwallet-static.min.js",
        "/js/jquery-1.12.3.min.js"
    ];


    export default {
        name: "file-check",
        data: function(){
            return {
                checkComplete: false,
                fileCheckResult: false
            }
        },
        methods:{
            fileCheck(){
                fileCheck(files)
                    .then( result => {
                        console.log("complete");
                        this.fileCheckResult = result;
                        this.checkComplete = true;
                    })
            }
        },
        created(){
            this.fileCheck();
        }
    }
</script>

<style scoped>
.checker{
    margin-top: 100px;
}
.placeholding{
    margin-top: 275px;
}
.checkmark{
    height: 200px;
    width: 200px;
}
</style>