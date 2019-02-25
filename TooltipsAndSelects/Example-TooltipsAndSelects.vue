<template>
    <div id="container" :class="[ fullSidebar ? 'sidebar-full' : 'sidebar-thin' ]">
        <TheSidebar
            :fullSize="fullSidebar"
        ></TheSidebar>

        <ThePageHeadingBar
            :pageHeading="pageHeading"
            :fullSize="fullSidebar"
        ></ThePageHeadingBar>

        <main>

            <!-- Filters -->
            <h2>
                Filter By
                <ToolTip class="tool-tip">
                    <i slot="target" class="material-icons info-icon">info_outline</i>
                    <div slot="content">
                        Supplier and Designators can be included OR excluded.
                    </div>
                </ToolTip>
            </h2>

            <div id="filter" class="grid-item box-shadow">

                <!-- Top - Left Column -->
                <div class="left-grid">
                    <!-- Effective date range -->
                    <div id="effective-date" class="input-group flex">
                        <h3> Sourcing End Date: </h3>
                        <div class="input-group-item">
                            <input id="shelf-start-date"
                                   type="date"
                                   data-placeholder="Start Date"
                                   v-model="sourcingEndDateStart">
                            &nbsp; to  &nbsp;

                            <input id="shelf-end-date"
                                   type="date"
                                   data-placeholder="End Date"
                                   v-model="sourcingEndDateEnd">
                        </div>
                    </div>

                    <!-- Supplier -->
                    <div id="supplier" class="input-group">
                        <h3 id="supplier-heading">
                            Supplier: <a class="reset-link" @click="resetSuppliers()">reset</a>
                        </h3>
                        <SelectIncludeExcludeFromSearch
                            ref="SelectIncludeExcludeFromSearch"
                            class="supplier-autogen"
                            :option-list="this.$store.state.primarySupplierList"
                            @updateOptions="( includedSuppliers, excludedSuppliers ) => updateSuppliers( includedSuppliers, excludedSuppliers )"
                        ></SelectIncludeExcludeFromSearch>
                    </div>

                </div>

                <!-- Top - Right Column -->
                <div class="right-grid">

                    <!-- Designators -->
                    <div id="designator" class="input-group">
                        <h3 id="designator-heading">
                            Designators: <a class="reset-link" @click="resetDesignators()">reset</a>
                        </h3>
                        <SelectIncludeExclude
                            ref="SelectIncludeExclude"
                            class="designators-autogen"
                            :initialOptions="this.$store.state.titleDesignators"
                            :show-reset-button="false"
                            @updateOptions="( includedDesignators, excludedDesignators ) => updateTitleDesignators( includedDesignators, excludedDesignators )"
                        ></SelectIncludeExclude>
                    </div>


                </div>

            </div>

            <!-- Purchase Order Info -->
            <h2>PO Info</h2>

            <div id="po-info" class="grid-item box-shadow">

                <!-- proprietary information removed -->

            </div>

            <!-- Page Footer Bar -->
            <ThePageFooterBar>
                <!-- Preview AutoGen -->
                <button
                    class="button"
                    @click="beginPreview"
                >
                    Preview
                </button>
                <!-- Auto Generate POs Button -->
                <button
                    class="button"
                    @click="beginAutoGen"
                >
                    Generate
                </button>
            </ThePageFooterBar>

        </main>
    </div>
</template>

