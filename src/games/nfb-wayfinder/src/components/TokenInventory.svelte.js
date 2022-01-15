/* components/TokenInventory.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	append,
	attr,
	binding_callbacks,
	check_outros,
	create_component,
	destroy_component,
	destroy_each,
	detach,
	element,
	group_outros,
	init,
	insert,
	mount_component,
	safe_not_equal,
	transition_in,
	transition_out
} from "svelte/internal";

import TokenInventorySlot from "./TokenInventorySlot.svelte";
import { onMount } from "svelte";
import { fadeOpacityTransition } from "../animations/transitions";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[3] = list[i];
	child_ctx[4] = list;
	child_ctx[5] = i;
	return child_ctx;
}

// (24:4) {#each elements as element, i}
function create_each_block(ctx) {
	let tokeninventoryslot;
	let i = /*i*/ ctx[5];
	let current;
	const assign_tokeninventoryslot = () => /*tokeninventoryslot_binding*/ ctx[2](tokeninventoryslot, i);
	const unassign_tokeninventoryslot = () => /*tokeninventoryslot_binding*/ ctx[2](null, i);
	let tokeninventoryslot_props = {};
	tokeninventoryslot = new TokenInventorySlot({ props: tokeninventoryslot_props });
	assign_tokeninventoryslot();

	return {
		c() {
			create_component(tokeninventoryslot.$$.fragment);
		},
		m(target, anchor) {
			mount_component(tokeninventoryslot, target, anchor);
			current = true;
		},
		p(ctx, dirty) {
			if (i !== /*i*/ ctx[5]) {
				unassign_tokeninventoryslot();
				i = /*i*/ ctx[5];
				assign_tokeninventoryslot();
			}

			const tokeninventoryslot_changes = {};
			tokeninventoryslot.$set(tokeninventoryslot_changes);
		},
		i(local) {
			if (current) return;
			transition_in(tokeninventoryslot.$$.fragment, local);
			current = true;
		},
		o(local) {
			transition_out(tokeninventoryslot.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			unassign_tokeninventoryslot();
			destroy_component(tokeninventoryslot, detaching);
		}
	};
}

function create_fragment(ctx) {
	let div1;
	let div0;
	let current;
	let each_value = /*elements*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div1 = element("div");
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div0, "class", "row svelte-l0oa72");
			attr(div1, "class", "container svelte-l0oa72");
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div0, null);
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*elements*/ 1) {
				each_value = /*elements*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { store } = $$props;
	let elements = new Array(3).fill(null);

	onMount(() => {
		const unmount = store.subscribe(v => {
			const tokens = v.tokensCollected || [];

			for (let i = 0; i < elements.length; i++) {
				elements[i].setToken(tokens[i]);
			}
		});

		return () => {
			unmount();
		};
	});

	function tokeninventoryslot_binding($$value, i) {
		binding_callbacks[$$value ? "unshift" : "push"](() => {
			elements[i] = $$value;
			$$invalidate(0, elements);
		});
	}

	$$self.$$set = $$props => {
		if ("store" in $$props) $$invalidate(1, store = $$props.store);
	};

	return [elements, store, tokeninventoryslot_binding];
}

class TokenInventory extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { store: 1 });
	}
}

export default TokenInventory;