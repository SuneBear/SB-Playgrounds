/* alec-svelte/GameApp.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	check_outros,
	create_component,
	destroy_component,
	detach,
	empty,
	group_outros,
	init,
	insert,
	listen,
	mount_component,
	noop,
	safe_not_equal,
	transition_in,
	transition_out
} from "svelte/internal";

import { createRootWorld, CONTEXT_KEY_NODE } from ".";
import { setContext, onMount } from "svelte";
import LayeredView from "./LayeredView.svelte";
import getConfig, { hideLoader } from "../config";
import NotSupportedOverlay from "../overlays/NotSupportedOverlay.svelte";

function create_if_block_1(ctx) {
	let layeredview;
	let current;
	layeredview = new LayeredView({ props: { layers: /*layers*/ ctx[2] } });

	return {
		c() {
			create_component(layeredview.$$.fragment);
		},
		m(target, anchor) {
			mount_component(layeredview, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const layeredview_changes = {};
			if (dirty & /*layers*/ 4) layeredview_changes.layers = /*layers*/ ctx[2];
			layeredview.$set(layeredview_changes);
		},
		i(local) {
			if (current) return;
			transition_in(layeredview.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(layeredview.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(layeredview, detaching);
		}
	};
}

// (40:0) {#if !supported}
function create_if_block(ctx) {
	let notsupportedoverlay;
	let current;
	notsupportedoverlay = new NotSupportedOverlay({});

	return {
		c() {
			create_component(notsupportedoverlay.$$.fragment);
		},
		m(target, anchor) {
			mount_component(notsupportedoverlay, target, anchor);
			current = true;
		},
		p: noop,
		i(local) {
			if (current) return;
			transition_in(notsupportedoverlay.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(notsupportedoverlay.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			destroy_component(notsupportedoverlay, detaching);
		}
	};
}

function create_fragment(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	const if_block_creators = [create_if_block, create_if_block_1];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (!/*supported*/ ctx[0]) return 0;
		if (/*ready*/ ctx[1]) return 1;
		return -1;
	}

	if (~(current_block_type_index = select_block_type(ctx, -1))) {
		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
	}

	return {
		c() {
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},
		m(target, anchor) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].m(target, anchor);
			}

			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(window, "contextmenu", contextmenu_handler);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx, dirty);

			if (current_block_type_index === previous_block_index) {
				if (~current_block_type_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				}
			} else {
				if (if_block) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
				}

				if (~current_block_type_index) {
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				} else {
					if_block = null;
				}
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (~current_block_type_index) {
				if_blocks[current_block_type_index].d(detaching);
			}

			if (detaching) detach(if_block_anchor);
			mounted = false;
			dispose();
		}
	};
}

const contextmenu_handler = e => e.preventDefault();

function instance($$self, $$props, $$invalidate) {
	let { onCreate = () => {

	} } = $$props;

	const { world, viewLayerStore } = createRootWorld();
	const config = getConfig();
	const ctx = { world };
	setContext(CONTEXT_KEY_NODE, ctx);
	let supported = true;
	let ready = false;

	onMount(() => {
		start();
	});

	let layers;

	viewLayerStore.subscribe(v => {
		$$invalidate(2, layers = v);
	});

	async function start() {
		$$invalidate(1, ready = true);

		if (!config.context) {
			$$invalidate(0, supported = false);
			hideLoader();
		} else {
			onCreate(world);
		}
	}

	$$self.$$set = $$props => {
		if ("onCreate" in $$props) $$invalidate(3, onCreate = $$props.onCreate);
	};

	return [supported, ready, layers, onCreate];
}

class GameApp extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { onCreate: 3 });
	}
}

export default GameApp;
