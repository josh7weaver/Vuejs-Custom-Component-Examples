<template>
    <div class="dropdown" :class="{'open' : open}">

        <input type="text"
               ref="search"
               v-model="searchText"
               :placeholder="placeholder"
               @input="searchChanged"
               @keydown.down="down"
               @keydown.up="up"
               @keydown.enter="suggestionSelected(matches[highlightIndex])"
               @keydown.esc="setOpen(false)"
               @blur="setOpen(false)"
               @click="setOpen(true)"
        >
        <!--<a class="toggle" @mousedown.prevent @click="setOpen(!open)">-->
            <!--<span class="arrow-up">▲</span>-->
            <!--<span class="arrow-down">▼</span>-->
        <!--</a>-->
        <ul class="suggestion-list">
            <li v-for="(suggestion, index) in matches"
                @click="suggestionSelected(suggestion)"
                @mousedown.prevent
                :class="{'active' : index === highlightIndex}"
            >
                {{ suggestion[name] }}
            </li>
        </ul>
    </div>

</template>

<script>
    /* Based on https://designhammer.com/blog/reusable-vuejs-components-part-3-autocomplete-dropdown */
    export default {
        name: 'SearchDropdownInput',
        props: {
            optionList: {
                // An array of objects, and each object must have a 'name' attribute
                type: Array,
                required: true,
            },
            name: {
                type: String,
                required: false,
                default: 'name',
            },
            placeholder: {
                type: String,
                required: false,
                default: 'Type to search',
            },
        },
        data() {
            return {
                searchText: '',
                selectedOption: null,
                open: false,
                highlightIndex: 0,
                // lastSearchText: '',
            };
        },
        computed: {
            matches() {
                return this.optionList.filter( option => option[ this.name ].toLowerCase().match( this.searchText.toLowerCase().replace( /\s+/g, '.+' ) ) );
            },
        },
        methods: {
            setOpen( isOpen ) {
                this.open = isOpen;

                if ( this.open ) {
                    this.$refs.search.focus();
                    // this.lastSearchText = this.searchText;
                    this.searchText = '';
                }
                // else if ( this.searchText.trim() === '' ) {
                //     this.searchText = this.lastSearchText;
                // }
            },
            searchChanged() {
                if ( !this.open ) {
                    this.open = true;
                }
                this.highlightIndex = 0; // reset the selected element if they change what they typed
            },
            suggestionSelected( suggestion ) {
                this.open = false;
                // this.searchText = suggestion[this.name];
                this.searchText = '';
                this.$emit( 'input', suggestion );
            },
            up() {
                if ( this.open ) {
                    if ( this.highlightIndex > 0 ) {
                        this.highlightIndex = this.highlightIndex - 1;
                    } else {
                        this.setOpen( false );
                    }
                } else {
                    this.setOpen( true );
                }
            },

            down() {
                if ( this.open ) {
                    if ( this.highlightIndex < this.matches.length - 1 ) {
                        this.highlightIndex = this.highlightIndex + 1;
                    }
                } else {
                    this.setOpen( true );
                }
            },
        },
    };
</script>

<style scoped>
    .dropdown {
        display: inline-block;
        width: 100%;
        position: relative;
    }
    input{
        width: 100%;
    }
    .suggestion-list {
        background-color: rgba(255, 255, 255, 0.95);
        border: 1px solid #ddd;
        list-style: none;
        display: block;
        margin: 0;
        padding: 0;
        width: 100%;
        min-height: 150px;
        max-height: 50vh;
        overflow: auto;
        position: absolute;
        top: 20px;
        left: 0;
        z-index: 2;
    }
    .suggestion-list li {
        padding: .5rem 0;
    }
    .dropdown.open .suggestion-list {
        display: block;
    }
    .dropdown .suggestion-list {
        display: none;
    }
    .suggestion-list li {
        cursor: pointer;
    }
    .suggestion-list li:hover {
        color: #fff;
        background-color: #ccc;
    }

    .toggle .arrow-up {
        display: none;
    }

    .open .toggle .arrow-up {
        display: inline-block;
    }

    .open .toggle .arrow-down {
        display: none;
    }

    .active  {
        color: #fff;
        background-color: #66c0ec;
    }

    /* Page specific styling */
    /* PO Line Item Modal */
    .po-lines-modal-dropdown-input input {
        width: 95%;
    }
    .po-lines-modal-dropdown-input .suggestion-list {
        max-height: 30vh;
        width: 95%;
    }
</style>
