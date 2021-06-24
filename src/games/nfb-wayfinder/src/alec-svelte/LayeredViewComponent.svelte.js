/* alec-svelte/LayeredViewComponent.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	assign,
	check_outros,
	create_component,
	destroy_component,
	detach,
	empty,
	get_spread_object,
	get_spread_update,
	group_outros,
	init,
	insert,
	mount_component,
	safe_not_equal,
	transition_in,
	transition_out
} from "svelte/internal";

import { ViewLayer, CONTEXT_KEY_NODE } from "./";
import { getContext, setContext } from "svelte";

function create_fragment(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*props*/ ctx[0]];
	var switch_value = /*component*/ ctx[1];

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props(ctx));
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, [dirty]) {
			const switch_instance_changes = (dirty & /*props*/ 1)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[0])])
			: {};

			if (switch_value !== (switch_value = /*component*/ ctx[1])) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props(ctx));
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { entity } = $$props;
	let { props } = $$props;
	let { component } = $$props;
	const base = getContext(CONTEXT_KEY_NODE);
	setContext(CONTEXT_KEY_NODE, { ...base, entity });

	$$self.$$set = $$props => {
		if ("entity" in $$props) $$invalidate(2, entity = $$props.entity);
		if ("props" in $$props) $$invalidate(0, props = $$props.props);
		if ("component" in $$props) $$invalidate(1, component = $$props.component);
	};

	return [props, component, entity];
}

class LayeredViewComponent extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { entity: 2, props: 0, component: 1 });
	}
}

export default LayeredViewComponent;
