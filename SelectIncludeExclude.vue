<template>
    <div id="wrapper">
        <div id="header" v-if="showResetButton">
            <div id="quick-select-links">
                <a id="reset-link" @click="reset()">reset</a>
            </div>
        </div>

        <div id="display-separately" v-if="showOptionsSeparately">
            <ul class="option-list">
                <li v-for="option in includedOptions"
                    class="option included"
                    @click="biToggleSelection(option)"
                    @mousedown.prevent
                >
                    {{ option[ name ] }}
                </li>
            </ul>
            <ul class="option-list">
                <li v-for="option in excludedOptions"
                    class="option excluded"
                    @click="biToggleSelection(option)"
                    @mousedown.prevent
                >
                    {{ option[ name ] }}
                </li>
            </ul>
        </div>
        <div v-else id="display-single-list">
            <ul class="option-list">
                <li v-for="option in initialOptions"
                    class="option"
                    :class="{included: isIncluded(option), excluded: isExcluded(option)}"
                    @click="triToggleSelection(option)"
                    @mousedown.prevent
                >
                    {{ option[ name ] }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
    import ArrayUtil from '@/utils/arrayUtil';

    export default {
        name: 'SelectIncludeExclude',
        props: {
            initialOptions: {
                type: Array,
                required: true,
            },
            name: {
                type: String,
                required: false,
                default: 'name',
            },
            preSelectedOption: {
                type: Object,
                required: false,
            },
            showResetButton: {
                type: Boolean,
                required: false,
                default: true,
            },
            showOptionsSeparately: {
                type: Boolean,
                required: false,
                default: false,
            },
        },
        watch: {
            initialOptions() {
                this.options = this.getInitialOptionsClone();
                if ( this.options.length === 0 ) {
                    this.reset();
                } else if ( this.preSelectedOption ) {
                    this.triToggleSelection( this.preSelectedOption );
                }
            },
        },
        data() {
            return {
                options: [],
                includedOptions: [],
                excludedOptions: [],
            };
        },
        methods: {
            getInitialOptionsClone() {
                return ArrayUtil.clone( this.initialOptions );
            },
            isIncluded( option ) {
                return this.includedOptions.indexOf( option ) !== -1;
            },
            isExcluded( option ) {
                return this.excludedOptions.indexOf( option ) !== -1;
            },
            reset() {
                this.includedOptions = [];
                this.excludedOptions = [];
                this.publishSelectedOptions();
            },
            publishSelectedOptions() {
                this.$emit( 'updateOptions', this.includedOptions, this.excludedOptions );
            },
            triToggleSelection( option ) {
                if ( this.isIncluded( option ) ) {
                    this.excludedOptions.push( option );
                    ArrayUtil.remove( this.includedOptions, option );
                } else if ( this.isExcluded( option ) ) {
                    ArrayUtil.remove( this.includedOptions, option );
                    ArrayUtil.remove( this.excludedOptions, option );
                } else {
                    this.includedOptions.push( option );
                    ArrayUtil.remove( this.excludedOptions, option );
                }

                this.publishSelectedOptions();
            },
            biToggleSelection( option ) {
                if ( this.isIncluded( option ) ) {
                    this.excludedOptions.push( option );
                    ArrayUtil.remove( this.includedOptions, option );
                } else {
                    this.includedOptions.push( option );
                    ArrayUtil.remove( this.excludedOptions, option );
                }

                this.publishSelectedOptions();
            },
        },
    };
</script>

<style scoped>
    #header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        float: right;
        margin-top: -50px;
    }
    ul{
        list-style-type: none;
        margin: 1.5rem 0;
        padding: 0;
    }
    #display-single-list .option-list{
        display: flex;
        flex-flow: row wrap;
        align-items: stretch;
    }
    #display-separately{
        display: flex;
    }
    #display-separately .option-list{
        flex:1;
    }
    .option{
        position: relative;
        font-size: .65rem;
        padding: .4rem 1.3rem .4rem .5rem;
        margin: 3px;
        cursor: pointer;
        border-radius: 7px;
        background-color: white;
        color: #5ea43b;
        letter-spacing: 1px;
        font-family: "Roboto Slab", serif;
    }
    .option:hover,
    .option.included:hover,
    .option.excluded:hover{
        opacity: .9;
    }
    .option.included{
        background-color: #5ea43b;
        color: white;
    }
    .option.included:after {
        content:"+";
        color: white;
        font-size: 18px;
        width: 20px;
        text-align: center;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    .option.excluded{
        background-color: white;
        color: #e53131;
        border: #e53131 1px solid;
        margin: 2px;
    }

    .option.excluded:after {
        content:"-";
        color: #e53131;
        font-size: 18px;
        width: 20px;
        text-align: center;
        position: absolute;
        right: 0;
        top: 42%;
        transform: translateY(-50%);
    }

    #quick-select-links a{
        font-size: .8rem;
        cursor: pointer;
        border: solid 2px white;
        padding: 5px 10px;
        border-radius: 10px;
    }

    /* PAGE SPECIFIC */

    /* Catalog-Autogen-PO */
        .designators-autogen .option {
            color: #646569;
            border: solid 1px #c1c1c1;
        }
        .designators-autogen .option.included {
            border: solid 1px #5ea43b;
            color: white;
        }
        .designators-autogen .option.excluded {
            margin: 3px;
            color: #e53131;
            border: #e53131 1px solid;
        }
</style>
