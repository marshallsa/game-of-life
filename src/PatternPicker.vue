<template>
<ul class="patterns">
    <li v-for="(pattern, index) in patterns">
        <a v-text="pattern.name"
            :class="{selected: index == selectedIndex}"
            @click="$emit('select', index == selectedIndex ? -1 : index)"></a>
    </li>
</ul>
</template>

<style>
.patterns {
    list-style-type: none;
    padding: 0 8px;
    margin: 0;
}
.patterns a {
    display: block;
    padding: 5px 5px;
    cursor: pointer;
}
.patterns a:hover {
    background: #eee;
}
.patterns .selected {
    font-weight: bold;
}
</style>

<script>
import Pattern from "./pattern.js";

import Vue from "vue";
import Component from "vue-class-component";

/**
 * Lets the user pick a pattern from a list.
 *
 * Properties:
 * * `patterns` - A list of {@link Pattern} objects to select from.
 * * `selectedIndex` - The index of the selected pattern in `patterns`. Bound to
 *   the `v-model` attribute.
 *
 * Events:
 * * `select` - Emitted when the selected index changes.
 */
@Component({
    model: {
        prop: "selectedIndex",
        event: "select"
    },
    props: {
        patterns: Array,
        selectedIndex: Number
    }
})
export default class PatternPicker extends Vue {}
</script>
