<template>
    <div id="select-include-exclude-from-search">
        <SearchDropdownInput
            :option-list="optionList"
            @input="supplier => pushSupplierToChild( supplier )"
        ></SearchDropdownInput>

        <SelectIncludeExclude
            :initial-options="selectedSuppliers"
            :pre-selected-option="lastOptionAdded"
            :show-reset-button="false"
            :show-options-separately="true"
            @updateOptions="( includedSuppliers, excludedSuppliers ) => publishSelectedOptions( includedSuppliers, excludedSuppliers )"
        ></SelectIncludeExclude>
    </div>
</template>

<script>
    import SearchDropdownInput from '@/components/SearchDropdownInput';
    import SelectIncludeExclude from '@/components/SelectIncludeExclude';

    export default {
        name: 'SelectIncludeExcludeFromSearch',
        components: {
            SelectIncludeExclude,
            SearchDropdownInput,
        },
        props: {
            optionList: {
                required: true,
                type: Array,
            },
        },
        data() {
            return {
                selectedSuppliers: [],
                lastOptionAdded: {},
            };
        },
        methods: {
            reset() {
                // can be called from parent by this.$refs.refToThisComponent.reset()
                this.selectedSuppliers = [];
            },
            pushSupplierToChild( supplier ) {
                this.selectedSuppliers.push( supplier );
                this.lastOptionAdded = supplier;
            },
            publishSelectedOptions( includedOptions, excludedOptions ) {
                this.$emit( 'updateOptions', includedOptions, excludedOptions );
            },
        },
    };
</script>

<style scoped>
</style>
