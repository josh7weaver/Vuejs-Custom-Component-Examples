import mutations from '@/store/mutation-types';
import ArrayUtil from '@/utils/arrayUtil';

/**
 * The functionality for select/deselect all
 * Required setup:
 *  1. include the mixin in the 'mixins' attribute array
 *    (i.e. mixins: [ MultiSelect ], )
 */
export const MultiSelect = {
    beforeDestroy() {
        this.$store.commit( mutations.CLEAR_SELECTED_ITEMS );
    },
    methods: {
        isListSelected( itemList ) {
            return ArrayUtil.isEqual(
                itemList.map( item => item.id ),
                this.$store.state.selectedItemList.map( item => item.id ),
            ) && ( itemList.length > 0 );
        },
        toggleListSelect( itemList ) {
            if ( this.isListSelected( itemList ) ) {
                this.$store.commit( mutations.CLEAR_SELECTED_ITEMS );
            } else {
                this.$store.commit( mutations.SET_SELECTED_ITEMS, { items: itemList } );
            }
        },
    },
};

/**
 * The functionality for select/deselect a SINGLE checkbox
 * Required setup:
 *  1. include the mixin in the 'mixins' attribute array
 *    (i.e. mixins: [ MultiSelect ], )
 */
export const MultiSelectItem = {
    beforeDestroy() {
        // so shit doesn't blow up - for long lists this brings vue to its knees if called for every item.
        // apparently calling a mutation that many times is NOT cheap for vuejs
        if ( this.$store.state.selectedItemList && this.$store.state.selectedItemList.length > 0 ) {
            this.$store.commit( mutations.CLEAR_SELECTED_ITEMS );
        }
    },
    methods: {
        /**
         * Remove an item from store.$state.selectedItemList
         * @param item { Object }
         */
        removeItemFromSelectedItems( item ) {
            this.$store.commit( mutations.REMOVE_ITEM_FROM_SELECTED_ITEMS, { item } );
        },

        /**
         * Add an item to store.$state.selectedItemList
         * @param item { Object }
         */
        addItemToSelectedItems( item ) {
            this.$store.commit( mutations.ADD_ITEM_TO_SELECTED_ITEMS, { item } );
        },

        /**
         * Add multiple items to store.$state.selectedItemList by the indexOfLastItemAdded and indexOfThisItem
         * @param indexOfLastItemAdded { Number }
         * @param indexOfThisItem { Number }
         * @param sortedItems { Array } - An array of sorted items to reference against
         */
        addItemsToSelectedItemsFromIndex( { indexOfLastItemAdded, indexOfThisItem, sortedItems = [] } ) {
            this.$store.commit( mutations.ADD_ITEMS_TO_SELECTED_ITEMS, {
                itemList: sortedItems.slice(
                    Math.min( indexOfLastItemAdded, indexOfThisItem ),
                    Math.max( indexOfLastItemAdded, indexOfThisItem ) + 1,
                ),
            } );
        },

        /**
         * @param item { Object } - an object with an id
         */
        isItemSelected( item ) {
            return this.$store.state.selectedItemList.findIndex( selectedItem => selectedItem.id === item.id ) > -1;
        },

        /**
         * Toggle the presence of an item in the store.$state.selectedItemList
         * Allows selection of multiple items if:
         *      1: A sortedItems array is supplied to reference against
         *      2: And the shift key is held on click
         *
         * @param item { Object } - The item to select or deselect
         * @param sortedItems { Array } - An array of sorted items that can be referenced
         * @param event { Event } - a Javascript event
         */
        toggleItemSelect( { item, sortedItems = [], event } ) {
            if ( this.isItemSelected( item ) ) {
                this.removeItemFromSelectedItems( item );
            } else if ( event.shiftKey && sortedItems && sortedItems.length && sortedItems.length > 0 ) {
                // Get the index of the last item added to the selectedItemList
                const indexOfLastItemAdded = this.$store.state.selectedItemList.length > 0
                        ? sortedItems.findIndex( sortedItem =>
                        sortedItem.id === this.$store.state.selectedItemList[ this.$store.state.selectedItemList.length - 1 ].id )
                        : 0;

                // Get the index of this item in the itemList
                const indexOfThisItem = sortedItems.findIndex( sortedItem => sortedItem.id === item.id );

                this.addItemsToSelectedItemsFromIndex( { indexOfLastItemAdded, indexOfThisItem, sortedItems } );
            } else {
                this.addItemToSelectedItems( item );
            }
        },
    },
};