<script>
    import actions from '@/store/action-types';

    // import ArrayUtil from '@/utils/arrayUtil';
    import FormUtil from '@/utils/formUtil';

    import ThePageHeadingBar from '@/components/ThePageHeadingBar';
    import TheSidebar from '@/components/TheSidebar';
    import ThePageFooterBar from '@/components/ThePageFooterBar';
    import SelectCatalog from '@/components/SelectCatalog';
    import SelectIncludeExclude from '@/components/SelectIncludeExclude';
    import ToolTip from '@/components/ToolTip';
    import SelectIncludeExcludeFromSearch from '@/components/SelectIncludeExcludeFromSearch';

    import ModalConfirmation from './autoGen/ModalConfirmation';

    export default {
        name: 'AutoGen',
        components: {
            ThePageHeadingBar,
            ThePageFooterBar,
            TheSidebar,
            SelectCatalog,
            SelectIncludeExclude,
            SelectIncludeExcludeFromSearch,
            ToolTip,
            ModalConfirmation,
        },
        beforeMount() {
            if ( this.$store.state.locationList.length === 0 ) {
                // If the user hasn't yet hit a page that has necessitated getting the filterOptions, go get them
                this.$store.dispatch( actions.getFilterOptions );
            }
            this.$store.dispatch( actions.getMasterSuppliers );
            // this.addEmptyCatalogToCatalogs();
        },
        data() {
            return {
                fullSidebar: false,
                pageHeading: 'AutoGen Purchase Orders',

                // showConfirmationModal: false,

                // shelfDateStart: '',
                // shelfDateEnd: '',
                sourcingEndDateStart: '',
                sourcingEndDateEnd: '',
                // catalogs: [],
                // effectiveStartDate: '',
                // effectiveEndDate: '',
                includeSupplierList: [],
                excludeSupplierList: [],
                titleIncludeDesignatorList: [],
                titleExcludeDesignatorList: [],
                addToDraft: false,
                openToBuyPercent: 100,
                expectedReceiveDate: '',
                overridePOPrefix: '',
                note: '',
                overrideEmail: '',
            };
        },
        methods: {
            selectInputField( event ) {
                FormUtil.selectInputFieldText( event );
            },

            updateSuppliers( includedSuppliers, excludedSuppliers ) {
                this.includeSupplierList = includedSuppliers;
                this.excludeSupplierList = excludedSuppliers;
            },
            updateTitleDesignators( includedDesignators, excludedDesignators ) {
                this.titleIncludeDesignatorList = includedDesignators;
                this.titleExcludeDesignatorList = excludedDesignators;
            },
            resetSuppliers() {
                this.$refs.SelectIncludeExcludeFromSearch.reset();
            },

            resetDesignators() {
                this.$refs.SelectIncludeExclude.reset();
            },

            beginAutoGen() {
                this.autoGeneratePurchaseOrders();
            },
            autoGeneratePurchaseOrders() {
                this.$store.dispatch( actions.postPurchaseOrderAutoGen, this.sanitizedFormData() );
            },

            beginPreview() {
                this.previewAutoGen();
            },
            previewAutoGen() {
                this.$store.dispatch( actions.postPreviewAutoGen, this.sanitizedFormData() );
            },

            sanitizedFormData() {
                // If we've selected at least one location to filter by,
                // remove the uid from each catalog before we ship it over the endpoint,
                // otherwise send an empty array
                // const formattedCatalogs = this.catalogs[ 0 ].locationId !== 0
                //     ? this.catalogs.map( ( catalog ) => {
                //         delete catalog.uid;
                //         delete catalog.isActivelyBeingEdited;
                //         return catalog;
                //     } )
                //     : [];

                return {
                    // shelfDateStart: this.shelfDateStart === '' ? null : this.shelfDateStart,
                    // shelfDateEnd: this.shelfDateEnd === '' ? null : this.shelfDateEnd,
                    sourcingEndDateStart: this.sourcingEndDateStart === '' ? null : this.sourcingEndDateStart,
                    sourcingEndDateEnd: this.sourcingEndDateEnd === '' ? null : this.sourcingEndDateEnd,
                    // catalogFilters: formattedCatalogs,
                    // effectiveStartDate: this.effectiveStartDate === '' ? null : this.effectiveStartDate,
                    // effectiveEndDate: this.effectiveEndDate === '' ? null : this.effectiveEndDate,
                    includeSupplierList: this.includeSupplierList,
                    excludeSupplierList: this.excludeSupplierList,
                    titleIncludeDesignatorList: this.titleIncludeDesignatorList,
                    titleExcludeDesignatorList: this.titleExcludeDesignatorList,
                    addToDraft: this.addToDraft,
                    openToBuyPercent: this.openToBuyPercent,
                    expectedReceiveDate: this.expectedReceiveDate,
                    overridePOPrefix: this.overridePOPrefix,
                    note: this.note,
                    overrideEmail: this.overrideEmail,
                };
            },
        },
    };
</script>

<style scoped>
    #container {
        font-family: 'RobotoSlab Regular', serif;
        color: #646569;
        margin: 0;
    }
    main{
        overflow: auto;
        height: calc(100vh - 150px);
        padding-bottom: 50px;
        grid-area: main;
        grid-template:
                "filter  filter"
                "poinfo poinfo";
        grid-gap: 20px;
    }

    ol,li{
        list-style: none;
        margin: 0;
        padding: 10px 0;
    }
    select {
        height: unset;
    }
    h3 {
        margin: 10px 0;
        font-size: 1rem;
        font-weight: normal;
    }
    .flex-column h3{
        margin-top: 0;
    }
    .tool-tip{
        display: inline-block;
        font-weight: normal;
    }

    .info-icon {
        color: #66c0ec;
        transform: translateY(20%);
    }
    .input-group {
        margin-bottom: .75rem;
    }
    .input-group.flex{
        display: flex;
        align-items: center;
        /*justify-content: space-between;*/
    }
    .input-group.flex-column{
        display: flex;
        flex-flow: column wrap;
        align-items: flex-start;
        height: 2rem;
    }
    .input-group.flex-column > * {
        flex-basis: 100%;
        width: 50%;
    }

    /* Top Section - filters */
    #filter {
        grid-area: filter;
        display: grid;
        grid-template-columns: 48% 48%;
        grid-gap: 4%;
        padding: 1.3rem;
        margin-bottom: 30px;
    }
    #catalogs button{
        background-color: transparent;
        color: #646568;
        width: 50px;
        height: 22px;
        border: #66c0ec 1px solid;
        border-radius: 4px;
        margin-top: 20px;
        font-weight: bold;
    }
    #catalogs button:hover{
        position: relative;
        top: 1px;
        left: 1px;
    }
    .reset-link{
        font-size: .8rem;
        cursor: pointer;
        padding: 0 10px;
    }
    #effective-date h3{
        margin-right: 2rem;
    }

    /* bottom section - PO info */
    #po-info{
        grid-area: poinfo;
        display: grid;
        grid-template-columns: 48% 48%;
        grid-gap: 4%;
        padding: 1.3rem;
    }
    #autogen-po-notes {
        margin-top: 25px;
    }

    .reset-link{
        font-size: .8rem;
        cursor: pointer;
        padding: 0 10px;
        color: #66c0ec;
        font-style: italic;
    }
    button {
        width: 220px;
    }

    #catalogs button {
        margin-top: 20px;
        font-size: .8rem;
        cursor: pointer;
        padding: 0 10px;
        color: #66c0ec;
        font-style: italic;
        background-color: transparent;
        box-shadow: none;
        height: unset;
        width: unset;
    }
    #autogen-po-notes textarea{
        width: 100%;
    }
    #otb-input{
        width: 4rem;
    }

</style>
