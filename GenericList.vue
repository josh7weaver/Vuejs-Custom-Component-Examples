<template>
    <div id="generic-list">
        <div class="search-results-heading">

            <!-- Prefix Column One Heading Slot -->
            <slot name="prefixColumnOneHeading"
                class="flex-0"
            ></slot>

            <!-- Checkbox -->
            <div v-if="includeCheckbox"
                 class="prefix-column-two flex-0">
                <input
                    type="checkbox"
                    :checked="isListSelected( itemList )"
                    @click="toggleListSelect( itemList )"
                />
            </div>

            <!-- List Headings -->
            <div
                v-for="column in listInfo"
                :key="column.name"
                class="list-item-header"
                :class="[ column.class ? column.class : 'flex-1' ]"
                @click="toggleSort( column )"
                @mousedown.prevent
            >
                <span>{{ column.name }}</span>
                <img class="sort-image" :src="sortImage( column )">
            </div>

        </div>

        <!-- List Items Container -->
        <div :class="{ 'scrollable-list-container': scrollableListContainer }">

            <!-- List Items -->
            <div
                v-for="item in sortedItems"
                :key="item.id"
                class="search-results-container"
                :class="{ 'is-selected': isItemSelected( item ), 'last-viewed-item': isLastViewedItem( item ) }"
            >
                <!-- Prefix Column One Row Slot -->
                <slot
                    name="prefixColumnOneRow"
                    :item="item"
                ></slot>

                <i v-if="purchaseOrderHasConflictingItems( item )"
                   class="material-icons conflict-warning">
                    warning
                </i>
                <div v-else>
                    <!-- List Item Checkbox -->
                    <div v-if="includeCheckbox"
                         class="result-item-checkbox">
                        <input
                            type="checkbox"
                            :checked="isItemSelected( item )"
                            @click="toggleItemSelect( { item, sortedItems, event: $event } )"
                        />
                    </div>
                </div>

                <!-- List Data Columns -->
                <div class="search-results-body"
                     @click="emitItemEvent( item )">
                    <div
                        v-for="column in listInfo"
                        :key="column.code"
                        class="list-item"
                        :class="[ column.class ? column.class : 'flex-1' ]"
                        v-html="item[ column.code ] || column.displayIfNull"
                    ></div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
    import ObjectUtil from '@/utils/objectUtil';

    import SortNone from '@/assets/images/sort_default.png';
    import SortTop from '@/assets/images/sort_active_top.png';
    import SortBottom from '@/assets/images/sort_active_bottom.png';

    import { MultiSelect, MultiSelectItem } from '@/mixins/MultiSelect';

    export default {
        name: 'GenericList',
        mixins: [ MultiSelect, MultiSelectItem ],
        props: {
            listInfo: {
                // Array of objects with name and code attributes
                type: Array,
                required: true,
            },
            itemList: {
                // Array of objects, must have id attribute
                type: Array,
                required: true,
            },
            referenceItem: {
                type: Object,
                required: false,
                default: () => ( {} ),
            },
            referenceList: {
                type: Array,
                required: false,
                default: () => [],
            },
            includeCheckbox: {
                type: Boolean,
                required: false,
                default: false,
            },
            scrollableListContainer: {
                type: Boolean,
                required: false,
                default: false,
            },
            initialSort: {
                type: String,
                required: false,
                default: '',
            },
            initialSortDir: {
                type: String,
                required: false,
                default: '',
            },
        },
        beforeMount() {
            this.currentSort = this.initialSort;
            this.currentSortDir = this.initialSortDir;
            this.emitSortedItems();
        },
        data() {
            return {
                currentSort: '', // column.code
                currentSortDir: '', // asc, desc
            };
        },
        computed: {
            sortNone() {
                return SortNone;
            },
            sortUpImage() {
                return SortTop;
            },
            sortDownImage() {
                return SortBottom;
            },
            sortedItems() {
                if ( this.currentSortDir === '' ) return this.itemList;

                // Ideas from: http://blog.vjeux.com/2010/javascript/javascript-sorting-table.html
                // https://medium.com/@fsufitch/is-javascript-array-sort-stable-46b90822543f
                // and the 'Sorting with map' section: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
                return this.itemList
                    .slice()
                    .map( ( objectElement, index ) => ( { index, value: objectElement[ this.currentSort ] } ) )
                    .sort( ( a, b ) => {
                        const firstAttribute = a.value;
                        const secondAttribute = b.value;

                        // handle nulls
                        if ( firstAttribute === null ) { // firstAttribute is null? last
                            return 1;
                        } else if ( secondAttribute === null ) { // secondAttribute is null? last
                            return -1;
                        }

                        // asc vs desc
                        let modifier = 1;
                        if ( this.currentSortDir === 'desc' ) modifier = -1;

                        // handle numbers
                        if ( typeof firstAttribute === 'number' || typeof secondAttribute === 'number' ) {
                            return ( Number( firstAttribute ) - Number( secondAttribute ) ) * modifier;
                        }

                        // String comparison
                        // If both items are equal, use their ORIGINAL index from the itemList array
                        return String( firstAttribute ).localeCompare( String( secondAttribute ) ) === 0
                            ? a.index - b.index
                            : String( firstAttribute ).localeCompare( String( secondAttribute ) ) * modifier;
                    } )
                    .map( element => this.itemList[ element.index ] );
            },
        },
        methods: {
            emitItemEvent( item ) {
                this.$emit( 'listItemClicked', item );
            },
            emitSortedItems() {
                this.$emit( 'sortedItemList', this.sortedItems );
            },

            /* One off to allow hiding checkbox if the item is a purchaseOrder and it has conflicting items */
            purchaseOrderHasConflictingItems( purchaseOrder ) {
                if ( purchaseOrder.number && purchaseOrder.purchaseOrderItemDTOList ) {
                    return this.$store.getters.purchaseOrderHasConflictingLineItems( purchaseOrder );
                }
                return false;
            },

            isLastViewedItem( listItem ) {
                return ObjectUtil.isObject( this.referenceItem )
                    && ObjectUtil.isNotEmpty( this.referenceItem )
                    && listItem.id === this.referenceItem.id;
            },

            sortImage( column ) {
                if ( column.code === this.currentSort ) {
                    if ( this.currentSortDir === 'asc' ) {
                        return this.sortDownImage;
                    } else if ( this.currentSortDir === 'desc' ) {
                        return this.sortUpImage;
                    }
                }
                return this.sortNone;
            },

            toggleSort( column ) {
                if ( column.code === this.currentSort ) {
                    if ( ( this.currentSortDir === '' ) || ( this.currentSortDir === 'asc' ) ) {
                        this.currentSortDir = 'desc';
                    } else if ( this.currentSortDir === 'desc' ) {
                        this.currentSortDir = 'asc';
                    }
                } else {
                    this.currentSortDir = 'desc';
                }

                this.currentSort = column.code;
                this.emitSortedItems();
            },
        },
    };
