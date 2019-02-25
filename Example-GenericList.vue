<template>
    <div>
        <div v-if="this.$store.state.requestInFlight">
            <LoaderIcon></LoaderIcon>
        </div>
        <div v-else>
            <!-- Purchase Order Item List -->
            <GenericList
                :listInfo="listInfo"
                :itemList="formattedPurchaseOrderList"
                :referenceItem="this.$store.state.currentPurchaseOrder"
                :referenceList="purchaseOrderList"
                :includeCheckbox="true"
                :scrollableListContainer="true"
                initialSortDir="asc"
                initialSort="expectedReceiveDate"
                @listItemClicked="purchaseOrder => displayDetail( purchaseOrder )"
                @sortedItemList="itemList => persistSortedItems( itemList )"
            ></GenericList>
        </div>
    </div>
</template>

<script>
    import actions from '@/store/action-types';
    import mutations from '@/store/mutation-types';

    import ArrayUtil from '@/utils/arrayUtil';
    import FormatUtil from '@/utils/formatUtil';

    import ThePageFooterBar from '@/components/ThePageFooterBar';
    import LoaderIcon from '@/components/LoaderIcon';
    import GenericList from '@/components/GenericList';

    export default {
        name: 'SummaryView',
        components: {
            ThePageFooterBar,
            LoaderIcon,
            GenericList,
        },
        data() {
            return {
                listInfo: [
                    {
                        name: 'PO #',
                        code: 'number',
                    },
                    {
                        name: 'Location',
                        code: 'location',
                    },
                    // etc...
                ],
            };
        },
        computed: {
            purchaseOrderList() {
                return this.$store.state.purchaseOrderList;
            },
            selectedPurchaseOrderList() {
                return ArrayUtil.whereIn( {
                    hayStack: this.$store.state.purchaseOrderList,
                    needleStack: this.$store.state.selectedItemList.map( item => item.id ),
                    needleAttribute: 'number',
                } );
            },
            canPrintPurchaseOrders() {
                return this.selectedPurchaseOrderList.length > 0;
            },
            formattedPurchaseOrderList() {
                return this.purchaseOrderList.length > 0
                    ? this.purchaseOrderList
                        .map( purchaseOrder => ( {
                            id: purchaseOrder.number,
                            number: purchaseOrder.number,
                            location: FormatUtil.locationNameToInitials( purchaseOrder.location.name ),
                            primarySupplier: purchaseOrder.supplier !== null
                                ? purchaseOrder.supplier.name
                                : 'Not Set',
                            notes: purchaseOrder.description && ( purchaseOrder.description.length > 40 )
                                ? FormatUtil.truncateText( purchaseOrder.description, 40 )
                                : purchaseOrder.description,
                            unitsOrdered: this.purchaseOrderHasItems( purchaseOrder )
                                ? purchaseOrder.purchaseOrderItemDTOList
                                    .map( item => item.requestedQuantity )
                                    .reduce( ( accumulator, currentValue ) => accumulator + currentValue )
                                : 0,
                            isbnsOrdered: this.purchaseOrderHasItems( purchaseOrder )
                                ? new Set( purchaseOrder.purchaseOrderItemDTOList
                                    .map( item => item.productCode ) ).size
                                : 0,
                            createDate: purchaseOrder.createDate,
                            expectedReceiveDate: purchaseOrder.expectedReceiveDate,
                            status: purchaseOrder.status,
                            purchaseOrderItemDTOList: purchaseOrder.purchaseOrderItemDTOList,
                        } ) )
                    : [];
            },
        },
        methods: {
            purchaseOrderHasItems( purchaseOrder ) {
                return this.$store.getters.purchaseOrderHasItems( purchaseOrder );
            },
            displayPoDetail( purchaseOrder ) {
                // The purchase order parameter is a formatted purchase order from formattedPurchaseOrderList,
                // so we need to get all of that purchase order's information
                const purchaseOrderIndex = this.purchaseOrderList.findIndex( order => order.number === purchaseOrder.number );
                this.$emit( 'showPoDetail', this.purchaseOrderList[ purchaseOrderIndex ] );
            },
            persistSortedItems( itemList ) {
                this.$store.commit( mutations.SET_PURCHASE_ORDER_LIST, {
                    purchaseOrderList: itemList
                        .map( purchaseOrder => this.purchaseOrderList.find( order => order.number === purchaseOrder.number ) ),
                } );
            },
            printSelectedPurchaseOrders() {
                this.$store.dispatch( actions.postPrintPurchaseOrders, { purchaseOrders: this.selectedPurchaseOrderList } );
            },
        },
    };
</script>

<style scoped>
</style>