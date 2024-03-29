/* components/AnimatedTextSpan.svelte generated by Svelte v3.31.0 */
import {
	SvelteComponent,
	add_render_callback,
	append,
	attr,
	check_outros,
	create_bidirectional_transition,
	destroy_each,
	detach,
	element,
	group_outros,
	init,
	insert,
	safe_not_equal,
	set_data,
	set_style,
	text as text_1,
	toggle_class,
	transition_in,
	transition_out
} from "svelte/internal";

import * as MathUtil from "../util/math";
import Random from "../util/Random";
import { fadeOpacityTransition, fadeTransition } from "../animations/transitions";
import { onMount, createEventDispatcher } from "svelte";

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i];
	return child_ctx;
}

// (101:2) {#each children as node}
function create_each_block(ctx) {
	let span;
	let t_value = /*node*/ ctx[10].value + "";
	let t;
	let span_style_value;
	let span_transition;
	let current;

	return {
		c() {
			span = element("span");
			t = text_1(t_value);
			attr(span, "style", span_style_value = `min-width: ${/*node*/ ctx[10].whitespace ? spaceWidth : 0}px;`);
			attr(span, "class", "text-node svelte-niwj3w");
			toggle_class(span, "whitespace", /*node*/ ctx[10].whitespace);
		},
		m(target, anchor) {
			insert(target, span, anchor);
			append(span, t);
			current = true;
		},
		p(new_ctx, dirty) {
			ctx = new_ctx;
			if ((!current || dirty & /*children*/ 8) && t_value !== (t_value = /*node*/ ctx[10].value + "")) set_data(t, t_value);

			if (!current || dirty & /*children*/ 8 && span_style_value !== (span_style_value = `min-width: ${/*node*/ ctx[10].whitespace ? spaceWidth : 0}px;`)) {
				attr(span, "style", span_style_value);
			}

			if (dirty & /*children*/ 8) {
				toggle_class(span, "whitespace", /*node*/ ctx[10].whitespace);
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (!span_transition) span_transition = create_bidirectional_transition(
					span,
					fadeTransition,
					{
						.../*node*/ ctx[10],
						delay: /*delay*/ ctx[0] + /*node*/ ctx[10].delay
					},
					true
				);

				span_transition.run(1);
			});

			current = true;
		},
		o(local) {
			if (!span_transition) span_transition = create_bidirectional_transition(
				span,
				fadeTransition,
				{
					.../*node*/ ctx[10],
					delay: /*delay*/ ctx[0] + /*node*/ ctx[10].delay
				},
				false
			);

			span_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(span);
			if (detaching && span_transition) span_transition.end();
		}
	};
}

function create_fragment(ctx) {
	let p;
	let p_transition;
	let current;
	let each_value = /*children*/ ctx[3];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			p = element("p");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			set_style(p, "letter-spacing", letterSpacing + "px");
			set_style(p, "font-size", fontSize + "px");
			set_style(p, "font-weight", fontWeight);
			set_style(p, "font-style", fontStyle);
			attr(p, "class", "svelte-niwj3w");
		},
		m(target, anchor) {
			insert(target, p, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(p, null);
			}

			current = true;
		},
		p(new_ctx, [dirty]) {
			ctx = new_ctx;

			if (dirty & /*children, spaceWidth, delay*/ 9) {
				each_value = /*children*/ ctx[3];
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
						each_blocks[i].m(p, null);
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

			add_render_callback(() => {
				if (!p_transition) p_transition = create_bidirectional_transition(
					p,
					fadeTransition,
					{
						opacity: 1,
						y: /*y*/ ctx[2],
						endX: /*x*/ ctx[1],
						endY: /*y*/ ctx[2]
					},
					true
				);

				p_transition.run(1);
			});

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			if (!p_transition) p_transition = create_bidirectional_transition(
				p,
				fadeTransition,
				{
					opacity: 1,
					y: /*y*/ ctx[2],
					endX: /*x*/ ctx[1],
					endY: /*y*/ ctx[2]
				},
				false
			);

			p_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(p);
			destroy_each(each_blocks, detaching);
			if (detaching && p_transition) p_transition.end();
		}
	};
}

const random = Random();

// we use inline style to conform to canvas text measuring
// and space character width
const fontSize = 18;

const letterSpacing = 0.5;
const fontStyle = "italic";
const fontWeight = 300;
const fontFamily = `"Enreal", sans-serif`;
const SPACE_WIDTH_DEFAULT = 5;
let spaceWidth = SPACE_WIDTH_DEFAULT;

document.fonts.ready.then(() => {
	computeSpaceWidth();
});

function computeSpaceWidth() {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");
	context.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
	const w = context.measureText(" ").width;

	if (w != null && w > 0 && isFinite(w)) {
		spaceWidth = w + letterSpacing;
	}
}

function instance($$self, $$props, $$invalidate) {
	const dispatcher = createEventDispatcher();
	let { text = "" } = $$props;
	let { delay = 0 } = $$props;
	let { duration = null } = $$props;
	let { x = 0 } = $$props;
	let { y = 0 } = $$props;
	const tmpPos = [];
	let killTimer;
	let children = [];

	if (duration != null) {
		killTimer = setTimeout(
			() => {
				dispatcher("kill");
			},
			duration
		);
	}

	onMount(() => {
		return () => {
			clearTimeout(killTimer);
		};
	});

	function update(value = "") {
		const constantInDuration = 2000; // milliseconds
		const count = value.length;
		const delayStagger = constantInDuration / count;
		const jitter = 0.05;
		const jitterAngle = MathUtil.degToRad(0);

		return value.split("").map((n, i) => {
			const whitespace = (/\s/).test(n);

			// const offset = 10;
			const [x, y] = random.insideCircle(10, tmpPos);

			return {
				value: whitespace ? " " : n,
				whitespace,
				angle: random.gaussian(0, MathUtil.degToRad(2)),
				delay: i * delayStagger + random.gaussian(0, 1),
				duration: random.range(1500, 2000),
				x,
				y
			}; // x: random.gaussian(0, offset),
			// y: random.gaussian(0, offset),
		}); // endX: random.gaussian(0, jitter) * 0.01,
		// endY: random.gaussian(0, jitter),
		// endAngle: random.gaussian(0, jitterAngle),
	}

	$$self.$$set = $$props => {
		if ("text" in $$props) $$invalidate(4, text = $$props.text);
		if ("delay" in $$props) $$invalidate(0, delay = $$props.delay);
		if ("duration" in $$props) $$invalidate(5, duration = $$props.duration);
		if ("x" in $$props) $$invalidate(1, x = $$props.x);
		if ("y" in $$props) $$invalidate(2, y = $$props.y);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*text*/ 16) {
			$: $$invalidate(3, children = update(text));
		}
	};

	return [delay, x, y, children, text, duration];
}

class AnimatedTextSpan extends SvelteComponent {
	constructor(options) {
		super();

		init(this, options, instance, create_fragment, safe_not_equal, {
			text: 4,
			delay: 0,
			duration: 5,
			x: 1,
			y: 2
		});
	}
}

export default AnimatedTextSpan;