</script>

<style scoped>
    /*
        Shared
    */
    .prefix-column-two{
        /*margin: 0 .4rem;*/
    }

    /*
        List Heading styles
    */
    .search-results-heading {
        display: flex;
        align-items: center;
        border-bottom: .5px solid #808080;
        padding: 10px 0 10px 6px;
        margin: 0 18px 0 6px;
        color: #646569;
        text-align: left;
        font-size: 12px;
        font-family: 'Nexa Bold', sans-serif;
    }

    .scrollable-list-container {
        overflow: auto;
        height: calc(100vh - 300px);
    }

    .list-item-header {
        cursor: pointer;
        position: relative;
        padding: 0 4px 0 17px;
    }
    .sort-image {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
    }

    /*
        List Item styles
    */
    .search-results-container {
        padding: 0 0 0 5px;
        margin-left: 6px;
        display:flex;
        align-items: center;
    }
    .search-results-container:hover{
        background-color: hsla(77, 58%, 59%, 0.09);
        cursor: pointer;
    }
    .search-results-container.last-viewed-item {
        margin-left: 0;
        border-left: 5px solid #66c0ec;
    }

    .search-results-body {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        flex: 1;
        padding: 6px 0;
        margin: 0;
        color: #8a8a8d;
        font-family: 'Roboto', serif;
    }

    .list-item{
        padding: 0 4px;
    }

    @media screen and (max-width: 1000px) {
        .list-item,
        .search-results-heading{
           font-size: 11px;
        }
    }


    .flex-0 {
        flex: 0;
    }
    .flex-1 {
        flex: 1;
    }
    .flex-2 {
        flex: 2;
    }

    /* Specific Page styles */
    .confirm-line-item-modal .scrollable-list-container {
        overflow-y: scroll;
        height: 300px;
        padding-bottom:20px;
    }

    .conflict-warning {
        color: red;
    }
</style>
