<template>
    <div class="tooltip-wrapper">

        <div class="tooltip-target"
             @click="mouseOverIcon()"
             @mousemove="mouseOverIcon()"
             @mouseleave="mouseLeaveIcon()"
        >
            <slot name="target"> <!-- TARGET ELEMENT(S) HERE --> </slot>
        </div>

        <transition name="fade">
            <div class="tooltip-content box-shadow"
                :style="offsets"
                v-show="showMoreInfoTooltip"
                @mouseenter="mouseOverTooltip()"
                @mouseleave="mouseLeaveTooltip()"
            >
                <slot name="content"> <!-- CONTENT HERE --> </slot>
            </div>
        </transition>
    </div>
</template>

<script>
    export default {
        name: 'ToolTip',
        props: {
            overrideOffsets: {
                type: Object,
                required: false,
                default: () => ( {} ),
            },
        },
        mounted() {
            // allows for defaults and overrides - results stored in this.offsets
            Object.assign( this.offsets, this.defaultOffsets, this.overrideOffsets );
        },
        data() {
            return {
                showMoreInfoTooltip: false,
                insideTooltip: false,
                offsets: {},
                defaultOffsets: {
                    left: '15px',
                    top: '15px',
                },
            };
        },
        methods: {
            mouseOverIcon() {
                this.show();
            },
            mouseLeaveIcon() {
                setTimeout( () => {
                    if ( !this.insideTooltip ) {
                        this.hide();
                    }
                }, 400 );
            },
            mouseOverTooltip() {
                this.insideTooltip = true;
            },
            mouseLeaveTooltip() {
                this.insideTooltip = false;
                this.hide();
            },
            hide() {
                this.showMoreInfoTooltip = false;
            },
            show() {
                // parts of this method aren't supported by IE
                // console.log( 'show' );
                // const openTooltips = document.querySelectorAll( '.tooltip-wrapper .tooltip-content' );
                // openTooltips.forEach( ( tooltip ) => {
                //     tooltip.style.display = 'none';
                // } );
                this.showMoreInfoTooltip = true;
            },
        },
    };
</script>

<style scoped>
    .tooltip-wrapper{
        position: relative; /* this is so tooltip can be positioned relative to parent */
    }
    .tooltip-target{
        cursor: pointer;
    }
    .tooltip-content{
        color: #2c3e50;
        background-color: #fff;
        min-width: 220px;
        position: absolute;
        top: 15px;
        z-index: 100;
        padding: 1.5rem 3em;
        font-family: 'RobotoSlab Regular', serif;
        font-size: .9rem;
    }
</style>
